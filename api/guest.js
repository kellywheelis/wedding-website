// A guest's side of the RSVP: sign in, read the private details, post the card.
//   POST /api/guest { action: 'login', phone, code }  -> { token, household, reply, cards }   (typed: a phone number of the
//                                                         household and its code, VENUS-4827, any case or spacing)
//   POST /api/guest { action: 'login', key }          -> the same, from the QR code's link (?k=...)
//   GET  /api/guest  (Authorization: Bearer <token>)  -> { household, reply, cards }        (a returning device)
//   POST /api/guest { action: 'rsvp', reply }  (token) -> { ok, reply }   (and an email to the couple: _notify.js)
//   POST /api/guest { action: 'logout' }       (token) -> { ok }
// The household's seats and events decide what a reply may say: never more seats, never an event they are not invited to.
// Every signed-in answer carries rsvp: { open, by } (the deadline, in _lib.js); once it has passed, a reply is refused (403).
import { redis, newToken, codeKey, phoneDigits, clip, ipOf, household, eventsOf, sessionHousehold, parse, rsvpState } from './_lib.js';
import { CARDS } from './_private.js';
import { notifyReply } from './_notify.js';

const SESSION_DAYS = 200;
const TRIES = 10, TRY_WINDOW = 600;                                   // wrong guesses allowed per address, per 10 minutes

const publicHousehold = (hh) => ({ names: hh.names, seats: hh.seats, events: eventsOf(hh) });
async function signedIn(hh) { return { household: publicHousehold(hh), reply: parse(await redis.get('reply:' + hh.id)), cards: CARDS, rsvp: rsvpState() }; }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const s = await sessionHousehold(req);
    if (!s || !s.hh) return res.status(401).json({ error: 'signed out' });
    return res.status(200).json(await signedIn(s.hh));
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body || {};

  if (body.action === 'login') {
    const ip = ipOf(req), rk = 'lrate:' + ip;
    const tries = Number(await redis.get(rk)) || 0;
    if (tries >= TRIES) return res.status(429).json({ error: 'Too many tries. Please wait ten minutes and try again.' });
    const fail = async (msg) => { const n = await redis.incr(rk); if (n === 1) await redis.expire(rk, TRY_WINDOW); return res.status(401).json({ error: msg }); };
    let hh = null;
    if (body.key) {                                                  // the QR code's link
      const k = String(body.key).replace(/[^A-Za-z0-9_-]/g, '');
      const id = k.length === 22 && await redis.get('qr:' + k);
      hh = id && await household(id);
      if (!hh) return fail('That link has not worked. Please sign in with your phone number and the code from your invitation.');
    } else {                                                         // typed: the phone number and the code must both be the household's
      const key = codeKey(body.code), digits = phoneDigits(body.phone);
      const id = digits && key.length >= 6 && key.length <= 20 && await redis.get('code:' + key);
      hh = id && await household(id);
      if (!hh || !(hh.phones || []).includes(digits)) return fail('That phone number and code do not match our guest list. The code is printed in your invitation.');
    }
    const token = newToken();
    await redis.set('sess:' + token, hh.id, { ex: SESSION_DAYS * 86400 });
    await redis.del(rk);
    return res.status(200).json({ token, ...(await signedIn(hh)) });
  }

  const s = await sessionHousehold(req);
  if (!s || !s.hh) return res.status(401).json({ error: 'signed out' });

  if (body.action === 'logout') { await redis.del('sess:' + s.token); return res.status(200).json({ ok: true }); }

  if (body.action === 'rsvp') {
    const rsvp = rsvpState();
    if (!rsvp.open) return res.status(403).json({ error: 'The RSVP closed on ' + rsvp.by + '. Please get in touch with us directly.', rsvp });
    const r = body.reply || {}, hh = s.hh;
    const yes = r.yes === 'yes' ? 'yes' : r.yes === 'no' ? 'no' : null;
    if (!yes) return res.status(400).json({ error: 'Yes or no, first.' });
    const name = clip(r.name, 200);
    if (!name) return res.status(400).json({ error: 'Your name, first.' });
    const allowed = new Set(hh.events || []);
    const seats = yes === 'yes' ? Math.max(0, Math.min(hh.seats, Math.floor(Number(r.seats)) || 0)) : 0;
    const events = yes === 'yes' ? [...new Set((Array.isArray(r.events) ? r.events : []).map(String))].filter((e) => allowed.has(e)) : [];
    const reply = { yes, seats, of: hh.seats, events, name, plus: clip(r.plus, 200), diet: clip(r.diet), note: clip(r.note, 1000),
      card: Math.max(0, Math.min(40, Math.floor(Number(r.card)) || 0)), when: Date.now() };
    const before = parse(await redis.get('reply:' + hh.id));
    await redis.set('reply:' + hh.id, JSON.stringify(reply));
    await redis.lpush('replylog', JSON.stringify({ id: hh.id, ...reply }));
    await redis.ltrim('replylog', 0, 1999);
    await notifyReply(hh, reply, before);                            // an email to the couple, when it is set up (_notify.js)
    return res.status(200).json({ ok: true, reply });
  }
  return res.status(400).json({ error: 'unknown action' });
}
