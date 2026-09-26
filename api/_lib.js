// Shared by the guest and admin endpoints: the database, the weekend's events, and small helpers.
//
// How a household signs in (the owner's choice, 26 Sept 2026; no texts are ever sent, so no spam filters in the way):
//   typed, on any device: one of the household's phone numbers AND its own code, printed in its invitation pack
//     (VENUS-4827); both must belong to the same household
//   the QR code in the pack: a link carrying the household's private key (?k=...), which signs it in with nothing to type
//
// What is kept (Upstash Redis, the store the arcade's scoreboard already uses):
//   hh:<id>        a household: { id, names, code, qr, phones: [digits], seats, events }
//   hh:all         the set of household ids
//   code:<CODE>    a household code (as normalised by codeKey) -> its household id
//   qr:<key>       a QR key -> its household id
//   reply:<id>     the household's RSVP: { yes, seats, of, events, plus, diet, note, name, card, when }
//   replylog       every reply as posted, newest first (a record; the admin page reads reply:<id>)
//   sess:<token>   a signed-in device -> household id (lasts 200 days)
//   lrate:<ip>     wrong-guess counter for sign-in, per address, 10 minutes
import { Redis } from '@upstash/redis';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

// the local dev server (tools/dev_server.mjs) supplies an in-memory stand-in; on Vercel it is the real store
// (values are kept as JSON text and read back as text: the library's automatic parsing would turn an id or a hash that
// happens to look like a number, "1e5…", into one)
export const redis = globalThis.__DEV_REDIS__ || new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN, automaticDeserialization: false });

// the events guests can be invited to, in the order of the weekend; Saturday, the wedding, is the card's yes/no
export const EVENTS = [
  { id: 'movie', name: 'Welcome movie & pizza night', day: 'Thursday, April 22' },
  { id: 'siena', name: 'Siena day', day: 'Friday, April 23' },
  { id: 'gelato', name: 'Gelato pool day', day: 'Sunday, April 25' },
  { id: 'brunch', name: 'Farewell brunch', day: 'Monday, April 26' },
];

// the private page's key: only its SHA-256 is here. The key itself was given to the owner (26 Sept 2026), not saved
// anywhere in the project; to replace it, put the SHA-256 of a new key here
const ADMIN_SHA256 = '72e7e255e655a8dd70b95bfd86041b8734f6d91faf550fa4934fc95c5ca5ac04';

export const sha256 = (s) => createHash('sha256').update(String(s)).digest('hex');
export const newToken = () => randomBytes(24).toString('hex');
export function sameHash(a, b) {
  const x = Buffer.from(String(a), 'hex'), y = Buffer.from(String(b), 'hex');
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
export const isAdmin = (key) => !!key && sameHash(sha256(key), ADMIN_SHA256);

// a phone number as digits with its country code: US numbers typed without the 1 get it (555 123 4567 -> 15551234567)
export function phoneDigits(s) {
  let d = String(s || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);                          // 0039... typed the European way
  if (d.length === 10) d = '1' + d;
  return d.length >= 8 && d.length <= 15 ? d : '';
}

// household codes: a word from the gallery and four digits, VENUS-4827. Read back forgivingly: case, spaces and the dash
// do not matter, so "venus 4827" opens the same household
const CODE_WORDS = ['VENUS', 'CUPID', 'GRACES', 'FLORA', 'SIENA', 'GELATO', 'APOLLO', 'DIANA', 'ARIADNE', 'BACCHUS', 'MERCURY', 'PEGASUS',
  'PRIMAVERA', 'MARS', 'LYRE', 'LAUREL', 'MYRTLE', 'CYPRESS', 'OLIVE', 'VESPA', 'DUOMO', 'CAMPO', 'TUSCANY', 'ROSE'];
export const codeKey = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export function newCode(taken) {
  for (;;) {
    const c = CODE_WORDS[randomBytes(1)[0] % CODE_WORDS.length] + '-' + String(randomBytes(2).readUInt16BE(0) % 9000 + 1000);
    if (!taken.has(codeKey(c))) return c;
  }
}

export const newQrKey = () => randomBytes(16).toString('base64url');   // 22 characters, for the QR link: not guessable

export const clip = (s, n = 500) => String(s ?? '').trim().slice(0, n);
export const ipOf = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
export const parse = (v) => { if (v == null) return null; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch (e) { return null; } };
export const household = async (id) => parse(await redis.get('hh:' + id));
export const eventsOf = (hh) => EVENTS.filter((e) => (hh.events || []).includes(e.id));

// the household a request's session belongs to (Authorization: Bearer <token>), or null
export async function sessionHousehold(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer ([0-9a-f]{48})$/);
  if (!m) return null;
  const id = await redis.get('sess:' + m[1]);
  return id ? { token: m[1], hh: await household(id) } : null;
}
