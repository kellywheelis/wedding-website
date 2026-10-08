// The guests' photographs (the owner's wish, 7 Oct 2026). From 2 pm in Italy on the wedding day the details room's
// centrepiece stops being the RSVP's reveal and becomes a slideshow of photographs the guests add, and anyone visiting the
// site can look through them afterwards. Guests add them on their phones from the QR code on the sign at the villa: its
// link (/add?k=<key>) carries a key, so the upload page works only for someone who has seen the sign; there is no sign-in.
// A photograph shows at once; the owner removes any she wishes from the private page. Uploads close two weeks after the
// wedding; the photographs stay.
//   GET  /api/gallery                        -> { live, open, opens, closes, photos: [{ id, w, h }] }   newest first, and no
//                                               photographs before the day (Vercel's CDN keeps the answer 15 seconds)
//   GET  /api/gallery?k=<key>                -> { live, open, opens, closes, keyOk, ready }   the upload page's first question
//   GET  /api/gallery?all=1  (x-admin-key)   -> { ...the dates, store, key, used, limit, photos: [{ id, w, h, t }] }   everything,
//                                               before the day too
//   POST /api/gallery { action: 'add', k, full, thumb } -> { ok, id }   full and thumb: base64 JPEGs, made by the upload page
//        (with x-admin-key in place of k, at any time: so the owner can try it before the day)
//   POST /api/gallery { action: 'delete', ids }  (x-admin-key) -> { ok, removed }
//   POST /api/gallery { action: 'newkey' }       (x-admin-key) -> { key }   a new link for the sign; the old one stops working
// The files are served by api/photo.js (/api/photo?id=...&s=f|t) from the store in _photos.js.
// What is kept (Upstash Redis, with the RSVP):
//   gal:z          the photographs, a sorted set: score = when added, member = "<id>:<width>:<height>"
//   gal:p:<id>     a photograph: { id, t, w, h, tw, th, bytes, full, thumb (where the store keeps its two files), member }
//   gal:bytes      the size of all the files kept
//   gal:key        the sign link's key (made when the private page first asks for it)
//   grate:<ip>     uploads per address, per 10 minutes
import { redis, isAdmin, sha256, sameHash, newQrKey, ipOf, parse } from './_lib.js';
import { storeName, putFile, delFiles, cleanJpeg, LIMITS } from './_photos.js';
import { randomBytes } from 'node:crypto';

// the dates: live from 2 pm on Saturday April 24, 2027 in Italy (summer time, UTC+2: noon UTC; the owner's choice, 7 Oct
// 2026, moved from midnight), and open for photographs until Saturday May 8 has ended everywhere (noon UTC on the 9th is
// midnight in the world's last time zone, UTC-12). The local dev server can move both (DEV_GALLERY, DEV_GALLERY_CLOSED)
// to try the gallery before the day.
const OPENS = Date.UTC(2027, 3, 24, 12), CLOSES = Date.UTC(2027, 4, 9, 12);
function galleryState() {
  const o = globalThis.__DEV_GALLERY_OPENS__ ?? OPENS, c = globalThis.__DEV_GALLERY_CLOSES__ ?? CLOSES, now = Date.now();
  return { live: now >= o, open: now >= o && now < c, opens: o, closes: c };
}
const PER_ADDRESS = 150, WINDOW = 600;                                // uploads allowed per address per 10 minutes (a whole villa may share one)
const ID = /^[A-Za-z0-9_-]{16}$/;

async function uploadKey() { let k = await redis.get('gal:key'); if (!k) { k = newQrKey(); await redis.set('gal:key', k); } return k; }
async function keyRight(k) { const cur = await redis.get('gal:key'); return !!cur && typeof k === 'string' && sameHash(sha256(k), sha256(cur)); }
async function list(detail) {
  const raw = await redis.zrange('gal:z', 0, -1, { rev: true, withScores: true }), out = [];   // [member, score, member, score, ...]
  for (let i = 0; i < raw.length; i += 2) { const [id, w, h] = String(raw[i]).split(':'); out.push(detail ? { id, w: +w, h: +h, t: Number(raw[i + 1]) } : { id, w: +w, h: +h }); }
  return out;
}
const fromBase64 = (s, max) => (typeof s === 'string' && s.length <= max * 4 / 3 + 4 && /^[A-Za-z0-9+/]+=*$/.test(s) ? Buffer.from(s, 'base64') : null);

export default async function handler(req, res) {
  const st = galleryState(), admin = isAdmin(req.headers['x-admin-key']);
  if (req.method === 'GET') {
    const q = req.query || {};
    if (q.all !== undefined) {
      res.setHeader('Cache-Control', 'no-store');
      if (!admin) return res.status(403).json({ error: 'not the key' });
      const store = storeName();
      return res.status(200).json({ ...st, store, key: await uploadKey(), used: Number(await redis.get('gal:bytes')) || 0, limit: store ? LIMITS[store] : null, photos: await list(true) });
    }
    if (q.k !== undefined) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ...st, keyOk: admin || await keyRight(String(q.k)), admin, ready: !!storeName() });
    }
    res.setHeader('Cache-Control', st.live ? 'public, s-maxage=15, stale-while-revalidate=60' : 'public, s-maxage=300');
    return res.status(200).json({ ...st, photos: st.live ? await list(false) : [] });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  res.setHeader('Cache-Control', 'no-store');
  const body = req.body || {};

  if (body.action === 'add') {
    if (!admin) {
      if (!st.open) return res.status(403).json({ error: st.live ? 'The gallery closed to new photographs on May 8. Thank you for every one!' : 'The gallery opens for photographs at 2 pm on the wedding day, April 24.', ...st });
      if (!(await keyRight(body.k))) return res.status(403).json({ error: 'This link is not working. Please scan the QR code on the sign again.', badKey: true });
      const rk = 'grate:' + ipOf(req), n = await redis.incr(rk);
      if (n === 1) await redis.expire(rk, WINDOW);
      if (n > PER_ADDRESS) return res.status(429).json({ error: 'That is a great many photographs at once! Please wait a few minutes, then add the rest.' });
    }
    const store = storeName();
    if (!store) return res.status(503).json({ error: 'The gallery is not quite ready for photographs yet. Please try again later.' });
    const full = cleanJpeg(fromBase64(body.full, 3.2e6), 2048), thumb = cleanJpeg(fromBase64(body.thumb, 4e5), 640);
    if (!full || !thumb) return res.status(400).json({ error: 'That photograph could not be read. Please try another.' });
    const size = full.buf.length + thumb.buf.length, lim = LIMITS[store];
    if ((await redis.zcard('gal:z')) >= lim.photos || (Number(await redis.get('gal:bytes')) || 0) + size > lim.bytes) return res.status(507).json({ error: 'The gallery is full. Thank you for all the photographs!' });
    const id = randomBytes(12).toString('base64url'), t = Date.now(), member = id + ':' + full.w + ':' + full.h;
    let fullRef = null, thumbRef = null;
    try {
      fullRef = await putFile('guest-photos/' + id + '.jpg', full.buf);
      thumbRef = await putFile('guest-photos/' + id + '-s.jpg', thumb.buf);
    } catch (e) {
      console.error('gallery: could not store a photograph', e);
      if (fullRef) try { await delFiles([fullRef]); } catch (e2) { /* left in the store, listed nowhere */ }
      return res.status(502).json({ error: 'The photograph could not be saved. Please try again.' });
    }
    await redis.set('gal:p:' + id, JSON.stringify({ id, t, w: full.w, h: full.h, tw: thumb.w, th: thumb.h, bytes: size, full: fullRef, thumb: thumbRef, member }));
    await redis.zadd('gal:z', { score: t, member });
    await redis.incrby('gal:bytes', size);
    return res.status(200).json({ ok: true, id });
  }

  if (!admin) return res.status(403).json({ error: 'not the key' });
  if (body.action === 'delete') {                                    // off the list first, so it is gone from the site at once; then its files
    const ids = (Array.isArray(body.ids) ? body.ids : []).map(String).filter((x) => ID.test(x)).slice(0, 500);
    let removed = 0;
    for (const id of ids) {
      const p = parse(await redis.get('gal:p:' + id));
      if (!p) continue;
      await redis.zrem('gal:z', p.member); await redis.del('gal:p:' + id); await redis.incrby('gal:bytes', -p.bytes);
      try { await delFiles([p.full, p.thumb]); } catch (e) { console.error('gallery: removed from the list, but the files of ' + id + ' are still in the store', e); }
      removed++;
    }
    return res.status(200).json({ ok: true, removed });
  }
  if (body.action === 'newkey') { const key = newQrKey(); await redis.set('gal:key', key); return res.status(200).json({ key }); }
  return res.status(400).json({ error: 'unknown action' });
}
