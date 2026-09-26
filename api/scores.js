// The arcade's scoreboard: one small function on Vercel, backed by Upstash Redis (the "KV" store).
//   GET  /api/scores?game=italy            -> { top: [{ name, score, when }, ...] }   (the best ten)
//   POST /api/scores  { game, name, score } -> { top, rank, id }                     (posts a score, returns the board and where it landed)
//   POST /api/scores  { game, remove: id }  -> { ok, top }                           (takes a score off the board: its poster's own, below)
// Names are three letters A-Z; a short list of words is refused; each address may post or remove a few times a minute.
// A posted score's id carries a random part (NAME:when:secret) that only its poster's device is given, and the board
// never shows it, so a score can be removed only from the device that posted it (the owner's wish, 26 Sept 2026: a guest
// may take their own initials off). Scores posted before that have no secret and stay.
import { Redis } from '@upstash/redis';
import { randomBytes } from 'node:crypto';

const GAMES = new Set(['italy', 'piazza', 'bouquet', 'flight', 'seating']);
const MAX = { italy: 30000, piazza: 10000, bouquet: 20000, flight: 20000, seating: 200000 };   // above these a score cannot be genuine
const BAD = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'CUM', 'DIK', 'DIC', 'COK', 'TIT', 'FAG', 'NIG', 'KKK', 'SEX', 'JEW', 'GAY', 'DIE', 'POO', 'PEE', 'WTF', 'FUX', 'PIS', 'VAG', 'HOE', 'SLT', 'CNT']);
const redis = globalThis.__DEV_REDIS__ || new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });   // the names Vercel's KV integration injects (the local dev server supplies a stand-in)

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const game = String((req.method === 'GET' ? req.query.game : (req.body || {}).game) || '');
  if (!GAMES.has(game)) return res.status(400).json({ error: 'unknown game' });
  const key = 'scores:' + game;
  if (req.method === 'GET') return res.status(200).json({ top: await top(key) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const body = req.body || {};
  if (body.remove !== undefined) {                                           // a guest taking their own score off
    const id = String(body.remove);
    if (!/^[A-Z]{3}:\d{10,15}:[A-Za-z0-9_-]{16,32}$/.test(id)) return res.status(400).json({ error: 'id' });
    if (await tooFast(req)) return res.status(429).json({ error: 'slow down' });
    const gone = await redis.zrem(key, id);
    return res.status(200).json({ ok: gone === 1, top: await top(key) });
  }
  const name = String(body.name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const score = Math.floor(Number(body.score));
  if (name.length !== 3 || BAD.has(name)) return res.status(400).json({ error: 'name' });
  if (!(score >= 0) || score > MAX[game]) return res.status(400).json({ error: 'score' });
  if (await tooFast(req)) return res.status(429).json({ error: 'slow down' });

  // a sorted set, score = points; the member carries the name, the moment (so equal scores stay distinct) and the secret
  const member = name + ':' + Date.now() + ':' + randomBytes(12).toString('base64url');
  await redis.zadd(key, { score, member });
  await redis.zremrangebyrank(key, 0, -101);                                  // keep the best hundred
  const rank = await redis.zrevrank(key, member);
  return res.status(200).json({ top: await top(key), rank: rank === null ? null : rank + 1, id: member });
}

async function tooFast(req) {                                                  // each address: eight posts or removals a minute
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const hits = await redis.incr('rate:' + ip); if (hits === 1) await redis.expire('rate:' + ip, 60);
  return hits > 8;
}

async function top(key) {
  const raw = await redis.zrange(key, 0, 9, { rev: true, withScores: true });   // [member, score, member, score, ...]
  const out = [];
  for (let i = 0; i < raw.length; i += 2) { const [name, when] = String(raw[i]).split(':'); out.push({ name, score: Number(raw[i + 1]), when: Number(when) }); }
  return out;
}
