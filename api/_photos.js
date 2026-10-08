// Where the guests' photographs are kept (api/gallery.js puts and removes them, api/photo.js hands them out), and the
// check every one passes on the way in. The store is Cloudflare R2 (the owner's choice, 7 Oct 2026: free up to 10 GB,
// with no charge for downloads), reached through its S3-style API with four settings in the Vercel project (Settings ->
// Environment Variables): R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY (an R2 API token with Object Read &
// Write on that bucket only) and R2_BUCKET. The bucket stays private: nothing is read from it but by api/photo.js.
// The local dev server (tools/dev_server.mjs) supplies an in-memory stand-in that forgets everything when it stops
// (or, with DEV_STORE=r2 and the four settings in its environment, uses the real bucket).
// Each photograph is two files: the picture (2048 px on its long side at most) and a small copy for the grids (640 px).
import { createHash, createHmac } from 'node:crypto';

// the most the gallery takes: a photograph and its small copy come to about 0.7 MB, and R2's free allowance is 10 GB
export const LIMITS = { r2: { photos: 12000, bytes: 9e9 }, dev: { photos: 500, bytes: 4e8 } };

const env = process.env;
export function storeName() {
  if (globalThis.__DEV_PHOTOS__) return 'dev';
  if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET) return 'r2';
  return null;                                                       // not set up yet: uploads are refused, politely
}

// put a file; returns its key, which get() and del() take to find it again
export async function putFile(key, buf) {
  const s = storeName();
  if (s === 'dev') { globalThis.__DEV_PHOTOS__.set(key, buf); return key; }
  if (s === 'r2') { const r = await r2('PUT', key, buf, 'image/jpeg'); if (!r.ok) throw new Error('R2 put ' + r.status + ' ' + (await r.text()).slice(0, 200)); return key; }
  throw new Error('no store');
}
export async function getFile(ref) {                                 // the file's bytes, or null if it is gone
  const s = storeName();
  if (s === 'dev') return globalThis.__DEV_PHOTOS__.get(ref) || null;
  const r = s === 'r2' ? await r2('GET', ref) : null;
  if (!r || r.status === 404) return null;
  if (!r.ok) throw new Error('store get ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}
export async function delFiles(refs) {
  const s = storeName();
  if (s === 'dev') { refs.forEach((k) => globalThis.__DEV_PHOTOS__.delete(k)); return; }
  if (s === 'r2') for (const k of refs) { const r = await r2('DELETE', k); if (!r.ok && r.status !== 404) throw new Error('R2 delete ' + r.status); }
}

// ---- Cloudflare R2, through its S3-style API with an AWS Signature Version 4 (no package needed)
const hex = (b) => createHash('sha256').update(b).digest('hex');
const hmac = (k, s) => createHmac('sha256', k).update(s).digest();
// the signature itself, apart so it can be checked: it gives Amazon's published example signature (GET Object, checked 7 Oct 2026)
export function sigv4({ method, host, path, query = '', headers, payloadHash, region, service, accessKey, secret, amzDate }) {
  const all = { host, ...headers }, names = Object.keys(all).map((n) => n.toLowerCase()).sort();
  const lower = Object.fromEntries(Object.entries(all).map(([k, v]) => [k.toLowerCase(), String(v).trim()]));
  const canonical = [method, path, query, ...names.map((n) => n + ':' + lower[n]), '', names.join(';'), payloadHash].join('\n');
  const day = amzDate.slice(0, 8), scope = `${day}/${region}/${service}/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, hex(canonical)].join('\n');
  const key = hmac(hmac(hmac(hmac('AWS4' + secret, day), region), service), 'aws4_request');
  return { signature: createHmac('sha256', key).update(toSign).digest('hex'), signed: names.join(';'), scope };
}
function r2(method, key, body, type) {
  const host = env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com', path = '/' + env.R2_BUCKET + '/' + key;   // keys are letters, digits, - _ / and .
  const amzDate = new Date().toISOString().replace(/[-:]|\.\d{3}/g, ''), payloadHash = hex(body || '');
  const headers = { 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate, ...(type ? { 'content-type': type } : {}) };
  const { signature, signed, scope } = sigv4({ method, host, path, headers, payloadHash, region: 'auto', service: 's3', accessKey: env.R2_ACCESS_KEY_ID, secret: env.R2_SECRET_ACCESS_KEY, amzDate });
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`;
  return fetch('https://' + host + path, { method, headers, body });
}

// ---- the check on the way in. The upload page makes every photograph afresh on the guest's phone (a canvas, which keeps
// no camera details), but this does not rely on it: the file must be a whole JPEG of a sensible size, and every block
// that can carry camera details, the place it was taken, or comments (EXIF, XMP, IPTC, and anything after the picture's
// end) is cut out. Kept: the JFIF header, a colour profile, and the Adobe colour marker. Returns { buf, w, h } or null.
export function cleanJpeg(buf, maxSide) {
  if (!Buffer.isBuffer(buf) || buf.length < 200 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  const out = [buf.subarray(0, 2)];
  let i = 2, w = 0, h = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return null;
    const m = buf[i + 1];
    if (m === 0xff) { i++; continue; }                               // fill byte
    if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) return null;   // no segment may stand here
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return null;
    const seg = buf.subarray(i, i + 2 + len);
    if (m === 0xda) {                                                // the picture data runs to the end marker, FF D9 (it never contains FF D9 itself)
      const end = buf.indexOf(Buffer.from([0xff, 0xd9]), i + 2 + len);
      if (end < 0 || !w || !h) return null;
      out.push(buf.subarray(i, end + 2));                            // anything after the end is dropped
      if (Math.max(w, h) > maxSide || Math.min(w, h) < 40) return null;
      return { buf: Buffer.concat(out), w, h };
    }
    if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); }   // the frame header: the size
    const tag = (s) => seg.subarray(4, 4 + s.length).toString('latin1') === s;
    const keep = m === 0xe0 ? tag('JFIF\0') : m === 0xe2 ? tag('ICC_PROFILE\0') : m === 0xee ? tag('Adobe') : !(m >= 0xe0 && m <= 0xef) && m !== 0xfe;   // APP0-15 and comments only as above
    if (keep) out.push(seg);
    i += 2 + len;
  }
  return null;
}
