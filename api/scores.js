// The arcade's scoreboard: one small function on Vercel, backed by Upstash Redis (the "KV" store).
//   GET  /api/scores?game=italy            -> { top: [{ name, score, when }, ...] }   (the best ten)
//   POST /api/scores  { game, name, score } -> { top, rank }                         (posts a score, returns the board and where it landed)
// Names are three letters A-Z; a short list of words is refused; each address may post a few times a minute.
import { Redis } from '@upstash/redis';

const GAMES = new Set(['italy', 'piazza', 'bouquet', 'flight']);
const MAX = { italy: 30000, piazza: 10000, bouquet: 20000, flight: 20000 };   // above these a score cannot be genuine
const BAD = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'CUM', 'DIK', 'DIC', 'COK', 'TIT', 'FAG', 'NIG', 'KKK', 'SEX', 'JEW', 'GAY', 'DIE', 'POO', 'PEE', 'WTF', 'FUX', 'PIS', 'VAG', 'HOE', 'SLT', 'CNT']);
const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });   // the names Vercel's KV integration injects

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const game = String((req.method === 'GET' ? req.query.game : (req.body || {}).game) || '');
  if (!GAMES.has(game)) return res.status(400).json({ error: 'unknown game' });
  const key = 'scores:' + game;
  if (req.method === 'GET') return res.status(200).json({ top: await top(key) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const body = req.body || {};
  const name = String(body.name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const score = Math.floor(Number(body.score));
  if (name.length !== 3 || BAD.has(name)) return res.status(400).json({ error: 'name' });
  if (!(score >= 0) || score > MAX[game]) return res.status(400).json({ error: 'score' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const hits = await redis.incr('rate:' + ip); if (hits === 1) await redis.expire('rate:' + ip, 60);
  if (hits > 8) return res.status(429).json({ error: 'slow down' });

  // a sorted set, score = points; the member carries the name and the moment, so equal scores stay distinct
  const member = name + ':' + Date.now();
  await redis.zadd(key, { score, member });
  await redis.zremrangebyrank(key, 0, -101);                                  // keep the best hundred
  const rank = await redis.zrevrank(key, member);
  return res.status(200).json({ top: await top(key), rank: rank === null ? null : rank + 1 });
}

async function top(key) {
  const raw = await redis.zrange(key, 0, 9, { rev: true, withScores: true });   // [member, score, member, score, ...]
  const out = [];
  for (let i = 0; i < raw.length; i += 2) { const [name, when] = String(raw[i]).split(':'); out.push({ name, score: Number(raw[i + 1]), when: Number(when) }); }
  return out;
}
