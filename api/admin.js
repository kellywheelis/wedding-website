// The owner's private page (rsvp-admin.html) talks to this. Every call carries the private key (header x-admin-key).
//   GET  /api/admin                                   -> { events, households: [{ ...household, reply }] }
//   POST /api/admin { action: 'guests', rows }        -> replaces the guest list; rows: [{ names, seats, events, code?, phones? }]
//   POST /api/admin { action: 'reset', id }           -> clears one household's reply (a test reply, say)
// Each household gets its own code (VENUS-4827), typed with one of its phone numbers, and a private key for its QR code.
// Loading a new list keeps a household's code, key and reply when the row gives that code, or the same names, or one of
// the same phone numbers; otherwise it gets new ones. A household with no phone number can sign in only by its QR code.
import { redis, EVENTS, isAdmin, phoneDigits, codeKey, newCode, newQrKey, clip, household, parse } from './_lib.js';
import { randomBytes } from 'node:crypto';

// what a spreadsheet may say for an event: its id, or a word from its name; "all" for every event
const EVENT_WORDS = { movie: ['movie', 'pizza', 'welcome'], siena: ['siena'], gelato: ['gelato', 'pool'], brunch: ['brunch', 'farewell'] };
function eventIds(v, problems, where) {
  const words = Array.isArray(v) ? v : String(v || '').split(/[,;/+]|\band\b/);
  const out = new Set();
  words.map((w) => String(w).trim().toLowerCase()).filter(Boolean).forEach((w) => {
    if (w === 'all') { EVENTS.forEach((e) => out.add(e.id)); return; }
    const hit = Object.keys(EVENT_WORDS).find((id) => id === w || EVENT_WORDS[id].some((k) => w.includes(k)));
    if (hit) out.add(hit); else problems.push(where + ': no event called "' + w + '"');
  });
  return EVENTS.map((e) => e.id).filter((id) => out.has(id));      // in the order of the weekend
}
const nameKey = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'not the key' });

  if (req.method === 'GET') {
    const ids = (await redis.smembers('hh:all')) || [];
    const households = [];
    for (const id of ids) { const hh = await household(id); if (hh) households.push({ ...hh, reply: parse(await redis.get('reply:' + id)) }); }
    households.sort((a, b) => a.names.localeCompare(b.names));
    return res.status(200).json({ events: EVENTS, households });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body || {};

  if (body.action === 'reset') {
    await redis.del('reply:' + clip(body.id, 40));
    return res.status(200).json({ ok: true });
  }

  if (body.action === 'guests') {
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const problems = [], notes = [], next = [], givenCodes = new Map(), phoneOn = new Map();
    rows.forEach((r, i) => {
      const names = clip(r.names, 200), where = 'Row ' + (i + 1) + (names ? ' (' + names + ')' : '');
      if (!names) { problems.push(where + ': no names'); return; }
      const seats = Math.floor(Number(r.seats));
      if (!(seats >= 1 && seats <= 20)) problems.push(where + ': seats should be a number from 1 to 20');
      const phones = [...new Set((Array.isArray(r.phones) ? r.phones : String(r.phones || '').split(/[,;/]|\bor\b/)).map(phoneDigits).filter(Boolean))];
      if (!phones.length) notes.push(where + ': no phone number, so only its QR code will sign it in');
      phones.forEach((p) => { if (phoneOn.has(p)) problems.push(where + ': the phone ' + p + ' is also on ' + phoneOn.get(p)); else phoneOn.set(p, names); });
      let code = clip(r.code, 30).toUpperCase();
      if (code) {
        if (!/^[A-Z]+-?\d{3,6}$/.test(code.replace(/\s/g, ''))) problems.push(where + ': the code "' + code + '" should be a word and digits, like VENUS-4827');
        else if (givenCodes.has(codeKey(code))) problems.push(where + ': the code ' + code + ' is also on ' + givenCodes.get(codeKey(code)));
        else givenCodes.set(codeKey(code), names);
      }
      next.push({ names, seats, events: eventIds(r.events, problems, where), phones, code });
    });
    if (!next.length) problems.push('No rows to load.');
    if (problems.length) return res.status(400).json({ error: 'Nothing was changed.', problems });

    // match each row to a household already on the list (its code, its names, or a phone number), to keep its code and reply
    const oldIds = (await redis.smembers('hh:all')) || [], old = [];
    for (const id of oldIds) { const hh = await household(id); if (hh) old.push(hh); }
    const byCode = new Map(old.map((h) => [codeKey(h.code), h])), byName = new Map(old.map((h) => [nameKey(h.names), h])), byPhone = new Map();
    old.forEach((h) => (h.phones || []).forEach((p) => byPhone.set(p, h)));
    const used = new Set();
    next.forEach((hh) => {
      const cands = [hh.code && byCode.get(codeKey(hh.code)), byName.get(nameKey(hh.names)), ...hh.phones.map((p) => byPhone.get(p))];
      const m = cands.find((h) => h && !used.has(h.id));
      if (m) { hh.id = m.id; used.add(m.id); hh.qr = m.qr; if (!hh.code) hh.code = m.code; }
    });
    const taken = new Set(next.filter((h) => h.code).map((h) => codeKey(h.code)));
    next.forEach((hh) => {
      if (!hh.id) { hh.id = 'h' + randomBytes(4).toString('hex'); used.add(hh.id); }
      if (!hh.code) { hh.code = newCode(taken); taken.add(codeKey(hh.code)); }
      if (!hh.qr) hh.qr = newQrKey();
    });
    for (const h of old) { await redis.del('code:' + codeKey(h.code)); if (h.qr) await redis.del('qr:' + h.qr); if (!used.has(h.id)) await redis.del('hh:' + h.id); }
    await redis.del('hh:all');
    for (const hh of next) { await redis.set('hh:' + hh.id, JSON.stringify(hh)); await redis.set('code:' + codeKey(hh.code), hh.id); await redis.set('qr:' + hh.qr, hh.id); }
    await redis.sadd('hh:all', ...next.map((hh) => hh.id));
    return res.status(200).json({ ok: true, households: next.length, seats: next.reduce((n, hh) => n + hh.seats, 0), kept: next.filter((h) => oldIds.includes(h.id)).length, notes });
  }
  return res.status(400).json({ error: 'unknown action' });
}
