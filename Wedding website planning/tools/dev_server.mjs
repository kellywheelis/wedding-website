// A local stand-in for the live site, for trying the RSVP before it goes live: the files routed as vercel.json routes
// them, and /api/* run the way Vercel runs them, against an in-memory copy of the database. Nothing leaves this
// computer, and it forgets everything when stopped. Needs Node.js (the project does not install it; any recent one).
//   node "Wedding website planning/tools/dev_server.mjs" [port]        (default 8020)
//   then  http://127.0.0.1:8020/   (the 3D gallery)   /mobile/   (the phone guide)   /rsvp-admin   (the private page)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');   // the repository
const PORT = Number(process.argv[2]) || 8020;

// the few Redis commands the RSVP uses, kept in memory; values come back as text, as the live store returns them
class MemRedis {
  constructor() { this.m = new Map(); }
  live(k) { const e = this.m.get(k); if (e && e.until && Date.now() > e.until) { this.m.delete(k); return null; } return e || null; }
  async get(k) { const e = this.live(k); return e ? e.v : null; }
  async set(k, v, o = {}) { this.m.set(k, { v: String(v), until: o.ex ? Date.now() + o.ex * 1000 : 0 }); return 'OK'; }
  async del(...ks) { let n = 0; ks.flat().forEach((k) => { if (this.m.delete(k)) n++; }); return n; }
  async incr(k) { const e = this.live(k); const n = (e ? Number(e.v) : 0) + 1; this.m.set(k, { v: String(n), until: e ? e.until : 0 }); return n; }
  async expire(k, s) { const e = this.live(k); if (!e) return 0; e.until = Date.now() + s * 1000; return 1; }
  async smembers(k) { const e = this.live(k); return e ? [...e.v] : []; }
  async sadd(k, ...ms) { const e = this.live(k) || { v: new Set(), until: 0 }; ms.forEach((x) => e.v.add(String(x))); this.m.set(k, e); return ms.length; }
  async lpush(k, ...vs) { const e = this.live(k) || { v: [], until: 0 }; vs.forEach((x) => e.v.unshift(String(x))); this.m.set(k, e); return e.v.length; }
  async ltrim(k, a, b) { const e = this.live(k); if (e) e.v = e.v.slice(a, b + 1); return 'OK'; }
  // sorted sets, for the arcade's scoreboard (api/scores.js): lowest score first, ties by member, as Redis orders them
  zs(k) { const e = this.live(k); return e ? [...e.v].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) : []; }
  cut(n, a, b) { if (a < 0) a += n; if (b < 0) b += n; return [Math.max(0, a), Math.min(n - 1, b)]; }
  async zadd(k, { score, member }) { const e = this.live(k) || { v: new Map(), until: 0 }; const had = e.v.has(member); e.v.set(member, Number(score)); this.m.set(k, e); return had ? 0 : 1; }
  async zrem(k, member) { const e = this.live(k); return e && e.v.delete(member) ? 1 : 0; }
  async zremrangebyrank(k, a, b) { const z = this.zs(k), [i, j] = this.cut(z.length, a, b), e = this.live(k); let n = 0; for (let x = i; x <= j; x++) { e.v.delete(z[x][0]); n++; } return n; }
  async zrevrank(k, member) { const i = this.zs(k).reverse().findIndex((p) => p[0] === member); return i < 0 ? null : i; }
  async zrange(k, a, b, o = {}) { const z = this.zs(k); if (o.rev) z.reverse(); const [i, j] = this.cut(z.length, a, b); const s = z.slice(i, j + 1); return o.withScores ? s.flat() : s.map((p) => p[0]); }
}
globalThis.__DEV_REDIS__ = new MemRedis();
// the RSVP's emails (api/_notify.js; start with RESEND_API_KEY and RSVP_NOTIFY_TO set to anything) are never sent from
// here: they are printed in this window. DEV_MAIL=fail answers as Resend would a refusal, to see a reply still go through
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  if (!String(url).startsWith('https://api.resend.com/')) return realFetch(url, opts);
  const m = JSON.parse(opts.body || '{}');
  console.log('\n--- email (not sent) to ' + [].concat(m.to).join(', ') + '\nSubject: ' + m.subject + '\n\n' + m.text + '\n---');
  return process.env.DEV_MAIL === 'fail' ? new Response('{"message":"refused (DEV_MAIL=fail)"}', { status: 422 }) : new Response('{"id":"dev"}', { status: 200 });
};
// DEV_RSVP_CLOSED=N: as if the RSVP deadline fell N seconds after this server started (0: it has already passed)
if (process.env.DEV_RSVP_CLOSED) globalThis.__DEV_RSVP_CLOSES__ = Date.now() + 1000 * Number(process.env.DEV_RSVP_CLOSED);

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
function route(p) {                                                 // vercel.json's rewrites, ":path*" and exact paths
  for (const r of vercel.rewrites || []) {
    const src = r.source;
    if (src.endsWith('/:path*')) { const base = src.slice(0, -7); if (p.startsWith(base + '/')) return r.destination.replace(':path*', p.slice(base.length + 1)); }
    else if (src === p) return r.destination;
  }
  return p;
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const api = url.pathname.match(/^\/api\/([a-z]+)$/);
  if (api) {                                                        // run the endpoint as Vercel would: req.query, req.body, res.status().json()
    let raw = ''; for await (const c of req) raw += c;
    const request = { method: req.method, headers: req.headers, query: Object.fromEntries(url.searchParams), socket: req.socket, body: null };
    try { request.body = raw ? JSON.parse(raw) : {}; } catch (e) { request.body = {}; }
    const response = { statusCode: 200, setHeader: (k, v) => res.setHeader(k, v),
      status(c) { this.statusCode = c; return this; },
      json(o) { res.writeHead(this.statusCode, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); } };
    try { const mod = await import(pathToFileURL(path.join(ROOT, 'api', api[1] + '.js')).href); await mod.default(request, response); }
    catch (e) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e.stack || e)); }
    return;
  }
  // DEV_EXTRA=/some/folder serves that folder at /__test/ (test pages that drive the site from the same address)
  if (process.env.DEV_EXTRA && url.pathname.startsWith('/__test/')) {
    const f = path.join(process.env.DEV_EXTRA, decodeURIComponent(url.pathname.slice(8)));
    if (fs.existsSync(f)) { res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'text/plain', 'cache-control': 'no-store' }); fs.createReadStream(f).pipe(res); return; }
  }
  let file = path.join(ROOT, decodeURIComponent(route(url.pathname)));
  if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  if (process.env.DEV_EXTRA && file.endsWith('gallery3d.js')) {        // with test pages on: a handle on the RSVP's functions for them
    res.end(fs.readFileSync(file, 'utf8') + '\nwindow.__ka = { openPostcards, postCard, openCard, GUEST };\n'); return;
  }
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('RSVP dev server: http://127.0.0.1:' + PORT + '/'));
