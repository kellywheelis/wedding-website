// The guests' photographs, one file at a time (see api/gallery.js): /api/photo?id=<id>&s=f for the picture, s=t for its
// small copy. They come through here, not straight from the store, so the store can stay private whichever one is chosen,
// and so the 3D gallery may paint them into its frame (a browser lets a page draw into 3D only pictures from its own
// address). Vercel's CDN keeps each file a day (a photograph never changes), so the store is seldom asked. A removed
// photograph is gone from here at once, though for up to a day the CDN may still hand a copy it holds to someone who
// has that photograph's exact address.
import { redis, parse } from './_lib.js';
import { getFile } from './_photos.js';

export default async function handler(req, res) {
  const q = req.query || {}, id = String(q.id || '');
  const p = /^[A-Za-z0-9_-]{16}$/.test(id) ? parse(await redis.get('gal:p:' + id)) : null;
  const buf = p ? await getFile(q.s === 't' ? p.thumb : p.full) : null;
  if (!buf) { res.setHeader('Cache-Control', 'no-store'); return res.status(404).json({ error: 'no such photograph' }); }
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
  return res.status(200).send(buf);
}
