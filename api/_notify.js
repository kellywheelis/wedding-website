// An email to the couple whenever a household posts or changes its RSVP (the owner's request, 26 Sept 2026), so the
// private page need not be watched. Sent through Resend (resend.com, free up to 100 a day), by a plain call to its API:
// no package. It is off until two settings are added to the Vercel project (Settings -> Environment Variables):
//   RESEND_API_KEY   the key from resend.com (API Keys)
//   RSVP_NOTIFY_TO   where the emails go; several addresses may be separated by commas. From Resend's own test sender
//                    (below) mail only reaches the address the Resend account was opened with; other addresses need
//                    the site's domain verified with Resend first, and FROM changed to an address on it.
// A failed or slow email never holds up or spoils a guest's reply: it is given five seconds, and errors are only logged.
import { EVENTS } from './_lib.js';

const FROM = 'The Gallery RSVP <onboarding@resend.dev>';
const eventName = (id) => (EVENTS.find((e) => e.id === id) || { name: id }).name;
const answer = (r) => (r.yes === 'yes' ? 'Yes, ' + r.seats + ' of ' + r.of + ' seats' : 'No, with regret');
const events = (r) => (r.yes === 'yes' ? (r.events || []).map(eventName).join(', ') || 'none' : '');

export async function notifyReply(hh, reply, before) {
  const key = process.env.RESEND_API_KEY, to = String(process.env.RSVP_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!key || !to.length) return;
  const subject = (before ? 'Changed RSVP from ' : 'RSVP from ') + hh.names + ': ' + answer(reply);
  const lines = [
    hh.names + (before ? ' changed their reply.' : ' replied.'), '',
    'Coming: ' + answer(reply),
    ...(reply.yes === 'yes' && (hh.events || []).length ? ['Events: ' + events(reply)] : []),   // left out for a household asked to none
    ...(reply.plus ? ['Plus-one: ' + reply.plus] : []),
    ...(reply.diet ? ['Allergies or dietary needs: ' + reply.diet] : []),
    ...(reply.note ? ['Note: ' + reply.note] : []),
    'Signed: ' + reply.name,
    ...(before ? ['', 'Before: ' + answer(before) + (before.yes === 'yes' && (hh.events || []).length ? '; events: ' + events(before) : '')] : []),
    '', 'Every reply: https://kaweddinggallery.com/rsvp-admin',
  ];
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, text: lines.join('\n') }),
    });
    if (!r.ok) console.error('RSVP email not sent:', r.status, await r.text().catch(() => ''));
  } catch (e) { console.error('RSVP email not sent:', e.message); }
}
