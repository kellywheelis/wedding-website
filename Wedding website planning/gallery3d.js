import * as THREE from 'three';

// ---------------------------------------------------------------- plan
// Blueprint units divided by 200: 1000 blueprint units = 5 m.
const U = 1 / 200;
const H = 3.95;             // wall height = vault springing
const EYE = 1.62;           // standing eye height

const P = {
  corrX: 500 * U,           // corridor half-width, 2.5 m
  backZ: 12,          // atrium back wall
  wingNearZ: -5,      // wing band, near edge
  wingFarZ: -10,      // wing band, far edge
  wingEndX: 2500 * U,       // wing end wall
  detFarZ: -19,       // details room end wall
  detX: 5             // details room half-width
};

const CLOSE_X = 10.45;        // where you stand for a close look at a wing's principal work, 1.95 m from it
const GALLERY_Z = -2.6;      // centre of the two atrium mini galleries, along the hall

const STATIONS = [
  { id: 'atrium', x: 0, z: 0, yaw: 0, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium', title: 'Two collections, one exhibit',
    body: 'Villa Cetinale, in the hills outside Siena. Two wings and five days of open hours. Wing I is through the opening on your left, Wing II on your right; the hall straight ahead holds the exhibit details — travel, lodging, and the program.',
    meta: 'Turn and choose a wing' },

  { id: 'kelly', x: 0, z: GALLERY_Z, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'kelly1', x: 0, z: GALLERY_Z + 1.3, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false, back: 'kelly',
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'kelly2', x: 0, z: GALLERY_Z - 1.3, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false, back: 'kelly',
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'anthony', x: 0, z: GALLERY_Z, yaw: -Math.PI / 2, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium · Anthony', title: 'Anthony',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'anthony2', x: 0, z: GALLERY_Z - 1.3, yaw: -Math.PI / 2, eye: 2.12, room: 'atrium', accent: '#C9A667', tour: false, back: 'anthony', game: 'menu',
    eyebrow: 'The atrium · Anthony · interactive installation', title: 'The Arcade',
    body: 'Five playable pieces. Getting to Italy, Cross the Piazza, Catch the Bouquet, Flight to Siena, and The Seating Chart. Arrows move, space jumps. Click the frame again to play.',
    meta: 'Anthony Alvarez & Kelly Wheelis, 2026 · interactive installation · Esc steps away' },
  // his artifacts: close-ups a step in from the wall stops (the pieces are small), reached by clicking them from his wall
  { id: 'anthonyCard', x: 1.95, z: GALLERY_Z + 1.05, yaw: -Math.PI / 2, eye: 1.95, pitch: 0, room: 'atrium', accent: '#C9A667', tour: false, back: 'anthony',
    eyebrow: 'The atrium · Anthony · from the collection', title: 'Destiny HERO – Diamond Dude',
    body: 'Anthony is a card battler of some notoriety, with experience that runs across numerous titles and competitions. This is his favorite card, slabbed and graded, hung where a portrait would go. Ask him about it, and allow time.',
    meta: 'Yu-Gi-Oh! trading card, graded slab · from the collection of Anthony Alvarez' },
  { id: 'anthonyCase', x: 1.75, z: GALLERY_Z + 1.75, yaw: -Math.PI / 2, eye: 1.95, pitch: 0, room: 'atrium', accent: '#C9A667', tour: false, back: 'anthony',
    eyebrow: 'The atrium · Anthony · in case of emergency', title: 'The Essentials',
    body: 'It is widely known that Anthony runs on three things: a Peach Red Bull, Hot Sauce, and Marlboro Southern Cuts. One of each, kept behind glass with a hammer, just in case. He plans to cut back after the wedding and quit in time, at which point this becomes a museum piece in the truest sense.',
    meta: 'Mixed media behind glass, with hammer · please do not actually break the glass' },
  { id: 'anthonyAmelia', x: 1.2, z: GALLERY_Z + 1.1, yaw: -1.87, eye: 1.45, pitch: -0.22, room: 'atrium', accent: '#C9A667', tour: false, back: 'anthony',
    eyebrow: 'The atrium · Anthony · the first gift', title: 'A2: Amelia',
    body: 'The first gift Kelly ever gave Anthony: a brick-built Amelia, put together stud by stud. Amelia immediately tried to fight it. Although the muse is still slightly wary of her tiny brick doppelganger, she allows it to continue to exist among us for now.',
    meta: 'Micro-brick model, built by Kelly Wheelis · Siena marble plinth' },

  { id: 'w1', x: -1150 * U, z: -7.5, yaw: Math.PI / 2, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · principal work', title: 'The Birth of Venus',
    body: 'Botticelli gave a woman the entire center of the canvas, in gold light, with flowers in the air and nobody hurrying her. That is the tone we want for the ceremony: golden, unhurried, and every head turned her way.',
    meta: 'Sandro Botticelli, c. 1485 · Uffizi, Florence' },
  { id: 'w1close', x: -CLOSE_X, z: -7.5, yaw: Math.PI / 2, eye: 1.95, room: 'w1', accent: '#93AEA2', tour: false,
    eyebrow: 'Wing I · principal work · up close', title: 'The Birth of Venus',
    body: 'Botticelli gave a woman the entire center of the canvas, in gold light, with flowers in the air and nobody hurrying her. That is the tone we want for the ceremony: golden, unhurried, and every head turned her way.',
    meta: 'Sandro Botticelli, c. 1485 · Uffizi, Florence' },
  { id: 'w1a', x: -6.8, z: -7.5, yaw: 0, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Procession',
    body: 'Down the cypress avenue at four o’clock, in the part of the afternoon when the light does the work for you.',
    meta: 'Live performance · approx. 30 minutes' },
  { id: 'w1b', x: -6.8, z: -7.5, yaw: Math.PI, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Vows',
    body: 'Written by both of us, read once, never rehearsed. Anthony maintains he will not cry.',
    meta: 'Ink on paper · 2027' },

  // Wing I's four side pictures, up close: reached by clicking a picture from its wall's stop; Step back returns there
  { id: 'w1graces', x: -7.8, z: -8.78, yaw: 0, eye: 2.0, room: 'w1', accent: '#93AEA2', tour: false, back: 'w1a',
    eyebrow: 'Wing I · The Procession · the bridal party', title: 'The Three Graces',
    body: 'Every girl needs her squad. The Graces have attended Venus since antiquity: they do the hair, carry the flowers and keep the secrets. The original bridal party. #girlgang',
    meta: 'Francesco Furini, c. 1633 · Hermitage, St Petersburg' },
  { id: 'w1amaryllis', x: -5.9, z: -8.78, yaw: 0, eye: 2.0, room: 'w1', accent: '#93AEA2', tour: false, back: 'w1a',
    eyebrow: 'Wing I · The Procession', title: 'Amaryllis and Mirtillo',
    body: 'A kissing contest, judged by nymphs, and the winner is crowned with flowers. We are not holding a contest. There will be a kiss.',
    meta: 'Anthony van Dyck, c. 1631–32 · Gothenburg Museum of Art' },
  { id: 'w1union', x: -5.9, z: -6.22, yaw: Math.PI, eye: 2.0, room: 'w1', accent: '#93AEA2', tour: false, back: 'w1b',
    eyebrow: 'Wing I · The Vows', title: 'Happy Union',
    body: 'Veronese’s recipe for a happy union: an olive branch, a crown of myrtle, and a dog at your feet for fidelity. We have the dogs covered.',
    meta: 'Paolo Veronese, c. 1575 · National Gallery, London' },
  { id: 'w1mars', x: -7.75, z: -6.22, yaw: Math.PI, eye: 2.0, room: 'w1', accent: '#93AEA2', tour: false, back: 'w1b',
    eyebrow: 'Wing I · The Vows', title: 'Mars and Venus United by Love',
    body: 'Cupid is tying their legs together with a ribbon. The vows do pretty much the same job, with fewer knots.',
    meta: 'Paolo Veronese, 1570s · The Metropolitan Museum of Art, New York' },

  { id: 'w2', x: 1150 * U, z: -7.5, yaw: -Math.PI / 2, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · principal work', title: 'Primavera',
    body: 'A hundred and ninety species of plant in one painting, and a garden that refuses to stop. The reception takes this as instruction as well as inspiration.',
    meta: 'Sandro Botticelli, c. 1480 · Uffizi, Florence' },
  { id: 'w2close', x: CLOSE_X, z: -7.5, yaw: -Math.PI / 2, eye: 1.95, room: 'w2', accent: '#D19A6E', tour: false,
    eyebrow: 'Wing II · principal work · up close', title: 'Primavera',
    body: 'A hundred and ninety species of plant in one painting, and a garden that refuses to stop. The reception takes this as instruction as well as inspiration.',
    meta: 'Sandro Botticelli, c. 1480 · Uffizi, Florence' },
  { id: 'w2a', x: 6.8, z: -7.5, yaw: 0, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Banquet',
    body: 'Tables dressed as banquet still life: figs, pomegranates, spilled candle wax, far too many flowers. We do plan on fewer than a hundred and ninety varieties, though; our commitment to floral design is not nearly as strong as Botticelli’s.',
    meta: 'Still life · perishable · hours undecided' },
  { id: 'w2b', x: 6.8, z: -7.5, yaw: Math.PI, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Dancing',
    body: 'Three Graces, minimum. Participation is not optional but skill is not required. Kelly will dance. Anthony will dance after a Peach Red Bull.',
    meta: 'Performance · ongoing' },

  // "The Banquet" wall's two still lifes, up close
  { id: 'w2utrecht', x: 5.9, z: -8.78, yaw: 0, eye: 2.0, room: 'w2', accent: '#D19A6E', tour: false, back: 'w2a',
    eyebrow: 'Wing II · The Banquet', title: 'Banquet Still Life',
    body: 'A lobster, a game pie, a lute, a macaw, a monkey helping himself to the cherries, and a small white dog pretending not to watch. Our seating plan is slightly more orderly. The dog situation is about the same. It hangs in Amsterdam, which is the real reason it is here: it’s where Anthony proposed, on our second trip there. We have a soft spot.',
    meta: 'Adriaen van Utrecht, 1644 · Rijksmuseum, Amsterdam' },
  { id: 'w2ruoppolo', x: 7.85, z: -8.78, yaw: 0, eye: 2.0, room: 'w2', accent: '#D19A6E', tour: false, back: 'w2a',
    eyebrow: 'Wing II · The Banquet', title: 'Still Life with Fruit',
    body: 'A watermelon split open on a blue-and-white plate, figs, peaches, and a melon nobody has gotten around to yet. Neapolitan still life is mostly an argument for dessert. We agree with it.',
    meta: 'Giovan Battista Ruoppolo, 1650–1699' },
  // "The Dancing" wall's two pictures, up close (as Wing I's): click a picture from the wall's stop; Step back returns there
  { id: 'w2parnassus', x: 5.8, z: -6.22, yaw: Math.PI, eye: 2.0, room: 'w2', accent: '#D19A6E', tour: false, back: 'w2b',
    eyebrow: 'Wing II · The Dancing', title: 'Parnassus',
    body: 'Apollo is on the lyre, the nine Muses have formed a circle, and nobody needed to be asked twice. This is the dance floor we are aiming for. Pegasus is optional.',
    meta: 'Andrea Mantegna, 1497 · Musée du Louvre, Paris' },
  { id: 'w2nastagio', x: 7.75, z: -6.22, yaw: Math.PI, eye: 2.0, room: 'w2', accent: '#D19A6E', tour: false, back: 'w2b',
    eyebrow: 'Wing II · The Dancing', title: 'The Wedding Banquet',
    body: 'Painted as a wedding present in 1483: long tables, a loggia open to the hills, and the waiters arriving in formation. The story that leads up to this feast is best not told at a wedding. The catering, however, is exactly right.',
    meta: 'Sandro Botticelli, 1483 · The Story of Nastagio degli Onesti, IV' },

  { id: 'det', look: 'free', x: 0, z: -12.5, yaw: 0, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · the centerpiece', title: 'The only thing missing from this exhibit is you',
    body: 'Every other work in the building is already hung. This frame is kept for our guests: you are the last piece of the collection, and the one we built the rest around.',
    meta: 'Empty frame, gilt · on loan from the future' },
  // Walk on visits the room in this order: the centrepiece, the table, then sections 1 to 7
  { id: 'detTable', look: 'free', x: 0, z: -13.6, yaw: 0, pitch: -0.5, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · the table', title: 'On the table',
    body: 'The save-the-date and the invitation are here to be handled. Click the save-the-date to pick it up and turn the wheel; click the invitation to open its doors and look inside.', meta: 'Please touch' },
  // the six sections on the walls: you stand before the group, raised to the height of its pictures (`eye`)
  { id: 'detMain', look: 'free', x: 2.2, z: -12.77, yaw: -Math.PI / 2, eye: 2.3, room: 'det', card: 'main', accent: '#C9A667',
    eyebrow: 'Exhibit details · 1', title: 'The Main Details',
    body: 'Two garden parties, painted four and a half centuries before ours. Villa Cetinale, Sovicille, in the hills outside Siena, Saturday, April 24, 2027, with the weekend around it. The maze is real. The cypress avenue is very real. Everything else is in the wall text.',
    meta: 'Villa Cetinale · Sovicille (Siena), Italy · April 24, 2027' },
  { id: 'detSchedule', look: 'free', x: -2.4, z: -11.7225, yaw: Math.PI / 2, eye: 2.3, room: 'det', card: 'schedule', accent: '#C9A667',
    eyebrow: 'Exhibit details · 2', title: 'The Full Schedule',
    body: 'The month of April, as Ferrara painted it: Venus arriving in triumph, the Three Graces, and everyone in their best clothes, ready to dance. Four days in the same month, in the same spirit. Arrive on Thursday, leave on Monday, and dance in between.',
    meta: 'Francesco del Cossa, April (Triumph of Venus), c. 1470 · Palazzo Schifanoia, Ferrara' },
  { id: 'detTravel', look: 'free', x: -2.2, z: -15.9225, yaw: Math.PI / 2, eye: 2.3, room: 'det', card: 'travel', accent: '#C9A667',
    eyebrow: 'Exhibit details · 3 · travel & transportation', title: 'Pegasus, Centaurs & Chariots',
    body: 'Or, as the modern world insists on calling them: planes, trains and automobiles. Pegasus is quickest, the centaurs run roughly on schedule, and a chariot needs somewhere to park. Those arriving by sea should ask Galatea about her dolphins.',
    meta: '' },
  { id: 'detStay', look: 'free', x: 2.4, z: -17.1925, yaw: -Math.PI / 2, eye: 2.3, room: 'det', card: 'stay', accent: '#C9A667',
    eyebrow: 'Exhibit details · 4', title: 'Accommodations',
    body: 'The best-kept bedroom in Venetian painting: slippers by the bed, a small dog on the floor, the window open, and an angel arriving quietly at dawn. We cannot promise the angel. We can help with the bed.',
    meta: 'Vittore Carpaccio, The Dream of St Ursula, 1495 · Gallerie dell’Accademia, Venice' },
  { id: 'detFrontL', look: 'free', x: -3.5, z: -12.75, yaw: Math.PI, eye: 2.2, room: 'det', card: 'logistics', accent: '#A79C85',
    eyebrow: 'Exhibit details · 5', title: 'Advanced Logistics',
    body: 'Lorenzetti painted the Sienese countryside seven hundred years ago: hills, vines, a road winding up to the gate, and everybody arriving safely. The hills have not moved. Pack some shoes that can manage them, and read the wall text for the rest.',
    meta: 'Ambrogio Lorenzetti, The Effects of Good Government in the Countryside, 1338–39 · Palazzo Pubblico, Siena' },
  { id: 'detFrontR', look: 'free', x: 3.4, z: -12.75, yaw: Math.PI, room: 'det', card: 'policies', accent: '#A79C85',
    eyebrow: 'Exhibit details · 6', title: 'Guest Policies',
    body: 'Mantegna painted the Gonzaga household with everyone present and accounted for: the marquis, his wife, the children, the courtiers, a little person, and the dog under the chair. That is the policy in one picture: come as yourself, with the people named on your invitation. The dog, sadly, stays home.',
    meta: 'After Andrea Mantegna, Camera degli Sposi, 1465–74 · Palazzo Ducale, Mantua' },
  // the gift-shop stand under the main frame on the end wall: postcards (the RSVP) and the registry note.
  // You reach it from the main frame's close-up (or by clicking it from anywhere in the room); Step back returns there.
  { id: 'detShop', x: 0, z: -17.0, yaw: 0, pitch: -0.36, room: 'det', card: 'registry', accent: '#C9A667', back: 'detClose',
    eyebrow: 'Exhibit details · 7 · the gift shop', title: 'Registry, Extras & RSVP',
    body: 'Every museum ends in the gift shop, and so does this one. Pick a postcard, write on the back whether you are coming, and post it in the box: that is the RSVP. The card on the counter says what we would like instead of presents, and the guide next to it says where to eat.',
    meta: 'Postcards · the RSVP box · the registry note' },
  // reached only by clicking
  { id: 'detClose', x: 0, z: -16.75, yaw: 0, eye: 2.5, room: 'det', accent: '#C9A667', tour: false,
    eyebrow: 'Exhibit details · the centerpiece · up close', title: 'The only thing missing from this exhibit is you',
    body: 'Every other work in the building is already hung. This frame is kept for our guests: you are the last piece of the collection, and the one we built the rest around.',
    meta: 'Empty frame, gilt · on loan from the future' },
  // the save-the-date, picked up off the table: same standing spot, and Step back puts it down again
  { id: 'detVolvelle', x: 0, z: -13.6, yaw: 0, pitch: -0.5, room: 'det', accent: '#C9A667', tour: false, back: 'detTable',
    eyebrow: 'Exhibit details · on the table', title: 'Save the Date',
    body: 'Kelly Wheelis, 2026. A volvelle: a wheel that turns behind a window. Drag the wheel round, or click the card, to change the picture in the frame.',
    meta: 'Paper, ink, gold foil and brass · edition of 100' },
  // the pop-up invitation, picked up off the table: same standing spot as the save-the-date
  { id: 'detInvite', x: 0, z: -13.6, yaw: 0, pitch: -0.5, room: 'det', accent: '#C9A667', tour: false, back: 'detTable',
    eyebrow: 'Exhibit details · on the table', title: 'The Invitation',
    body: 'Illustrated by Truong Hoai Vu. A pop-up diorama of Villa Cetinale: click the doors to open them, move the mouse to look inside, and click the tab at the top to draw out the card.',
    meta: 'Truong Hoai Vu · vuth.art · Paper and ink' }
];
// stops are referred to by id everywhere, never by position in the list
const ST = {};
STATIONS.forEach((st, i) => { ST[st.id] = i; });
// Write-ups for things in the entrance hall that you look at from the atrium without walking up to them:
// clicking one only changes the panel at the bottom. (Set as `userData.note` on the object.)
const NOTES = {
  pair: { accent: '#C9A667', eyebrow: 'The atrium · a pair', title: 'Venus and Mars',
    body: 'Love and War, just across the hall from each other. She is the Capitoline Venus, surprised on her way out of the bath; he is the Ludovisi Mars, sword still in hand but sitting down, with Cupid playing at his feet. Veronese, in Wing I, shows how that story ends. Love wins, and Mars does not seem to mind.',
    meta: 'Roman marbles after Greek originals · casts at Statens Museum for Kunst, Copenhagen' },
  frescoBride: { accent: '#C9A667', eyebrow: 'The atrium · a wedding fresco', title: 'Venus and the Three Graces Presenting Gifts to a Young Woman',
    body: 'Painted on the wall of a villa outside Florence, most likely for a wedding in the 1480s, and found under whitewash four hundred years later. Venus and the Graces arrive with presents for the bride. The original wedding guests, and they set the bar rather high.',
    meta: 'Sandro Botticelli, c. 1483–86 · fresco from Villa Lemmi · Musée du Louvre, Paris' },
  frescoGroom: { accent: '#C9A667', eyebrow: 'The atrium · a wedding fresco', title: 'A Young Man Being Introduced to the Seven Liberal Arts',
    body: 'The groom’s half of the pair. He is led by the hand to meet Grammar, Rhetoric, Logic, Arithmetic, Geometry, Astronomy and Music, all seven at once, which is a lot of new in-laws for one afternoon.',
    meta: 'Sandro Botticelli, c. 1483–86 · fresco from Villa Lemmi · Musée du Louvre, Paris' }
};
// Wall texts: the long version of a details section, opened from the panel's "Read the full details" button.
// A stop names its card with `card:`. Each card is a title and a list of sections: { h: heading, p: [paragraphs] }.
// EVERYTHING BELOW IS PLACEHOLDER TEXT for the owner to replace.
const TBC = 'To be confirmed.';
const CARDS = {
  main: { title: 'The Main Details', sections: [
    { h: 'When', p: ['Saturday, April 24, 2027. The weekend runs from April 22 to 26. ' + TBC] },
    { h: 'Where', p: ['Villa Cetinale, Sovicille (SI), Tuscany, Italy. Full address and a map link: ' + TBC] },
    { h: 'The essentials', p: [TBC] } ] },
  schedule: { title: 'The Full Schedule', sections: [
    { h: 'Thursday, April 22', p: ['Event, time, place and dress code. ' + TBC] },
    { h: 'Friday, April 23', p: [TBC] },
    { h: 'Saturday, April 24 · the wedding', p: [TBC] },
    { h: 'Sunday, April 25', p: [TBC] },
    { h: 'Monday, April 26', p: [TBC] },
    { h: 'Dress codes', p: [TBC] } ] },
  travel: { title: 'Travel & Transportation', sections: [
    { h: 'By Pegasus (nearest airports)', p: [TBC] },
    { h: 'By centaur (trains and transit hubs)', p: [TBC] },
    { h: 'By chariot (car hire, driving and parking)', p: [TBC] },
    { h: 'Airport transfers', p: [TBC] },
    { h: 'Wedding shuttles', p: [TBC] } ] },
  stay: { title: 'Accommodations', sections: [
    { h: 'Where to stay', p: [TBC] },
    { h: 'Room blocks and group codes', p: [TBC] },
    { h: 'Booking deadlines', p: [TBC] } ] },
  logistics: { title: 'Advanced Logistics', sections: [
    { h: 'Terrain and footwear', p: [TBC] },
    { h: 'Weather in late April', p: [TBC] },
    { h: 'Outlets and voltage', p: [TBC] },
    { h: 'Currency and tipping', p: [TBC] },
    { h: 'Mobile service, wifi and eSIMs', p: [TBC] } ] },
  policies: { title: 'Guest Policies', sections: [
    { h: 'RSVP deadline', p: [TBC] },
    { h: 'Plus-ones', p: [TBC] },
    { h: 'Children', p: [TBC] },
    { h: 'On the day: who to call', p: [TBC] } ] },
  registry: { title: 'Registry & Extras', sections: [
    { h: 'RSVP', p: ['Pick a postcard from the rack, turn it over, and post it in the letterbox.'] },
    { h: 'Gifts', p: ['Our no-physical-gifts note. ' + TBC] },
    { h: 'A local guide', p: ['Sights, food and things to do nearby. ' + TBC] } ] }
};
const ROOM_ENTRY = { atrium: ST.atrium, w1: ST.w1, w2: ST.w2, det: ST.det };
const JUNCTION_Z = -7.5;

// ---------------------------------------------------------------- scene
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// nothing that moves casts a shadow, so the shadow maps are drawn once (and again whenever something is added), not every frame
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d8cdb2');

const camera = new THREE.PerspectiveCamera(70, 1, 0.22, 120);   // near 0.22: the held card is at 0.39; a nearer plane wastes depth precision and lets distant surfaces flicker
camera.position.set(0, EYE, 0);

const loader = new THREE.TextureLoader();
// the loading line along the top edge, and the note at the foot of the doors: every texture and model goes through
// three's default manager, so its progress is the collection's
(function loading() {
  const bar = document.getElementById('loadbar'), note = document.getElementById('hanging'), enter = document.getElementById('enter');
  if (!bar) return;
  let done = false;
  const ready = () => {                                                   // "Hanging the collection…" fades out where the button will be, and "Open the doors" fades in
    if (done) return;
    done = true; bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; if (note) note.style.opacity = '0'; }, 400);
    setTimeout(() => { bar.remove(); if (note) note.remove(); if (enter) { const t = document.getElementById('enterText'); if (t) t.style.opacity = '1'; enter.style.pointerEvents = 'auto'; } }, 1300);   // the box stays; only the words swap
  };
  THREE.DefaultLoadingManager.onProgress = (url, n, total) => { if (!done) bar.style.width = Math.round(100 * n / Math.max(total, 1)) + '%'; };
  THREE.DefaultLoadingManager.onLoad = ready;
  setTimeout(() => { if (!done && note) note.textContent = 'Hanging the collection\u2026 a moment more'; }, 8000);
  setTimeout(ready, 45000);                                               // and never keep anyone at the door longer than this
})();
const tex = (src, rx, ry) => {
  const t = loader.load(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (rx) t.repeat.set(rx, ry || rx);
  return t;
};

const plaster = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 2, 1.4), color: '#efe7d6', roughness: 0.95, metalness: 0 });
const plasterWide = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 4, 1.4), color: '#efe7d6', roughness: 0.95, metalness: 0 });
// stone floor drawn to canvas: pale honed slabs, 0.6 x 1.2 m, laid in staggered courses
// running down the hall, each slab with its own tone, soft clouding, a faint vein or two
// and fine cut joints. One tile covers FLOOR_TILE metres and wraps seamlessly.
const FLOOR_TILE = 7.2;
function floorTexture() {
  const S = 2048, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  const ppm = S / FLOOR_TILE, sw = 0.6 * ppm, sl = 1.2 * ppm;
  const courses = Math.round(FLOOR_TILE / 0.6), perCourse = Math.round(FLOOR_TILE / 1.2);
  const rng = (seed) => () => {             // small seeded generator, so a slab split by the tile edge matches itself
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const slab = (px, py, seed) => {
    const r = rng(seed);
    x.save();
    x.beginPath(); x.rect(px, py, sw, sl); x.clip();
    const tone = 188 + (r() - 0.5) * 44, warm = 0.2 + r() * 0.6;
    x.fillStyle = 'rgb(' + Math.round(tone + 2 * warm) + ',' + Math.round(tone) + ',' + Math.round(tone - 7 * warm) + ')';
    x.fillRect(px, py, sw, sl);
    for (let i = 0; i < 26; i++) {           // soft clouding
      const bx = px + r() * sw, by = py + r() * sl, br = (0.12 + r() * 0.5) * sw;
      const g = x.createRadialGradient(bx, by, 0, bx, by, br);
      const a = 0.05 + r() * 0.08;
      g.addColorStop(0, (r() < 0.5 ? 'rgba(255,252,244,' : 'rgba(120,112,98,') + a + ')');
      g.addColorStop(1, 'rgba(160,155,145,0)');
      x.fillStyle = g;
      x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const veins = Math.floor(r() * 3);       // faint veins
    for (let i = 0; i < veins; i++) {
      x.strokeStyle = 'rgba(' + (r() < 0.5 ? '250,247,238,' : '128,120,106,') + (0.05 + r() * 0.08) + ')';
      x.lineWidth = 0.6 + r() * 1.6;
      x.beginPath();
      x.moveTo(px + r() * sw, py - 4);
      x.bezierCurveTo(px + r() * sw, py + sl * 0.35, px + r() * sw, py + sl * 0.65, px + r() * sw, py + sl + 4);
      x.stroke();
    }
    x.restore();
    x.strokeStyle = 'rgba(92,85,73,.5)';     // cut joint, with a hair of light on one side
    x.lineWidth = 1.6;
    x.strokeRect(px, py, sw, sl);
    x.strokeStyle = 'rgba(255,253,246,.16)';
    x.lineWidth = 1;
    x.strokeRect(px + 1.6, py + 1.6, sw - 3.2, sl - 3.2);
  };
  for (let i = 0; i < courses; i++) {
    const off = (i % 2) * sl / 2;
    for (let j = 0; j <= perCourse; j++) slab(i * sw, j * sl - off, i * 97 + (j % perCourse) * 13 + 5);
  }
  const img = x.getImageData(0, 0, S, S), d = img.data;   // fine grain
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 9;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 16;
  return t;
}
const stoneMap = floorTexture();
stoneMap.repeat.set(40 / FLOOR_TILE, 40 / FLOOR_TILE);
stoneMap.offset.x = 0.1 / FLOOR_TILE;          // centres a course on the hall's axis
const stone = new THREE.MeshStandardMaterial({ map: stoneMap, roughness: 0.5, metalness: 0.02 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: '#e6ddc8', roughness: 1, side: THREE.DoubleSide, emissive: '#6a5f46', emissiveIntensity: 0.5 });
const skirt = new THREE.MeshStandardMaterial({ color: '#8d8578', roughness: 0.8 });
const brass = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.32, metalness: 0.85 });
const frameMat = new THREE.MeshStandardMaterial({ color: '#b3893f', roughness: 0.38, metalness: 0.6 });

// ---- ornate gilt frames: a moulded profile swept round the picture and mitred at the corners,
// carved (as a bump map) with a bead row, a plain frieze, a band of leaves and a twisted-ribbon
// edge; carved corner pieces cover the mitres, and the larger frames carry a crest.
function giltCarving() {
  const W = 512, Hh = 256, c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const x = c.getContext('2d');
  x.fillStyle = '#6e6e6e'; x.fillRect(0, 0, W, Hh);
  const band = (v0, v1) => [Math.round((1 - v1) * Hh), Math.round((v1 - v0) * Hh)];   // v = 0 at the picture, 1 at the outer edge
  let [y, h] = band(0.02, 0.13);                                   // bead row
  for (let i = 0; i < 16; i++) {
    const cx = 16 + i * 32, cy = y + h / 2, g = x.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, h * 0.62);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#8a8a8a'); g.addColorStop(1, '#1e1e1e');
    x.fillStyle = g; x.fillRect(cx - 16, y, 32, h);
  }
  [y, h] = band(0.13, 0.3);                                        // frieze, lightly sanded, with a small flower per repeat
  x.fillStyle = '#7c7c7c'; x.fillRect(0, y, W, h);
  for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.12)'; x.fillRect(Math.random() * W, y + Math.random() * h, 2, 2); }
  for (let i = 0; i < 4; i++) {
    const cx = 64 + i * 128, cy = y + h / 2;
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; x.fillStyle = '#d8d8d8'; x.beginPath(); x.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 8, 5, a, 0, 6.3); x.fill(); }
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy, 5, 0, 6.3); x.fill();
  }
  [y, h] = band(0.3, 0.74);                                        // leaf band: leaves springing outwards, tips curling
  x.fillStyle = '#2a2a2a'; x.fillRect(0, y, W, h);
  for (let i = -1; i < 9; i++) {
    [0, 32].forEach((shift, layer) => {
      const x0 = i * 64 + shift, base = y + h, tip = y + (layer ? h * 0.3 : 0.02 * h);
      const g = x.createLinearGradient(0, base, 0, tip);
      g.addColorStop(0, layer ? '#5a5a5a' : '#777777'); g.addColorStop(1, '#ffffff');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(x0, base); x.bezierCurveTo(x0 - 6, base - h * 0.5, x0 + 14, tip + 6, x0 + 32, tip);
      x.bezierCurveTo(x0 + 50, tip + 6, x0 + 70, base - h * 0.5, x0 + 64, base); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(x0 + 32, base); x.lineTo(x0 + 32, tip + 8); x.stroke();
      for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(x0 + 32, base - k * h * 0.2); x.lineTo(x0 + 32 - 16, base - k * h * 0.2 - 12); x.moveTo(x0 + 32, base - k * h * 0.2); x.lineTo(x0 + 32 + 16, base - k * h * 0.2 - 12); x.stroke(); }
    });
  }
  [y, h] = band(0.76, 0.94);                                       // twisted ribbon round the top moulding
  for (let i = -1; i < 22; i++) {
    const g = x.createLinearGradient(i * 26, 0, i * 26 + 26, 0);
    g.addColorStop(0, '#2c2c2c'); g.addColorStop(0.5, '#f4f4f4'); g.addColorStop(1, '#2c2c2c');
    x.fillStyle = g; x.beginPath(); x.moveTo(i * 26, y + h); x.lineTo(i * 26 + 18, y); x.lineTo(i * 26 + 44, y); x.lineTo(i * 26 + 26, y + h); x.closePath(); x.fill();
  }
  // colour: the same carving, read as old gilding — bright on the high points, bole-dark in the hollows
  const img = x.getImageData(0, 0, W, Hh), c2 = document.createElement('canvas');
  c2.width = W; c2.height = Hh;
  const x2 = c2.getContext('2d'), out = x2.createImageData(W, Hh);
  for (let i = 0; i < img.data.length; i += 4) {
    const t = img.data[i] / 255, k = Math.pow(t, 0.8);
    out.data[i] = 96 + 150 * k; out.data[i + 1] = 62 + 140 * k; out.data[i + 2] = 22 + 84 * k; out.data[i + 3] = 255;
  }
  x2.putImageData(out, 0, 0);
  const mk = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  return { bump: mk(c, false), color: mk(c2, true) };
}
const GILT = giltCarving();
const giltMat = new THREE.MeshStandardMaterial({ map: GILT.color, bumpMap: GILT.bump, bumpScale: 5, color: '#ffe9b0', roughness: 0.4, metalness: 0.35 });
const giltPlain = new THREE.MeshStandardMaterial({ color: '#d9ab4c', roughness: 0.38, metalness: 0.4 });
// across the moulding: [distance out from the picture, height off the wall], both as fractions of the frame's width
const FRAME_PROFILE = [[0, 0.1], [0, 0.22], [0.06, 0.27], [0.13, 0.22], [0.17, 0.18], [0.3, 0.2], [0.42, 0.3], [0.55, 0.46], [0.68, 0.56], [0.76, 0.6], [0.85, 0.62], [0.93, 0.56], [0.98, 0.42], [1, 0.26], [1, 0]];
// the same moulding swept round an oval, with a carved crest at the top and a smaller one below
function ornateOvalFrame(w, h) {
  const fw = THREE.MathUtils.clamp(0.085 + 0.036 * Math.max(w, h), 0.12, 0.25), tile = 0.34, N = 96, a = w / 2, b = h / 2;
  const arc = [0];
  for (let k = 1; k < FRAME_PROFILE.length; k++) arc.push(arc[k - 1] + Math.hypot(FRAME_PROFILE[k][0] - FRAME_PROFILE[k - 1][0], FRAME_PROFILE[k][1] - FRAME_PROFILE[k - 1][1]));
  const verts = [], uvs = [], index = [];
  let along = 0, px = a, py = 0;
  for (let i = 0; i <= N; i++) {
    const th = i / N * Math.PI * 2, ex = a * Math.cos(th), ey = b * Math.sin(th);
    along += Math.hypot(ex - px, ey - py); px = ex; py = ey;
    const n = new THREE.Vector2(Math.cos(th) / a, Math.sin(th) / b).normalize();      // outward from the ellipse
    FRAME_PROFILE.forEach(([o, z], k) => {
      verts.push(ex + n.x * o * fw, ey + n.y * o * fw, z * fw);
      uvs.push(along / tile, arc[k] / arc[arc.length - 1]);
    });
  }
  const P = FRAME_PROFILE.length;
  for (let i = 0; i < N; i++) for (let k = 0; k < P - 1; k++) {
    const q = i * P + k;
    index.push(q, q + 1, q + P, q + 1, q + P + 1, q + P);          // wound to face the room
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const g = new THREE.Group(), moulding = new THREE.Mesh(geo, giltMat);
  moulding.name = 'frame'; moulding.castShadow = true;
  g.add(moulding);
  const leaf = (px, py, ang, sc) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), giltPlain);
    m.scale.set(sc * 0.95, sc * 0.36, sc * 0.26); m.rotation.z = ang; m.position.set(px + Math.cos(ang) * sc * 0.7, py + Math.sin(ang) * sc * 0.7, fw * 0.6);
    g.add(m);
  };
  [1, -1].forEach((sy) => {
    const py = sy * (b + fw * 0.62), sc = fw * (sy > 0 ? 1 : 0.75);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(sc * 0.34, 16, 10), giltPlain);
    shell.scale.set(1.25, 0.95, 0.5); shell.position.set(0, py + sy * sc * 0.12, fw * 0.66);
    g.add(shell);
    [0.5, 1.0, 2.14, 2.64].forEach((ang) => leaf(0, py, sy > 0 ? ang : -ang, sc * 0.4));
    [-1, 1].forEach((sd) => leaf(sd * sc * 0.2, py, sd > 0 ? 0.12 * sy : Math.PI - 0.12 * sy, sc * 0.5));
  });
  g.userData.pictureZ = fw * 0.1 + 0.003;
  return g;
}
// a plainer moulding: a flat ogee, hung in ebonised wood with a gilt slip at the picture's edge, as a salon mixes with its gilt
const PLAIN_PROFILE = [[0, 0.06], [0, 0.18], [0.08, 0.22], [0.22, 0.24], [0.5, 0.3], [0.78, 0.26], [0.93, 0.18], [1, 0.1], [1, 0]];
const ebonyMat = new THREE.MeshStandardMaterial({ color: '#1e1713', roughness: 0.32, metalness: 0.05 });
function ornateFrame(w, h, style = 'gilt') {
  const plain = style === 'plain', PROFILE = plain ? PLAIN_PROFILE : FRAME_PROFILE;
  const fw = THREE.MathUtils.clamp(0.085 + 0.036 * Math.max(w, h), 0.12, 0.25) * (plain ? 0.8 : 1), tile = 0.34;
  const arc = [0];
  for (let k = 1; k < PROFILE.length; k++) arc.push(arc[k - 1] + Math.hypot(PROFILE[k][0] - PROFILE[k - 1][0], PROFILE[k][1] - PROFILE[k - 1][1]));
  const verts = [], uvs = [], index = [];
  // each side runs between two corners; every profile point pushes both corners outwards by the same amount, which is the mitre
  [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([ax, ay, bx, by]) => {
    const base = verts.length / 3, len = (ax !== bx ? w : h);
    PROFILE.forEach(([o, z], k) => {
      const e = o * fw, v = arc[k] / arc[arc.length - 1];
      verts.push(ax * (w / 2 + e), ay * (h / 2 + e), z * fw, bx * (w / 2 + e), by * (h / 2 + e), z * fw);
      uvs.push(-(len / 2 + e) / tile, v, (len / 2 + e) / tile, v);
    });
    for (let k = 0; k < PROFILE.length - 1; k++) { const q = base + k * 2; index.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }   // wound to face the room
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const g = new THREE.Group(), moulding = new THREE.Mesh(geo, plain ? ebonyMat : giltMat);
  moulding.name = 'frame'; moulding.castShadow = true;
  g.add(moulding);
  if (plain) {                                                        // the gilt slip, a narrow band round the picture's edge, and no carving
    [[w + fw * 0.16, fw * 0.08, 0, h / 2 + fw * 0.04], [w + fw * 0.16, fw * 0.08, 0, -h / 2 - fw * 0.04], [fw * 0.08, h, -w / 2 - fw * 0.04, 0], [fw * 0.08, h, w / 2 + fw * 0.04, 0]].forEach(([bw, bh, bx, by]) => {
      const slip = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, fw * 0.16), giltPlain);   // stands well proud of the moulding: sharing its plane made the line flicker as you move
      slip.position.set(bx, by, fw * 0.27); g.add(slip);
    });
    g.userData.pictureZ = fw * 0.1 + 0.003;
    return g;
  }
  const leaf = (px, py, ang, s) => {                                 // one carved leaf, lying on the frame
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), giltPlain);
    m.scale.set(s * 0.95, s * 0.36, s * 0.26); m.rotation.z = ang; m.position.set(px + Math.cos(ang) * s * 0.7, py + Math.sin(ang) * s * 0.7, fw * 0.6);
    g.add(m);
  };
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {        // corner pieces over the mitres
    const px = sx * (w / 2 + fw * 0.58), py = sy * (h / 2 + fw * 0.58), out = Math.atan2(sy, sx);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(fw * 0.2, 14, 10), giltPlain);
    boss.scale.z = 0.6; boss.position.set(px, py, fw * 0.66);
    g.add(boss);
    [out, out + 2.2, out - 2.2, out + 0.75, out - 0.75].forEach((a, i) => leaf(px, py, a, fw * (i < 3 ? 0.36 : 0.27)));
  });
  if (Math.max(w, h) >= 1.1) {                                        // crest at the top centre, and its echo below
    [1, -1].forEach((sy) => {
      const py = sy * (h / 2 + fw * 0.62), s = fw * (sy > 0 ? 1 : 0.75);
      const shell = new THREE.Mesh(new THREE.SphereGeometry(s * 0.34, 16, 10), giltPlain);
      shell.scale.set(1.25, 0.95, 0.5); shell.position.set(0, py + sy * s * 0.12, fw * 0.66);
      g.add(shell);
      [0.5, 1.0, 2.14, 2.64].forEach((a) => leaf(0, py, sy > 0 ? a : -a, s * 0.4));
      [-1, 1].forEach((sd) => leaf(sd * s * 0.2, py, sd > 0 ? 0.12 * sy : Math.PI - 0.12 * sy, s * 0.5));
    });
  }
  g.userData.pictureZ = fw * 0.1 + 0.003;
  return g;
}


// ---- shell
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), stone);
floor.name = 'floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const VAULT = { x0: -2.5, x1: 2.5, z0: -10, z1: 12, spring: H, crown: H + 2.45 };
(function ceiling() {
  const plan = new THREE.Shape();
  plan.moveTo(-20, -20); plan.lineTo(20, -20); plan.lineTo(20, 20); plan.lineTo(-20, 20); plan.lineTo(-20, -20);
  [[VAULT.x0, VAULT.x1, VAULT.z0, VAULT.z1], [-12.5, -2.5, -10, -5], [2.5, 12.5, -10, -5], [-P.detX, P.detX, P.detFarZ, P.wingFarZ]].forEach((r) => {
    const h = new THREE.Path();
    h.moveTo(r[0], r[2]); h.lineTo(r[1], r[2]); h.lineTo(r[1], r[3]); h.lineTo(r[0], r[3]); h.lineTo(r[0], r[2]);
    plan.holes.push(h);
  });
  const ceil = new THREE.Mesh(new THREE.ShapeGeometry(plan), ceilingMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = VAULT.crown;
  scene.add(ceil);
})();

// ---- groin-vaulted ceiling over the hall
function vaultTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const x = c.getContext('2d');
  x.fillStyle = '#d9cdb1'; x.fillRect(0, 0, 1024, 1024);
  const rows = 30, cols = 30;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const w = 1024 / cols, h = 1024 / rows;
      const off = (r % 2) * w * 0.5;
      const t = 196 + Math.random() * 40;
      x.fillStyle = 'rgb(' + Math.round(t) + ',' + Math.round(t * 0.93) + ',' + Math.round(t * 0.79) + ')';
      x.fillRect(k * w + off + 1.4, r * h + 1.4, w - 2.8, h - 2.8);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const vaultMap = vaultTexture();
vaultMap.repeat.set(5, 3.4);
vaultMap.anisotropy = 8;
const vaultMat = new THREE.MeshStandardMaterial({ map: vaultMap, color: '#e8d9b4', roughness: 1, side: THREE.DoubleSide, emissive: '#4a3d22', emissiveIntensity: 0.22 });
const ribMat = new THREE.MeshStandardMaterial({ color: '#e9dfc6', roughness: 0.92 });

// walls: which bay edges stand on a wall — xn/xp = the -x/+x edge, zn/zp = the -z/+z edge
function groinBay(cx, cz, W, D, walls) {
  const rise = VAULT.crown - VAULT.spring;
  // four webs of a true groin vault: two crossing barrels, each kept only where it is
  // the higher of the two, so the surface creases exactly along the diagonal ribs
  const M = 48, K = 12;
  const verts = [], uvs = [], index = [];
  [[0, 1], [0, -1], [1, 1], [1, -1]].forEach(([axis, side]) => {
    const base = verts.length / 3;
    for (let i = 0; i <= M; i++) {
      const th = Math.PI * i / M;
      const c = Math.cos(th), s = Math.sin(th);
      for (let j = 0; j <= K; j++) {
        const n = side * (1 - (j / K) * (1 - Math.abs(c)));   // bay edge -> groin line
        const x = axis === 0 ? c * W / 2 : n * W / 2;
        const z = axis === 0 ? n * D / 2 : c * D / 2;
        verts.push(cx + x, VAULT.spring + rise * s, cz + z);
        uvs.push(n * 0.5 + 0.5, i / M);
      }
    }
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < K; j++) {
        const a = base + i * (K + 1) + j, b = a + 1, c2 = a + K + 1, d = c2 + 1;
        index.push(a, c2, b, b, c2, d);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, vaultMat);
  scene.add(m);

  // ribs are pulled in by their own radius on any side that is a wall, so they sit
  // against the wall instead of poking through into the room behind it
  const IN = 0.058;
  const fx = (lx) => lx * (1 - ((lx < 0 ? walls.xn : walls.xp) ? IN / (W / 2) : 0));
  const fz = (lz) => lz * (1 - ((lz < 0 ? walls.zn : walls.zp) ? IN / (D / 2) : 0));
  const arch = (t) => VAULT.crown - rise * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)))) - 0.04;
  const tube = (pts, r) => scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8, false), ribMat));

  // diagonal groin ribs
  [1, -1].forEach((dir) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector3(cx + fx((t - 0.5) * W), arch(t), cz + fz(dir * (t - 0.5) * D)));
    }
    tube(pts, 0.05);
  });

  // carved boss at the crown, where the diagonal ribs cross
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 12), ribMat);
  boss.scale.y = 0.55;
  boss.position.set(cx, VAULT.crown - 0.09, cz);
  const bossEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), frameMat);
  bossEye.position.set(cx, VAULT.crown - 0.18, cz);
  scene.add(boss, bossEye);

  // an arch on every bay edge: a wall rib where the edge is a wall, a transverse arch
  // where it opens onto the next bay (drawn once, by the bay on its positive side)
  [['xn', 1, -1], ['xp', 1, 1], ['zn', 0, -1], ['zp', 0, 1]].forEach(([edge, axis, side]) => {
    if (!walls[edge] && side > 0) return;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const lx = axis === 0 ? (t - 0.5) * W : side * W / 2;
      const lz = axis === 0 ? side * D / 2 : (t - 0.5) * D;
      pts.push(new THREE.Vector3(cx + fx(lx), arch(t), cz + fz(lz)));
    }
    tube(pts, 0.055);
  });
}

(function endCaps() {
  [VAULT.z1, VAULT.z0].forEach((z) => {
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(VAULT.x1 - VAULT.x0, VAULT.crown - VAULT.spring + 0.1), plaster);
    cap.position.set(0, VAULT.spring + (VAULT.crown - VAULT.spring) / 2, z);
    scene.add(cap);
  });
})();

// wall lunette: carries a wall from the springing up to the crown behind a bay edge;
// the vault hides everything outside the arch
function lunette(x1, z1, x2, z2) {
  const len = Math.hypot(x2 - x1, z2 - z1), h = VAULT.crown - VAULT.spring;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), plaster);
  m.position.set((x1 + x2) / 2, VAULT.spring + h / 2, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  scene.add(m);
}

(function vaultWings() {
  [-10, -5, 5, 10].forEach((cx) => {
    // side walls front and back; the outer bay ends on the wing end wall, the inner on the hall wall
    groinBay(cx, -7.5, 5, 5, { zn: true, zp: true, xn: cx === -10 || cx === 5, xp: cx === -5 || cx === 10 });
    lunette(cx - 2.5, -5, cx + 2.5, -5);
    lunette(cx - 2.5, -10, cx + 2.5, -10);
  });
  [-12.5, 12.5].forEach((x) => lunette(x, -10, x, -5));
})();

(function vaultHall() {
  const W = VAULT.x1 - VAULT.x0;
  // bays follow the plan: the atrium in equal bays, then one square bay over the crossing
  // (centred on the wing arches), ending on the details-arch wall
  const atrium = 3, aD = (P.backZ - P.wingNearZ) / atrium;
  const edges = [];
  for (let i = 0; i <= atrium; i++) edges.push(P.backZ - i * aD);
  edges.push(P.wingFarZ);
  for (let i = 0; i < edges.length - 1; i++) {
    const zp = edges[i], zn = edges[i + 1];
    groinBay(0, (zp + zn) / 2, W, zp - zn, {
      xn: true, xp: true,
      zp: zp === P.backZ || zp === P.wingFarZ,
      zn: zn === P.wingFarZ
    });
    [VAULT.x0, VAULT.x1].forEach((x) => lunette(x, zp, x, zn));
  }
})();


// wall builder: from (x1,z1) to (x2,z2), facing chosen by normal sign
function wall(x1, z1, x2, z2, mat) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const g = new THREE.PlaneGeometry(len, H);
  const m = new THREE.Mesh(g, mat || plaster);
  m.position.set((x1 + x2) / 2, H / 2, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  m.receiveShadow = true;
  m.material.side = THREE.DoubleSide;
  scene.add(m);

  const base = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.05), skirt);
  base.position.set(m.position.x, 0.08, m.position.z);
  base.rotation.y = m.rotation.y;
  scene.add(base);
  return m;
}

// corridor runs from the entrance to the details hall; across each wing's band the hall face is the
// portal's own (wingPortal below), so the walls stop where it starts and nothing lies over it
[-P.corrX, P.corrX].forEach((sx) => {
  wall(sx, P.backZ, sx, P.wingNearZ, plasterWide);
});
wall(-P.corrX, P.backZ, P.corrX, P.backZ);

// wings
wall(-P.wingEndX, P.wingNearZ, -P.corrX, P.wingNearZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.corrX, P.wingFarZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.wingEndX, P.wingNearZ);
wall(P.corrX, P.wingNearZ, P.wingEndX, P.wingNearZ, plasterWide);
wall(P.corrX, P.wingFarZ, P.wingEndX, P.wingFarZ, plasterWide);
wall(P.wingEndX, P.wingFarZ, P.wingEndX, P.wingNearZ);


// a wall face with an arched opening cut up from the floor, traced as one outline so the
// opening leaves no face lying on the floor
function archedWallShape(half, top, r, springs) {
  const s = new THREE.Shape();
  s.moveTo(-half, 0); s.lineTo(-half, top); s.lineTo(half, top); s.lineTo(half, 0);
  s.lineTo(r, 0); s.lineTo(r, springs);
  s.absarc(0, springs, r, 0, Math.PI, false);
  s.lineTo(-r, 0); s.lineTo(-half, 0);
  return s;
}

// arched doorway into a wing (sx = -1 left, 1 right): the hall wall is given real thickness
// across the wing's end, set back into the wing, so the hall face stays flush and the
// depth of the wall shows only inside the opening
function wingPortal(sx, z, openW, springs) {
  const r = openW / 2, T = 0.26;
  const half = (P.wingNearZ - P.wingFarZ) / 2 - 0.005;
  // a touch taller than the wall so its top tucks in behind the lunette with no slit between
  // ...and sunk 2 cm, so its underside (plaster is drawn two-sided) lies below the floor instead of on it
  const outer = archedWallShape(half, H + 0.04, r, springs);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: T, bevelEnabled: false }), plaster);
  m.position.set(sx * (P.corrX + 0.004), -0.02, z);
  m.rotation.y = Math.PI / 2;
  if (sx < 0) m.translateZ(-T);
  m.receiveShadow = true;
  scene.add(m);

  // skirting on the wing face and on the hall face, either side of the opening. It stops just inside the
  // moulded surround's leg (0.17 wide) rather than at the opening, so its end face never lies on the jamb
  [-1, 1].forEach((sz) => {
    const stop = r + 0.16, len = half - stop;
    [P.corrX + 0.004 + T, P.corrX + 0.004].forEach((fx) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.05), skirt);
      base.position.set(sx * fx, 0.08, z + sz * (stop + len / 2));
      base.rotation.y = Math.PI / 2;
      scene.add(base);
    });
  });
}

// arched openings into both wings
wingPortal(-1, -7.5, 2.6, 2.3);
wingPortal(1, -7.5, 2.6, 2.3);

// arched doorway into the details hall
(function detailsArch() {
  const z = P.wingFarZ, openW = 2.7, springs = 2.3, r = openW / 2;
  // one solid wall with the arch cut out of it, so nothing is left open above the curve
  const face = archedWallShape(P.corrX, H + 0.02, r, springs);
  const wallMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(face, { depth: 0.28, bevelEnabled: false }), plaster);
  wallMesh.position.set(0, -0.02, z - 0.14);                          // sunk 2 cm: its underside below the floor, not on it
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  // the band's foot and the opening's foot both sit below the floor: otherwise a sliver of band is left across
  // the doorway with its top exactly on the floor plane, and the two flicker against each other as you walk in
  const shape = new THREE.Shape();
  shape.moveTo(-r, -0.05); shape.lineTo(-r, springs);
  shape.absarc(0, springs, r, Math.PI, 0, true);
  shape.lineTo(r, -0.05); shape.lineTo(-r, -0.05);
  const cut = new THREE.Shape();
  cut.moveTo(-r - 0.16, -0.1); cut.lineTo(-r - 0.16, springs);
  cut.absarc(0, springs, r + 0.16, Math.PI, 0, true);
  cut.lineTo(r + 0.16, -0.1); cut.lineTo(-r - 0.16, -0.1);
  cut.holes.push(new THREE.Path(shape.getPoints(48)));
  const band = new THREE.Mesh(new THREE.ExtrudeGeometry(cut, { depth: 0.34, bevelEnabled: false }), plaster);   // 3 cm proud of the wall on both faces
  band.position.set(0, 0, z - 0.17);
  scene.add(band);
})();

// ---- columns and dome
const stoneMat = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 1, 2), color: '#ded2b6', roughness: 0.92 });
// a drawn marble: a ground colour, clouded with two tones, crossed by fine veins in two colours, and grained
function marbleTexture(ground, cloud, veins, grain, seed0 = 4171) {
  const W = 512, c = document.createElement('canvas');
  c.width = W; c.height = W;
  const x = c.getContext('2d');
  let seed = seed0;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  x.fillStyle = ground; x.fillRect(0, 0, W, W);
  for (let i = 0; i < 320; i++) {                                     // cloudy variation in the ground
    const cx = rnd() * W, cy = rnd() * W, r = 30 + rnd() * 120, g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tone = rnd() < 0.5 ? cloud[0] : cloud[1];
    g.addColorStop(0, `rgba(${tone},.28)`); g.addColorStop(1, `rgba(${tone},0)`);
    x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  x.lineCap = 'round';
  for (let v = 0; v < 18; v++) {                                      // meandering veins
    let px = rnd() * W, py = rnd() * W, a = rnd() * Math.PI * 2;
    const pale = rnd() < 0.6;
    x.strokeStyle = pale ? `rgba(${veins[0]},${0.3 + rnd() * 0.35})` : `rgba(${veins[1]},${0.2 + rnd() * 0.25})`;
    x.lineWidth = pale ? 1 + rnd() * 2 : 0.8 + rnd() * 1.2;
    x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 60; k++) { a += (rnd() - 0.5) * 0.9; px += Math.cos(a) * 9; py += Math.sin(a) * 9; x.lineTo(px, py); }
    x.stroke();
  }
  for (let i = 0; i < 2600; i++) {                                    // fine grain
    x.fillStyle = rnd() < 0.5 ? `rgba(${grain[0]},.14)` : `rgba(${grain[1]},.12)`;
    x.fillRect(rnd() * W, rnd() * W, 1.5, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
// Siena marble (giallo di Siena, quarried a few miles from the villa) for every plinth in the museum:
// a honey-gold ground, clouded lighter and darker, with fine pale and grey-violet veins
const plinthMat = new THREE.MeshStandardMaterial({ map: marbleTexture('#cdaa66', ['226,196,124', '166,120,52'], ['246,236,214', '112,92,104'], ['255,245,220', '90,60,20']), color: '#f2e2bf', roughness: 0.42 });
// white statuary marble with soft grey veins, for the centre table's top
const marbleStatuary = new THREE.MeshStandardMaterial({ map: marbleTexture('#ece8e0', ['255,255,252', '196,192,184'], ['150,150,148', '120,118,120'], ['255,255,255', '110,110,110'], 9001), color: '#f6f3ec', roughness: 0.35 });

function column(x, z) {
  const g = new THREE.Group();
  const shaftH = H - 0.72;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.22, 24), stoneMat);
  base.position.y = 0.11;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.11, 0.58), stoneMat);
  plinth.position.y = 0.055;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.2, shaftH, 28), stoneMat);
  shaft.position.y = 0.22 + shaftH / 2;
  shaft.castShadow = true;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.175, 0.13, 24), stoneMat);
  neck.position.y = 0.22 + shaftH + 0.065;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.17, 0.54), stoneMat);
  cap.position.y = 0.22 + shaftH + 0.21;
  [plinth, base, shaft, neck, cap].forEach((m) => { m.name = 'column'; g.add(m); });
  g.position.set(x, 0, z);
  scene.add(g);
}

// flanking each wing arch, and the arch into the details hall
[-1, 1].forEach((sx) => { column(sx * (P.corrX - 0.32), P.wingFarZ + 0.55); });

// ---- artwork
// ---- three of the family, painted into three of the pictures in each painter's own manner (the owner's habit: she
// paints her pets into prints). Nothing marks them; a click on the animal itself, from the picture's own stop, names the
// find in the panel and counts it in the tally. `at` is the animal's box on the picture, as fractions from its top-left.
const HIDDEN = {
  'assets/primavera.jpg': { at: [0.073, 0.82, 0.165, 0.975], stop: 'w2close', accent: '#D19A6E', eyebrow: 'Wing II \u00b7 found', title: 'Amelia, in the orchard',
    body: 'Botticelli did not paint a dog at Mercury\u2019s feet. Kelly regularly paints her pets into other people\u2019s pictures, and Amelia saw no reason to be left out of this iconic party. In fact, she thinks she is the guest of honor.', meta: 'One of three. The other two are elsewhere in the building.' },
  'assets/w1-amaryllis-and-mirtillo.jpg': { at: [0.84, 0.86, 0.99, 0.985], stop: 'w1amaryllis', accent: '#93AEA2', eyebrow: 'Wing I \u00b7 found', title: 'Mishka, with the hound',
    body: 'A hound in the corner, resting against Amaryllis\u2019s hand. Mishka, the definition of a Velcro dog, is not asleep. He is keeping an eye on the party and refuses to be left out.', meta: 'One of three. The other two are elsewhere in the building.' },
  'assets/det-good-government-countryside.jpg': { at: [0.66, 0.9, 0.725, 0.985], stop: 'detFrontL', accent: '#A79C85', eyebrow: 'Exhibit details \u00b7 found', title: 'Trogdor, on the road to Siena',
    body: 'On Lorenzetti\u2019s white road, among the mule trains, a sulcata tortoise is making for the villa at his own pace. Trogdor set off some time ago. He will get there\u2026 eventually.', meta: 'One of three. The other two are elsewhere in the building.' }
};
const FOUND = new Set((() => { try { return JSON.parse(localStorage.getItem('ka-found') || '[]'); } catch (e) { return []; } })());
function markHidden(mesh, src) { if (HIDDEN[src]) mesh.userData.hidden = src; }
// a click on a picture that hides one: is it on the animal? (uv from the raycast; the picture's v runs bottom-up)
function hiddenHit(hit) {
  const src = hit.object.userData.hidden;
  if (!src || !hit.uv) return null;
  const h = HIDDEN[src], u = hit.uv.x, v = 1 - hit.uv.y, pad = 0.03;
  return u >= h.at[0] - pad && u <= h.at[2] + pad && v >= h.at[1] - pad && v <= h.at[3] + pad ? h : null;
}
const atHiddenStop = (h) => STATIONS[idx].id === h.stop || (h.closeIdx !== undefined && idx === h.closeIdx);   // the picture's own close-up, or the stop named

function painting(src, aspect, w, x, z, rotY, station, closer, y = 1.95) {
  const h = w / aspect;
  const grp = new THREE.Group();
  const frame = ornateFrame(w, h);
  frame.position.z = -0.045;
  grp.add(frame);
  const canvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex(src), roughness: 0.62 })
  );
  canvasMesh.name = 'canvas';
  canvasMesh.position.z = -0.045 + frame.userData.pictureZ;
  markHidden(canvasMesh, src);
  grp.add(canvasMesh);
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  grp.userData.station = station;   // the stop that faces this picture; clicking it takes you there
  grp.userData.closer = closer;     // clicking again from that stop steps you up close
  scene.add(grp);
  return grp;
}

painting('assets/birth-of-venus.jpg', 278 / 172, 3.6, -P.wingEndX + 0.07, -7.5, Math.PI / 2, ST.w1, ST.w1close);
painting('assets/primavera.jpg', 314 / 203, 3.6, P.wingEndX - 0.07, -7.5, -Math.PI / 2, ST.w2, ST.w2close);

// The wings' side walls carry a pair of pictures each: a larger one towards the entrance and a smaller one beside it,
// clear of the statues further along. A picture leads to its wall's stop, and from there (if it has one) to its own
// close-up stop. `x` is how far into the wing it hangs; Wing I is the mirror of Wing II.
//   Wing I far wall, "The Procession": the bridal party, and a crowning        near wall, "The Vows": two unions
const W1_PICTURES = [
  { src: 'assets/w1-amaryllis-and-mirtillo.jpg', aspect: 2048 / 1739, w: 1.6, x: -5.9, y: 2.0, wall: 'far', close: 'w1amaryllis' },
  { src: 'assets/w1-three-graces.jpg', aspect: 1617 / 2048, w: 1.25, x: -7.8, y: 2.0, wall: 'far', close: 'w1graces' },
  { src: 'assets/w1-happy-union.jpg', aspect: 2048 / 1959, w: 1.5, x: -5.9, y: 2.0, wall: 'near', close: 'w1union' },
  { src: 'assets/w1-mars-and-venus.jpg', aspect: 1594 / 2048, w: 1.2, x: -7.75, y: 2.0, wall: 'near', close: 'w1mars' }
];
//   Wing II far wall, "The Banquet": two still lifes            near wall, "The Dancing": the Muses dancing, and a wedding feast
const W2_PICTURES = [
  { src: 'assets/w2-banquet-still-life.jpg', aspect: 2048 / 1544, w: 1.85, x: 5.9, y: 2.0, wall: 'far', close: 'w2utrecht' },
  { src: 'assets/w2-watermelon-still-life.jpg', aspect: 2048 / 1425, w: 1.2, x: 7.85, y: 1.92, wall: 'far', close: 'w2ruoppolo' },
  { src: 'assets/w2-parnassus.jpg', aspect: 2048 / 1690, w: 1.6, x: 5.8, y: 2.0, wall: 'near', close: 'w2parnassus' },
  { src: 'assets/w2-nastagio-banquet.jpg', aspect: 1225 / 700, w: 1.45, x: 7.75, y: 1.92, wall: 'near', close: 'w2nastagio' }
];
const hangSideWalls = (list, farStop, nearStop) => list.forEach((p) => {
  const far = p.wall === 'far';
  painting(p.src, p.aspect, p.w, p.x, far ? P.wingFarZ + 0.07 : P.wingNearZ - 0.07, far ? 0 : Math.PI, far ? farStop : nearStop, p.close ? ST[p.close] : undefined, p.y);
});
hangSideWalls(W1_PICTURES, ST.w1a, ST.w1b);
hangSideWalls(W2_PICTURES, ST.w2a, ST.w2b);

// ---------------------------------------------------------------- details room
// a salon-hung gallery room after the reference (assets/ref-terracotta.jpg): burgundy walls
// over a pale dado, a coved ceiling, one large picture per wall with smaller ones stacked
// around it, busts on pedestals, console tables along the walls and a table in the centre
const DET = { x: P.detX, zF: P.wingFarZ - 0.145, zB: P.detFarZ, cove: 2.1, rise: 2.0 };
DET.zMid = (DET.zF + DET.zB) / 2;
const BURGUNDY = '#7A1A3C';                       // the invitation burgundy, sampled from the KA monogram
const BURGUNDY_PAINT = '#6c1637';                 // mixed darker and cooler: under the warm lamps it renders close to BURGUNDY
const burgundy = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 3, 1.4), color: BURGUNDY_PAINT, roughness: 0.9 });
const burgundyFront = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 0.3, 0.36), color: BURGUNDY_PAINT, roughness: 0.9, side: THREE.DoubleSide });
const marbleWhite = new THREE.MeshStandardMaterial({ color: '#efebe2', roughness: 0.5 });
const marbleBlue = new THREE.MeshStandardMaterial({ color: '#b3bec4', roughness: 0.3, metalness: 0.02 });
const marbleRed = new THREE.MeshStandardMaterial({ color: '#6d3b35', roughness: 0.3, metalness: 0.02 });
const paintedWood = new THREE.MeshStandardMaterial({ color: '#e7e1d2', roughness: 0.7 });
const walnutTable = new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-rail.jpg'), color: '#d9b48c', roughness: 0.5 });   // the same walnut as the card stands

(function detailsShell() {
  wall(-DET.x, DET.zF, -DET.x, DET.zB, burgundy);
  wall(DET.x, DET.zB, DET.x, DET.zF, burgundy);
  wall(-DET.x, DET.zB, DET.x, DET.zB, burgundy);
  // entrance wall, room side: one face with the details arch cut through it
  const front = new THREE.Mesh(new THREE.ShapeGeometry(archedWallShape(DET.x, H, 1.35, 2.3), 32), burgundyFront);
  front.position.set(0, 0, DET.zF);
  front.rotation.y = Math.PI;
  scene.add(front);

  // pale dado with a cap rail, and a gilt cornice where the cove springs
  const run = (x1, z1, x2, z2) => {
    const len = Math.hypot(x2 - x1, z2 - z1), rotY = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
    [[0.9, 0.06, 0.45, stoneMat], [0.07, 0.11, 0.935, stoneMat], [0.16, 0.24, H - 0.03, frameMat]].forEach(([h, d, y, mat]) => {
      if (mat === frameMat && Math.abs(len - (DET.x - 1.55)) < 0.01) return;   // cornice is laid in full runs below
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, d), mat);
      m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      m.rotation.y = rotY;
      scene.add(m);
    });
  };
  run(-DET.x, DET.zF, -DET.x, DET.zB);
  run(DET.x, DET.zB, DET.x, DET.zF);
  run(-DET.x, DET.zB, DET.x, DET.zB);
  run(-DET.x, DET.zF, -1.55, DET.zF);             // either side of the arch
  run(1.55, DET.zF, DET.x, DET.zF);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(DET.x * 2, 0.16, 0.24), frameMat);
  cornice.position.set(0, H - 0.03, DET.zF);
  scene.add(cornice);
})();

(function detailsCeiling() {
  // four coves, mitred at the corners: a quarter-ellipse swept along each wall, rising to a flat centre
  const x0 = -DET.x, x1 = DET.x, z0 = DET.zB, z1 = DET.zF, c = DET.cove, top = H + DET.rise, N = 20;
  const verts = [], uvs = [], index = [];
  [[[x0, z0], [x1, z0], [0, 1]], [[x1, z1], [x0, z1], [0, -1]], [[x0, z1], [x0, z0], [1, 0]], [[x1, z0], [x1, z1], [-1, 0]]].forEach(([a, b, n]) => {
    const base = verts.length / 3, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    for (let i = 0; i <= N; i++) {
      const th = (Math.PI / 2) * i / N, d = c * (1 - Math.cos(th)), y = H + DET.rise * Math.sin(th);
      [d, len - d].forEach((t) => {               // the strip shortens as it rises, meeting its neighbours on the mitre
        verts.push(a[0] + ux * t + n[0] * d, y, a[1] + uz * t + n[1] * d);
        uvs.push(t / len, i / N);
      });
    }
    for (let i = 0; i < N; i++) { const k = base + i * 2; index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  const coveMat = new THREE.MeshStandardMaterial({ color: '#eadfc6', roughness: 1, side: THREE.DoubleSide, emissive: '#5a4f3a', emissiveIntensity: 0.3 });
  scene.add(new THREE.Mesh(g, coveMat));

  // flat centre: a placeholder ceiling painting (soft sky) in a gilt frame
  const pw = x1 - x0 - 2 * c, pd = z1 - z0 - 2 * c;
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = Math.round(512 * pd / pw);
  const x = cv.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, cv.height);
  sky.addColorStop(0, '#7f9db8'); sky.addColorStop(0.55, '#b9c6c8'); sky.addColorStop(1, '#e3c398');
  x.fillStyle = sky; x.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 40; i++) {
    const bx = Math.random() * cv.width, by = Math.random() * cv.height, br = 30 + Math.random() * 90;
    const cl = x.createRadialGradient(bx, by, 0, bx, by, br);
    cl.addColorStop(0, 'rgba(255,246,228,' + (0.10 + Math.random() * 0.16) + ')'); cl.addColorStop(1, 'rgba(255,246,228,0)');
    x.fillStyle = cl; x.fillRect(bx - br, by - br, br * 2, br * 2);
  }
  const skyTex = tex('assets/det-ceiling-tiepolo.jpg');                 // Tiepolo's sketch for a ceiling (the Met), turned to lie along the room
  skyTex.wrapS = skyTex.wrapT = THREE.ClampToEdgeWrapping; skyTex.anisotropy = 8;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ map: skyTex, color: '#e8e2d6' }));
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, top, (z0 + z1) / 2);
  scene.add(panel);
  [[pw + 0.3, 0.15, 0, -pd / 2], [pw + 0.3, 0.15, 0, pd / 2], [0.15, pd + 0.3, -pw / 2, 0], [0.15, pd + 0.3, pw / 2, 0]].forEach(([w, d, ox, oz]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), frameMat);
    f.position.set(ox, top - 0.04, (z0 + z1) / 2 + oz);
    scene.add(f);
  });
})();

// ---- the hang. Each entry is one picture: which wall, where along it, centre height, size.
// Give an entry a `src` (an image in assets/) to hang a real picture; without one it shows a
// placeholder study. `blank: true` is the empty frame waiting for a name (the RSVP station).
// Each picture belongs to a section (`sec`), whose stop you walk to when you click it from elsewhere in the room. Once
// you stand at that stop, clicking a picture puts its own write-up (`note`) in the bottom panel instead.
const SECTION_STOP = { you: 'detClose', main: 'detMain', schedule: 'detSchedule', travel: 'detTravel', stay: 'detStay', logistics: 'detFrontL', policies: 'detFrontR' };
const SECTION_LABEL = { main: 'the main details', schedule: 'the schedule', travel: 'travel & transportation', stay: 'accommodations', logistics: 'advanced logistics', policies: 'guest policies' };
const DETAIL_PICTURES = [
  // end wall: the centrepiece alone, kept for the guests ("the only thing missing from this exhibit is you")
  { wall: 'back', at: 0, y: 2.55, w: 3.4, h: 2.3, sec: 'you' },
  // an oval frame either side of it, above the statues, empty for now
  { wall: 'back', at: -3.7, y: 2.7, w: 0.95, h: 1.25, sec: 'you', oval: true, blank: true },
  { wall: 'back', at: 3.7, y: 2.7, w: 0.95, h: 1.25, sec: 'you', oval: true, blank: true },
  // LEFT WALL, entrance side. 2 The schedule: April above; time and the feast beneath
  { wall: 'left', at: DET.zMid + 2.85, y: 2.745, w: 2.0, h: 1.012, sec: 'schedule', src: 'assets/det-april-triumph-of-venus.jpg',
    note: ['April (The Triumph of Venus)', 'From a room in Ferrara that paints the year month by month. April belongs to Venus: she arrives on a barge drawn by swans, lovers gather on the banks, and the three Graces look on. We took the hint about the month.', 'Francesco del Cossa, c. 1470 · Palazzo Schifanoia, Ferrara'] },
  { frame: 'plain', wall: 'left', at: DET.zMid + 3.45, y: 1.64, w: 0.85, h: 0.607, sec: 'schedule', src: 'assets/det-dance-to-the-music-of-time.jpg', crop: [0.05, 0.09, 0.96, 0.89],       // trimmed inside its shaped edge
    note: ['A Dance to the Music of Time', 'Father Time plays the lyre and the Seasons dance to it. The small cupid in the corner is holding the hourglass, which makes him the one keeping us to schedule.', 'Follower of Laurent de La Hyre, 17th century'] },
  { frame: 'plain', wall: 'left', at: DET.zMid + 2.26, y: 1.64, w: 0.95, h: 0.396, sec: 'schedule', src: 'assets/det-banquet-of-cupid-and-psyche.jpg', crop: [0.115, 0.255, 0.995, 0.7],   // the banquet panel alone, without the ceiling round it
    note: ['The Wedding Banquet of Cupid and Psyche', 'Every god on Olympus came to the wedding. It is painted on a ceiling as if it were a tapestry stretched overhead: Bacchus pours, the Graces see to the perfume, and the Hours scatter flowers. Even up there, dinner ran on schedule.', 'Raphael and workshop, 1518 · Villa Farnesina, Rome'] },
  // LEFT WALL, far side. 3 Travel: "Pegasus, Centaurs & Chariots", with Galatea's dolphins in the middle
  { wall: 'left', at: DET.zMid - 0.03, y: 2.3, w: 0.8, h: 1.2, sec: 'travel', src: 'assets/det-pegasus-and-mercury.jpg',
    note: ['Pegasus with Mercury', 'Mercury is the god of travelers, and Pegasus is the only flight that has never lost a bag. The rest of this painting, Mantegna’s Parnassus, hangs in Wing II.', 'Andrea Mantegna, 1497 (detail) · Musée du Louvre, Paris'] },
  { wall: 'left', at: DET.zMid - 1.35, y: 2.3, w: 1.14, h: 1.5, sec: 'travel', src: 'assets/det-triumph-of-galatea.jpg',
    note: ['The Triumph of Galatea', 'Galatea travels by shell, drawn by two dolphins, steering one-handed and ignoring three cupids who are taking aim at her. The only guest who will not need an airport transfer.', 'Raphael, c. 1512 · Villa Farnesina, Rome'] },
  { wall: 'left', at: DET.zMid - 2.695, y: 2.3, w: 0.85, h: 1.2, sec: 'travel', src: 'assets/det-pallas-and-the-centaur.jpg',
    note: ['Pallas and the Centaur', 'Pallas has the centaur by the hair, which is roughly how it feels to catch a connecting train. He looks sorry about the delay. They usually do.', 'Sandro Botticelli, c. 1482 · Gallerie degli Uffizi, Florence'] },
  // RIGHT WALL, entrance side. 1 The main details: a party in a villa garden, and one under a villa loggia
  { wall: 'right', at: DET.zMid + 0.45, y: 2.23, w: 2.4, h: 1.735, sec: 'main', src: 'assets/det-pleasure-garden-with-a-maze.jpg',
    note: ['Pleasure Garden with a Maze', 'A villa garden in full swing: a maze, musicians, boats on the water, a banquet in the middle and guests in every corner. Add a cypress avenue next to the maze and this is more or less the plan.', 'Lodewijk Toeput, called Pozzoserrato, c. 1579–84 · Royal Collection'] },
  { wall: 'right', at: DET.zMid + 3.15, y: 2.23, w: 1.9, h: 0.866, sec: 'main', src: 'assets/det-dives-and-lazarus.jpg',
    note: ['Dives and Lazarus', 'A party under a villa loggia, with musicians playing and the garden beyond. Strictly it is a parable about a rich man who ignored the beggar at his door. Lesson taken: everyone at our door gets a seat and a plate.', 'Bonifacio Veronese (Bonifacio de’ Pitati), c. 1540s · Gallerie dell’Accademia, Venice'] },
  // RIGHT WALL, far side. 4 Accommodations: one picture, a bedroom
  { wall: 'right', at: DET.zMid - 2.62, y: 2.3, w: 1.552, h: 1.6, sec: 'stay', src: 'assets/det-dream-of-st-ursula.jpg',
    note: ['The Dream of St Ursula', 'The best-kept bedroom in Venetian painting: slippers by the bed, a small dog on the floor, the window open, and an angel arriving quietly at dawn. We cannot promise the angel. We can help with the bed.', 'Vittore Carpaccio, 1495 · Gallerie dell’Accademia, Venice'] },
  // ENTRANCE WALL, left. 5 Advanced logistics: terrain above; weather and the seasons beneath. Kept left of x -2.2, clear of the bust
  { wall: 'front', at: -3.5, y: 2.85, w: 2.1, h: 0.823, sec: 'logistics', src: 'assets/det-good-government-countryside.jpg',
    note: ['The Effects of Good Government in the Countryside', 'The hills round Siena, painted a short drive from the villa nearly seven hundred years ago, and they have hardly changed: white roads, vineyards, and rather more slope than it looks. Pack shoes accordingly.', 'Ambrogio Lorenzetti, 1338–39 · Palazzo Pubblico, Siena'] },
  { frame: 'plain', wall: 'front', at: -3.955, y: 1.74, w: 1.1, h: 0.848, sec: 'logistics', src: 'assets/det-storm-on-a-mediterranean-coast.jpg',
    note: ['A Storm on a Mediterranean Coast', 'The weather forecast, worst case. Late April in Tuscany is usually gentle, but Vernet made a career out of what happens when it is not. Bring a layer.', 'Claude-Joseph Vernet, 1767 · J. Paul Getty Museum, Los Angeles'] },
  { frame: 'plain', wall: 'front', at: -2.785, y: 1.74, w: 0.59, h: 0.869, sec: 'logistics', src: 'assets/det-four-seasons.jpg',
    note: ['Allegory of the Four Seasons', 'Spring, Summer, Autumn and Winter, crowded into one frame. Late April can manage three of them in a day.', 'Bartolomeo Manfredi, c. 1610 · Dayton Art Institute'] },
  // ENTRANCE WALL, right. 6 Guest policies
  { wall: 'front', at: 3.4, y: 2.4, w: 1.75, h: 1.21, sec: 'policies', src: 'assets/det-court-of-gonzaga.jpg',
    note: ['The Court of Gonzaga', 'A letter has just arrived, and the Marquis is conferring with his secretary while the whole household waits to hear: the family, the children, and the dog under his chair. The room is called the Camera degli Sposi, the bridal chamber. Please answer your letter faster than he did.', 'Andrea Mantegna, 1465–74 · Palazzo Ducale, Mantua'] }
];
const STUDY_TONES = [['#c9b28a', '#3a2a1a'], ['#9fb0a6', '#1f2a2a'], ['#d6a77a', '#3b1e14'], ['#b9c0cf', '#252a3a'], ['#c8c08a', '#2e2c12'], ['#c7a0a0', '#351a1e']];
function studyTexture(i, aspect, blank) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = Math.round(256 / aspect);
  const x = c.getContext('2d');
  if (blank) {
    x.fillStyle = '#efe6d2'; x.fillRect(0, 0, c.width, c.height);
  } else {
    const [lt, dk] = STUDY_TONES[i % STUDY_TONES.length];
    const g = x.createRadialGradient(c.width * (0.35 + 0.3 * ((i * 37) % 10) / 10), c.height * 0.42, 4, c.width / 2, c.height / 2, c.width * 0.75);
    g.addColorStop(0, lt); g.addColorStop(1, dk);
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// an ornate gilt frame round a picture; `src` hangs an image, otherwise a placeholder
function framedPicture(p, i) {
  const grp = new THREE.Group();
  const frame = p.oval ? ornateOvalFrame(p.w, p.h) : ornateFrame(p.w, p.h, p.frame);
  frame.position.z = -0.07;
  let picGeo = new THREE.PlaneGeometry(p.w, p.h);
  if (p.oval) {                                                      // an elliptical canvas, its picture mapped as if it were the full rectangle
    picGeo = new THREE.ShapeGeometry(new THREE.Shape().absellipse(0, 0, p.w / 2, p.h / 2, 0, Math.PI * 2, false, 0), 48);
    const pos = picGeo.attributes.position, uv = [];
    for (let k = 0; k < pos.count; k++) uv.push(pos.getX(k) / p.w + 0.5, pos.getY(k) / p.h + 0.5);
    picGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  }
  const pic = new THREE.Mesh(picGeo, new THREE.MeshStandardMaterial({ map: p.src ? tex(p.src) : studyTexture(i, p.w / p.h, p.blank), roughness: 0.62 }));
  if (p.src) markHidden(pic, p.src);
  pic.position.z = -0.07 + frame.userData.pictureZ;
  if (p.src) {
    const t = pic.material.map;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    if (p.crop) { const [l, tp, r, b] = p.crop; t.repeat.set(r - l, b - tp); t.offset.set(l, 1 - b); }   // show only a detail of the image
  }
  [frame, pic].forEach((m) => grp.add(m));
  scene.add(grp);
  return grp;
}
let mainFrame = null;                                  // the end wall's centrepiece, which the curtain hangs over
DETAIL_PICTURES.forEach((p, i) => {
  const grp = framedPicture(p, i);
  if (p.wall === 'back' && p.at === 0) mainFrame = grp;
  const off = 0.075;                               // stand the frame just off the wall (and the dado line)
  if (p.wall === 'back') { grp.position.set(p.at, p.y, DET.zB + off); }
  if (p.wall === 'front') { grp.position.set(p.at, p.y, DET.zF - off); grp.rotation.y = Math.PI; }
  if (p.wall === 'left') { grp.position.set(-DET.x + off, p.y, p.at); grp.rotation.y = Math.PI / 2; }
  if (p.wall === 'right') { grp.position.set(DET.x - off, p.y, p.at); grp.rotation.y = -Math.PI / 2; }
  const secStop = STATIONS[ST[SECTION_STOP[p.sec]]];
  grp.userData.station = ST[SECTION_STOP[p.sec]];
  if (p.note && p.src) {
    // a close-up stop in front of the picture, at its own height, as near as its size allows; Step back returns to the section
    const d = THREE.MathUtils.clamp(Math.max(0.95 * p.h, 0.55 * p.w), 0.9, 2.3);
    const at = { left: [-DET.x + d, p.at, Math.PI / 2], right: [DET.x - d, p.at, -Math.PI / 2], front: [p.at, DET.zF - d, Math.PI], back: [p.at, DET.zB + d, 0] }[p.wall];
    const id = 'pic' + i;
    STATIONS.push({ id, x: at[0], z: at[1], yaw: at[2], eye: THREE.MathUtils.clamp(p.y, 1.3, 2.9), room: 'det', card: secStop.card, tour: false, back: secStop.id,
      accent: '#C9A667', eyebrow: 'Exhibit details · ' + SECTION_LABEL[p.sec], title: p.note[0], body: p.note[1], meta: p.note[2] });
    ST[id] = STATIONS.length - 1;
    grp.userData.closer = ST[id];
    if (HIDDEN[p.src]) HIDDEN[p.src].closeIdx = ST[id];              // a hidden pet in this picture is found from this close-up
  }
});

// ---- a gold title on the wall above each section, large enough to read from the room's entrance.
// Clicking it walks you to the section; clicking it once you are there puts the section's own write-up back in the panel.
function sectionTitle(text, wall, at, stopId, maxW) {
  const PH = 0.31, c = document.createElement('canvas');
  c.height = 256; c.width = Math.round(256 * maxW / PH);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const draw = (face) => {
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    let px = 196;
    const fit = () => { x.font = '600 ' + px + 'px ' + face; if ('letterSpacing' in x) x.letterSpacing = Math.round(px * 0.09) + 'px'; return x.measureText(text).width; };
    while (fit() > c.width * 0.97 && px > 60) px -= 4;
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = 'rgba(30,4,12,.55)'; x.fillText(text, c.width / 2 + 3, 196 + 4);
    x.fillStyle = '#ecc873'; x.fillText(text, c.width / 2, 196);
    const tw = Math.min(c.width * 0.97, x.measureText(text).width);
    x.fillRect(c.width / 2 - tw / 2, 226, tw, 5);                      // a fine rule beneath
    t.needsUpdate = true;
  };
  draw('Georgia, serif');
  if (document.fonts && document.fonts.load) document.fonts.load("600 40px 'Cormorant Garamond'").then(() => draw("'Cormorant Garamond', Georgia, serif")).catch(() => {});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(maxW * 0.86, PH), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, toneMapped: false }));
  const Y = 3.62, off = 0.014;
  if (wall === 'front') { m.position.set(at, Y, DET.zF - off); m.rotation.y = Math.PI; }
  if (wall === 'left') { m.position.set(-DET.x + off, Y, at); m.rotation.y = Math.PI / 2; }
  if (wall === 'right') { m.position.set(DET.x - off, Y, at); m.rotation.y = -Math.PI / 2; }
  m.userData.station = ST[stopId];
  m.userData.note = STATIONS[ST[stopId]];
  scene.add(m);
}
// ---- a small gold-edged button on the wall beneath each section: click it for the section's wall text
function detailsButton(wall, at, cardKey) {
  const W = 1.3, Hh = 0.14, c = document.createElement('canvas');
  c.width = 1300; c.height = Math.round(1300 * Hh / W);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const draw = (face) => {
    const x = c.getContext('2d'), w = c.width, h = c.height;
    x.clearRect(0, 0, w, h);
    x.fillStyle = 'rgba(40,6,18,.85)'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#e0bc68'; x.lineWidth = 5; x.strokeRect(6, 6, w - 12, h - 12);
    x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28);
    x.fillStyle = '#f0d48a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '600 58px ' + face; if ('letterSpacing' in x) x.letterSpacing = '10px';
    x.fillText('CLICK HERE FOR DETAILS', w / 2, h / 2 + 3);
    t.needsUpdate = true;
  };
  draw('Georgia, serif');
  if (document.fonts && document.fonts.load) document.fonts.load("600 40px 'EB Garamond'").then(() => draw("'EB Garamond', Georgia, serif")).catch(() => {});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
  // centred between the dado's cap rail (top at 0.97) and the lowest frame edge of this section's pictures,
  // but never lower than just above the rail (the sections with small pictures hung low have no room to spare)
  const RAIL = 0.97, low = Math.min(...DETAIL_PICTURES.filter((p) => p.sec === cardKey)
    .map((p) => p.y - p.h / 2 - THREE.MathUtils.clamp(0.085 + 0.036 * Math.max(p.w, p.h), 0.12, 0.25)));
  const Y = Math.max(1.03, (RAIL + low) / 2), off = 0.014;
  if (wall === 'front') { m.position.set(at, Y, DET.zF - off); m.rotation.y = Math.PI; }
  if (wall === 'left') { m.position.set(-DET.x + off, Y, at); m.rotation.y = Math.PI / 2; }
  if (wall === 'right') { m.position.set(DET.x - off, Y, at); m.rotation.y = -Math.PI / 2; }
  m.userData.cardKey = cardKey;
  scene.add(m);
}
detailsButton('right', DET.zMid + 1.8, 'main');
detailsButton('left', DET.zMid + 2.85, 'schedule');
detailsButton('left', DET.zMid - 1.35, 'travel');
detailsButton('right', DET.zMid - 2.62, 'stay');
detailsButton('front', -3.45, 'logistics');
detailsButton('front', 3.4, 'policies');

sectionTitle('THE MAIN DETAILS', 'right', DET.zMid + 1.8, 'detMain', 3.0);
sectionTitle('THE SCHEDULE', 'left', DET.zMid + 2.85, 'detSchedule', 2.5);
sectionTitle('TRAVEL & TRANSPORTATION', 'left', DET.zMid - 1.35, 'detTravel', 3.7);
sectionTitle('ACCOMMODATIONS', 'right', DET.zMid - 2.62, 'detStay', 2.6);
sectionTitle('ADVANCED LOGISTICS', 'front', -3.45, 'detFrontL', 2.9);
sectionTitle('GUEST POLICIES', 'front', 3.4, 'detFrontR', 2.4);

// ---- atrium mini galleries: three frames a side, Kelly on the left wall, Anthony on the right.
// Each frame has its own stop directly in front of it. Give a frame a `src` (an image in
// assets/) to hang a photograph; until then it shows an empty mount.
const ATRIUM_PICTURES = [
  { who: 'kelly', stop: 'kelly', dz: 0, y: 2.0, w: 1.15, h: 1.5, blank: true },
  { who: 'kelly', stop: 'kelly1', dz: 1.3, y: 2.12, w: 0.8, h: 1.05, blank: true },
  { who: 'kelly', stop: 'kelly2', dz: -1.3, y: 1.88, w: 0.8, h: 1.05, blank: true },
  { who: 'anthony', stop: 'anthony', dz: 0, y: 2.0, w: 1.15, h: 1.5, blank: true },
  { who: 'anthony', stop: 'anthony2', dz: -1.3, y: 2.12, w: 0.84, h: 1.08, blank: true }   // the arcade screen: 224 x 288, so 7:9
];
ATRIUM_PICTURES.forEach((p, i) => {
  const grp = framedPicture(p, i);
  const sx = p.who === 'kelly' ? -1 : 1;
  grp.position.set(sx * (P.corrX - 0.075), p.y, GALLERY_Z + p.dz);   // NB the stops for these frames use the same z; keep the two lists in step
  grp.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  // clicking any frame on the wall takes you to the wall's centred stop (the main frame's); from there a small frame
  // steps you across to it, as the wings' side pictures do
  grp.userData.station = ST[p.dz === 0 ? p.stop : p.who];
  if (p.dz !== 0) grp.userData.closer = ST[p.stop];
  // a frame whose stop carries a game is a screen: the game's title plays on it, so it reads as alive from the hall
  const game = STATIONS[ST[p.stop]].game;
  if (game && window.Arcade && Arcade.games[game]) {
    const cv = Arcade.attract(game, 6), t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
    cv.onframe = () => { t.needsUpdate = true; };
    const pic = grp.children[1];
    pic.material = new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.55, roughness: 0.4 });   // a lit screen
  }
});

// ---- an engraved brass name plaque under each gallery's large frame
const GALLERY_NAMES = { kelly: 'KELLY', anthony: 'ANTHONY' };
function plaqueTexture(text, px) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 205;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, c.height);           // brushed brass
  g.addColorStop(0, '#d9bb74'); g.addColorStop(0.45, '#b8934a'); g.addColorStop(1, '#8f6f33');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 260; i++) {
    x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,244,210,' : '60,40,10,') + (0.03 + Math.random() * 0.05) + ')';
    x.fillRect(0, Math.random() * c.height, c.width, 1);
  }
  x.strokeStyle = 'rgba(58,40,10,.7)'; x.lineWidth = 3; x.strokeRect(14, 14, c.width - 28, c.height - 28);
  [[36, 36], [c.width - 36, 36], [36, c.height - 36], [c.width - 36, c.height - 36]].forEach(([sx, sy]) => {   // screws
    x.fillStyle = '#7a5d28'; x.beginPath(); x.arc(sx, sy, 7, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(40,26,6,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(sx - 5, sy); x.lineTo(sx + 5, sy); x.stroke();
  });
  x.font = '600 ' + px + 'px Georgia';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if ('letterSpacing' in x) x.letterSpacing = Math.round(px * 0.18) + 'px';
  x.fillStyle = 'rgba(255,242,205,.55)'; x.fillText(text, c.width / 2, c.height / 2 + 5);   // lower lip of the engraving catches light
  x.fillStyle = '#34240a'; x.fillText(text, c.width / 2, c.height / 2 + 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
Object.keys(GALLERY_NAMES).forEach((who) => {
  const sx = who === 'kelly' ? -1 : 1;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, 0.025), brass);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.24), new THREE.MeshStandardMaterial({ map: plaqueTexture(GALLERY_NAMES[who], 84), roughness: 0.45, metalness: 0.15 }));
  face.position.z = 0.0135;
  const g = new THREE.Group();
  g.add(plate, face);
  g.position.set(sx * (P.corrX - 0.02), 0.86, GALLERY_Z);        // just under the large frame
  g.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  g.userData.station = ST[who];
  scene.add(g);
});

// ---- Anthony's artifacts, on his wall. Each is a group whose local +z faces into the hall and whose origin sits on
// the wall face; a click takes you to his wall, a second click steps you in close (as the small frames do).
const ARTIFACT_WALL = { x: P.corrX - 0.004, rotY: -Math.PI / 2 };
function hangArtifact(g, z, y, closeId) {
  g.position.set(ARTIFACT_WALL.x, y, z);
  g.rotation.y = ARTIFACT_WALL.rotY;
  g.userData.station = ST.anthony;
  g.userData.closer = ST[closeId];
  scene.add(g);
}
function wrapLines(x, text, maxW) {           // break a run of text into lines that fit a canvas width
  const words = text.split(' '), lines = [];
  let line = '';
  words.forEach((w) => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line);
  return lines;
}
function poly(x, pts, col) { x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath(); x.fillStyle = col; x.fill(); }

// 1. his favourite card, Destiny HERO - Diamond Dude, in a graded slab on brass clips under the right-hand frame.
// The card face is drawn here in the style of the game's effect monsters; a straight-on photo of the real card
// saved as assets/diamond-dude.png replaces the drawing (it should be the whole card, borders included).
function cardFaceCanvas() {
  const c = document.createElement('canvas');
  c.width = 420; c.height = 612;
  const x = c.getContext('2d');
  x.fillStyle = '#c8733b'; x.fillRect(0, 0, 420, 612);                             // the burnt-orange frame of an effect monster
  x.strokeStyle = '#7a3e18'; x.lineWidth = 6; x.strokeRect(3, 3, 414, 606);
  x.fillStyle = '#f0e4c9'; x.fillRect(24, 22, 372, 44);                              // name plate
  x.fillStyle = '#1a1410'; x.font = '600 19px Georgia'; x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillText('Destiny HERO - Diamond Dude', 30, 44);
  x.fillStyle = '#2b1c3a'; x.beginPath(); x.arc(376, 44, 15, 0, Math.PI * 2); x.fill();   // attribute: DARK
  x.fillStyle = '#e9d3ff'; x.font = '700 9px Georgia'; x.textAlign = 'center'; x.fillText('DARK', 376, 45);
  for (let k = 0; k < 4; k++) {                                                      // level 4: four stars
    const sx = 384 - k * 26, sy = 84, pts = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 10.5, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r]); }
    x.fillStyle = '#8a4a10'; x.beginPath(); x.arc(sx, sy, 12, 0, Math.PI * 2); x.fill();
    poly(x, pts, '#f3b53b');
  }
  x.fillStyle = '#f0e4c9'; x.fillRect(30, 100, 360, 360);                            // the art: a crystal hero on a dark ground
  const g = x.createLinearGradient(0, 106, 0, 454); g.addColorStop(0, '#171b38'); g.addColorStop(1, '#3d1f49');
  x.fillStyle = g; x.fillRect(36, 106, 348, 348);
  const glow = x.createRadialGradient(210, 280, 10, 210, 280, 170); glow.addColorStop(0, 'rgba(160,210,255,.45)'); glow.addColorStop(1, 'rgba(160,210,255,0)');
  x.fillStyle = glow; x.fillRect(36, 106, 348, 348);
  const cx = 210, cy = 285;
  poly(x, [[cx - 40, cy + 60], [cx - 12, cy + 60], [cx - 20, cy + 150], [cx - 52, cy + 150]], '#8fb6d9');    // legs
  poly(x, [[cx + 12, cy + 60], [cx + 40, cy + 60], [cx + 52, cy + 150], [cx + 20, cy + 150]], '#7ea6cc');
  poly(x, [[cx - 70, cy - 30], [cx - 122, cy + 34], [cx - 100, cy + 46], [cx - 58, cy - 4]], '#a7cbe8');   // arms
  poly(x, [[cx + 70, cy - 30], [cx + 122, cy + 34], [cx + 100, cy + 46], [cx + 58, cy - 4]], '#8fb6d9');
  poly(x, [[cx, cy - 70], [cx + 70, cy - 30], [cx + 40, cy + 70], [cx - 40, cy + 70], [cx - 70, cy - 30]], '#c9e3f5');   // the diamond torso, faceted
  poly(x, [[cx, cy - 70], [cx + 70, cy - 30], [cx, cy + 10]], '#a7cbe8');
  poly(x, [[cx, cy - 70], [cx - 70, cy - 30], [cx, cy + 10]], '#e6f3fb');
  poly(x, [[cx - 70, cy - 30], [cx, cy + 10], [cx - 40, cy + 70]], '#8fb6d9');
  poly(x, [[cx + 70, cy - 30], [cx, cy + 10], [cx + 40, cy + 70]], '#6f9bc4');
  poly(x, [[cx, cy - 132], [cx + 34, cy - 114], [cx + 34, cy - 80], [cx, cy - 62], [cx - 34, cy - 80], [cx - 34, cy - 114]], '#dbeefb');   // the head, a cut stone
  poly(x, [[cx - 26, cy - 102], [cx + 26, cy - 102], [cx + 22, cy - 90], [cx - 22, cy - 90]], '#2a2f55');                                 // visor
  [[120, 150, 5], [300, 170, 4], [110, 400, 3], [320, 420, 5], [250, 130, 3]].forEach(([sx, sy, r]) => {                                 // glints
    poly(x, [[sx, sy - r * 2.2], [sx + r * 0.6, sy], [sx, sy + r * 2.2], [sx - r * 0.6, sy]], 'rgba(255,255,255,.85)');
    poly(x, [[sx - r * 2.2, sy], [sx, sy + r * 0.6], [sx + r * 2.2, sy], [sx, sy - r * 0.6]], 'rgba(255,255,255,.85)');
  });
  x.fillStyle = '#f0e4c9'; x.fillRect(24, 472, 372, 116);                            // type and effect
  x.fillStyle = '#1a1410'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.font = '700 13px Georgia'; x.fillText('[Warrior / Effect]', 32, 492);
  x.font = '11px Georgia';
  wrapLines(x, 'Once per turn, you can look at the top card of your Deck. If it is a Normal Spell Card, send it to the Graveyard, and during the Main Phase 1 of your next turn, activate its effect.', 356)
    .forEach((l, i) => x.fillText(l, 32, 510 + i * 14));
  x.strokeStyle = '#1a1410'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(32, 560); x.lineTo(388, 560); x.stroke();
  x.font = '700 13px Georgia'; x.textAlign = 'right'; x.fillText('ATK/1400    DEF/1600', 388, 578);
  x.font = '9px Georgia'; x.textAlign = 'left'; x.fillStyle = '#3a2a1a'; x.fillText('DESTINY HERO', 32, 600);
  return c;
}
function slabLabelCanvas() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 200;
  const x = c.getContext('2d');
  x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, 512, 200);
  x.fillStyle = BURGUNDY_PAINT; x.fillRect(0, 0, 512, 16);
  x.fillStyle = '#1a1410'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.font = '700 26px Arial'; x.fillText('YU-GI-OH!  DESTINY HERO', 22, 70);
  x.font = '600 26px Arial'; x.fillText('DIAMOND DUDE', 22, 110);
  x.font = '500 17px Arial'; x.fillStyle = '#5a5048'; x.fillText('EFFECT MONSTER  ·  CERT. 24042027', 22, 154);
  x.strokeStyle = '#1a1410'; x.lineWidth = 3; x.strokeRect(392, 40, 96, 130);
  x.fillStyle = '#1a1410'; x.textAlign = 'center';
  x.font = '700 64px Arial'; x.fillText('10', 440, 118);
  x.font = '700 18px Arial'; x.fillText('GEM MT', 440, 150);
  return c;
}
(function cardSlab() {
  const g = new THREE.Group();
  const SW = 0.22, SH = 0.35, SD = 0.016, CW = 0.166, CH = 0.242;                // the slab, and the card inside it (2.6 x life)
  const acrylic = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.04, metalness: 0.05, transparent: true, opacity: 0.2, depthWrite: false });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(SW, SH, SD), acrylic);
  slab.position.z = SD / 2 + 0.006;
  const well = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.02, SH - 0.02), new THREE.MeshStandardMaterial({ color: '#f5f2ea', roughness: 0.7 }));   // the white inner sleeve
  well.position.z = 0.009;                                                       // just behind the card and label, inside the acrylic, so the three stay together from any angle
  const ct = new THREE.CanvasTexture(cardFaceCanvas());
  ct.colorSpace = THREE.SRGBColorSpace; ct.anisotropy = 8;
  const card = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.55 }));
  card.position.set(0, -0.037, 0.012);                                         // clear of the label above it: where the two overlapped, the card's top edge flickered
  const img = new Image();                                                       // the real card, if a photo of it has been supplied
  img.onload = () => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; card.material.map = t; card.material.needsUpdate = true; };
  img.src = 'assets/diamond-dude.png';
  const lt = new THREE.CanvasTexture(slabLabelCanvas());
  lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.195, 0.076), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.6 }));
  label.position.set(0, SH / 2 - 0.047, 0.012);
  g.add(well, card, label, slab);
  [[-1, -1], [1, -1], [0, 1]].forEach(([sx, sy]) => {                             // brass clips: two at the foot, one at the crown
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.012, SD + 0.02), brass);
    clip.position.set(sx * (SW / 2 - 0.03), sy * (SH / 2 + 0.006), SD / 2 + 0.006);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.018, 0.006), brass);
    lip.position.set(sx * (SW / 2 - 0.03), sy * (SH / 2 - 0.004), SD + 0.009);
    g.add(clip, lip);
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.012), brass);   // a small plaque below
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.06), new THREE.MeshStandardMaterial({ map: plaqueTexture('DIAMOND DUDE', 84), roughness: 0.45, metalness: 0.15 }));
  face.position.z = 0.0065;
  plate.add(face); plate.position.set(0, -SH / 2 - 0.06, 0.006);
  g.add(plate);
  // all of it mounted on a walnut plaque with a stepped edge, as a trophy is
  g.children.forEach((c) => { c.position.z += 0.03; });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.5, 0.022), walnutTable);
  board.position.set(0, -0.02, 0.011);
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.47, 0.008), walnutTable);
  step.position.set(0, -0.02, 0.026);
  g.add(board, step);
  hangArtifact(g, GALLERY_Z + 1.05, 1.95, 'anthonyCard');   // where the right-hand frame was, at eye level
})();

// 2. IN CASE OF EMERGENCY BREAK GLASS: a red steel case under the arcade with a glass front and a hammer on a chain,
// and inside, the three things he runs on: a Peach Red Bull, Hot Ones' Last Dab, and a pack of Marlboro Southern Cuts.
(function emergencyCase() {
  const g = new THREE.Group();
  const CW = 0.46, CH = 0.44, CD = 0.15;
  const red = new THREE.MeshStandardMaterial({ color: '#b3202a', roughness: 0.38, metalness: 0.15 });
  const cream = new THREE.MeshStandardMaterial({ color: '#f1ece1', roughness: 0.7 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(CW - 0.02, CH - 0.02, 0.012), cream);
  back.position.z = 0.006;
  g.add(back);
  [[0, CH / 2 - 0.015, CW, 0.03], [0, -CH / 2 + 0.015, CW, 0.03], [-CW / 2 + 0.015, 0, 0.03, CH - 0.06], [CW / 2 - 0.015, 0, 0.03, CH - 0.06]].forEach(([bx, by, bw, bh]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, CD), red);
    bar.position.set(bx, by, CD / 2);
    g.add(bar);
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(CW - 0.06, 0.006, CD - 0.02), cream);     // the case is cream inside, floor included
  floor.position.set(0, -CH / 2 + 0.033, CD / 2 - 0.004);
  g.add(floor);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(CW - 0.07, 0.012, CD - 0.045), cream);   // the ledge they stand on
  const shelfY = -CH / 2 + 0.09, shelfZ = (CD - 0.045) / 2 + 0.012;
  shelf.position.set(0, shelfY, shelfZ);
  g.add(shelf);
  const items = new THREE.Group();                                                // the three of them, built at life size and shown a third larger
  items.position.set(0, shelfY + 0.006, shelfZ); items.scale.setScalar(1.3);
  g.add(items);
  const top = 0;
  // The three are drawn after the real things. A straight-on photo of each, saved in assets/ as case-can.png (the can's
  // front), case-sauce.png (the bottle's label) or case-pack.png (the pack's front), replaces the drawing.
  const photo = (src, onto) => { const im = new Image(); im.onload = () => onto(im); im.src = src; };
  // A photograph of a cylinder is a projection: the print at angle a round the can lands at sin(a) across the picture.
  // This runs that backwards, column by column, so that the picture wrapped round the front half of a cylinder looks
  // exactly like the photograph again when seen from the front
  const unwrap = (ctx, im, x0, w, h) => { for (let i = 0; i < w; i++) { const sx = Math.min(im.width - 1, im.width / 2 * (1 + Math.sin(-Math.PI / 2 + Math.PI * (i + 0.5) / w))); ctx.drawImage(im, sx, 0, 1, im.height, x0 + i, 0, 1, h); } };
  // the can: Red Bull's Peach Edition, cream and peach, the sun and the two bulls, the red script, a peach
  const cc = document.createElement('canvas');
  cc.width = 512; cc.height = 360;
  let x = cc.getContext('2d');
  const cg = x.createLinearGradient(0, 0, 0, 360); cg.addColorStop(0, '#f8ead6'); cg.addColorStop(0.55, '#f5d9bb'); cg.addColorStop(1, '#efb98f');
  x.fillStyle = cg; x.fillRect(0, 0, 512, 360);
  const bull = (cx, cy, s, dir) => {                                              // a charging bull in profile, head down, as a red silhouette
    const pts = [[0, 30], [14, 16], [40, 8], [66, 12], [82, 22], [92, 8], [98, 12], [90, 26], [100, 34], [96, 42], [82, 40], [78, 58], [70, 58], [66, 44], [42, 44], [38, 60], [30, 60], [30, 46], [14, 48], [6, 60], [0, 58], [6, 44]];
    poly(x, pts.map(([px, py]) => [cx + dir * (px - 50) * s, cy + (py - 34) * s]), '#c8102e');
  };
  x.fillStyle = '#f5c518'; x.beginPath(); x.arc(256, 92, 26, 0, Math.PI * 2); x.fill();   // the sun (the front of a can shows two fifths of its wrap, so everything sits within 200 px)
  bull(226, 96, 0.52, 1); bull(286, 96, 0.52, -1);
  x.fillStyle = '#c8102e'; x.textAlign = 'center'; x.font = 'italic 700 36px Georgia';
  x.fillText('Red Bull', 256, 166);
  x.fillStyle = '#2a2a2a'; x.font = '700 11px Arial';
  if ('letterSpacing' in x) x.letterSpacing = '2px';
  x.fillText('THE PEACH EDITION', 256, 190);
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  x.fillStyle = '#f0925a'; x.beginPath(); x.arc(256, 268, 32, 0, Math.PI * 2); x.fill();   // the peach, with its crease and leaf
  x.fillStyle = '#e46b45'; x.beginPath(); x.arc(266, 275, 24, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#f7b98e'; x.beginPath(); x.arc(245, 258, 9, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#c9553a'; x.lineWidth = 3; x.beginPath(); x.moveTo(256, 238); x.quadraticCurveTo(248, 268, 260, 298); x.stroke();
  poly(x, [[258, 238], [284, 224], [292, 236], [268, 246]], '#6aa64a');
  x.fillStyle = '#8a6b52'; x.font = '600 9px Arial'; x.fillText('ENERGY DRINK', 256, 330);
  const canTex = new THREE.CanvasTexture(cc); canTex.colorSpace = THREE.SRGBColorSpace;
  // the real can is hot pink all round. A photo flattens the front half of a can: wrapped back on, it has to span less
  // than a quarter turn to face you whole
  photo('assets/case-can.png', (im) => { x = cc.getContext('2d'); x.fillStyle = '#e63a86'; x.fillRect(0, 0, 512, 360); unwrap(x, im, 128, 256, 360); canTex.needsUpdate = true; });   // the photo round the front half, pink round the back
  const silver = new THREE.MeshStandardMaterial({ color: '#cfd3d6', roughness: 0.3, metalness: 0.8 });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.135, 28), [new THREE.MeshStandardMaterial({ map: canTex, roughness: 0.35, metalness: 0.4 }), silver, silver]);
  can.position.set(-0.115, top + 0.0675, 0); can.rotation.y = Math.PI + 0.12;     // a cylinder's seam is at the front: turn the picture round to face out
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.003, 8, 28), silver);
  rim.rotation.x = Math.PI / 2; rim.position.set(-0.115, top + 0.135, 0);
  items.add(can, rim);
  // the hot sauce: a small bottle of orange sauce, black label, a yellow cap with a yellow seal down the neck
  const dark = new THREE.MeshStandardMaterial({ color: '#e0731c', roughness: 0.3, metalness: 0.05 });
  const black = new THREE.MeshStandardMaterial({ color: '#f2c318', roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.095, 24), dark);
  body.position.set(0, top + 0.0475, 0);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.026, 0.022, 24), dark);
  shoulder.position.set(0, top + 0.106, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 16), black);
  neck.position.set(0, top + 0.13, 0);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.022, 16), black);
  cap.position.set(0, top + 0.153, 0);
  // its label, after the real one: the HOT ONES band on top, THE LAST DAB in white on black, the flame
  const lc = document.createElement('canvas');
  lc.width = 320; lc.height = 128;
  x = lc.getContext('2d');
  x.fillStyle = '#111111'; x.fillRect(0, 0, 320, 128);
  x.fillStyle = '#f4efe6'; x.fillRect(0, 0, 320, 26);
  x.fillStyle = '#111111'; x.textAlign = 'center'; x.font = '900 13px Arial';
  if ('letterSpacing' in x) x.letterSpacing = '1px';
  x.fillText('HOT ONES', 160, 19);
  poly(x, [[160, 34], [174, 56], [169, 58], [182, 78], [160, 68], [138, 78], [151, 58], [146, 56]], '#e8402a');   // the flame
  poly(x, [[160, 50], [167, 62], [160, 71], [153, 62]], '#f7b32b');
  x.fillStyle = '#f5f0e6'; x.font = '900 14px Arial'; x.fillText('THE LAST DAB', 160, 102);
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  x.fillStyle = '#c9c2b4'; x.font = '600 7px Arial'; x.fillText('HOT SAUCE', 160, 117);
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  const labTex = new THREE.CanvasTexture(lc); labTex.colorSpace = THREE.SRGBColorSpace;
  photo('assets/case-sauce.png', (im) => { x = lc.getContext('2d'); x.fillStyle = '#111111'; x.fillRect(0, 0, 320, 128); unwrap(x, im, 80, 160, 128); labTex.needsUpdate = true; });
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.0265, 0.0265, 0.07, 24, 1, true), new THREE.MeshStandardMaterial({ map: labTex, roughness: 0.6 }));
  lab.position.set(0, top + 0.05, 0); lab.rotation.y = Math.PI;
  items.add(body, shoulder, neck, cap, lab);
  // the cigarettes: Marlboro Southern Cut, a black pack, the roof in tobacco-brown wood grain, the white script
  const pc = document.createElement('canvas');
  pc.width = 224; pc.height = 360;
  x = pc.getContext('2d');
  x.fillStyle = '#0f0d0c'; x.fillRect(0, 0, 224, 360);
  const wg = x.createLinearGradient(0, 0, 224, 0); wg.addColorStop(0, '#5a3a22'); wg.addColorStop(0.5, '#8a5a30'); wg.addColorStop(1, '#4e3320');
  poly(x, [[0, 0], [224, 0], [224, 96], [112, 168], [0, 96]], wg);                  // the roof
  for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(0,0,0,' + (0.08 + Math.random() * 0.12) + ')'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const yy = Math.random() * 170; x.moveTo(0, yy); x.bezierCurveTo(70, yy + 6, 150, yy - 6, 224, yy + 3); x.stroke(); }   // the grain
  x.save(); x.beginPath(); x.rect(0, 0, 224, 168); x.clip(); x.fillStyle = '#0f0d0c'; poly(x, [[0, 96], [112, 168], [224, 96], [224, 360], [0, 360]], '#0f0d0c'); x.restore();
  x.strokeStyle = '#c9a25a'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 96); x.lineTo(112, 168); x.lineTo(224, 96); x.stroke();
  x.fillStyle = '#e8d6a6'; x.textAlign = 'center';
  x.font = '600 11px Georgia'; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText('SOUTHERN CUT', 112, 205);
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  x.fillStyle = '#f4f1ea'; x.font = '700 40px Georgia'; x.fillText('Marlboro', 112, 258);
  x.fillStyle = '#c9a25a'; x.beginPath(); x.arc(112, 292, 9, 0, Math.PI * 2); x.fill();   // the crest
  x.fillStyle = '#0f0d0c'; x.font = '700 9px Georgia'; x.fillText('M', 112, 296);
  x.fillStyle = '#9c8a63'; x.font = '600 10px Georgia'; x.fillText('20 CLASS A CIGARETTES', 112, 336);
  const pTex = new THREE.CanvasTexture(pc); pTex.colorSpace = THREE.SRGBColorSpace;
  const packSide = new THREE.MeshStandardMaterial({ color: '#17120f', roughness: 0.5 });
  photo('assets/case-pack.png', (im) => {                                         // the real Southern Cut pack is copper: the photo on the front, copper round the sides
    packSide.color.set('#b5762f'); x = pc.getContext('2d');
    x.drawImage(im, 0, 0, 224, 360);                                                  // the owner's straight-on photo of the front, edge to edge
    pTex.needsUpdate = true;
  });
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.09, 0.023), [packSide, packSide, packSide, packSide, new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.5 }), packSide]);
  pack.position.set(0.115, top + 0.045, 0);
  items.add(pack);
  // the glass, with the warning painted on it
  const gc = document.createElement('canvas');
  gc.width = 460; gc.height = 440;
  x = gc.getContext('2d');
  x.fillStyle = 'rgba(205,228,240,.16)'; x.fillRect(0, 0, 460, 440);
  x.fillStyle = 'rgba(255,255,255,.1)'; poly(x, [[60, 0], [150, 0], [0, 190], [0, 100]], 'rgba(255,255,255,.1)');
  x.fillStyle = '#c41e2a'; x.textAlign = 'center';
  if ('letterSpacing' in x) x.letterSpacing = '1px';
  x.font = '700 36px Arial'; x.fillText('BREAK GLASS', 230, 426);
  const glassTex = new THREE.CanvasTexture(gc); glassTex.colorSpace = THREE.SRGBColorSpace;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.06, CH - 0.06), new THREE.MeshStandardMaterial({ map: glassTex, transparent: true, roughness: 0.05, metalness: 0.1, depthWrite: false }));
  glass.position.z = CD - 0.004;
  g.add(glass);
  // IN CASE OF EMERGENCY in white on the red top bar, as a real case has it, so it reads whatever is behind the glass
  const bc = document.createElement('canvas');
  bc.width = 920; bc.height = 60;
  x = bc.getContext('2d');
  x.fillStyle = '#b3202a'; x.fillRect(0, 0, 920, 60);
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 40px Arial';
  if ('letterSpacing' in x) x.letterSpacing = '4px';
  x.fillText('IN CASE OF EMERGENCY', 460, 32);
  const barTex = new THREE.CanvasTexture(bc); barTex.colorSpace = THREE.SRGBColorSpace; barTex.anisotropy = 8;
  const barFace = new THREE.Mesh(new THREE.PlaneGeometry(CW, 0.03), new THREE.MeshStandardMaterial({ map: barTex, roughness: 0.38, metalness: 0.15 }));
  barFace.position.set(0, CH / 2 - 0.015, CD + 0.001);
  g.add(barFace);
  // the hammer on its chain, hung at the right of the case
  const steel = new THREE.MeshStandardMaterial({ color: '#4d4f52', roughness: 0.35, metalness: 0.8 });
  const hx = CW / 2 + 0.065, hz = CD - 0.02, wood = new THREE.MeshStandardMaterial({ color: '#2b211c', roughness: 0.55 });   // hung level with the glass, so it shows from in front
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.09, 8), steel);
  chain.position.set(hx, CH / 2 - 0.06, hz);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.002, 8, 16), steel);
  ring.position.set(hx, CH / 2 - 0.012, hz);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.007, 0.14, 12), wood);
  handle.position.set(hx, CH / 2 - 0.175, hz);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.022, 0.022), steel);
  head.position.set(hx, CH / 2 - 0.245, hz);
  g.add(chain, ring, handle, head);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.012), brass);   // a small plaque below
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.06), new THREE.MeshStandardMaterial({ map: plaqueTexture('THE ESSENTIALS', 84), roughness: 0.45, metalness: 0.15 }));
  face.position.z = 0.0065;
  plate.add(face); plate.position.set(0, -CH / 2 - 0.075, 0.006);
  g.add(plate);
  hangArtifact(g, GALLERY_Z + 1.75, 1.95, 'anthonyCase');   // beside the slab
})();

// ---- raised gilt numerals above the wing arches, built from bars and serifs
function numeral(count, sx) {
  const g = new THREE.Group();
  const barW = 0.18, barH = 0.9, gap = 0.42, serifH = 0.1, depth = 0.1;
  const span = (count - 1) * gap;
  for (let k = 0; k < count; k++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, depth), frameMat);
    bar.position.x = -span / 2 + k * gap;
    g.add(bar);
  }
  [1, -1].forEach((sy) => {
    const serif = new THREE.Mesh(new THREE.BoxGeometry(span + barW + 0.28, serifH, depth), frameMat);
    serif.position.y = sy * (barH / 2 + serifH / 2);
    g.add(serif);
  });
  g.position.set(sx * (P.corrX - depth / 2 - 0.005), H + 0.8, -7.5);
  g.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(g);
}
numeral(1, -1);      // I, over the Wing I arch
numeral(2, 1);       // II, over the Wing II arch

// ---- sculpture spots. Every pedestal or plinth that can carry a real sculpture registers itself
// here under an id, along with the placeholder it shows until a 3D scan is assigned to it
// (see SCULPTURES, further down).
const SCULPTURE_SPOTS = {};    // id -> { group, top: height of the surface it stands on, placeholder: [meshes] }

// ---- furniture and sculpture, built from simple solids
function bust(x, z, rotY, id) {
  const g = new THREE.Group();
  [[0.52, 0.12, 0.52, 0.06], [0.4, 1.0, 0.4, 0.62], [0.5, 0.1, 0.5, 1.17]].forEach(([w, h, d, y]) => {   // pedestal
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plinthMat);
    m.position.y = y; g.add(m);
  });
  // socle, chest and shoulders turned as one profile, then flattened front to back like a carved bust
  const profile = [[0.0, 0], [0.12, 0], [0.085, 0.09], [0.09, 0.13], [0.17, 0.17], [0.25, 0.27], [0.27, 0.36], [0.22, 0.43], [0.12, 0.47], [0.072, 0.5], [0.065, 0.6], [0, 0.6]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), marbleWhite);
  torso.scale.set(1, 1, 0.62); torso.position.y = 1.22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 18), marbleWhite);
  head.scale.set(0.88, 1.18, 1.0); head.position.set(0, 1.9, 0.01);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 10), marbleWhite);
  nose.rotation.x = Math.PI / 2 - 0.5; nose.position.set(0, 1.885, 0.118);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), marbleWhite);
  hair.scale.set(0.92, 1.12, 1.05); hair.position.set(0, 1.91, -0.012); hair.rotation.x = -0.35;
  [torso, head, nose, hair].forEach((m) => g.add(m));
  if (id) SCULPTURE_SPOTS[id] = { group: g, top: 1.22, placeholder: [torso, head, nose, hair] };
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
}
function table(x, z, rotY, w, d, topMat, bodyMat, legs) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), topMat);
  top.position.y = 0.865;
  const apron = new THREE.Mesh(new THREE.BoxGeometry(w - 0.16, 0.13, d - 0.14), bodyMat);
  apron.position.y = 0.765;
  g.add(top, apron);
  const lx = w / 2 - 0.14, lz = d / 2 - 0.12;
  const spots = legs === 6 ? [[-lx, -lz], [0, -lz], [lx, -lz], [-lx, lz], [0, lz], [lx, lz]] : [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]];
  spots.forEach(([px, pz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.7, 14), bodyMat);
    leg.position.set(px, 0.35, pz);
    g.add(leg);
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  return g;
}
// the room's four smaller sculptures, on the pedestals in the corners: Ariadne reclines, so hers is a long low plinth
place(sculpturePedestal('detEndL', 1.1, 0.5, 0.5), -4.55, DET.zB + 0.55, 0);
place(sculpturePedestal('detEndR', 1.1, 0.5, 0.5), 4.55, DET.zB + 0.55, 0);
place(reservedPlinth('STATUE', 'detStatueL'), -2.5, DET.zB + 0.62, 0);   // large figures flanking the principal picture
place(reservedPlinth('STATUE', 'detStatueR', 0.96, 0.74), 2.5, DET.zB + 0.62, 0);   // Diana's base is 0.88 x 0.65
place(sculpturePedestal('detEntryL', 1.1, 0.5, 0.5), -2.15, DET.zF - 0.5, Math.PI);   // flanking the entrance arch, facing into the room
place(sculpturePedestal('detEntryR', 1.1, 0.5, 0.5), 2.15, DET.zF - 0.5, Math.PI);
table(0, DET.zMid - 0.55, 0, 2.4, 1.2, marbleStatuary, walnutTable, 6).userData.station = ST.detTable;           // centre table
// gilt consoles under the side walls' principal pictures (the end wall's place is taken by the gift-shop stand)

// ---- room lighting: four warm pools, and an unshadowed picture light on each principal work
[[-2.4, DET.zF - 2.2], [2.4, DET.zF - 2.2], [-2.4, DET.zB + 2.2], [2.4, DET.zB + 2.2]].forEach(([x, z]) => {
  const pl = new THREE.PointLight('#ffeccb', 9, 11, 2);
  pl.position.set(x, H + 0.9, z);
  scene.add(pl);
});

// ---------------------------------------------------------------- architectural detail
// the stone dressing of an Italian gallery: a cornice where the vaults spring, pilasters marking
// the atrium's bays, moulded surrounds and keystones on the arches, and the entrance doors
const trimMat = new THREE.MeshStandardMaterial({ color: '#d8ccb0', roughness: 0.9 });
const walnutDoor = new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-panel.jpg'), roughness: 0.6 });
function boxRun(x1, z1, x2, z2, y, h, d, mat) {       // a moulding laid along a wall line, centred on it
  const len = Math.hypot(x2 - x1, z2 - z1);
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, d), mat || trimMat);
  m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  scene.add(m);
}
function cornice(x1, z1, x2, z2) {
  boxRun(x1, z1, x2, z2, H - 0.05, 0.1, 0.17);
  boxRun(x1, z1, x2, z2, H - 0.135, 0.07, 0.09);
}
(function cornices() {
  const c = P.corrX, e = P.wingEndX, face = P.wingFarZ + 0.14;
  [-c, c].forEach((x) => cornice(x, P.backZ, x, P.wingFarZ));          // hall sides (shared with the wings' inner ends)
  cornice(-c, P.backZ, c, P.backZ);
  cornice(-c, face, -1.5, face); cornice(1.5, face, c, face);           // details-arch wall, either side of the plaque
  [-1, 1].forEach((sx) => {
    cornice(sx * c, P.wingNearZ, sx * e, P.wingNearZ);
    cornice(sx * c, P.wingFarZ, sx * e, P.wingFarZ);
    cornice(sx * e, P.wingFarZ, sx * e, P.wingNearZ);
    cornice(sx * (c + 0.264), P.wingFarZ, sx * (c + 0.264), P.wingNearZ);   // wing face of the doorway wall
  });
})();
(function pilasters() {
  // one under each rib springer along the atrium, on both walls
  const bay = (P.backZ - P.wingNearZ) / 3;
  [P.backZ - bay, P.backZ - 2 * bay, P.wingNearZ].forEach((z) => {
    [-P.corrX, P.corrX].forEach((x) => {
      [[0.44, H - 0.17, 0.14, (H - 0.17) / 2], [0.54, 0.22, 0.2, 0.11], [0.5, 0.06, 0.17, 0.25], [0.54, 0.15, 0.2, H - 0.245], [0.5, 0.05, 0.17, H - 0.345]].forEach(([w, h, d, y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), trimMat);
        m.position.set(x, y, z);
        scene.add(m);
      });
    });
  });
})();
// a moulded band following an arch and running down its jambs, with a keystone at the crown
function archSurround(x, z, rotY, openW, springs, legs) {
  const r = openW / 2, bw = 0.17, depth = 0.05;
  const s = new THREE.Shape();
  const foot = legs ? 0 : springs;
  s.moveTo(-r - bw, foot); s.lineTo(-r - bw, springs);
  s.absarc(0, springs, r + bw, Math.PI, 0, true);
  s.lineTo(r + bw, foot); s.lineTo(r, foot); s.lineTo(r, springs);
  s.absarc(0, springs, r, 0, Math.PI, false);
  s.lineTo(-r, foot); s.lineTo(-r - bw, foot);
  const band = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 32 }), trimMat);
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, depth + 0.05), trimMat);
  key.position.set(0, springs + r + 0.1, (depth + 0.05) / 2);
  const g = new THREE.Group();
  g.add(band, key);
  [-1, 1].forEach((sd) => {                                            // impost blocks at the springing
    const imp = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.08, 0.1, depth + 0.03), trimMat);
    imp.position.set(sd * (r + bw / 2), springs, (depth + 0.03) / 2);
    g.add(imp);
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
}
[-1, 1].forEach((sx) => {
  archSurround(sx * P.corrX, -7.5, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 2.6, 2.3, true);             // hall face of each wing arch
  archSurround(sx * (P.corrX + 0.264), -7.5, sx < 0 ? -Math.PI / 2 : Math.PI / 2, 2.6, 2.3, true);   // and the face inside the wing
});
(function keystones() {                                                // the details arch already has its band
  [[P.wingFarZ + 0.15, 1], [P.wingFarZ - 0.15, -1]].forEach(([z, dir]) => {
    // 3.53 to 3.83: it must stop under the directory sign (bottom edge 3.85), whose panel face it would otherwise share a plane with
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.09), trimMat);
    key.position.set(0, 2.3 + 1.35 + 0.03, z + dir * 0.03);
    scene.add(key);
  });
})();
(function entranceDoors() {
  // the inside face of the walnut entrance doors, in a stone architrave, on the atrium's back wall
  const z = P.backZ - 0.03, w = 2.9, h = 3.25;
  [-1, 1].forEach((sd) => {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(w / 2 - 0.01, h), walnutDoor);
    leaf.position.set(sd * w / 4, h / 2, z);
    leaf.rotation.y = Math.PI;
    const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.62, 12), frameMat);
    pull.position.set(sd * 0.09, 1.2, z - 0.06);
    scene.add(leaf, pull);
  });
  [[-1, 0.26, h + 0.26], [1, 0.26, h + 0.26]].forEach(([sd, bw, bh]) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.12), trimMat);
    jamb.position.set(sd * (w / 2 + bw / 2), bh / 2, P.backZ - 0.06);
    scene.add(jamb);
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(w + 0.52, 0.26, 0.12), trimMat);
  head.position.set(0, h + 0.13, P.backZ - 0.06);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.1, 0.26), trimMat);
  hood.position.set(0, h + 0.31, P.backZ - 0.13);
  scene.add(head, hood);
})();

// ---------------------------------------------------------------- objects in the wings
// Wing I answers The Birth of Venus: marble urns, the scallop shell, roses.
// Wing II answers Primavera: flowers without end, and the orange grove in terracotta pots.
const terracotta = new THREE.MeshStandardMaterial({ color: '#b5643c', roughness: 0.85 });
const leafMat = new THREE.MeshStandardMaterial({ color: '#3f5a33', roughness: 0.9 });
const pearl = new THREE.MeshStandardMaterial({ color: '#f4eadb', roughness: 0.32, side: THREE.DoubleSide });
const tint = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75 });
const lathe = (pts, mat, seg = 36) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function pedestal(h, W = 0.5, D = W, mat = plinthMat) {             // W x D: its footprint (a seated or reclining figure needs a deeper one)
  const g = new THREE.Group();
  [[0, 0.1, 0.05], [-0.12, h - 0.2, h / 2], [-0.02, 0.1, h - 0.05]].forEach(([inset, bh, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(W + inset, bh, D + inset), mat);
    m.position.y = y; g.add(m);
  });
  return g;
}
function place(g, x, z, rotY) { g.position.set(x, 0, z); g.rotation.y = rotY || 0; scene.add(g); return g; }
function urn(top) {                                   // a carved marble vase on its pedestal, after the Medici and Borghese urns
  const g = pedestal(0.95);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), marbleWhite);   // square foot
  foot.position.y = 0.95 + 0.025; g.add(foot);
  // torus base, gadrooned bowl, a wide belly, a narrow neck and a flared lip
  const profile = [[0, 0.05], [0.105, 0.05], [0.115, 0.085], [0.075, 0.115], [0.068, 0.19], [0.16, 0.27], [0.225, 0.42], [0.215, 0.56], [0.16, 0.66], [0.108, 0.72], [0.095, 0.8], [0.1, 0.855], [0.165, 0.895], [0.155, 0.93], [0.125, 0.93], [0, 0.93]];
  const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 96), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {                            // sixteen convex flutes round the bowl, fading out towards the belly
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y > 0.19 && y < 0.58) { const k = Math.sin(Math.PI * (y - 0.19) / 0.39), a = Math.atan2(z, x), f = 1 + 0.05 * k * Math.cos(16 * a); pos.setXYZ(i, x * f, y, z * f); }
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, marbleWhite);
  body.position.y = 0.95;
  g.add(body);
  [-1, 1].forEach((sd) => {                                        // two scroll handles at the shoulder
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.017, 10, 28, Math.PI), marbleWhite);
    h.position.set(sd * 0.195, 0.95 + 0.5, 0); h.rotation.z = -sd * Math.PI / 2;
    g.add(h);
  });
  if (top) { top.position.y = 0.95 + 0.86; g.add(top); }
  return g;
}
// ---- botanical pieces are built leaf by leaf and petal by petal, as instanced meshes
function leafGeometry() {                             // one leaf: pointed, folded along the midrib, drooping at the tip
  const rows = 6, verts = [], index = [];
  for (let i = 0; i <= rows; i++) {
    const v = i / rows, w = 0.21 * Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * v)), 0.85) * (1 - 0.35 * v);
    const droop = -0.16 * v * v;
    verts.push(-w, v, 0.3 * w + droop, 0, v, droop, w, v, 0.3 * w + droop);
  }
  for (let i = 0; i < rows; i++) {
    const k = i * 3;
    index.push(k, k + 1, k + 3, k + 1, k + 4, k + 3, k + 1, k + 2, k + 4, k + 2, k + 5, k + 4);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}
function petalGeometry() {                            // one rose petal: cupped across, rolling back at the lip
  const nu = 4, nv = 4, verts = [], index = [];
  for (let j = 0; j <= nv; j++) {
    const v = j / nv, w = 0.7 * Math.pow(Math.sin(Math.PI * (0.12 + 0.8 * v)), 0.7);
    for (let i = 0; i <= nu; i++) {
      const u = -1 + 2 * i / nu, x = u * w;
      verts.push(x, v, -0.75 * x * x + 0.3 * v * v * v);
    }
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * (nu + 1) + i;
    index.push(k, k + 1, k + nu + 1, k + 1, k + nu + 2, k + nu + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}
const LEAF_GEO = leafGeometry(), PETAL_GEO = petalGeometry();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
// collects instances (matrix + colour) and turns them into one InstancedMesh
function instancer(geo, mat) {
  const mats = [], cols = [];
  return {
    add(m, c) { mats.push(m.clone()); cols.push(c.clone()); },
    build() {
      const mesh = new THREE.InstancedMesh(geo, mat, mats.length);
      mats.forEach((m, i) => { mesh.setMatrixAt(i, m); mesh.setColorAt(i, cols[i]); });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      return mesh;
    }
  };
}
// the sculpture files are compressed by gltfpack (EXT_meshopt_compression, KHR_mesh_quantization): the loader needs the
// meshopt decoder, which comes with three.js in assets/lib/three/
const gltfLoaderReady = () => Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')])
  .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder));
// ---- Anthony's third artifact: Amelia, the first gift: a JEKCA brick model of their dog (the Japanese Spitz set,
// ST19PT31), on a Siena marble plinth between his frames. The model is assets/sculpture/amelia.glb: a 3D generation
// from the maker's three product renders (front, left, right; Tripo via Magnific, 25 Sept 2026), reduced with
// tools/reduce_glb.py, which bakes its texture (the black nose and eyes) into vertex colours. Shown at about
// two and a half times the set's size, half a metre long.
(function amelia() {
  const dog = new THREE.Group();
  const LENGTH = 0.5;
  gltfLoaderReady().then((gltfLoader) => {
    gltfLoader.load('assets/sculpture/amelia.glb', (gltf) => {
      const m = gltf.scene;
      m.traverse((o) => { if (o.isMesh) { if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }); } });
      const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const k = LENGTH / size.x;                                       // her length runs along the model's x, nose toward +x
      m.scale.setScalar(k);
      m.position.set(-c.x * k, -box.min.y * k, -c.z * k);              // centred on her footprint, standing on the plinth top
      dog.add(m);
    }, undefined, () => console.warn('Amelia did not load'));
  }).catch(() => console.warn('sculpture loader unavailable for Amelia'));
  const g = new THREE.Group();
  [[0.42, 0.1, 0.42, 0.05], [0.34, 0.72, 0.34, 0.46], [0.4, 0.08, 0.4, 0.86]].forEach(([w, h, d, y]) => {   // a slim square plinth to waist height, her paws near its edges, in the busts' pedestals' style
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plinthMat);
    p.position.y = y; g.add(p);
  });
  dog.position.y = 0.9; dog.rotation.y = Math.PI * 0.75;              // she stands diagonally, nose toward the plinth's front-left corner              // she stands diagonally, nose toward the plinth's front-left corner, her plume to the room
  g.add(dog);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.055, 0.012), brass);   // her name, on the plinth's face
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.055), new THREE.MeshStandardMaterial({ map: plaqueTexture('AMELIA', 84), roughness: 0.45, metalness: 0.15 }));
  face.position.z = 0.0065;
  plate.add(face); plate.position.set(-0.176, 0.765, 0); plate.rotation.y = -Math.PI / 2;   // just under the cap, as a museum plate sits
  g.add(plate);
  g.position.set(2.15, 0, GALLERY_Z + 1.4);                           // on the floor below the slab and the case
  g.userData.station = ST.anthony;
  g.userData.closer = ST.anthonyAmelia;
  scene.add(g);
})();

// a leaf at `pos`, its length pointing along `dir`, rolled at random about that direction
function addLeaf(inst, pos, dir, size, color, rnd) {
  const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.clone().normalize());
  q.multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, rnd() * Math.PI * 2));
  inst.add(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(size, size, size)), color);
}
// a rose at `c` opening along `n`: a tight heart, then three rings of overlapping petals,
// each ring wider, larger and more open than the last. `s` is roughly a third of the bloom's width.
function addRose(inst, c, n, s, base, rnd, rings = 3) {
  const frame = new THREE.Matrix4().compose(c, new THREE.Quaternion().setFromUnitVectors(Y_AXIS, n.clone().normalize()), new THREE.Vector3(1, 1, 1));
  const heart = base.clone().multiplyScalar(0.68);
  //            petals  radius  opening  size   lift
  const RINGS = [[3, 0.03, 0.05, 0.5, 0.2], [5, 0.12, 0.22, 0.72, 0.14], [7, 0.3, 0.55, 0.95, 0.07], [9, 0.5, 0.95, 1.12, 0]];
  RINGS.slice(0, rings + 1).forEach(([count, rad, open, size, lift], ri) => {
    const spin = rnd() * 6.283;
    for (let k = 0; k < count; k++) {
      const phi = spin + k * 6.283 / count, tilt = open + (rnd() - 0.5) * 0.14, sz = s * size * (0.93 + rnd() * 0.14);
      const d = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));
      const X = new THREE.Vector3(Math.sin(phi), 0, -Math.cos(phi));
      const Y = new THREE.Vector3(0, Math.cos(tilt), 0).addScaledVector(d, Math.sin(tilt));
      const Z = new THREE.Vector3().crossVectors(X, Y);
      const m = new THREE.Matrix4().makeBasis(X.multiplyScalar(sz), Y.clone().multiplyScalar(sz), Z.multiplyScalar(sz));
      m.setPosition(d.clone().multiplyScalar(s * rad).setY(s * lift));
      inst.add(m.premultiply(frame), heart.clone().lerp(base, Math.min(1, 0.2 + ri * 0.3 + rnd() * 0.1)));
    }
  });
}

// a stem that tapers along its length, from r0 at the start to r1 at the tip, slightly uneven, as stems are
function taperedTube(curve, segs, r0, r1, rnd) {
  const geo = new THREE.TubeGeometry(curve, segs, 1, 5, false), pos = geo.attributes.position, ring = 6;   // radius 1, then scaled ring by ring
  const centre = new THREE.Vector3(), v = new THREE.Vector3(), wobble = 0.6 + rnd() * 3;
  for (let i = 0; i < pos.count; i++) {
    const j = Math.floor(i / ring), t = j / segs;
    curve.getPoint(t, centre);
    const r = (r0 + (r1 - r0) * Math.pow(t, 0.8)) * (1 + 0.12 * Math.sin(t * 9 + wobble));
    v.fromBufferAttribute(pos, i).sub(centre).multiplyScalar(r).add(centre);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  return geo;
}
// roses massed on an urn and fountaining down its pedestal, for the urns beside The Birth of Venus:
// garden roses of two varieties (cream-blush and coral-pink) with a few deep accents, at every stage from bud to
// full bloom, on real rose foliage (leaflets in threes), with sprays of gypsophila for air and trailing ivy for depth
function roseCascade(seed) {
  const g = new THREE.Group(), rnd = seeded(seed);
  const petals = instancer(PETAL_GEO, new THREE.MeshStandardMaterial({ roughness: 0.68, side: THREE.DoubleSide }));
  const leaves = instancer(LEAF_GEO, new THREE.MeshStandardMaterial({ roughness: 0.55, side: THREE.DoubleSide }));
  const dots = instancer(new THREE.SphereGeometry(1, 7, 5), new THREE.MeshStandardMaterial({ roughness: 0.8 }));
  const ROSES = ['#f7ead8', '#f7ead8', '#f4d3c8', '#f4d3c8', '#f4d3c8', '#eeb0b8', '#eeb0b8', '#eeb0b8', '#f1b79e', '#f1b79e', '#dd8c9c', '#dd8c9c', '#bb5872'].map((h) => new THREE.Color(h));
  const GREENS = ['#2c4524', '#3a562c', '#4a6a34', '#587a3c'].map((h) => new THREE.Color(h));
  const IVY = ['#22381f', '#2d4a28', '#365a2e'].map((h) => new THREE.Color(h));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // a bloom at any stage: a bud on its calyx, a half-open rose, or a full one
  const bloom = (pos, n, size, stage) => {
    const t = stage === undefined ? rnd() : stage;
    if (t < 0.18) {
      addRose(petals, pos, n, size * 0.62, pick(ROSES), rnd, 1);
      for (let k = 0; k < 4; k++) addLeaf(leaves, pos.clone().addScaledVector(n.clone().normalize(), -size * 0.1), n.clone().normalize().applyAxisAngle(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), 0.7), size * 0.9, GREENS[0], rnd);
    } else if (t < 0.45) addRose(petals, pos, n, size * 0.85, pick(ROSES), rnd, 2);
    else addRose(petals, pos, n, size, pick(ROSES), rnd, 3);
  };
  // rose foliage: a compound leaf of three leaflets, the middle one a little longer
  const leafCluster = (pos, dir, size, col) => {
    const d = dir.clone().normalize(), side = V(-d.z, 0, d.x).normalize();
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    addLeaf(leaves, pos, d, size * 1.05, col || pick(GREENS), rnd);
    [-1, 1].forEach((sd) => addLeaf(leaves, pos.clone().addScaledVector(d, -size * 0.25), d.clone().addScaledVector(side, sd * 0.75).normalize(), size * 0.8, col || pick(GREENS), rnd));
  };
  // gypsophila: a loose spray of tiny white flowers
  const gyp = (pos, n) => {
    const count = 6 + Math.floor(rnd() * 6), c = new THREE.Color('#fbf6ec');
    for (let k = 0; k < count; k++) {
      const p = pos.clone().add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.07)).addScaledVector(n, 0.02 + rnd() * 0.04);
      dots.add(new THREE.Matrix4().compose(p, new THREE.Quaternion(), V(0.0065, 0.0065, 0.0065)), c);
    }
  };
  // the mass on top: a tall dome of blooms, foliage tucked between and underneath, gypsophila at the edges
  for (let i = 0; i < 58; i++) {
    const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.05), R = 0.3 + rnd() * 0.06;
    const n = V(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a));
    bloom(n.clone().multiplyScalar(R).setY(n.y * R * 1.35 + 0.1), n, 0.054 + rnd() * 0.016, rnd() < 0.75 ? 0.5 + rnd() * 0.5 : rnd() * 0.45);
  }
  for (let i = 0; i < 34; i++) {
    const a = rnd() * 6.283, e = 0.85 + rnd() * 0.95, R = 0.3 + rnd() * 0.1;
    const n = V(Math.sin(e) * Math.cos(a), Math.cos(e) * 0.6, Math.sin(e) * Math.sin(a));
    leafCluster(n.clone().multiplyScalar(R * 0.82), n, 0.085 + rnd() * 0.04);
  }
  for (let i = 0; i < 16; i++) {
    const a = rnd() * 6.283, e = 0.7 + rnd() * 0.7, n = V(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a));
    gyp(n.clone().multiplyScalar(0.36).setY(n.y * 0.4 + 0.1), n);
  }
  // the fountain: tall sprays rising out of the middle, arching over and out, thinning to buds at the tips
  const stemMat = tint('#3b4a26');
  for (let i = 0; i < 6; i++) {
    const ang = 0.35 + i * (2.45 / 5) + (rnd() - 0.5) * 0.25;                   // fanned towards the room, never into the wall
    const out = V(Math.cos(ang), 0, Math.sin(ang)), h = 0.5 + rnd() * 0.18, reach = 0.42 + rnd() * 0.16;
    const pts = [[0, 0.15], [0.07, 0.45 + h * 0.4], [0.28, 0.2 + h], [0.62, 0.05 + h * 0.75], [1, 0.05 + h * 0.15]].map(([k, y]) => out.clone().multiplyScalar(k * reach).setY(y));
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(taperedTube(curve, 20, 0.009, 0.0025, rnd), stemMat));
    for (let j = 0; j < 9; j++) {
      const t = 0.3 + (j + 0.5 + (rnd() - 0.5) * 0.5) / 9 * 0.7, pt = curve.getPoint(t), tan = curve.getTangent(t);
      const outward = pt.clone().setY(0).normalize().multiplyScalar(0.7).add(V(0, 0.6 - t * 0.4, 0)).addScaledVector(tan, -0.15);
      const size = (0.05 - 0.02 * t) * (0.85 + rnd() * 0.3);
      bloom(pt.clone().addScaledVector(outward.clone().normalize(), size * 1.1), outward, size, t > 0.9 ? rnd() * 0.17 : t > 0.72 ? 0.2 + rnd() * 0.25 : 0.5 + rnd() * 0.5);
      if (rnd() < 0.8) leafCluster(pt, V(rnd() - 0.5, -0.3 - rnd() * 0.5, rnd() - 0.5).addScaledVector(outward, 0.4), 0.055 + rnd() * 0.03);
      if (j > 5 && rnd() < 0.5) gyp(pt, outward.clone().normalize());
    }
  }
  // the cascades: vines leaving the rim, rising a little, arcing out and falling, roses thinning to buds at the tips
  const vineMat = tint('#3b4a26');
  [[1.57, 1.6], [1.0, 1.2], [2.15, 1.3], [0.45, 0.85], [2.7, 0.9], [1.3, 0.7], [1.85, 0.6]].forEach(([ang, drop]) => {
    const out = V(Math.cos(ang), 0, Math.sin(ang)), reach = 0.4 + rnd() * 0.15, rise = 0.3 + rnd() * 0.18;
    const side = V(-out.z, 0, out.x).multiplyScalar((rnd() - 0.5) * 0.35);
    const pts = [0, 0.15, 0.35, 0.6, 1].map((t) => out.clone().multiplyScalar(0.15 + reach * Math.sin(Math.min(1, t * 1.6) * Math.PI / 2))
      .addScaledVector(side, t * t).setY(0.12 + rise * Math.sin(Math.min(1, t * 2) * Math.PI / 2) * Math.pow(1 - t, 0.7) - drop * t * t));
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(taperedTube(curve, 24, 0.011, 0.002, rnd), vineMat));
    const count = Math.round(17 + drop * 14);
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5 + (rnd() - 0.5) * 0.6) / count, pt = curve.getPoint(t), tan = curve.getTangent(t);
      const outward = pt.clone().setY(0).normalize().multiplyScalar(0.8).add(V(0, 0.55 - t * 0.5, 0)).addScaledVector(tan, -0.2);
      const size = (0.06 - 0.022 * t) * (0.85 + rnd() * 0.3);
      const across = V(-tan.z, 0, tan.x).multiplyScalar((rnd() - 0.5) * 0.3 * (1 - 0.8 * t));
      bloom(pt.clone().add(across).addScaledVector(outward.clone().normalize(), size * 1.2), outward, size, t > 0.88 ? rnd() * 0.17 : t > 0.7 ? 0.2 + rnd() * 0.25 : 0.5 + rnd() * 0.5);
      leafCluster(pt, V(rnd() - 0.5, -0.2 - rnd() * 0.6, rnd() - 0.5).addScaledVector(outward, 0.5), 0.055 + rnd() * 0.03);
      if (rnd() < 0.3) gyp(pt, outward.clone().normalize());
    }
  });
  // trailing ivy between the rose vines: no flowers, small dark leaves close along a thin stem, falling straight
  [0.75, 1.3, 1.85, 2.4].forEach((ang) => {
    const out = V(Math.cos(ang), 0, Math.sin(ang)), reach = 0.28 + rnd() * 0.1, drop = 1.0 + rnd() * 0.6;
    const pts = [0, 0.2, 0.5, 1].map((t) => out.clone().multiplyScalar(0.18 + reach * Math.sin(Math.min(1, t * 1.8) * Math.PI / 2)).setY(0.1 + 0.08 * Math.sin(t * 3) - drop * t * t));
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(taperedTube(curve, 20, 0.006, 0.0015, rnd), vineMat));
    const count = Math.round(18 + drop * 10);
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count, pt = curve.getPoint(t), tan = curve.getTangent(t);
      const side = V(-tan.z, 0, tan.x).normalize().multiplyScalar(i % 2 ? 1 : -1);
      addLeaf(leaves, pt, side.addScaledVector(tan, 0.3).add(V(0, -0.35, 0)), 0.04 + rnd() * 0.02, pick(IVY), rnd);
    }
  });
  g.add(petals.build(), leaves.build(), dots.build());
  return g;
}

// an orange tree standard in a banded terracotta pot, as in the Primavera grove
function citrusTree(seed) {
  const g = new THREE.Group(), rnd = seeded(seed);
  g.add(lathe([[0, 0], [0.2, 0], [0.225, 0.03], [0.235, 0.07], [0.29, 0.42], [0.31, 0.45], [0.345, 0.47], [0.35, 0.51], [0.335, 0.545], [0.295, 0.545], [0.28, 0.5], [0, 0.5]], terracotta, 48));
  [[0.262, 0.2], [0.283, 0.36]].forEach(([r, y]) => {                 // raised bands, as on Impruneta pots
    const band = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 48), terracotta);
    band.rotation.x = Math.PI / 2; band.position.y = y; g.add(band);
  });
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.285, 32), tint('#3a2a1c'));
  soil.rotation.x = -Math.PI / 2; soil.position.y = 0.505; g.add(soil);
  const bark = tint('#5a4a38');
  const top = new THREE.Vector3(0.015, 1.62, 0.0), centre = new THREE.Vector3(0, 2.0, 0);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.025, 0.9, 0.012), new THREE.Vector3(-0.018, 1.3, -0.01), top]), 20, 0.028, 8, false), bark));
  // the crown: leaves gathered in clumps around an ellipsoid. Inside it, a looser layer of dark leaves, so that a
  // thin patch shows more foliage behind it (a smooth dark ball was tried first, and showed through as a ball)
  const leaves = instancer(LEAF_GEO, new THREE.MeshStandardMaterial({ roughness: 0.42, side: THREE.DoubleSide }));
  const deep = new THREE.Color('#2c4722'), sunlit = new THREE.Color('#5d7f3c'), rad = new THREE.Vector3(0.47, 0.52, 0.47);
  const clumps = [];
  for (let i = 0; i < 24; i++) {
    const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.85), R = 0.72 + rnd() * 0.3;
    const dir = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a));
    clumps.push(dir.clone().multiply(rad).multiplyScalar(R));
    if (i < 5) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top.clone().setY(1.5 + rnd() * 0.1), top.clone().lerp(centre.clone().add(clumps[i]), 0.5).add(new THREE.Vector3(0, -0.06, 0)), centre.clone().add(clumps[i])]), 8, 0.011, 5, false), bark));
  }
  const onCrown = () => { const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.9); return new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)); };
  const shade = new THREE.Color('#1c2f17');
  for (let i = 0; i < 800; i++) {                                  // the inner layer, all round
    const d = onCrown(), p = d.clone().multiply(rad).multiplyScalar(0.42 + rnd() * 0.3);
    addLeaf(leaves, p.add(centre), d.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5)), 0.1 + rnd() * 0.05, shade.clone().lerp(deep, rnd() * 0.7), rnd);
  }
  for (let i = 0; i < 500; i++) {                                  // an even scatter over the outside, so no side is left thin
    const d = onCrown(), p = d.clone().multiply(rad).multiplyScalar(0.82 + rnd() * 0.2);
    const lit = THREE.MathUtils.clamp(0.5 + p.y / 1.0 + (rnd() - 0.5) * 0.5, 0, 1);
    addLeaf(leaves, p.add(centre), d.add(new THREE.Vector3(rnd() - 0.5, -0.35 + rnd() * 0.5, rnd() - 0.5).multiplyScalar(0.9)), 0.085 + rnd() * 0.045, deep.clone().lerp(sunlit, lit), rnd);
  }
  for (let i = 0; i < 2100; i++) {
    const c = clumps[Math.floor(rnd() * clumps.length)];
    const p = c.clone().add(new THREE.Vector3(rnd() + rnd() + rnd() - 1.5, rnd() + rnd() + rnd() - 1.5, rnd() + rnd() + rnd() - 1.5).multiplyScalar(0.2));
    const dir = p.clone().normalize().add(new THREE.Vector3(rnd() - 0.5, -0.35 + rnd() * 0.5, rnd() - 0.5).multiplyScalar(0.9));
    const lit = THREE.MathUtils.clamp(0.5 + p.y / 1.0 + (rnd() - 0.5) * 0.5, 0, 1);
    addLeaf(leaves, p.add(centre), dir, 0.085 + rnd() * 0.045, deep.clone().lerp(sunlit, lit), rnd);
  }
  g.add(leaves.build());
  // fruit hangs mostly from the lower, outer crown; blossom is scattered over it
  const rind = [tint('#e8902a'), tint('#de7f1f'), tint('#efa03a')], calyx = tint('#2d4220');
  for (let i = 0; i < 18; i++) {
    const a = rnd() * 6.283, e = 0.9 + rnd() * 1.5, r = 0.041 + rnd() * 0.011;
    const p = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)).multiply(rad).multiplyScalar(0.98).add(centre);
    const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), rind[i % 3]);
    o.scale.y = 0.94; o.position.copy(p);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.008, 6), calyx);
    cap.position.copy(p).y += r * 0.93;
    g.add(o, cap);
  }
  // orange blossom: small five-petalled white flowers with a yellow heart, scattered evenly over the crown (singly,
  // now and then a pair, here and there a bud), standing just proud of the leaves. Each petal is the leaf shape, laid so its edges cup towards the flower's
  // axis and its tip curls back, as citrus petals do.
  const petals = instancer(LEAF_GEO, new THREE.MeshStandardMaterial({ roughness: 0.45, side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0.14 }));
  const white = new THREE.Color('#fbf8ee'), heartGeo = new THREE.SphereGeometry(0.0085, 8, 6), heartMat = tint('#e8c24a'), budMat = tint('#f6f1e2');
  // The trees stand against the wing's end wall, so the blossom goes on the side that faces the room (-x), at the heights
  // you see. One flower per cell of a jittered grid over that side, which spreads them evenly instead of in clumps.
  const COLS = 8, ROWS = 5;
  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const n = (() => { const a = Math.PI + ((col + rnd()) / COLS - 0.5) * 3.0, e = 0.5 + (row + rnd()) / ROWS * 1.35; return new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)); })();
    const at = n.clone().multiply(rad).multiplyScalar(1.24).add(centre);      // out past the leaf tips, or they are lost in the foliage
    const side = new THREE.Vector3().crossVectors(n, Y_AXIS).normalize(), up = new THREE.Vector3().crossVectors(side, n).normalize();
    const flowers = rnd() < 0.25 ? 2 : 1;
    for (let f = 0; f < flowers; f++) {
      const pos = at.clone().addScaledVector(side, f * 0.07).addScaledVector(up, f * (rnd() - 0.5) * 0.08);
      const axis = n.clone().addScaledVector(side, (rnd() - 0.5) * 0.7).addScaledVector(up, (rnd() - 0.5) * 0.7).normalize();
      const u = new THREE.Vector3().crossVectors(axis, Math.abs(axis.y) < 0.9 ? Y_AXIS : new THREE.Vector3(1, 0, 0)).normalize(), v = new THREE.Vector3().crossVectors(axis, u);
      const len = 0.033 + rnd() * 0.007, open = 1.05 + rnd() * 0.25, spin = rnd() * 6.283;
      for (let k = 0; k < 5; k++) {
        const phi = spin + k * 6.283 / 5;
        const radial = u.clone().multiplyScalar(Math.cos(phi)).addScaledVector(v, Math.sin(phi));
        const Y = axis.clone().multiplyScalar(Math.cos(open)).addScaledVector(radial, Math.sin(open));     // along the petal
        const Z = axis.clone().addScaledVector(Y, -axis.dot(Y)).normalize();                                // the petal's face, towards the axis
        const X = new THREE.Vector3().crossVectors(Y, Z);
        const m = new THREE.Matrix4().makeBasis(X.multiplyScalar(len * 1.25), Y.clone().multiplyScalar(len), Z.multiplyScalar(len));
        petals.add(m.setPosition(pos), white);
      }
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.position.copy(pos).addScaledVector(axis, 0.004);
      g.add(heart);
    }
    if (i % 3) continue;                                             // a closed bud beside every third
    const bud = new THREE.Mesh(heartGeo, budMat);
    bud.scale.set(1, 1.7, 1);
    bud.position.copy(at).addScaledVector(side, 0.06).addScaledVector(up, -0.05);
    g.add(bud);
  }
  g.add(petals.build());
  return g;
}
// a low plinth kept free for a statue that is still to come, marked with a small brass label
// a plain pedestal that carries a sculpture scan
function sculpturePedestal(id, h, W, D, mat) {
  const g = pedestal(h, W, D, mat);
  SCULPTURE_SPOTS[id] = { group: g, top: h, placeholder: [] };
  return g;
}
function reservedPlinth(label, id, W = 0.78, D = W, rounded = 0, mat = plinthMat) {    // W x D: the plinth's footprint; rounded: corner radius, to hug a statue's own base
  const g = new THREE.Group();
  [[0, 0.1, 0.05], [-0.12, 0.4, 0.3], [-0.02, 0.1, 0.55]].forEach(([inset, h, y]) => {
    let geo = new THREE.BoxGeometry(W + inset, h, D + inset);
    if (rounded) {                                                   // a rounded rectangle, extruded upwards
      const a = (W + inset) / 2, b = (D + inset) / 2, r = rounded + inset / 2, sh = new THREE.Shape();
      sh.moveTo(-a + r, -b); sh.lineTo(a - r, -b); sh.absarc(a - r, -b + r, r, -Math.PI / 2, 0, false);
      sh.lineTo(a, b - r); sh.absarc(a - r, b - r, r, 0, Math.PI / 2, false);
      sh.lineTo(-a + r, b); sh.absarc(-a + r, b - r, r, Math.PI / 2, Math.PI, false);
      sh.lineTo(-a, -b + r); sh.absarc(-a + r, -b + r, r, Math.PI, Math.PI * 1.5, false);
      geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 14 });
      geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2, 0);
    }
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y; g.add(m);
  });
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#b8934a'; x.fillRect(0, 0, 512, 128);
  x.strokeStyle = 'rgba(58,40,10,.7)'; x.lineWidth = 4; x.strokeRect(8, 8, 496, 112);
  x.fillStyle = '#34240a'; x.font = '600 50px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(label, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.09), new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.15 }));
  plate.position.set(0, 0.3, (D - 0.12) / 2 + 0.002);
  g.add(plate);
  if (id) SCULPTURE_SPOTS[id] = { group: g, top: 0.6, placeholder: [plate] };
  return g;
}
(function furnishWings() {
  const endX = P.wingEndX - 0.45, sideX = 1830 * U, zFar = P.wingFarZ + 0.38, zNear = P.wingNearZ - 0.38;
  // Wing I: rose cascades flank the Venus; Venus and her son Cupid stand on the side walls
  place(urn(roseCascade(3)), -(P.wingEndX - 0.4), -7.5 - 2.18, Math.PI / 2);
  place(urn(roseCascade(8)), -(P.wingEndX - 0.4), -7.5 + 2.18, Math.PI / 2);
  place(reservedPlinth('STATUE', 'w1statue'), -sideX, zFar + 0.05, 0);
  // Cupid sits with his legs out: about 0.53 wide and 0.94 deep, so his pedestal is long, and stands further off the wall
  place(sculpturePedestal('w1small', 0.95, 0.64, 1.06), -sideX, zNear - 0.22, Math.PI);
  // Wing II: the orange grove flanks Primavera; the side walls are kept for a statue and a bust
  place(citrusTree(5), endX, -7.5 - 2.12, 0);
  place(citrusTree(9), endX, -7.5 + 2.12, 0);
  place(reservedPlinth('STATUE', 'w2statue'), sideX, zFar + 0.05, 0);
  bust(sideX, zNear, Math.PI, 'w2bust');
})();

// ---- the entrance end of the atrium: Venus and Mars flank the doors (the couple of the Veronese in Wing I), so the long look back down the hall
// (which you get for a moment whenever you walk back to the atrium) has something to land on
(function atriumStatues() {
  // Half way down the entrance hall, against the side walls and turned in towards the centre line: near enough to the
  // atrium's standing spot (z 0) to read at a glance. Nobody walks beyond z 0, so they are never in the way.
  const Z = 4.6;
  [[-1, 'atriumStatueL'], [1, 'atriumStatueR']].forEach(([sx, id]) => {
    // Mars sits, on a base 0.90 x 1.30 m: his plinth is that plus a finger's width, turned only slightly so it stays tight to the wall
    const seated = id === 'atriumStatueR';
    const g = place(seated ? reservedPlinth('STATUE', id, 0.96, 1.36) : reservedPlinth('STATUE', id), sx * (seated ? 1.9 : 1.85), Z, Math.PI + sx * (seated ? 0.1 : 0.55));
    g.userData.note = NOTES.pair;                                                   // the two share one write-up
    const sp = new THREE.SpotLight('#ffe3b3', 15, 8, 0.55, 0.9, 1.4);              // a soft wash each, no shadows
    sp.position.set(sx * 0.5, H - 0.2, Z - 2.4);
    sp.target.position.set(sx * 1.75, 1.8, Z);
    scene.add(sp, sp.target);
  });
})();

// ---- a burgundy banner with the KA monogram in gold, hung from a brass rod in the lunette above the entrance doors
// (plain gilt lettering on the cream wall was tried first, and was too faint to read from the atrium)
(function doorBanner() {
  const img = new Image();
  img.onload = () => {
    const CW = 768, CH = 1024, c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    const x = c.getContext('2d');
    const outline = (inset) => {                                     // a swallow-tailed pennant
      x.beginPath();
      x.moveTo(inset, inset); x.lineTo(CW - inset, inset); x.lineTo(CW - inset, CH - inset * 1.6);
      x.lineTo(CW / 2, CH * 0.8 - inset * 0.4); x.lineTo(inset, CH - inset * 1.6); x.closePath();
    };
    outline(0); x.save(); x.clip();
    x.fillStyle = '#5e1230'; x.fillRect(0, 0, CW, CH);             // mixed darker than the swatch: lit, and carrying a little of its own light, it lands on the invitation burgundy
    const rnd = seeded(77);
    for (let i = 0; i < 2600; i++) {                                 // a woven grain
      x.fillStyle = rnd() < 0.5 ? 'rgba(255,220,200,.05)' : 'rgba(0,0,0,.07)';
      if (rnd() < 0.5) x.fillRect(rnd() * CW, rnd() * CH, 1, 14 + rnd() * 30); else x.fillRect(rnd() * CW, rnd() * CH, 14 + rnd() * 30, 1);
    }
    x.restore();
    x.strokeStyle = '#d9ab4c'; x.lineJoin = 'miter';
    x.lineWidth = 9; outline(26); x.stroke();                        // gold braid: a broad line and a fine one inside it
    x.lineWidth = 3; outline(46); x.stroke();
    const m = document.createElement('canvas');                       // the monogram, recoloured gold
    m.width = m.height = 640;
    const mx = m.getContext('2d');
    mx.drawImage(img, 0, 0, 640, 640);
    mx.globalCompositeOperation = 'source-in';
    const g = mx.createLinearGradient(0, 0, 640, 640);
    g.addColorStop(0, '#f6dc94'); g.addColorStop(0.5, '#e0b557'); g.addColorStop(1, '#c1953b');
    mx.fillStyle = g; mx.fillRect(0, 0, 640, 640);
    x.shadowColor = 'rgba(30,0,10,.55)'; x.shadowBlur = 6; x.shadowOffsetY = 3;
    x.drawImage(m, (CW - 640) / 2, CH * 0.07);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;

    const W = 1.4, Hh = W * CH / CW, topY = VAULT.spring + 1.98, z = P.backZ - 0.09;
    const geo = new THREE.PlaneGeometry(W, Hh, 28, 1), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.022 * Math.sin(pos.getX(i) * 13));   // soft vertical folds
    geo.computeVertexNormals();
    const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.14 }));
    cloth.position.set(0, topY - Hh / 2, z);
    cloth.rotation.y = Math.PI;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, W + 0.3, 12), brass);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, topY + 0.01, z);
    scene.add(cloth, rod);
    [-1, 1].forEach((sd) => {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), brass);
      finial.position.set(sd * (W / 2 + 0.17), topY + 0.01, z);
      const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), brass);
      bracket.rotation.x = Math.PI / 2;
      bracket.position.set(sd * (W / 2 + 0.06), topY + 0.01, z + 0.045);
      scene.add(finial, bracket);
    });
  };
  img.src = 'assets/monogram-ka.png';
})();

// ---- two frescoes on the entrance hall's bare walls, by the statues: Botticelli's pair from Villa Lemmi, painted for
// a wedding in the 1480s. The bride receiving gifts from Venus and the Graces goes on Venus's side; the groom being
// presented to the Liberal Arts, on Mars's. Set in plain stone mouldings, as wall paintings are, not in gilt frames.
[{ src: 'assets/fresco-venus-and-graces.jpg', aspect: 2048 / 1521, sx: -1, zc: 2.65, note: NOTES.frescoBride }, { src: 'assets/fresco-liberal-arts.jpg', aspect: 2048 / 1822, sx: 1, zc: 2.38, note: NOTES.frescoGroom }].forEach((f) => {
  // placed so each surround clears the pilaster on one side and its statue's plinth on the other
  const h = 1.95, w = h * f.aspect, zc = f.zc, y = 2.12, x = f.sx * (P.corrX - 0.012);
  const t = tex(f.src);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  const paint = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  paint.position.set(x, y, zc);
  paint.rotation.y = f.sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  paint.userData.note = f.note;
  scene.add(paint);
  // its stone surround, as a wall painting is set in a palazzo: a fine inner fillet, a broad architrave round it, a
  // plain frieze and a projecting cornice above, and below, a sill carried on two small corbels
  const slab = (len, tall, deep, yc, zc2) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(deep, tall, len), trimMat);
    m.position.set(f.sx * (P.corrX - deep / 2), yc, zc2);
    m.userData.note = f.note;
    scene.add(m);
  };
  const ring = (inner, bw, deep) => {                                // a rectangular band, `inner` out from the painting's edge
    const W = w + 2 * inner, Hh = h + 2 * inner;
    slab(W + 2 * bw, bw, deep, y + Hh / 2 + bw / 2, zc); slab(W + 2 * bw, bw, deep, y - Hh / 2 - bw / 2, zc);
    slab(bw, Hh, deep, y, zc - W / 2 - bw / 2); slab(bw, Hh, deep, y, zc + W / 2 + bw / 2);
  };
  ring(0, 0.035, 0.035);
  ring(0.035, 0.13, 0.075);
  const out = 0.165, top = y + h / 2 + out, bottom = y - h / 2 - out, full = w + 2 * out;
  slab(full, 0.13, 0.06, top + 0.065, zc);                           // frieze
  slab(full + 0.26, 0.05, 0.12, top + 0.155, zc);                    // cornice, in two steps
  slab(full + 0.36, 0.06, 0.18, top + 0.21, zc);
  slab(full + 0.3, 0.07, 0.2, bottom - 0.035, zc);                   // sill
  slab(full + 0.16, 0.04, 0.13, bottom - 0.09, zc);
  [-1, 1].forEach((sd) => slab(0.13, 0.2, 0.12, bottom - 0.21, zc + sd * (full / 2 - 0.14)));   // corbels
});

// ---------------------------------------------------------------- real sculpture (3D scans)
// Assign a scan to a spot and it replaces that spot's placeholder. Spots:
//   w1statue / w1small      Wing I, the low plinth (far side wall) and the pedestal (near side wall)
//   atriumStatueL / atriumStatueR   the entrance hall, half way down, either side (large full figures)
//   w2statue   Wing II, the low plinth on the far side wall (a medium full figure)
//   detStatueL / detStatueR   details room, the two plinths flanking the principal picture
//   w2bust     Wing II, the pedestal on the near side wall
//   detEndL / detEndR       details room, flanking the end-wall hang
//   detEntryL / detEntryR   details room, flanking the entrance arch
// Models are .glb files in assets/sculpture/, made from raw museum scans with tools/convert_scan.py.
//   src     the .glb
//   height  how tall it should stand, in metres (a bust is about 0.7, a medium statue about 1.5)
//   turn    optional, radians, to face it the right way on its spot
//   tilt    optional, [x, z] in degrees, to straighten a scan whose base was captured off level
//   level   optional, true to straighten it automatically, by fitting a plane to the underside of its base
//   nudge   optional, [x, z] in metres, when the statue's own base is off-centre under it
//   keep    optional, true to keep the scan's own colour instead of the gallery's marble
//   title / credit   what it is and who to thank; credits are listed in the page's Credits panel
const SCULPTURES = {
  atriumStatueL: { src: 'assets/sculpture/venus-capitoline.glb', height: 2.25, title: 'The Capitoline Venus (cast of the marble in the Capitoline Museums, Rome)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  atriumStatueR: { src: 'assets/sculpture/mars-ludovisi.glb', height: 1.85, nudge: [-0.02, -0.065],   // his base is not centred under him
    title: 'The Ludovisi Mars, with Cupid at his feet (cast of the marble in Palazzo Altemps, Rome)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  w1statue: { src: 'assets/sculpture/venus-apple.glb', height: 1.5, title: 'Venus with the Apple, Bertel Thorvaldsen, 1809',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  w1small: { src: 'assets/sculpture/amor-lyre.glb', height: 0.95, title: 'Cupid Playing the Lyre, Bertel Thorvaldsen',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detStatueL: { src: 'assets/sculpture/apollo-belvedere.glb', height: 2.0, level: true,   // the scan was captured off level: stood flat and centred by its base
    title: 'Apollo Belvedere, after Leochares (cast of the Vatican marble)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detStatueR: { src: 'assets/sculpture/diana.glb', height: 1.9, nudge: [0.11, 0.13], title: 'Diana the Huntress (Diana of Villa Bartholoni), 1831',
    credit: '3D scan by Rama · CC BY-SA 3.0 FR · via Wikimedia Commons' },
  w2statue: { src: 'assets/sculpture/venus-italica.glb', height: 1.55, title: 'Venus Italica, Antonio Canova',
    credit: '3D scan by Rama, Musées d’art et d’histoire de Genève · CC BY-SA 3.0 FR · via Wikimedia Commons' },
  w2bust: { src: 'assets/sculpture/costanza.glb', height: 0.7, turn: 0, title: 'Costanza Bonarelli, Gian Lorenzo Bernini, c. 1636–38 (cast of the Bargello marble)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detEndL: { src: 'assets/sculpture/ariadne-head.glb', height: 0.7, turn: Math.PI, title: 'Head of Ariadne (Musée Saint-Raymond, Toulouse)',
    credit: '3D scan by Musée Saint-Raymond / Scan the World · CC BY · via Wikimedia Commons' },
  detEntryR: { src: 'assets/sculpture/antinous-dionysus.glb', height: 0.78, turn: 0, title: 'Antinous as Dionysus (cast of the Vatican marble)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detEntryL: { src: 'assets/sculpture/beatrice.glb', height: 0.66, turn: 0, title: 'Beatrice d’Este, after Gian Cristoforo Romano (cast of the Louvre marble)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
};
// the Credits panel: the paintings, then every sculpture scan with the attribution its licence asks for
(function credits() {
  const list = document.getElementById('creditsList');
  if (!list) return;
  const rows = [
    ['The Birth of Venus and Primavera, Sandro Botticelli', 'Gallerie degli Uffizi, Florence · public domain'],
    ['Venus and the Three Graces Presenting Gifts to a Young Woman; A Young Man Being Introduced to the Seven Liberal Arts (frescoes from Villa Lemmi), Sandro Botticelli, c. 1483–86', 'Musée du Louvre, Paris · public domain'],
    ['Happy Union (Allegory of Love, IV), Paolo Veronese, c. 1575', 'National Gallery, London · public domain'],
    ['Mars and Venus United by Love, Paolo Veronese, 1570s', 'The Metropolitan Museum of Art, New York · public domain'],
    ['The Three Graces, Francesco Furini, c. 1633', 'State Hermitage Museum, St Petersburg · public domain'],
    ['Amaryllis and Mirtillo, Anthony van Dyck, c. 1631–32', 'Gothenburg Museum of Art · public domain'],
    ['The Wedding Banquet (The Story of Nastagio degli Onesti, IV), Sandro Botticelli, 1483', 'Private collection, Florence · public domain'],
    ['Parnassus, Andrea Mantegna, 1497', 'Musée du Louvre, Paris · public domain'],
    ['Banquet Still Life, Adriaen van Utrecht, 1644', 'Rijksmuseum, Amsterdam · public domain'],
    ['Still Life with Fruit, Giovan Battista Ruoppolo, 1650–1699', 'Public domain'],
    ['Pallas and the Centaur, Sandro Botticelli, c. 1482', 'Gallerie degli Uffizi, Florence · public domain'],
    ['The Triumph of Galatea, Raphael, c. 1512', 'Villa Farnesina, Rome · public domain'],
    ['April (The Triumph of Venus), Francesco del Cossa, c. 1470', 'Palazzo Schifanoia, Ferrara · public domain'],
    ['The Wedding Banquet of Cupid and Psyche, Raphael and workshop, 1518', 'Villa Farnesina, Rome · public domain'],
    ['A Dance to the Music of Time, follower of Laurent de La Hyre, 17th century', 'Public domain'],
    ['Pleasure Garden with a Maze, Lodewijk Toeput (Pozzoserrato), c. 1579–84', 'Royal Collection · public domain'],
    ['Dives and Lazarus, Bonifacio Veronese (Bonifacio de’ Pitati), c. 1540s', 'Gallerie dell’Accademia, Venice · public domain'],
    ['A Storm on a Mediterranean Coast, Claude-Joseph Vernet, 1767', 'J. Paul Getty Museum, Los Angeles · public domain'],
    ['Allegory of the Four Seasons, Bartolomeo Manfredi, c. 1610', 'Dayton Art Institute · public domain'],
    ['The Effects of Good Government in the Countryside, Ambrogio Lorenzetti, 1338–39', 'Palazzo Pubblico, Siena · public domain'],
    ['The Dream of St Ursula, Vittore Carpaccio, 1495', 'Gallerie dell’Accademia, Venice · public domain'],
    ['The Court of Gonzaga (Camera degli Sposi), Andrea Mantegna, 1465–74', 'Palazzo Ducale, Mantua · public domain'],
    ['Allegory of the Planets and Continents (sketch for a ceiling), Giovanni Battista Tiepolo, 1752', 'The Metropolitan Museum of Art, New York · public domain'],
    ['Pop-Up Invitation, Truong Hoai Vu', 'vuth.art · illustration and paper engineering, shown with the artist’s permission'],
    ...Object.values(SCULPTURES).map((c) => [c.title, c.credit + ' · simplified for the web, shared under the same license'])
  ];
  rows.forEach(([what, who]) => {
    const p = document.createElement('p');
    p.style.cssText = 'margin:0 0 12px;font-size:14px;line-height:1.5;color:#BCB29B';
    const b = document.createElement('span');
    b.style.cssText = 'display:block;color:#F6F1E4;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:17px';
    b.textContent = what;
    p.append(b, who);
    list.appendChild(p);
  });
  const panel = document.getElementById('credits');
  document.getElementById('creditsBtn').addEventListener('click', () => { panel.style.display = 'grid'; });
  panel.addEventListener('click', (e) => { if (e.target === panel || e.target.id === 'creditsClose') panel.style.display = 'none'; });
})();

// write-ups for the sculpture in the details room: click a statue or bust and this fills the bottom panel
const SCULPTURE_NOTES = {
  detStatueL: ['Apollo Belvedere', 'For three hundred years this was the most famous statue in the world. Apollo has just loosed an arrow and is watching it land; he already knows it has struck. Goethe wept in front of it, Napoleon carried it off to Paris, and every art student in Europe drew it. He stands by the curtain because he is the god of light, music and poetry, all three of which we have booked. He is also the only guest who has ever hit his mark on the first try, and we hope his aim is contagious.', 'Roman copy after Leochares, c. 120–140 · Vatican Museums (cast at Statens Museum for Kunst, Copenhagen)'],
  detStatueR: ['Diana the Huntress', 'Apollo’s twin sister, reaching over her shoulder for an arrow, with a stag at her side. Goddess of the hunt, the moon and the countryside, which makes her the patron of everyone driving through the Tuscan hills after dark.', 'Unknown sculptor, 1831, marble · Geneva · in the pose of the Diana of Versailles (Louvre)'],
  detEndL: ['Ariadne', 'Abandoned on an island by the man she had just saved, she lay down and slept. Bacchus found her there, married her, and set her wedding crown in the sky as a constellation. He is at the door as you came in, still wearing the ivy. Things turned out fine.', 'Roman, 2nd century · Musée Saint-Raymond, Toulouse'],
  detEntryR: ['Antinous as Dionysus', 'Ivy and grapes in his hair: the god of wine, as the emperor Hadrian had his beloved Antinous portrayed, at the door to welcome you in. A confession: neither of us drinks. A request: please do not let that stop you. Tuscany makes some of the best wine on earth, and somebody has to enjoy it on our behalf. His bride, Ariadne, is at the far end of the room.', 'Roman, c. 130–138 · Vatican Museums (cast at Statens Museum for Kunst, Copenhagen)'],
  detEntryL: ['Beatrice d’Este', 'Married at fifteen to the Duke of Milan, and by twenty running the most brilliant court in Italy: Leonardo worked for her husband, and the poets worked for her. A Renaissance bride, at the door to welcome you in.', 'After Gian Cristoforo Romano, c. 1490 · Musée du Louvre, Paris (cast at Statens Museum for Kunst, Copenhagen)'],
  w1statue: ['Venus with the Apple', 'The apple is the prize from the Judgment of Paris: three goddesses, one young man, and a choice between power, wisdom and love. He chose love, and she has held on to the apple ever since. We are not saying he was right about everything. He was right about that.', 'Bertel Thorvaldsen, 1809 · Statens Museum for Kunst, Copenhagen'],
  w1small: ['Cupid Playing the Lyre', 'Between assignments, Cupid has put the bow down and picked up a lyre. He is in the ceremony wing for a reason: he has offered to play. There will be real musicians as well. He asked first.', 'Bertel Thorvaldsen · Statens Museum for Kunst, Copenhagen'],
  w2statue: ['Venus Italica', 'When Napoleon carried the Medici Venus off to Paris, Florence commissioned Canova to make a replacement. She was so loved that when the original came home, they kept both. She is stepping out of her bath and reaching for a towel, which is roughly the energy of getting ready for a party. This is the reception wing. Take your time.', 'Antonio Canova, 1804–12 · Galleria Palatina, Florence; this version Musée d’art et d’histoire, Geneva'],
  w2bust: ['Costanza Bonarelli', 'Bernini carved the woman he loved the way nobody had carved anyone before: hair undone, collar open, halfway through saying something. No commission, no flattery, no goddess. Just a man looking at a woman. The rest of their story is not a wedding story. The look is.', 'Gian Lorenzo Bernini, c. 1636–38 · Museo Nazionale del Bargello, Florence (cast at Statens Museum for Kunst)']
};
const marbleScan = new THREE.MeshStandardMaterial({ color: '#f1ebdf', roughness: 0.5, vertexColors: true });
// an attribute as a plain, unpacked Float32 array (the values as read, before the node's scale)
function plainAttr(g, name) {
  const p = g.attributes[name];
  if (!p || (!p.isInterleavedBufferAttribute && p.array instanceof Float32Array)) return;
  const a = new Float32Array(p.count * p.itemSize);
  for (let i = 0; i < p.count; i++) for (let k = 0; k < p.itemSize; k++) a[i * p.itemSize + k] = p.getComponent(i, k);
  g.setAttribute(name, new THREE.BufferAttribute(a, p.itemSize));
}
// the scans' simplification (tools/convert_scan.py) leaves some tiny triangles wound inside out; the renderer skips
// them, and they show as dark pinholes. Any triangle facing against its own vertices' normals is turned round
function fixWinding(g) {
  const idx = g.index, pos = g.attributes.position, nor = g.attributes.normal; if (!idx || !nor) return;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), m = new THREE.Vector3(), s = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    const i = idx.getX(t), j = idx.getX(t + 1), k = idx.getX(t + 2);
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, j); c.fromBufferAttribute(pos, k);
    n.subVectors(c, b).cross(m.subVectors(a, b));
    s.fromBufferAttribute(nor, i).add(m.fromBufferAttribute(nor, j)).add(m.fromBufferAttribute(nor, k));
    if (n.dot(s) < 0) { idx.setX(t + 1, k); idx.setX(t + 2, j); }
  }
  idx.needsUpdate = true;
}
// marble in vertex colors: the hollows (folds, curls, eyes) go darker and warmer, as old marble does in a museum
// photo, so the carving reads; and the stone is clouded a little, with a few faint gray threads
function marbleShade(g) {
  const idx = g.index, pos = g.attributes.position, nor = g.attributes.normal; if (!idx || !nor) return;
  const nv = pos.count, P = pos.array, N = nor.array, I = idx.array, cav = new Float32Array(nv), cnt = new Float32Array(nv);
  // how far a vertex's neighbors rise above its surface: positive in a hollow, negative on a ridge
  const edge = (i, j) => {
    const dx = P[3 * j] - P[3 * i], dy = P[3 * j + 1] - P[3 * i + 1], dz = P[3 * j + 2] - P[3 * i + 2], L = Math.hypot(dx, dy, dz) || 1;
    cav[i] += (N[3 * i] * dx + N[3 * i + 1] * dy + N[3 * i + 2] * dz) / L; cnt[i]++;
  };
  for (let t = 0; t < I.length; t += 3) { const a = I[t], b = I[t + 1], c = I[t + 2]; edge(a, b); edge(a, c); edge(b, a); edge(b, c); edge(c, a); edge(c, b); }
  for (let i = 0; i < nv; i++) cav[i] = cnt[i] ? cav[i] / cnt[i] : 0;
  for (let r = 0; r < 3; r++) {                                            // spread a little, so it reads as shadowed hollows rather than grit
    const acc = new Float32Array(nv), k = new Float32Array(nv);
    for (let t = 0; t < I.length; t += 3) { const a = I[t], b = I[t + 1], c = I[t + 2];
      acc[a] += cav[b] + cav[c]; acc[b] += cav[a] + cav[c]; acc[c] += cav[a] + cav[b]; k[a] += 2; k[b] += 2; k[c] += 2; }
    for (let i = 0; i < nv; i++) if (k[i]) cav[i] = 0.4 * cav[i] + 0.6 * acc[i] / k[i];
  }
  g.computeBoundingBox(); const bb = g.boundingBox, H = (bb.max.y - bb.min.y) || 1;
  const hash = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
  const vnoise = (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf); let r = 0;
    for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++)
      r += hash(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    return r;
  };
  const col = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    const x = (P[3 * i] - bb.min.x) / H, y = (P[3 * i + 1] - bb.min.y) / H, z = (P[3 * i + 2] - bb.min.z) / H;
    const occl = Math.min(1, Math.max(0, cav[i] * 16));                   // 0 on open surfaces, 1 deep in a fold
    const cloud = 0.97 + 0.05 * vnoise(x * 5, y * 5, z * 5) + 0.02 * vnoise(x * 17, y * 17, z * 17);
    const wv = x * 3 + y * 7 + z * 2 + 2.2 * vnoise(x * 3, y * 3, z * 3) + 0.8 * vnoise(x * 9, y * 9, z * 9);
    const sh = cloud * (1 - 0.09 * Math.pow(1 - Math.abs(Math.sin(wv * 3.1)), 14));
    col[3 * i] = sh * (1 - 0.42 * occl); col[3 * i + 1] = sh * (1 - 0.47 * occl); col[3 * i + 2] = sh * (1 - 0.55 * occl);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
// stand a scan flat: fit a plane through its lowest vertices (the underside of its base) and rotate the whole
// figure so that plane lies level; repeated with a thinner slice once it is roughly level, to refine
function levelBase(model) {
  model.updateMatrixWorld(true);
  const pts = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld));
  });
  const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let pass = 0; pass < 5; pass++) {
    let lo = Infinity, hi = -Infinity;
    pts.forEach((p) => { if (p.y < lo) lo = p.y; if (p.y > hi) hi = p.y; });
    const band = lo + (hi - lo) * (pass ? 0.015 : 0.06);
    let n = 0, sx = 0, sz = 0, sy = 0, sxx = 0, szz = 0, sxz = 0, sxy = 0, szy = 0;   // least squares for y = a·x + b·z + c
    pts.forEach((p) => { if (p.y > band) return; n++; sx += p.x; sz += p.z; sy += p.y; sxx += p.x * p.x; szz += p.z * p.z; sxz += p.x * p.z; sxy += p.x * p.y; szy += p.z * p.y; });
    if (n < 12) break;
    const det = sxx * (szz * n - sz * sz) - sxz * (sxz * n - sz * sx) + sx * (sxz * sz - szz * sx);
    if (Math.abs(det) < 1e-12) break;
    const a = (sxy * (szz * n - sz * sz) - sxz * (szy * n - sz * sy) + sx * (szy * sz - szz * sy)) / det;
    const b = (sxx * (szy * n - sz * sy) - sxy * (sxz * n - sz * sx) + sx * (sxz * sy - szy * sx)) / det;
    const r = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-a, 1, -b).normalize(), up);
    pts.forEach((p) => p.applyQuaternion(r));
    q.premultiply(r);
  }
  model.quaternion.copy(q);
  model.updateMatrixWorld(true);
  // where the base itself sits, so the figure can be centred by its base rather than by its outstretched limbs
  let lo = Infinity, hi = -Infinity;
  pts.forEach((p) => { if (p.y < lo) lo = p.y; if (p.y > hi) hi = p.y; });
  const band = lo + (hi - lo) * 0.03, base = new THREE.Vector3();
  let n = 0;
  pts.forEach((p) => { if (p.y <= band) { base.add(p); n++; } });
  return n ? base.divideScalar(n) : null;
}
(function loadSculptures() {
  const ids = Object.keys(SCULPTURES).filter((id) => SCULPTURE_SPOTS[id]);
  if (!ids.length) return;
  gltfLoaderReady().then((gltfLoader) => {
    ids.forEach((id) => {
      const cfg = SCULPTURES[id], spot = SCULPTURE_SPOTS[id];
      gltfLoader.load(cfg.src, (gltf) => {
        const model = gltf.scene;
        let base = null;
        if (cfg.level) base = levelBase(model);
        else if (cfg.tilt) { model.rotation.set(THREE.MathUtils.degToRad(cfg.tilt[0]), 0, THREE.MathUtils.degToRad(cfg.tilt[1])); model.updateMatrixWorld(true); }
        const box = new THREE.Box3().setFromObject(model, true), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());   // precise: a levelled scan is rotated, and its loose box would sit below its real feet
        if (base) { c.x = base.x; c.z = base.z; }                                  // a levelled scan is centred by its base, not its reach
        const k = cfg.height / size.y;
        model.scale.setScalar(k);
        const [nx, nz] = cfg.nudge || [0, 0];                                    // metres, to centre the statue's own base on its plinth
        model.position.set(-c.x * k + nx, spot.top - box.min.y * k, -c.z * k + nz);   // stood on the spot, centred
        model.traverse((o) => {                                               // gltfpack packs positions as 16-bit numbers 8 bytes apart (the
          if (!o.isMesh) return;                                               // node's scale makes them metres); the shading below reads plain arrays
          plainAttr(o.geometry, 'position'); plainAttr(o.geometry, 'normal');
          if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();   // the files carry none: they are computed here
        });
        if (!cfg.keep) model.traverse((o) => { if (o.isMesh) { fixWinding(o.geometry); marbleShade(o.geometry); o.material = marbleScan; } });
        // the scans run to 100,000 triangles each, and the cursor's ray is tested against the scene every frame
        // of a walk; testing that many triangles drops frames. So the scan itself is left out of the ray test and
        // a plain invisible box round it is what the cursor and clicks meet instead
        model.traverse((o) => { if (o.isMesh) o.raycast = () => {}; });
        const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x * k, size.y * k, size.z * k),
          new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
        proxy.position.set(model.position.x + c.x * k, model.position.y + (c.y - box.min.y) * k, model.position.z + c.z * k);
        proxy.renderOrder = -1;
        const holder = new THREE.Group();
        holder.rotation.y = cfg.turn || 0;
        holder.add(model, proxy);
        spot.placeholder.forEach((m) => m.removeFromParent());
        spot.group.add(holder);
        renderer.shadowMap.needsUpdate = true;
        if (SCULPTURE_NOTES[id]) {
          // a walk-up stop: stand in front of it on the room side, facing it, eyes near the figure's middle; Step back returns to the room's entry
          const n = SCULPTURE_NOTES[id], g = spot.group, fx = g.position.x, fz = g.position.z;
          // which room it stands in, and which wall it stands against: the approach comes straight off that wall,
          // at a distance that fills the view with it
          const room = fz < DET.zF ? 'det' : fx < 0 ? 'w1' : 'w2';
          let toRoom;
          if (room === 'det') {
            const onEndWall = fz < DET.zB + 1.2, onFrontWall = fz > DET.zF - 1.2;
            toRoom = onEndWall ? new THREE.Vector3(0, 0, 1) : onFrontWall ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(-Math.sign(fx), 0, 0);
          } else toRoom = new THREE.Vector3(0, 0, fz < JUNCTION_Z ? 1 : -1);      // a wing's far or near wall
          const dist = THREE.MathUtils.clamp(1.3 * cfg.height + 0.3, 1.0, 2.4);
          const sx = fx + toRoom.x * dist, sz = fz + toRoom.z * dist, yaw = Math.atan2(sx - fx, sz - fz);
          const sid = 'sc_' + id;
          // small pieces: look slightly down at them from close by, so they fill the view
          const mid = spot.top + cfg.height * 0.55, eye = THREE.MathUtils.clamp(mid + 0.15, 1.35, 2.2);
          const look = { det: ['#C9A667', 'Exhibit details · sculpture'], w1: ['#93AEA2', 'Wing I · sculpture'], w2: ['#D19A6E', 'Wing II · sculpture'] }[room];
          STATIONS.push({ id: sid, x: sx, z: sz, yaw, eye, pitch: -Math.atan2(eye - mid, dist) * 0.8, room, tour: false, back: room,
            accent: look[0], eyebrow: look[1], title: n[0], body: n[1], meta: n[2] });
          ST[sid] = STATIONS.length - 1;
          g.userData.station = ST[sid];
          if (typeof paintTally === 'function') paintTally();
        }
      }, undefined, () => console.warn('sculpture did not load, keeping the placeholder:', cfg.src));
    });
  }).catch(() => console.warn('sculpture loader unavailable, keeping the placeholders'));
})();

// ---- a spot on each of the large statues, from high on the wall behind the viewer's shoulder, so they stand out of the room's wash
[[-1.85, 4.6, 0, 1.2], [1.9, 4.6, 0, 1.2], [-1830 * U, P.wingFarZ + 0.43, 0, 1.4], [1830 * U, P.wingFarZ + 0.43, 0, 1.4], [-2.5, DET.zB + 0.62, 0, 1.4], [2.5, DET.zB + 0.62, 0, 1.4]].forEach(([x, z, _, aim]) => {
  const sp = new THREE.SpotLight('#fff1d6', 14, 7, 0.42, 0.6, 1.3);
  sp.position.set(x * 0.55, H - 0.2, z + (z > 0 ? -2.2 : 2.2));      // up near the vault, in front of the statue, toward the room's centre
  sp.target.position.set(x, aim, z);
  scene.add(sp, sp.target);
});

// ---- the hourglass: on the pedestal in the far right corner, the sand running down to the day. A brass frame of
// two plates and four turned columns holds the glass; the sand's top cone sinks and the bottom cone grows as the date
// nears (the whole glass is the time from the site's opening, 18 Sept 2026, to 24 April 2027), with a thin stream
// between them. The countdown is engraved on a brass plaque on the pedestal's face and kept to the day.
const WEDDING = new Date(2027, 3, 24, 16, 0, 0), SITE_OPENED = new Date(2026, 8, 18);
const HOURGLASS = { sandTop: null, sandBottom: null, stream: null, plaque: null, plaqueText: '', grains: null, fall: 0, gm: new THREE.Matrix4() };
function tickSand(t) {                                                   // the grains fall at a steady rate, each a little off the thread's axis
  const gr = HOURGLASS.grains; if (!gr || !HOURGLASS.stream.visible) return;
  const L = HOURGLASS.fall, n = gr.count, speed = 0.6;                     // metres per second
  for (let i = 0; i < n; i++) {
    const phase = ((t / 1000) * speed / L + i / n + (i * 0.37) % 0.02) % 1;   // a steady fall, the grains staggered so they do not march
    const y = -phase * phase * L, a = i * 2.4;                            // from the neck down to the pile, faster as they fall, as sand does
    const spread = 0.0012 + 0.004 * phase * phase;                       // close to the thread at the neck, spreading a little by the time they land
    HOURGLASS.gm.makeTranslation(Math.cos(a) * spread, y, Math.sin(a) * spread);
    gr.setMatrixAt(i, HOURGLASS.gm);
  }
  gr.instanceMatrix.needsUpdate = true;
}
(function hourglass() {
  const spot = SCULPTURE_SPOTS.detEndR; if (!spot) return;
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5 });   // near-colourless glass: read by its highlights, not its tint
  const sandMat = new THREE.MeshStandardMaterial({ color: '#d9b571', roughness: 0.95 });
  const H2 = 0.8, R = 0.145;                                                // the whole piece: four-fifths of a metre tall
  // the glass: two bulbs turned as one profile, waisted in the middle
  const prof = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80, y = (t - 0.5) * H2 * 0.84, u = (t * 2) % 1;
    // an antique profile: from the plate, a short flat shoulder, then a broad belly low in the bulb, drawing out to a long slender neck
    const d = t < 0.5 ? u : 1 - u;                                          // 0 at the plate, 1 at the neck, for either bulb
    const belly = Math.sin(Math.min(1, d / 0.32) * Math.PI / 2);            // full width by a third of the way in
    const draw = d < 0.32 ? 1 : Math.pow(1 - (d - 0.32) / 0.68, 1.6);        // then a long taper to the neck
    prof.push(new THREE.Vector2(R * belly * (0.18 + 0.82 * draw) + 0.006, y));
  }
  const bulbs = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), glass); bulbs.position.y = H2 / 2; g.add(bulbs);
  // the frame: two brass plates and four columns
  [[H2 - 0.02], [0.02]].forEach(([y]) => { const plate = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.02, 32), brass); plate.position.y = y; g.add(plate); });
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4, col = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, H2 - 0.04, 12), brass);
    col.position.set(Math.cos(a) * (R + 0.015), H2 / 2, Math.sin(a) * (R + 0.015)); g.add(col);
    [0.06, H2 - 0.06].forEach((y) => { const knop = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), brass); knop.position.set(Math.cos(a) * (R + 0.015), y, Math.sin(a) * (R + 0.015)); g.add(knop); });
  }
  // the sand: each mass is turned from the same profile as the bulb it sits in, so its edge always meets the glass.
  // The top mass fills the upper bulb from its neck up to a level, with a dip (the funnel) at the centre; the bottom
  // mass fills the lower bulb from its base up to a level, with a peak at the centre. Both are rebuilt as the level moves.
  const bulbR = (y) => { const t = y / (H2 * 0.84) + 0.5, u = (t * 2) % 1, d = t < 0.5 ? u : 1 - u; const belly = Math.sin(Math.min(1, d / 0.32) * Math.PI / 2), draw = d < 0.32 ? 1 : Math.pow(1 - (d - 0.32) / 0.68, 1.6); return R * belly * (0.18 + 0.82 * draw) + 0.006; };   // the glass's radius at height y (from the neck)
  const sandGeo = (lower, level, peak) => {                                 // a lathe: the bulb wall from the neck (or base) to `level`, then the surface back to the axis
    const pts = [];
    const y0 = lower ? -H2 * 0.42 + 0.004 : 0.012, y1 = lower ? level : level;
    if (lower) { for (let i = 0; i <= 16; i++) { const y = y0 + (y1 - y0) * i / 16; pts.push(new THREE.Vector2(Math.max(0.002, bulbR(y) - 0.004), y)); } pts.push(new THREE.Vector2(0, y1 + peak)); }
    else { pts.push(new THREE.Vector2(0.002, y0)); for (let i = 0; i <= 16; i++) { const y = y0 + (y1 - y0) * i / 16; pts.push(new THREE.Vector2(Math.max(0.002, bulbR(y) - 0.004), y)); } pts.push(new THREE.Vector2(0, y1 - peak)); }
    const g = new THREE.LatheGeometry(lower ? pts : pts.reverse(), 40); g.computeVertexNormals(); return g;
  };
  const top = new THREE.Mesh(sandGeo(false, H2 * 0.3, 0.03), sandMat); top.position.y = H2 / 2; g.add(top);
  const bottom = new THREE.Mesh(sandGeo(true, -H2 * 0.3, 0.03), sandMat); bottom.position.y = H2 / 2; g.add(bottom);
  // the falling sand: a thin thread, and a run of grains sliding down it that wrap round, so the fall is seen to move
  const stream = new THREE.Group(); stream.position.y = H2 / 2; g.add(stream);
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.002, 1, 8), sandMat); stream.add(thread);   // unit length: scaled to reach the pile
  HOURGLASS.thread = thread;
  const grains = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0022, 6, 5), sandMat, 90); stream.add(grains);
  HOURGLASS.grains = grains; HOURGLASS.fall = H2 * 0.36;
  HOURGLASS.sandGeo = sandGeo;
  HOURGLASS.sandTop = top; HOURGLASS.sandBottom = bottom; HOURGLASS.stream = stream;
  g.position.y = spot.top; g.rotation.y = -Math.PI * 0.3;
  spot.group.add(g);
  // the plaque on the pedestal's face, toward the room
  const plaqueRows = (n, word) => [[0.3, 170, [[word, '600', 4]]], [0.7, 380, [[n, '700', 2]]], [0.93, 170, [['UNTIL SIENA', '600', 4]]]];   // three lines filling the plate: DAYS / the number / UNTIL SIENA
  const plaque = engravedPlaque(0.34, 0.24, plaqueRows('', 'DAYS'));
  plaque.position.set(0, 0.62, 0.192); spot.group.add(plaque);           // flat on the shaft's face (the shaft is 0.38 deep: its face is at 0.19)
  HOURGLASS.plaqueRows = plaqueRows;
  HOURGLASS.plaque = plaque;
  const fx = spot.group.position.x, fz = spot.group.position.z, sx = fx - 0.55, sz = fz + 1.75;                  // the stop: in front of the pedestal and a little toward the room's centre, near enough to read the plaque
  STATIONS.push({ id: 'sc_hourglass', x: sx, z: sz, yaw: Math.atan2(sx - fx, sz - fz), eye: 1.3, pitch: -0.12, room: 'det', tour: false, back: 'det',
    accent: '#C9A667', eyebrow: 'Exhibit details \u00b7 the countdown', title: 'The Hourglass',
    body: 'The sand began to run the day this gallery opened and will finish on the afternoon of the twenty-fourth of April. Every grain in the lower bulb is a day already spent getting ready; every grain above is one still to come. The plaque keeps the count, in case you are the sort who checks. We are.',
    meta: 'Brass and glass, 2026 \u00b7 the count is kept to the day' });
  ST.sc_hourglass = STATIONS.length - 1;
  spot.group.traverse((o) => { o.userData.station = ST.sc_hourglass; });
  setHourglass();
})();
function setHourglass() {
  if (!HOURGLASS.sandTop) return;
  const now = new Date(), total = WEDDING - SITE_OPENED, left = Math.max(0, Math.min(1, (WEDDING - now) / total));   // 1 = all the sand still above
  const H2 = 0.8, span = H2 * 0.42;                                          // each bulb runs from the neck to 0.42 of the height
  // the sand's level in each bulb, from the neck: the top bulb never quite fills and the bottom never quite empties, so both read as sand in glass
  const topLevel = 0.03 + (span - 0.06) * (0.08 + 0.72 * left), botLevel = -span + 0.02 + (span - 0.05) * (0.1 + 0.7 * (1 - left));
  HOURGLASS.sandTop.geometry.dispose(); HOURGLASS.sandTop.geometry = HOURGLASS.sandGeo(false, topLevel, Math.min(0.04, topLevel * 0.5));
  HOURGLASS.sandBottom.geometry.dispose(); HOURGLASS.sandBottom.geometry = HOURGLASS.sandGeo(true, botLevel, Math.min(0.05, (botLevel + span) * 0.5));
  const peakY = botLevel + Math.min(0.05, (botLevel + span) * 0.5);      // the pile's peak, from the neck (negative: below it)
  HOURGLASS.fall = -peakY + 0.006;                                        // the stream runs from just below the neck to the peak
  if (HOURGLASS.thread) { HOURGLASS.thread.scale.y = HOURGLASS.fall; HOURGLASS.thread.position.y = -HOURGLASS.fall / 2; }
  HOURGLASS.stream.visible = left > 0 && left < 1;
  const days = Math.max(0, Math.ceil((WEDDING - now) / 86400000));
  const text = String(days);
  if (text !== HOURGLASS.plaqueText && HOURGLASS.plaque) {
    HOURGLASS.plaqueText = text;
    const fresh = engravedPlaque(0.34, 0.24, HOURGLASS.plaqueRows(text, days === 1 ? 'DAY' : 'DAYS'));
    HOURGLASS.plaque.children[1].material = fresh.children[1].material;   // the engraved face; the brass plate stays
  }
}
setInterval(setHourglass, 60000);

// ---- signage drawn to canvas, hung as brass lettering
function signTexture(lines, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.clearRect(0, 0, w, h);
  let y = h / 2 - (lines.length - 1) * 34;
  lines.forEach((ln) => {
    x.font = ln.font;
    x.fillStyle = ln.color || '#5a3f0c';
    x.textAlign = 'center';
    x.shadowColor = 'rgba(255,252,238,.9)';
    x.shadowOffsetY = 1.5;
    x.fillText(ln.t, w / 2, y);
    y += ln.gap || 72;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function sign(lines, w, h, x, y, z, rotY) {
  const t = signTexture(lines, 512, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4, metalness: 0.3 }));
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  scene.add(m);
  return m;
}

// directory sign, mounted flat on the wall above the details arch: a burgundy panel (the invitation
// burgundy, like the monogram banner) in a stepped gilt frame, gold lettering in the site's Garamond,
// a double hairline border and a small ornament between the two lines. Lettering is sized to fill the
// panel so it reads from the atrium.
function directoryTexture(lines, aspect) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = Math.round(2048 / aspect);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const draw = (face) => {
    const x = c.getContext('2d'), W = c.width, H = c.height;
    x.fillStyle = '#5e1230'; x.fillRect(0, 0, W, H);                  // the banner's burgundy
    let seed = 77; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 6000; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,220,200,.05)' : 'rgba(0,0,0,.07)'; x.fillRect(rnd() * W, rnd() * H, 3, 3); }
    x.strokeStyle = '#d9b565'; x.lineWidth = 12; x.strokeRect(44, 44, W - 88, H - 88);   // double rule border (thick enough not to shimmer from across the hall)
    x.lineWidth = 6; x.strokeRect(70, 70, W - 140, H - 140);
    x.fillStyle = '#e9c97a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if ('letterSpacing' in x) x.letterSpacing = '14px';
    let px = 300;
    const widest = () => { x.font = '500 ' + px + 'px ' + face; return Math.max(...lines.map((l) => x.measureText(l).width)); };
    while (px > 40 && widest() > W * 0.9) px -= 2;
    const gap = px * 1.55, y0 = H / 2 - (lines.length - 1) * gap / 2;
    lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * gap + px * 0.04));
    for (let i = 1; i < lines.length; i++) {                             // a fine rule with a diamond, between the lines
      const y = y0 + (i - 0.5) * gap, r = W * 0.13;
      x.strokeStyle = '#d9b565'; x.lineWidth = 6;
      x.beginPath(); x.moveTo(W / 2 - r, y); x.lineTo(W / 2 - 34, y); x.moveTo(W / 2 + 34, y); x.lineTo(W / 2 + r, y); x.stroke();
      x.fillStyle = '#d9b565'; x.beginPath(); x.moveTo(W / 2, y - 14); x.lineTo(W / 2 + 14, y); x.lineTo(W / 2, y + 14); x.lineTo(W / 2 - 14, y); x.closePath(); x.fill();
    }
    t.needsUpdate = true;
  };
  draw('Georgia, serif');
  if (document.fonts && document.fonts.load) document.fonts.load("500 40px 'EB Garamond'").then(() => draw("'EB Garamond', Georgia, serif")).catch(() => {});
  return t;
}
const PLAQUE_W = 2.9, PLAQUE_H = 1.15;              // overhangs the 2.7 m arch opening by 10 cm a side
const PLAQUE_Y = 2.3 + 1.35 + 0.2 + PLAQUE_H / 2;   // bottom edge just clear of the arch band
const PLAQUE_Z = P.wingFarZ + 0.14 + 0.035;         // back of the plaque on the wall face
const plaque = new THREE.Group();
{
  const panel = new THREE.Mesh(new THREE.BoxGeometry(PLAQUE_W, PLAQUE_H, 0.05),
    new THREE.MeshStandardMaterial({ map: directoryTexture(['←  WING I  ·  WING II  →', 'EXHIBIT DETAILS  ↑'], PLAQUE_W / PLAQUE_H), roughness: 0.75 }));
  panel.position.z = 0.025;
  plaque.add(panel);
  // a stepped gilt frame round it: a broad outer moulding and a fine inner fillet, both standing proud of the panel
  const F = 0.075, f = 0.018, D = 0.075, d = 0.02, PZ = 0.05;         // PZ: the panel's front; the fillets stand on it
  [[PLAQUE_W + 2 * F, F, D, 0, PLAQUE_H / 2 + F / 2], [PLAQUE_W + 2 * F, F, D, 0, -PLAQUE_H / 2 - F / 2],
   [F, PLAQUE_H, D, -PLAQUE_W / 2 - F / 2, 0], [F, PLAQUE_H, D, PLAQUE_W / 2 + F / 2, 0],
   [PLAQUE_W, f, d, 0, PLAQUE_H / 2 - f / 2], [PLAQUE_W, f, d, 0, -PLAQUE_H / 2 + f / 2],
   [f, PLAQUE_H - 2 * f, d, -PLAQUE_W / 2 + f / 2, 0], [f, PLAQUE_H - 2 * f, d, PLAQUE_W / 2 - f / 2, 0]].forEach(([w, h, dp, px, py]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dp), frameMat);
    m.position.set(px, py, dp === d ? PZ + dp / 2 : dp / 2); m.castShadow = true;
    plaque.add(m);
  });
}
plaque.position.set(0, PLAQUE_Y, PLAQUE_Z);
scene.add(plaque);

// ---- lighting
scene.add(new THREE.HemisphereLight('#fff4e0', '#8a8070', 1.25));
const ambient = new THREE.AmbientLight('#fff1d8', 0.5);
scene.add(ambient);

// a brass picture light: a slim bar held off the wall on two arms just above the frame, glowing
// underneath, with a wide soft-edged wash of light on the picture (the light itself hangs further
// out than the fixture, so the wash falls evenly instead of burning the top of the canvas).
//   (x, y, z)     where the light shines from        (tx, ty, tz)  the centre of the picture, on the wall
//   topY, barW    top edge of the frame, and how long the bar should be
//   lamps         how many lamps sit along the bar. A wide picture needs several, or the wash reads as
//                 one round spotlight pool instead of light falling from the whole length of the bar
const brassLit = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.34, metalness: 0.55 });
const lampGlow = new THREE.MeshBasicMaterial({ color: '#ffe6b8' });
function pictureLight(x, y, z, tx, ty, tz, shadow, power, topY, barW, lamps = 1) {
  const n = new THREE.Vector3(x - tx, 0, z - tz).normalize();          // out from the wall
  const along = new THREE.Vector3(-n.z, 0, n.x);
  const barY = Math.min(topY + 0.12, H - 0.32), reach = 0.24;
  const fixture = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, barW, 16), brassLit);
  bar.quaternion.setFromUnitVectors(Y_AXIS, along);
  bar.position.copy(n).multiplyScalar(reach).setY(barY);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(barW * 0.94, 0.006, 0.026), lampGlow);   // the lit underside
  strip.rotation.y = Math.atan2(along.x, along.z) + Math.PI / 2;
  strip.position.copy(bar.position).y -= 0.024;
  fixture.add(bar, strip);
  [-1, 1].forEach((sd) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.027, 12, 10), brassLit);
    cap.position.copy(bar.position).addScaledVector(along, sd * barW / 2);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, reach, 8), brassLit);
    arm.quaternion.setFromUnitVectors(Y_AXIS, n);
    arm.position.copy(n).multiplyScalar(reach / 2).addScaledVector(along, sd * barW * 0.3).setY(barY);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), brassLit);  // where the arm meets the wall
    rose.quaternion.setFromUnitVectors(Y_AXIS, n);
    rose.position.copy(n).multiplyScalar(0.006).addScaledVector(along, sd * barW * 0.3).setY(barY);
    fixture.add(cap, arm, rose);
  });
  fixture.position.set(tx, 0, tz);
  scene.add(fixture);

  for (let k = 0; k < lamps; k++) {
    const off = lamps === 1 ? 0 : (k / (lamps - 1) - 0.5) * barW * 0.8;  // spaced along the bar, each aimed straight down its own strip
    const sp = new THREE.SpotLight('#ffe3b3', power / lamps * (lamps > 1 ? 1.25 : 1), 9, 0.88, 1.0, 1.5);
    sp.position.set(x + along.x * off, y, z + along.z * off);
    sp.target.position.set(tx + along.x * off, ty, tz + along.z * off);
    if (shadow && k === Math.floor(lamps / 2)) {                        // one shadow-caster is enough
      sp.castShadow = true;
      sp.shadow.mapSize.set(1024, 1024);
      sp.shadow.radius = 6;                                             // soft-edged shadows under the frames
      sp.shadow.blurSamples = 16;
    }
    scene.add(sp);
    scene.add(sp.target);
  }
}
pictureLight(-P.wingEndX + 0.6, H - 0.5, -7.5, -P.wingEndX, 1.95, -7.5, true, 15, 3.17, 3.0, 3);
pictureLight(P.wingEndX - 0.6, H - 0.5, -7.5, P.wingEndX, 1.95, -7.5, true, 15, 3.22, 3.0, 3);
[...W1_PICTURES, ...W2_PICTURES].forEach((p) => {
  const far = p.wall === 'far', wallZ = far ? P.wingFarZ : P.wingNearZ, h = p.w / p.aspect, big = p.w > 1.5;
  const fw = THREE.MathUtils.clamp(0.085 + 0.036 * Math.max(p.w, h), 0.12, 0.25);      // the frame's width, as ornateFrame works it out
  pictureLight(p.x, H - 0.5, wallZ + (far ? 0.6 : -0.6), p.x, p.y, wallZ, big, big ? 13 : 10, p.y + h / 2 + fw, p.w * 0.62, big ? 2 : 1);
});

// (the centrepiece had a picture light; it washed out the gilt lettering behind the curtain, so it is gone — 25 Sept 2026)

// warm pools down the corridor so the space reads as lit
[[0, 10], [0, 6.5], [0, 3], [0, -0.5], [0, -4], [0, -7.5]].forEach(([x, z]) => {
  const pl = new THREE.PointLight('#ffeccb', 7, 9, 2);
  pl.position.set(x, H - 0.6, z);
  scene.add(pl);
});

[10, 5, 0, -5].forEach((z) => {
  const up = new THREE.PointLight('#ffeccb', 5, 7, 2);
  up.position.set(0, VAULT.spring + 0.5, z);
  scene.add(up);
});

// ---------------------------------------------------------------- camera moves
let idx = 0;
const cam = { x: STATIONS[0].x, z: STATIONS[0].z, yaw: STATIONS[0].yaw, pitch: 0, eye: EYE };   // the doors open onto the atrium stop itself
let wantPitch = 0, wantEye = EYE;   // the tilt and viewing height of the stop you are heading for; applied once you have arrived
const settled = () => Math.abs(cam.pitch - wantPitch) < 0.001 && Math.abs(cam.eye - wantEye) < 0.001;
let queue = [];
let leg = null;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const shortAngle = (from, to) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

function pushMove(x, z) { queue.push({ kind: 'move', x, z, ms: 1250 }); }
function pushTurn(yaw) { queue.push({ kind: 'turn', yaw, ms: 1300 }); }

// the centre table is the one thing standing in the open floor of the details room: walks go round it
const TABLE_KEEPOUT = { x0: -1.5, x1: 1.5, z0: DET.zMid - 0.55 - 0.9, z1: DET.zMid - 0.55 + 0.9 };
const DET_ENTRY = { x: 0, z: -12.5 };      // where the hall's centre line arrives in the details room
function clearOfTable(ax, az, bx, bz) {
  for (let i = 1; i < 24; i++) {
    const k = i / 24, x = ax + (bx - ax) * k, z = az + (bz - az) * k;
    if (x > TABLE_KEEPOUT.x0 && x < TABLE_KEEPOUT.x1 && z > TABLE_KEEPOUT.z0 && z < TABLE_KEEPOUT.z1) return false;
  }
  return true;
}
// plan a walk across the details room from `at` to (tx, tz): straight if the table is not in the way,
// otherwise round one of its ends. Each leg: turn the way you are going, then walk. Updates `at`.
function detWalk(at, tx, tz) {
  // the shortest route from here to there that never crosses the table: straight if it can be, otherwise
  // by way of the corners of the table's keep-out (set a little wide, so the rounded corners of the walk clear it too)
  const X = TABLE_KEEPOUT.x1 + 0.45, zN = TABLE_KEEPOUT.z1 + 0.05, zF = TABLE_KEEPOUT.z0 - 0.05;
  const nodes = [[at.x, at.z], [-X, zN], [X, zN], [X, zF], [-X, zF], [tx, tz]], N = nodes.length;
  const dist = Array(N).fill(Infinity), prev = Array(N).fill(-1), done = Array(N).fill(false);
  dist[0] = 0;
  for (let k = 0; k < N; k++) {
    let u = -1;
    for (let i = 0; i < N; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true;
    for (let v = 0; v < N; v++) {
      if (done[v] || !clearOfTable(nodes[u][0], nodes[u][1], nodes[v][0], nodes[v][1])) continue;
      const d = dist[u] + Math.hypot(nodes[v][0] - nodes[u][0], nodes[v][1] - nodes[u][1]);
      if (d < dist[v]) { dist[v] = d; prev[v] = u; }
    }
  }
  let pts = [];
  if (dist[N - 1] < Infinity) { for (let v = N - 1; v > 0; v = prev[v]) pts.unshift(nodes[v]); }
  else pts = [[tx, tz]];
  pts.forEach(([x, z]) => {
    if (Math.abs(x - at.x) < 0.01 && Math.abs(z - at.z) < 0.01) return;
    pushTurn(Math.atan2(at.x - x, at.z - z));
    pushMove(x, z);
    at.x = x; at.z = z;
  });
}

function planRoute(n) {
  const i = Math.max(0, Math.min(STATIONS.length - 1, n));
  // already there: nothing to do, unless you have turned round on the spot and should face it again
  if (i === idx && queue.length === 0 && !leg && Math.abs(shortAngle(cam.yaw, STATIONS[i].yaw) - cam.yaw) < 0.01) return;
  const t = STATIONS[i];
  idx = i;
  queue = []; leg = null;
  hideMotto();
  paintLabel(t);
  markRoom(t.room);
  wantPitch = t.pitch || 0;
  wantEye = t.eye || EYE;
  // level out and come back down to standing height before moving off. Not when the next stop is the very spot you
  // are standing on, facing the same way (the table and the things on it): there the view goes straight from one
  // tilt to the other, or simply stays put, instead of nodding up and back down
  const sameView = Math.abs(shortAngle(cam.yaw, t.yaw) - cam.yaw) < 0.01;
  // ...nor when sidestepping along a wall between two close-ups held at the same height and tilt
  const alongWall = sameView && Math.hypot(t.x - cam.x, t.z - cam.z) < 3;
  const staying = (Math.hypot(t.x - cam.x, t.z - cam.z) < 0.01 && sameView) || alongWall;
  if (!staying && (Math.abs(cam.pitch) > 0.001 || Math.abs(cam.eye - EYE) > 0.001)) queue.push({ kind: 'turn', yaw: cam.yaw, pitch: 0, eye: EYE, ms: 800 });

  const at = { x: cam.x, z: cam.z };       // where the plan has got to so far
  const here = roomAt();
  const facing = (yaw) => Math.abs(shortAngle(cam.yaw, yaw) - cam.yaw) < 0.01;

  // stepping back from a close-up at an atrium wall to the stop in front of it: a plain step back, no turning round
  if (here === 'atrium' && t.room === 'atrium' && at.x !== 0 && t.x === 0 && Math.abs(shortAngle(cam.yaw, t.yaw) - cam.yaw) < 0.6 && Math.hypot(t.x - at.x, t.z - at.z) < 3) {
    pushMove(t.x, t.z);
    pushTurn(t.yaw);
    return;
  }

  if (here === 'det' && t.room === 'det') {
    // inside the details room you cross the floor freely. A short move to a stop that faces the way
    // you already face is a plain step (forwards, backwards or sideways); anything else is walked.
    const d = Math.hypot(t.x - at.x, t.z - at.z);
    if (d > 0.01 && d < 3 && facing(t.yaw) && clearOfTable(at.x, at.z, t.x, t.z)) pushMove(t.x, t.z);
    else detWalk(at, t.x, t.z);
    pushTurn(t.yaw);
    return;
  }

  if (t.x !== 0 && t.room !== 'det' && here === t.room) {
    // already inside this wing: stay in it. Going deeper, walk facing the end wall and then
    // turn to the picture; coming back, turn to the picture first and step back from it.
    const moves = Math.abs(cam.x - t.x) > 0.01 || Math.abs(cam.z - t.z) > 0.01;
    const wallFacing = Math.abs(Math.sin(t.yaw)) < 0.01;          // facing a side wall, not the wing's end wall
    if (moves && wallFacing && facing(t.yaw) && Math.hypot(t.x - cam.x, t.z - cam.z) < 3) {
      pushMove(t.x, t.z);                  // up to a picture on the wall you face, along to its neighbour, or back from it
    } else if (moves && Math.abs(t.x) > Math.abs(cam.x)) {
      pushTurn(t.x < 0 ? Math.PI / 2 : -Math.PI / 2);
      pushMove(t.x, t.z);
      pushTurn(t.yaw);
    } else {
      pushTurn(t.yaw);
      if (moves) pushMove(t.x, t.z);
    }
    return;
  }

  // every other journey runs along the hall's centre line
  if (here === 'det') detWalk(at, DET_ENTRY.x, DET_ENTRY.z);              // leaving the details room: back to its entry first
  else if (at.x !== 0) {                                                   // leaving a wing: out onto the centre line
    pushTurn(at.x < 0 ? -Math.PI / 2 : Math.PI / 2);
    pushMove(0, at.z);
    at.x = 0;
  }
  const g = t.room === 'det' ? DET_ENTRY : t;                              // a details-room stop is reached through its entry
  if (g.x !== 0) {                                                         // into a wing, through the crossing
    if (Math.abs(at.z - JUNCTION_Z) > 0.01) {
      pushTurn(at.z > JUNCTION_Z ? 0 : Math.PI);
      pushMove(0, JUNCTION_Z);
    }
    pushTurn(Math.atan2(0 - g.x, JUNCTION_Z - g.z));                     // the way you are going; the stop's own facing comes last
    pushMove(g.x, g.z);
  } else {
    const dz = Math.abs(at.z - g.z), fresh = !queue.some((q) => q.kind === 'move');
    if (dz > 0.01 && dz < 3 && fresh && cam.x === 0 && facing(t.yaw)) {
      pushMove(g.x, g.z);                  // a neighbouring frame on the wall you already face: sidestep along it
    } else if (dz > 0.01) {
      pushTurn(at.z > g.z ? 0 : Math.PI);
      pushMove(g.x, g.z);
    }
    at.x = g.x; at.z = g.z;
    if (t.room === 'det') detWalk(at, t.x, t.z);
  }
  pushTurn(t.yaw);
}

// ---- the walk itself. planRoute() thinks in steps (turn, walk, turn); a person does not move like that, so the
// steps are compiled into one continuous walk: a path through the same points with rounded corners, walked at a
// steady pace with a soft start and stop, the heading turning as the path bends, the initial turn taken on the
// spot only when it is a big one, and the final turn to face the stop blended into the last stretch. The levelling
// of the view and the stop's own tilt and height are folded into the same motion. Routes with no walking (a turn
// on the spot) still run as plain turn steps.
// speed m/s; ramp: metres to get up to pace and to stop; slow: how much a corner slows you (0.45 = to 55%);
// corner: corner radius in metres; bigTurn: radians, a first turn larger than this is taken on the spot;
// turnRate: radians per ms, the fastest the view ever swings (~125 deg/s); lag: ms, how far the view trails its heading
const WALK = { speed: 2.5, ramp: 1.3, minMs: 1100, corner: 0.9, slow: 0.4, bigTurn: 0.9, turnRate: 0.0022, lag: 130 };
let lastSteps = [];                                    // the plan as steps, kept for the test harness to report
function goTo(n) {
  planRoute(n);
  lastSteps = queue.slice();
  compileWalk();
}
const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const lerpAngle = (a, b, k) => a + (shortAngle(a, b) - a) * k;
function compileWalk() {
  if (!queue.some((q) => q.kind === 'move')) return;
  // steps -> points. A move takes the heading of the turn before it; a move with no turn (a sidestep, a step
  // back) holds the view where it is; a trailing turn is the facing to end on.
  const pts = [{ x: cam.x, z: cam.z }];
  let pending = null, level = false, endYaw = null;
  queue.forEach((q) => {
    if (q.kind === 'turn') { if (q.pitch === 0 && q.yaw === cam.yaw) level = true; else pending = q.yaw; return; }
    const prev = pts[pts.length - 1], heading = Math.atan2(prev.x - q.x, prev.z - q.z);
    const hold = pending === null || Math.abs(shortAngle(heading, pending) - heading) > 0.5;
    pts.push({ x: q.x, z: q.z, hold: hold ? (pending === null ? (prev.yawHold ?? cam.yaw) : pending) : null });
    pts[pts.length - 1].yawHold = pts[pts.length - 1].hold;
    pending = null;
  });
  // a trailing turn says where to end up facing; otherwise it is the held view, or the way the last leg went
  const last = pts[pts.length - 1], prevPt = pts[pts.length - 2];
  endYaw = pending !== null ? pending : (last.hold ?? Math.atan2(prevPt.x - last.x, prevPt.z - last.z));
  queue = [];
  // round the corners: each interior point becomes a short curve from a little before it to a little after
  const poly = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const P = pts[i], A = pts[i - 1], B = pts[i + 1];
    const la = Math.hypot(P.x - A.x, P.z - A.z), lb = Math.hypot(B.x - P.x, B.z - P.z), r = Math.min(WALK.corner, la * 0.45, lb * 0.45);
    const ax = (A.x - P.x) / la, az = (A.z - P.z) / la, bx = (B.x - P.x) / lb, bz = (B.z - P.z) / lb;
    const p0 = { x: P.x + ax * r, z: P.z + az * r }, p2 = { x: P.x + bx * r, z: P.z + bz * r };
    for (let k = 0; k <= 24; k++) {                                 // a quadratic curve through the corner
      const u = k / 24, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u;
      poly.push({ x: w0 * p0.x + w1 * P.x + w2 * p2.x, z: w0 * p0.z + w1 * P.z + w2 * p2.z, hold: P.hold, corner: true });
    }
  }
  poly.push(pts[pts.length - 1]);
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i].x - poly[i - 1].x, poly[i].z - poly[i - 1].z));
  const L = cum[cum.length - 1];
  if (L < 0.005) { queue.push({ kind: 'turn', yaw: endYaw, ms: 1100 }); return; }
  const walk = { kind: 'path', poly, cum, L, endYaw, t0: 0, pf: cam.pitch, ef: cam.eye, pt: wantPitch, et: wantEye, level };
  // pace: a steady walk that eases off through the corners and at both ends. Time is tabulated every 2 cm
  // along the path, so that at any moment we know how far along it we are
  const STEP = 0.02, n = Math.ceil(L / STEP), S = [], T = [];
  let t = 0;
  for (let i = 0; i <= n; i++) {
    const sd = Math.min(L, i * STEP);
    let bend = 0;                                                    // how much of the path within half a metre is corner
    for (let d = -0.5; d <= 0.5; d += 0.1) { const q = alongPath(walk, Math.min(L, Math.max(0, sd + d))); bend += q.corner ? 1 : 0; }
    const ends = 0.1 + 0.9 * smooth(Math.min(sd, L - sd) / WALK.ramp);
    const v = WALK.speed * ends * (1 - WALK.slow * bend / 11);
    if (i) t += STEP / v * 1000;
    S.push(sd); T.push(t);
  }
  walk.S = S; walk.T = T; walk.ms = Math.max(WALK.minMs, t);
  if (walk.ms > t) { const k = walk.ms / t; for (let i = 0; i < T.length; i++) T[i] *= k; }
  // how far the view has to swing at the start and at the end, and how much of the path each gets. A big first
  // turn is taken on the spot before setting off; a big last turn starts early so it is never a whip
  const h0 = alongPath(walk, 0).yaw, h1 = alongPath(walk, L).yaw;
  const turn0 = Math.abs(shortAngle(cam.yaw, h0) - cam.yaw), turn1 = Math.abs(shortAngle(h1, endYaw) - h1);
  walk.lookIn = turn0 > WALK.bigTurn ? 0.3 : Math.min(L * 0.45, 0.5 + 1.6 * turn0 / (Math.PI / 2));
  walk.lookOut = Math.min(L * 0.6, 0.6 + 2.2 * turn1 / (Math.PI / 2));
  if (turn0 > WALK.bigTurn) queue.push({ kind: 'turn', yaw: h0, ms: 800 + turn0 / Math.PI * 1600 });
  queue.push(walk);
}
// where along the path you are after `s` metres, and which way the walk itself faces there: a held view, or the
// heading, read over a 30 cm stretch so it sweeps round the corners instead of stepping
function alongPath(w, s) {
  const at = (d) => {
    d = Math.min(w.L, Math.max(0, d));
    let i = 1;
    while (i < w.cum.length - 1 && w.cum[i] < d) i++;
    const a = w.poly[i - 1], b = w.poly[i], span = w.cum[i] - w.cum[i - 1], k = span > 1e-6 ? (d - w.cum[i - 1]) / span : 1;
    return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, a, b };
  };
  const p = at(s), hold = p.b.hold === undefined ? w.poly[w.poly.length - 1].hold : p.b.hold;
  const q0 = at(s - 0.15), q1 = at(s + 0.15);
  const yaw = hold ?? (Math.hypot(q1.x - q0.x, q1.z - q0.z) > 1e-4 ? Math.atan2(q0.x - q1.x, q0.z - q1.z) : Math.atan2(p.b.x - p.x, p.b.z - p.z));
  return { x: p.x, z: p.z, yaw, corner: !!(p.b.corner && p.a.corner) };
}
// distance covered at time t, from the walk's pace table
function paceDistance(w, t) {
  const T = w.T, S = w.S;
  let lo = 0, hi = T.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
  const span = T[hi] - T[lo];
  return span > 1e-6 ? S[lo] + (S[hi] - S[lo]) * Math.min(1, Math.max(0, (t - T[lo]) / span)) : S[lo];
}
function stepPath(w, now) {
  if (!w.started) { w.started = true; w.t0 = now; w.last = now; w.from = cam.yaw; }
  const dt = Math.min(100, now - w.last); w.last = now;
  const t = Math.min(w.ms, now - w.t0), s = paceDistance(w, t), at = alongPath(w, s);
  cam.x = at.x; cam.z = at.z;
  // heading: from where you were facing into the walk's own heading, and out of it into the stop's facing
  let yaw = at.yaw;
  if (w.lookIn > 0 && s < w.lookIn) yaw = lerpAngle(w.from, yaw, smooth(s / w.lookIn));
  if (s > w.L - w.lookOut) yaw = lerpAngle(yaw, w.endYaw, smooth((s - (w.L - w.lookOut)) / w.lookOut));
  // the view follows that heading with a little lag, and never swings faster than a person turns
  const swing = shortAngle(cam.yaw, yaw) - cam.yaw, most = WALK.turnRate * dt;
  cam.yaw += Math.max(-most, Math.min(most, swing * (1 - Math.exp(-dt / WALK.lag))));
  // view height and tilt: level out over the first stretch and take up the stop's own over the last; a short
  // walk goes straight from one to the other
  const k = t / w.ms;
  if (!w.level || w.L < 2.5) { const e = smooth(k); cam.pitch = w.pf + (w.pt - w.pf) * e; cam.eye = w.ef + (w.et - w.ef) * e; }
  else if (k < 0.35) { const e = smooth(k / 0.35); cam.pitch = w.pf * (1 - e); cam.eye = w.ef + (EYE - w.ef) * e; }
  else if (k > 0.65) { const e = smooth((k - 0.65) / 0.35); cam.pitch = w.pt * e; cam.eye = EYE + (w.et - EYE) * e; }
  else { cam.pitch = 0; cam.eye = EYE; }
  if (t >= w.ms) {                                                  // arrived; finish any turn the lag and the cap left over
    cam.x = w.poly[w.poly.length - 1].x; cam.z = w.poly[w.poly.length - 1].z; cam.pitch = w.pt; cam.eye = w.et;
    const left = shortAngle(cam.yaw, w.endYaw) - cam.yaw;
    if (Math.abs(left) > 0.002) { cam.yaw += Math.max(-most, Math.min(most, left * Math.max(0.35, 1 - Math.exp(-dt / WALK.lag)))); return false; }
    cam.yaw = shortAngle(cam.yaw, w.endYaw); return true;
  }
  return false;
}

function startLeg() {
  const step = queue.shift();
  if (!step) {
    // arrived: take up the stop's own tilt and viewing height, if it has them
    leg = settled() ? null : { kind: 'turn', from: cam.yaw, to: cam.yaw, pf: cam.pitch, pt: wantPitch, ef: cam.eye, et: wantEye, t0: performance.now(), ms: 1000 };
    return;
  }
  if (step.kind === 'path') { leg = step; return; }
  if (step.kind === 'turn') {
    const to = Math.abs(Math.abs(step.yaw - cam.yaw) - Math.PI) < 0.001 ? step.yaw : shortAngle(cam.yaw, step.yaw), pt = step.pitch === undefined ? cam.pitch : step.pitch, et = step.eye === undefined ? cam.eye : step.eye;
    if (Math.abs(to - cam.yaw) < 0.001 && Math.abs(pt - cam.pitch) < 0.001 && Math.abs(et - cam.eye) < 0.001) return startLeg();
    leg = { kind: 'turn', from: cam.yaw, to, pf: cam.pitch, pt, ef: cam.eye, et, t0: performance.now(), ms: step.ms };
  } else {
    if (Math.abs(step.x - cam.x) < 0.001 && Math.abs(step.z - cam.z) < 0.001) return startLeg();
    leg = { kind: 'move', fx: cam.x, fz: cam.z, tx: step.x, tz: step.z, t0: performance.now(), ms: step.ms };
  }
}

// ---------------------------------------------------------------- ui
const el = (id) => document.getElementById(id);
// ---- the collection tally: how many of the works you have stood in front of, by title, kept between visits
const SEEN = new Set((() => { try { return JSON.parse(localStorage.getItem('ka-seen') || '[]'); } catch (e) { return []; } })());
function tallyTotal() { return new Set(STATIONS.filter((s) => s.id !== 'atrium').map((s) => s.title)).size; }   // distinct works; the sculptures join once their scans have loaded
function paintTally() {
  const t = el('tally'); if (!t) return;
  const total = tallyTotal(), seen = [...SEEN].filter((x) => STATIONS.some((s) => s.title === x)).length;
  const found = [...FOUND].filter((x) => HIDDEN[x]).length, n = Object.keys(HIDDEN).length;
  // the three finds are a bonus under the count: hollow stars that fill in gold
  const stars = Array.from({ length: n }, (_, i) => '<span style="color:' + (i < found ? '#E8C07A' : 'rgba(242,223,168,.45)') + '">' + (i < found ? '\u2605' : '\u2606') + '</span>').join('');
  t.innerHTML = (seen >= total ? 'Collection \u00b7 every work seen' : 'Collection \u00b7 ' + seen + ' of ' + total) + '<span style="display:block;font-size:11px;letter-spacing:.14em;margin-top:2px">Hidden bonuses ' + stars + '</span>';
}
function foundHidden(h) {
  const src = Object.keys(HIDDEN).find((k) => HIDDEN[k] === h);
  if (!FOUND.has(src)) { FOUND.add(src); try { localStorage.setItem('ka-found', JSON.stringify([...FOUND])); } catch (e) { /* the find lasts the visit */ } }
  paintTally();
  const n = [...FOUND].filter((x) => HIDDEN[x]).length;
  paintLabel({ ...h, id: 'hidden', meta: n >= 3 ? 'All three found.' : n === 2 ? 'Two of three found. One more is hiding.' : h.meta });
}
function noteSeen(st) {
  if (st.id === 'atrium' || st.id === 'hidden' || SEEN.has(st.title)) return;
  SEEN.add(st.title);
  try { localStorage.setItem('ka-seen', JSON.stringify([...SEEN])); } catch (e) { /* private mode: the tally lasts the visit */ }
  paintTally();
}
function paintLabel(st) {
  noteSeen(st);
  el('eyebrow').textContent = st.eyebrow;
  el('eyebrow').style.color = st.accent;
  el('title').textContent = st.title;
  el('body').textContent = st.body;
  el('meta').textContent = st.meta;
  el('more').style.visibility = st.card || st.game ? 'visible' : 'hidden';   // "Read the full details" where a wall text exists; "Play" where a game does. Its space is kept at every stop, so the panel (and the view above it) never changes height
  el('more').dataset.card = st.card || '';
  el('more').dataset.game = st.game || '';
  el('more').innerHTML = st.game ? 'Play &nbsp;&rarr;' : 'Read the full details &nbsp;&rarr;';
  // ease the new text in, so a change of write-up catches the eye (restarts the CSS animation)
  ['eyebrow', 'title', 'body', 'meta'].forEach((id) => {
    const n = el(id);
    n.classList.remove('fresh');
    void n.offsetWidth;
    n.classList.add('fresh');
  });
}
const HINTS = { atrium: 'Go ahead \u2013 touch the art', w1: 'Touch a work to walk up to it', w2: 'Touch a work to walk up to it', det: 'Touch a frame to read its card' };
function markRoom(room) {
  if (el('hint') && HINTS[room]) el('hint').textContent = HINTS[room];
  document.querySelectorAll('[data-room]').forEach((b) => {
    const on = b.getAttribute('data-room') === room;
    b.style.background = on ? 'rgba(232,192,122,.16)' : 'transparent';
    b.style.borderColor = on ? 'rgba(232,192,122,.75)' : 'rgba(201,166,103,.3)';
    b.style.color = on ? '#F2E6C9' : '#A79C85';
  });
  // the step-back button shows everywhere except the atrium's own stop
  const home = idx === ROOM_ENTRY.atrium;
  const back = el('back');
  back.style.opacity = home ? '0.35' : '1'; back.style.pointerEvents = home ? 'none' : 'auto';   // at the entrance there is nowhere back to go: dimmed, in its place
  // no turning round with the save-the-date or the invitation in your hands
  const holding = STATIONS[idx].back === 'detTable';
  el('sections').style.display = room === 'det' ? 'flex' : 'none';
  el('sections').style.opacity = room === 'det' && STATIONS[idx].id === 'detClose' ? '0' : '1';   // at the centrepiece the buttons fade, so the curtain and the reveal have the wall to themselves
  el('sections').style.pointerEvents = room === 'det' && STATIONS[idx].id === 'detClose' ? 'none' : '';
  document.querySelectorAll('#sections button').forEach((b) => {
    const on = b.dataset.card === (STATIONS[idx].card || '');
    b.style.background = on ? 'rgba(232,192,122,.26)' : 'rgba(26,18,8,.55)';
    b.style.color = on ? '#FFF3D0' : '#F2DFA8';
  });
  el('turn').style.opacity = holding || !navShown ? '0' : '1';      // hidden while a card is held, and until the motto has gone
  el('turn').style.pointerEvents = holding ? 'none' : 'auto';
}
// turn around on the spot: a half turn, with the view levelled and back at standing height. Turning again faces the
// stop once more and takes up its own tilt and height.
document.querySelectorAll('#sections button').forEach((b) => b.addEventListener('click', () => goTo(ST[b.dataset.stop])));
el('turn').addEventListener('click', () => {
  if (leg || queue.length) return;
  const t = STATIONS[idx], yaw = cam.yaw + Math.PI;
  const facingStop = Math.abs(Math.sin((yaw - t.yaw) / 2)) < 0.01;
  wantPitch = facingStop ? t.pitch || 0 : 0;
  wantEye = facingStop ? t.eye || EYE : EYE;
  hideMotto();
  paintLabel(t);                                         // back to the stop's own write-up, if a statue's or fresco's was showing
  queue.push({ kind: 'turn', yaw, pitch: 0, eye: EYE, ms: 1700 });
});
// step back one level: from a side picture to the room's entry stop (where the other pictures
// are in view to click), and from the entry stop out to the atrium
el('back').addEventListener('click', () => {
  const entry = ROOM_ENTRY[STATIONS[idx].room];
  if (STATIONS[idx].back) goTo(ST[STATIONS[idx].back]);           // a stop can name where Step back leads
  else goTo(idx === entry ? ROOM_ENTRY.atrium : entry);
});
document.querySelectorAll('[data-room]').forEach((b) => {
  b.addEventListener('click', () => goTo(ROOM_ENTRY[b.getAttribute('data-room')]));
});
// look left or right (side: 1 = left, -1 = right): go to the nearest stop in this room that faces that way and is
// not behind you (the atrium's walls, a wing's side wall, the next section along in the details room); if there
// is none, a quarter turn on the spot
function sideStep(side) {
  if (leg || queue.length) return;
  const here = roomAt(), want = cam.yaw + side * Math.PI / 2, fwd = { x: -Math.sin(want), z: -Math.cos(want) };
  if (Math.abs(shortAngle(want, STATIONS[idx].yaw) - want) < 0.3) { goTo(idx); return; }   // turned away from your own stop: face it again
  let best = null, bestD = Infinity;
  STATIONS.forEach((s, i) => {
    if (i === idx || s.room !== here) return;
    if (Math.abs(shortAngle(want, s.yaw) - want) > 0.9) return;                       // must face roughly that way
    const dx = s.x - cam.x, dz = s.z - cam.z;
    if (dx * fwd.x + dz * fwd.z < -2.0) return;                                        // not well behind you (a stop a metre back still counts)
    const d = Math.hypot(dx, dz) + (s.tour === false ? 1.5 : 0);                       // prefer the wall stops to close-ups
    if (d < bestD) { bestD = d; best = i; }
  });
  if (best !== null) { goTo(best); return; }
  wantPitch = 0; wantEye = EYE; hideMotto(); paintLabel(STATIONS[idx]);
  queue.push({ kind: 'turn', yaw: want, pitch: 0, eye: EYE, ms: 1200 });
}
el('left').addEventListener('click', () => sideStep(1));
el('right').addEventListener('click', () => sideStep(-1));
// walking the tour skips stops that are only reached by clicking their picture
function tourStep(dir) {
  let n = idx + dir;
  while (STATIONS[n] && STATIONS[n].tour === false) n += dir;
  if (STATIONS[n]) goTo(n);
}
el('nav').querySelector('[data-back]').addEventListener('click', () => tourStep(-1));
document.querySelector('[data-fwd]').addEventListener('click', () => tourStep(1));
// the wall-text card
function openCard(key) {
  const c = CARDS[key];
  if (!c) return;
  el('cardTitle').textContent = c.title;
  const body = el('cardBody');
  body.textContent = '';
  c.sections.forEach((sec) => {
    const h = document.createElement('h3');
    h.textContent = sec.h;
    body.appendChild(h);
    sec.p.forEach((t) => { const p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
  });
  el('card').style.display = 'grid';
  el('cardSheet').scrollTop = 0;
}
const closeCard = () => { el('card').style.display = 'none'; };
el('more').addEventListener('click', () => { if (el('more').dataset.game) openArcade(); else openCard(el('more').dataset.card); });
el('card').addEventListener('click', (e) => { if (e.target === el('card') || e.target.id === 'cardClose') closeCard(); });
window.addEventListener('keydown', (e) => {
  if (el('postcard').style.display === 'grid') { if (e.key === 'Escape') closePostcards(); return; }
  if (el('card').style.display === 'grid') { if (e.key === 'Escape') closeCard(); return; }   // no walking about behind an open card
  if (window.Arcade && Arcade.open) return;                        // the arcade has the keys while a game is open
  if (e.key === 'ArrowUp') tourStep(1);
  if (e.key === 'ArrowDown') el('back').click();
  if ((e.key === 'r' || e.key === 'R') && STATIONS[idx].id === 'detClose') closeCurtain();
  if (e.key === 'ArrowLeft') sideStep(1);
  if (e.key === 'ArrowRight') sideStep(-1);
});

let mottoTimer = null;
let navShown = false;                                              // the compass and Turn around wait until the motto has gone
function showNav() { navShown = true; el('compass').style.opacity = '1'; if (el('tally')) { paintTally(); el('tally').style.opacity = '1'; } markRoom(STATIONS[idx].room); }
function hideMotto() {
  clearTimeout(mottoTimer);
  el('motto').style.opacity = '0';
  showNav();
}
function openDoors(instant) {
  el('gateCopy').style.opacity = '0';
  // the two buttons sit outside gateCopy, so fade their wrappers out with it
  [el('enter').parentElement, el('skip').parentElement.parentElement].forEach((n) => {
    n.style.transition = 'opacity 450ms ease';
    n.style.opacity = '0';
  });
  el('enter').style.pointerEvents = el('skip').style.pointerEvents = 'none';
  if (el('gateGlow')) { el('gateGlow').dataset.off = '1'; el('gateGlow').style.opacity = '0'; }
  setTimeout(() => {
    el('doorL').style.transform = 'translateX(-101%)';
    el('doorR').style.transform = 'translateX(101%)';
    el('label').style.opacity = '1';
    el('nav').style.opacity = '1';
    el('motto').style.opacity = '1';
    mottoTimer = setTimeout(() => { el('motto').style.opacity = '0'; showNav(); }, 5200);
  }, instant ? 0 : 480);
  setTimeout(() => { el('gate').style.display = 'none'; }, instant ? 100 : 2800);
}
el('enter').addEventListener('click', () => openDoors(false));
el('skip').addEventListener('click', () => { openDoors(true); goTo(ROOM_ENTRY.det); });

// ---------------------------------------------------------------- clickable doorways
// an invisible pane fills each opening; clicking it walks you through, same as the room buttons
const doorMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
function doorPane(room, openW, springs, x, z, rotY) {
  const r = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-r, 0); s.lineTo(-r, springs);
  s.absarc(0, springs, r, Math.PI, 0, true);
  s.lineTo(r, 0); s.lineTo(-r, 0);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 24), doorMat);
  m.position.set(x, 0, z);
  m.rotation.y = rotY;
  m.userData.room = room;
  scene.add(m);
}
doorPane('w1', 2.6, 2.3, -P.corrX, -7.5, Math.PI / 2);
doorPane('w2', 2.6, 2.3, P.corrX, -7.5, Math.PI / 2);
doorPane('det', 2.7, 2.3, 0, P.wingFarZ, 0);

const roomAt = () => (cam.z < P.wingFarZ ? 'det' : cam.x < -P.corrX ? 'w1' : cam.x > P.corrX ? 'w2' : 'atrium');
const raycaster = new THREE.Raycaster();
// what lies under a screen point: the room a click there leads to (null if it isn't on a
// doorway) and the first solid surface along the line of sight
function probe(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
  const here = roomAt();
  let own = false, target = null, surface = null, station, closer, note, cardKey;
  for (const hit of raycaster.intersectObjects(scene.children, true)) {
    const room = hit.object.userData.room;
    if (!room) {                            // anything solid ends the line of sight
      surface = hit;
      for (let o = hit.object; o && station === undefined && !note; o = o.parent) { station = o.userData.station; closer = o.userData.closer; note = o.userData.note; cardKey = cardKey || o.userData.cardKey; }
      break;
    }
    if (room === here) own = true; else target = room;
  }
  // the doorway of the room you are standing in leads back out to the atrium
  // a picture only counts from inside its own room, and not through a doorway
  if (station !== undefined && (own || target || STATIONS[station].room !== here)) { station = undefined; note = undefined; }
  // already facing it: the next click is the step closer (and nothing once you are there)
  if (station !== undefined && closer !== undefined && (idx === station || idx === closer || STATIONS[idx].back === STATIONS[station].id)) station = closer;
  // a write-up: for things with no stop of their own (the entrance hall), from the atrium; for a picture or title that
  // belongs to a stop, once you stand at that stop. Never through a doorway, nor while that write-up is already showing.
  const atIt = station === undefined ? here === 'atrium' : station === idx && !leg && !queue.length;
  if (note && (own || target || !atIt || el('title').textContent === note.title)) note = undefined;
  if (station === idx && !STATIONS[idx].game) station = undefined;   // at the stop already: nothing to do, unless it is the arcade, where the next click plays
  if (cardKey && (own || target || here !== 'det')) cardKey = undefined;   // the wall buttons work from anywhere in their room
  return { room: target || (own ? 'atrium' : null), surface, station, note, cardKey };
}
const doorAt = (clientX, clientY) => probe(clientX, clientY).room;
// is this click on the thing in your hands (the save-the-date or the invitation)?
function onHeldItem(e) {
  if (volHeld()) return volAngleAt(e.clientX, e.clientY) !== null;
  if (invHeld()) {
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    return raycaster.intersectObjects([invPick, invCard], true).length > 0;
  }
  return false;
}
canvas.addEventListener('click', (e) => {
  const p = probe(e.clientX, e.clientY);
  // the gift shop, clicked from its own stop: the postcards
  if (p.surface && atShop(p.surface)) { openPostcards(); return; }
  // a hidden pet, clicked from its picture's own stop: name the find (a click elsewhere on the picture does what it always did)
  if (p.surface) { const h = hiddenHit(p.surface); if (h && atHiddenStop(h)) { foundHidden(h); return; } }
  // holding something and clicking away from it: put it down (a click on something else walks there, which puts it down too)
  if ((volHeld() || invHeld()) && !onHeldItem(e) && !p.room && p.station === undefined && !p.cardKey && !p.note) { goTo(ST.detTable); return; }
  if (p.room) goTo(ROOM_ENTRY[p.room]);
  else if (p.cardKey) openCard(p.cardKey);
  else if (p.note) paintLabel(p.note);                  // no walking: only the panel changes
  else if (p.station !== undefined) { if (STATIONS[p.station].game && p.station === idx && !queue.length && !(leg && leg.kind === 'path')) openArcade(); else goTo(p.station); }   // a picture in this room: go and face it; the arcade, faced already: play
});

// pointer glow: a soft pool of warm light on whatever the mouse points at
const GLOW = 0.7;
const glow = new THREE.PointLight('#ffd9a0', 0, 3.2, 2);
scene.add(glow);
const glowAim = new THREE.Vector3();
const pointer = { x: 0, y: 0, inside: false, moved: false };
// the mouse is tracked across the whole page, entry doors included, so the glow is already
// under it when the doors part; on the doors themselves a matching glow is drawn in CSS
const gateGlow = document.getElementById('gateGlow');
window.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.moved = true;
  pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!pointer.inside) canvas.style.cursor = '';
  if (gateGlow && !gateGlow.dataset.off) {
    gateGlow.style.setProperty('--gx', e.clientX + 'px');
    gateGlow.style.setProperty('--gy', e.clientY + 'px');
    gateGlow.style.opacity = '1';
  }
});
document.documentElement.addEventListener('pointerleave', () => {
  pointer.inside = false;
  canvas.style.cursor = '';
  if (gateGlow) gateGlow.style.opacity = '0';
});
function updatePointer() {
  // re-read what is under the mouse when it moves, and while the camera is moving under it
  const busy = !!leg || queue.length > 0 || !settled();
  if (busy) pointer.recheck = 100;                                  // frames to keep looking after a move ends (things are still lifting into the hand)
  else if (pointer.recheck) pointer.recheck--;
  if (pointer.inside && (pointer.moved || (!busy && pointer.recheck))) {   // not on every frame of a walk: the ray test is the dearest thing in the frame
    pointer.moved = false;
    const p = probe(pointer.x, pointer.y);
    const onPet = p.surface && hiddenHit(p.surface) && atHiddenStop(hiddenHit(p.surface));
    const onShop = p.surface && atShop(p.surface);   // the hidden pets: the pointer lights up over them only from their picture's stop
    const cur = volHeld() && p.surface && isVolvelle(p.surface.object) ? (volDrag ? 'grabbing' : 'grab')
      : onPet ? 'var(--cur-find)'
      : onShop || p.room || p.station !== undefined || p.note || p.cardKey || (invHeld() && p.surface && p.surface.object.userData.invite) ? 'var(--cur-on)'
      : LOOK.turning ? (LOOK.turning > 0 ? 'e-resize' : 'w-resize') : '';
    if (canvas.style.cursor !== cur) canvas.style.cursor = cur;        // only when it changes: re-setting a cursor makes some browsers flash the default arrow
    if (p.surface) {
      // hold the light a little off the surface, on the side facing the viewer
      const n = p.surface.face.normal.clone().transformDirection(p.surface.object.matrixWorld);
      if (n.dot(raycaster.ray.direction) > 0) n.negate();
      glowAim.copy(p.surface.point).addScaledVector(n, 0.7);
      if (glow.intensity < 0.02) glow.position.copy(glowAim);
    }
  }
  glow.position.lerp(glowAim, 0.22);
  glow.intensity += ((pointer.inside ? GLOW : 0) - glow.intensity) * 0.1;
}

// ---------------------------------------------------------------- on the table: the save-the-date volvelle
// A digital build of the paper save-the-date (assets/SAVE-THE-DATE-PACK): a square card with an oval
// window, a wheel of five plates turning on a brass eyelet behind it, and a thumb notch in the edge.
// Built to the pack's measurements, in units of one card width (4.521 in), then scaled up for the table.
// It stands propped on the centre table; clicking it takes you to the `detVolvelle` stop, where it lifts
// off its stand to face you and the wheel can be dragged round or clicked on to the next plate.
const VOL = { lift: 0, angle: 0, target: 0, STEP: Math.PI * 2 / 5, SIZE: 0.34, HOLD: 0.39 };
const volvelle = new THREE.Group();
const volWheel = new THREE.Group();
let volFront = null, volShadow = null;
(function buildVolvelle() {
  const IN = 1 / 4.521;                                           // one inch, in card widths
  const clampTex = (src) => { const t = tex(src); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8; return t; };
  // printed paper carries a little of its own light, so it stays readable in the hand whatever the room is doing
  const printed = (src, extra) => { const t = clampTex(src); return new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.2, ...extra }); };
  const outline = () => {                                         // the square, with the thumb notch in its right edge
    const chord = 1.580 * IN / 2, depth = 0.564 * IN, R = (chord * chord + depth * depth) / (2 * depth), cx = 0.5 + R - depth;
    const a = Math.atan2(chord, 0.5 - cx);
    const sh = new THREE.Shape();
    sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(0.5, -chord);
    sh.absarc(cx, 0, R, -a, a, true);
    sh.lineTo(0.5, 0.5); sh.lineTo(-0.5, 0.5); sh.lineTo(-0.5, -0.5);
    return sh;
  };
  const WINDOW_X = -1.266 * IN;                                   // window centre, left of the pivot
  const ellipse = (x, rx, ry) => new THREE.Path().absellipse(x, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const planeUV = (geo) => {                                      // lay the printed artwork over a cut shape
    const pos = geo.attributes.position, uv = [];
    for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) + 0.5, pos.getY(i) + 0.5);
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return geo;
  };
  const PAPER = '#f3ecdf';                                        // the beige cotton rag the card is printed on

  // the back panel, printed with the monogram pattern; two-sided, and its artwork flipped so that, seen from
  // behind (which is how a card back is seen), the monograms read the right way round
  const backMat = printed('assets/volvelle/back.png', { color: PAPER, roughness: 0.9, side: THREE.DoubleSide });
  backMat.map.wrapS = THREE.RepeatWrapping; backMat.map.repeat.x = -1; backMat.map.offset.x = 1;
  const back = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(outline(), 24)), backMat);
  const wheelArt = new THREE.Mesh(new THREE.PlaneGeometry(4.354 * IN, 4.354 * IN),
    printed('assets/volvelle/wheel.png', { alphaTest: 0.5, roughness: 0.5 }));
  volWheel.add(wheelArt);
  volWheel.position.z = 0.003;

  const face = outline();
  face.holes.push(ellipse(WINDOW_X, 0.995 * IN / 2, 1.266 * IN / 2), ellipse(0, 0.0625 * IN, 0.0625 * IN));
  volFront = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(face, 48)),
    printed('assets/volvelle/front.png', { color: PAPER, roughness: 0.9 }));
  volFront.position.z = 0.006;

  // the pieces laid on by hand: two gold rails, the white panelled wainscot, the two stacked gilt rings
  const relief = new THREE.Group();
  relief.position.z = 0.0062;
  const edge = 0.900 * IN, railH = 0.077 * IN;
  [0.5 - edge - railH / 2, -0.5 + edge + railH / 2].forEach((y) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1, railH, 0.004), giltPlain);
    rail.position.set(0, y, 0.002);
    relief.add(rail);
  });
  const wc = document.createElement('canvas');
  wc.width = 1024; wc.height = Math.round(1024 * 0.900 / 4.521);
  const wx = wc.getContext('2d'), ppi = 1024 / 4.521;
  wx.fillStyle = '#fbfaf5'; wx.fillRect(0, 0, wc.width, wc.height);
  for (let i = 0; i < 5; i++) {                                   // five panels, three debossed outlines each
    const cx = (i + 0.5) * 1024 / 5, cy = wc.height / 2;
    [[0.804, 0.760], [0.724, 0.680], [0.644, 0.600]].forEach(([w, h]) => {
      wx.lineWidth = 1.4;
      wx.strokeStyle = 'rgba(255,255,255,.95)'; wx.strokeRect(cx - w * ppi / 2 + 1, cy - h * ppi / 2 + 1.2, w * ppi, h * ppi);
      wx.strokeStyle = 'rgba(118,110,98,.62)'; wx.strokeRect(cx - w * ppi / 2, cy - h * ppi / 2, w * ppi, h * ppi);
    });
  }
  const wainTex = new THREE.CanvasTexture(wc);
  wainTex.colorSpace = THREE.SRGBColorSpace; wainTex.anisotropy = 8;
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(1, edge, 0.003), [0, 1, 2, 3, 4, 5].map((k) =>
    new THREE.MeshStandardMaterial(k === 4 ? { map: wainTex, roughness: 0.85 } : { color: '#fbfaf5', roughness: 0.85 })));
  wainscot.position.set(0, -0.5 + edge / 2, 0.0015);
  relief.add(wainscot);
  const ring = (ow, oh, iw, ih, z) => {
    const sh = new THREE.Shape().absellipse(0, 0, ow * IN / 2, oh * IN / 2, 0, Math.PI * 2, false, 0);
    sh.holes.push(new THREE.Path().absellipse(0, 0, iw * IN / 2, ih * IN / 2, 0, Math.PI * 2, true, 0));
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: false, curveSegments: 64 }), giltPlain);
    m.position.set(WINDOW_X, 0, z);
    relief.add(m);
  };
  ring(1.411, 1.691, 1.030, 1.301, 0);                            // ring A, the larger, underneath
  ring(1.245, 1.525, 0.916, 1.187, 0.004);                        // ring B on top, lapping the window's cut edge
  const pearls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.6 / 25.4 * IN, 8, 6), giltPlain, 59);   // ring A's pearl course
  for (let i = 0; i < 59; i++) {
    const t = i / 59 * Math.PI * 2;
    pearls.setMatrixAt(i, new THREE.Matrix4().makeTranslation(WINDOW_X + Math.cos(t) * 1.328 * IN / 2, Math.sin(t) * 1.608 * IN / 2, 0.0042));
  }
  relief.add(pearls);
  const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.085 * IN, 0.03 * IN, 10, 28), brass);
  eyelet.position.z = 0.0085;

  volvelle.add(back, volWheel, volFront, relief, eyelet);
  volvelle.traverse((o) => { o.userData.volvelle = true; });
  volvelle.userData.station = ST.detVolvelle;
  scene.add(volvelle);

  // a soft contact shadow on the table, under the stand
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sx = sc.getContext('2d'), sg = sx.createRadialGradient(64, 64, 30, 64, 64, 64);
  sg.addColorStop(0, 'rgba(40,30,15,.5)'); sg.addColorStop(1, 'rgba(40,30,15,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  volShadow = new THREE.Mesh(new THREE.PlaneGeometry(VOL.SIZE * 1.35, VOL.SIZE * 1.35),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  scene.add(volShadow);
})();

// ---- an engraved brass plaque: brushed brass, a fine engraved border, four screws, engraved lettering.
// rows: [height down the plate (0..1), lettering size in px, [[text, font style, letter-spacing], ...]], each row centred.
// Set out as a museum "tombstone" label: artist, then the title in italics with its date, then the materials.
function engravedPlaque(PW, PH, rows) {
  const c = document.createElement('canvas');
  c.width = Math.round(2048 * PW / 0.46); c.height = Math.round(c.width * PH / PW);   // the same pixels per metre on every plaque, so lettering sizes match
  const plaqueTex = new THREE.CanvasTexture(c);
  plaqueTex.colorSpace = THREE.SRGBColorSpace; plaqueTex.anisotropy = 8;
  const draw = (serif) => {
    const x = c.getContext('2d'), w = c.width, h = c.height;
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ecd596'); g.addColorStop(0.5, '#d6b56a'); g.addColorStop(1, '#b8954c');   // kept light, so the lettering has contrast
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const rnd = seeded(41);
    for (let i = 0; i < 300; i++) {                               // a light brushing only: heavy grain eats small type
      x.fillStyle = 'rgba(' + (rnd() < 0.5 ? '255,244,210,' : '60,40,10,') + (0.015 + rnd() * 0.025) + ')';
      x.fillRect(0, rnd() * h, w, 1 + rnd());
    }
    x.strokeStyle = 'rgba(58,40,10,.75)'; x.lineWidth = 4; x.strokeRect(24, 24, w - 48, h - 48);
    x.strokeStyle = 'rgba(255,240,200,.35)'; x.lineWidth = 2; x.strokeRect(27, 28, w - 54, h - 54);
    [[62, 62], [w - 62, 62], [62, h - 62], [w - 62, h - 62]].forEach(([sx, sy]) => {
      x.fillStyle = '#7a5d28'; x.beginPath(); x.arc(sx, sy, 13, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(40,26,6,.85)'; x.lineWidth = 3; x.beginPath(); x.moveTo(sx - 9, sy - 4); x.lineTo(sx + 9, sy + 4); x.stroke();
    });
    // engraved text: a light lower lip under dark lettering. Each row is a list of [text, font, letter-spacing] runs, centred.
    const row = (y, size, runs) => {                              // size in px; shrunk to fit if the row is too wide
      const measure = (k) => runs.map(([t, style, ls]) => { x.font = style + ' ' + Math.round(size * k) + 'px ' + serif; if ('letterSpacing' in x) x.letterSpacing = Math.round(ls * k) + 'px'; return x.measureText(t).width; });
      let k = 1, widths = measure(1);
      const total = () => widths.reduce((a, b) => a + b, 0);
      if (total() > w * 0.86) { k = w * 0.86 / total(); widths = measure(k); }
      let px = (w - total()) / 2;
      x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
      runs.forEach(([t, style, ls], i) => {
        x.font = style + ' ' + Math.round(size * k) + 'px ' + serif; if ('letterSpacing' in x) x.letterSpacing = Math.round(ls * k) + 'px';
        x.fillStyle = 'rgba(255,246,218,.7)'; x.fillText(t, px, y + 4);           // the cut's lower lip, catching light
        x.fillStyle = '#1c1204'; x.strokeStyle = '#1c1204'; x.lineWidth = size * 0.035;
        x.strokeText(t, px, y); x.fillText(t, px, y);                             // stroked as well as filled: a deeper, bolder cut
        px += widths[i];
      });
    };
    rows.forEach(([v, size, runs]) => row(h * v, size, runs));
    plaqueTex.needsUpdate = true;
  };
  draw('Georgia, serif');
  if (document.fonts && document.fonts.load) {                    // redraw in the site's own face once it has loaded
    Promise.all([document.fonts.load("italic 500 40px 'EB Garamond'"), document.fonts.load("500 40px 'EB Garamond'")])
      .then(() => draw("'EB Garamond', Georgia, serif")).catch(() => {});
  }
  const plate = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.012, PH + 0.012, 0.004), brass);
  // no metalness: without reflections a metal only darkens, and the engraving needs the plate bright
  const face = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.5, metalness: 0, emissive: '#ffffff', emissiveMap: plaqueTex, emissiveIntensity: 0.18 }));
  face.position.z = 0.0022;
  const plaque = new THREE.Group();
  plaque.add(plate, face);
  return plaque;
}

// ---- its stand: a walnut base that props the card up, with an engraved brass plaque on the base's
// sloped front. It stands on the table's left half (the right is kept for the invitation), turned a
// little towards the middle of the room.
const TABLE_TOP = 0.9;
const volStand = new THREE.Group();
volStand.position.set(-0.47, TABLE_TOP, DET.zMid - 0.55 + 0.26);
volStand.rotation.y = 0.2;
scene.add(volStand);
const VOL_REST = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
(function volvelleStand() {
  const W = 0.5, LEAN = 0.21, BH = 0.135;                         // base width; how far the card leans back (radians); base height
  // side profile of the base, front towards +x here: a low block whose front slopes back at 45 degrees
  const prof = [[-0.09, 0], [0.14, 0], [0.14, 0.015], [0.02, BH], [-0.09, BH]].map(([x, y]) => new THREE.Vector2(x, y));
  const base = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(prof), { depth: W, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-rail.jpg'), color: '#d9b48c', roughness: 0.5 }));
  base.rotation.y = -Math.PI / 2;                                 // profile's front now faces the viewer, width along x
  base.position.x = W / 2;
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(VOL.SIZE + 0.03, 0.012, 0.008), brass);   // the lip the card's foot sits behind
  ledge.position.set(0, BH + 0.006, 0.006);
  volStand.add(base, ledge);
  [-0.1, 0.1].forEach((x) => {                                    // two brass struts behind, holding the card's back
    const foot = new THREE.Vector3(x, BH, -0.08), head = new THREE.Vector3(x, BH + 0.22 * Math.cos(LEAN), -0.004 - 0.22 * Math.sin(LEAN) - 0.004);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, foot.distanceTo(head), 8), brass);
    strut.position.copy(foot).add(head).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(Y_AXIS, head.clone().sub(foot).normalize());
    volStand.add(strut);
  });

  const plaque = engravedPlaque(0.46, 0.155, [
    [0.33, 176, [['KELLY WHEELIS', '600', 22]]],
    [0.60, 150, [['Save the Date', 'italic 500', 3], [', 2026', '500', 3]]],
    [0.85, 128, [['Paper, ink, gold foil and brass', '500', 4]]]
  ]);
  plaque.position.set(0, (0.015 + BH) / 2 + 0.0025, 0.08 + 0.0025);   // centred on the base's sloped front
  plaque.rotation.x = -Math.PI / 4;
  volStand.add(plaque);
  volStand.traverse((o) => { o.userData.station = ST.detVolvelle; });

  // where the card rests: foot behind the ledge, leaning back against the struts
  volStand.updateMatrixWorld(true);
  VOL_REST.pos.set(0, BH + 0.004 + VOL.SIZE / 2 * Math.cos(LEAN), -0.004 - VOL.SIZE / 2 * Math.sin(LEAN)).applyMatrix4(volStand.matrixWorld);
  VOL_REST.quat.copy(volStand.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-LEAN, 0, 0)));
  volShadow.geometry = new THREE.PlaneGeometry(W * 1.35, 0.2 * 2.1);
  volShadow.rotation.set(-Math.PI / 2, 0, volStand.rotation.y);
  volShadow.position.set(volStand.position.x, TABLE_TOP + 0.002, volStand.position.z + 0.01);
})();

// ---- handling it: lift to the viewer at its stop, drag the wheel round, click to advance one plate
const volHeld = () => VOL.lift > 0.97;
const isVolvelle = (o) => !!(o && o.userData.volvelle);
function volAngleAt(clientX, clientY) {                           // the pointer's angle about the pivot, in the card's own plane
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = raycaster.intersectObject(volFront, false)[0] || raycaster.intersectObject(volWheel, true)[0];
  if (!hit) return null;
  const p = volvelle.worldToLocal(hit.point.clone());
  return Math.atan2(p.y, p.x);
}
let volDrag = null;
canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', (e) => {
  if (!volHeld()) return;
  const a = volAngleAt(e.clientX, e.clientY);
  if (a === null) return;
  volDrag = { a, moved: 0 };
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not a live pointer */ }
});
canvas.addEventListener('pointermove', (e) => {
  if (!volDrag) return;
  const a = volAngleAt(e.clientX, e.clientY);
  if (a === null) return;
  let d = a - volDrag.a;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  VOL.angle += d; VOL.target = VOL.angle;
  volDrag.a = a; volDrag.moved += Math.abs(d);
});
const volRelease = () => {
  if (!volDrag) return;
  // a plain click turns on to the next plate (counted from where the wheel is heading, so quick clicks
  // each count); a drag settles on whichever plate is nearest
  VOL.target = volDrag.moved < 0.04 ? Math.round(VOL.target / VOL.STEP) * VOL.STEP - VOL.STEP : Math.round(VOL.angle / VOL.STEP) * VOL.STEP;
  volDrag = null;
};
canvas.addEventListener('pointerup', volRelease);
canvas.addEventListener('pointercancel', volRelease);
function updateVolvelle() {
  const want = idx === ST.detVolvelle && !leg && !queue.length && settled() ? 1 : 0;
  VOL.lift += (want - VOL.lift) * 0.09;
  if (Math.abs(want - VOL.lift) < 0.002) VOL.lift = want;
  const k = easeInOut(VOL.lift);
  const held = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(VOL.HOLD).add(camera.position);
  volvelle.position.lerpVectors(VOL_REST.pos, held, k);
  volvelle.position.y += Math.sin(k * Math.PI) * 0.06;            // a little arc on the way up
  volvelle.quaternion.slerpQuaternions(VOL_REST.quat, camera.quaternion, k);
  volvelle.scale.setScalar(VOL.SIZE);
  if (!volDrag) VOL.angle += (VOL.target - VOL.angle) * 0.16;
  volWheel.rotation.z = VOL.angle;
}

// ---------------------------------------------------------------- on the table: the pop-up invitation
// A digital build of the paper invitation (artwork by its illustrator, used with his permission and to be
// credited on a plaque; images made by tools/make_invitation_assets.py). It is a box diorama: a cream frame
// with a window, two door panels that slide apart behind it, and inside, a box with three cut-paper layers
// (busts and the couple, cypresses and guests, the villa) in front of a sky printed on the back wall. A
// square card draws out of the top by its tab. Units: one card width; scaled up by INV.SIZE for the table.
const INV = { lift: 0, doors: 0, doorsTarget: 0, card: 0, cardTarget: 0, tiltX: 0, tiltY: 0, SIZE: 0.46, HOLD: 0.5 };
const invite = new THREE.Group();
let invPick = null, invDoorL = null, invDoorR = null, invCard = null;
const INV_CARD = { s: 0.76, h: 0.76 / (1280 / 1232), stowZ: -0.012 };
(function buildInvitation() {
  const CH = 0.784, D = 0.15;                                       // card height; box depth
  // the window, from the straightened photograph: x 0.132-0.862 and y 0.174-0.833 of the card, measured from its top left
  const WIN = { x0: -0.5 + 0.132, x1: -0.5 + 0.862, y0: CH / 2 - 0.833 * CH, y1: CH / 2 - 0.174 * CH };
  const ww = WIN.x1 - WIN.x0, wh = WIN.y1 - WIN.y0, wx = (WIN.x0 + WIN.x1) / 2, wy = (WIN.y0 + WIN.y1) / 2;
  const load = (src) => { const t = tex('assets/invitation/' + src); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8; return t; };
  // printed paper carries a little of its own light, so it stays readable in the hand whatever the room is doing
  const printed = (t, extra) => new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.22, roughness: 0.9, ...extra });
  const INSIDE = '#fbf8f1', CREAM = '#f3ecdc';
  const inside = new THREE.MeshStandardMaterial({ color: INSIDE, roughness: 0.95, side: THREE.DoubleSide });

  // the box: back wall with the sky printed on it, four walls, and a cover on the back of the card
  const bw = ww + 0.05, bh = wh + 0.05, floorY = WIN.y0 - 0.012;
  const wall = (w, h, x, y, z, rx, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), inside); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); invite.add(m); };
  wall(bw, D, wx, wy + bh / 2, D / 2, Math.PI / 2, 0); wall(bw, D, wx, wy - bh / 2, D / 2, -Math.PI / 2, 0);
  wall(D, bh, wx - bw / 2, wy, D / 2, 0, Math.PI / 2); wall(D, bh, wx + bw / 2, wy, D / 2, 0, -Math.PI / 2);
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(1, CH), new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.9, side: THREE.DoubleSide }));
  cover.position.z = -0.002;
  invite.add(cover);
  // the layers stand on the box floor, bottom edges together; [image, pixel aspect, width, lift off the floor, depth]
  const sky = load('back.jpg'), skyW = 0.80, skyH = skyW / (1280 / 760);
  sky.repeat.set(bw / skyW, bh / skyH);
  sky.offset.set((1 - bw / skyW) / 2, 1 - bh / skyH);              // the picture's top edge on the wall's top edge: clouds sit just over the villa's roof
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), printed(sky, { color: INSIDE }));
  backWall.position.set(wx, wy, 0.002);
  invite.add(backWall);
  [['layer3.png', 1280 / 814, 0.435, 0.08, 0.03, true],
    ['layer2.png', 1280 / 816, 0.78, 0, 0.075, true], ['layer1.png', 1280 / 760, 0.80, 0, 0.12, true]].forEach(([src, aspect, w, up, z, cut]) => {
    const h = w / aspect;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), printed(load(src), cut ? { alphaTest: 0.5, side: THREE.DoubleSide } : { color: INSIDE }));
    m.position.set(wx, floorY + up + h / 2, z);
    invite.add(m);
  });

  // two doors meeting on the centre line, the monogram printed across the seam; they slide apart
  const doorTex = load('doors.jpg'), mono = tex('assets/monogram-ka.png');
  const NOTCH_Y = 0;                                                // the frame's two semicircular thumb notches sit level, half way up
  const half = (side) => {                                          // side: -1 left, 1 right
    const g = new THREE.Group(), homeX = wx + side * ww / 4;
    // the panel runs on outwards under the frame; its picture is pinned to the window, so the two halves meet exactly
    const geo = new THREE.PlaneGeometry(ww / 2 + 0.03, wh + 0.03);
    geo.translate(side * 0.015, 0, 0);
    const pos = geo.attributes.position, uvs = geo.attributes.uv;
    // the window shows only the middle of the door drawing, as on the real card (measured from a photograph of it:
    // the busts' and niches' places in the window against their places in the artwork)
    // (centred on the hill path, which the seam runs through; the path lies at 0.5058 of the artwork's width, not 0.5)
    const ART = { u0: 0.5058 - 0.385, u1: 0.5058 + 0.385, vTop: 0.0845, vBottom: 0.857 };
    for (let i = 0; i < pos.count; i++) {
      const fx = (homeX + pos.getX(i) - WIN.x0) / ww, fy = (wy + pos.getY(i) - WIN.y0) / wh;
      uvs.setXY(i, ART.u0 + fx * (ART.u1 - ART.u0), (1 - ART.vBottom) + fy * (ART.vBottom - ART.vTop));
    }
    const panel = new THREE.Mesh(geo, printed(doorTex, { color: INSIDE }));
    const kaGeo = new THREE.PlaneGeometry(0.085, 0.17), kaUv = kaGeo.attributes.uv;
    for (let i = 0; i < kaUv.count; i++) kaUv.setX(i, kaUv.getX(i) * 0.5 + (side > 0 ? 0.5 : 0));
    const ka = new THREE.Mesh(kaGeo, new THREE.MeshStandardMaterial({ map: mono, transparent: true, alphaTest: 0.35, roughness: 0.8 }));
    ka.position.set(-side * (ww / 4 - 0.0425), wh * 0.235, 0.001);
    // the thumb tab: the door's own edge, seen through the notch in the frame, and what you would push to slide it
    const outer = side * 0.5, inner = homeX + side * (ww / 4 + 0.03);
    const tabM = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(outer - inner), 0.17), new THREE.MeshStandardMaterial({ color: INSIDE, roughness: 0.9, emissive: INSIDE, emissiveIntensity: 0.2 }));
    tabM.position.set((outer + inner) / 2 - homeX, NOTCH_Y - wy, 0);
    g.add(panel, ka, tabM);
    if (side < 0) {                                                 // the seam: the shadowed gap where the two doors meet
      const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.0032, wh + 0.03), new THREE.MeshBasicMaterial({ color: '#3a2a26', transparent: true, opacity: 0.55 }));
      seam.position.set(ww / 4, 0, 0.0015);
      g.add(seam);
    }
    g.userData.homeX = homeX;
    g.position.set(homeX, wy, D + 0.003);
    invite.add(g);
    return g;
  };
  invDoorL = half(-1); invDoorR = half(1);

  // the frame, and its gold-foil lettering as a separate leaf so it can shine
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, CH), printed(load('frame.png'), { alphaTest: 0.5 }));
  frame.position.z = D + 0.008;
  const foil = new THREE.Mesh(new THREE.PlaneGeometry(1, CH), new THREE.MeshStandardMaterial({ map: load('foil.png'), color: '#d9a93f', transparent: true, alphaTest: 0.3, roughness: 0.3, metalness: 0.35, emissive: '#7a5a14', emissiveIntensity: 0.55 }));
  foil.position.z = D + 0.0088;
  invite.add(frame, foil);

  // the pull-out card: the illustrated side only, with its thumb tab showing above the frame
  invCard = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(INV_CARD.s, INV_CARD.h), printed(load('card.jpg'), { color: CREAM, side: THREE.DoubleSide }));
  const tab = new THREE.Mesh(new THREE.CircleGeometry(0.056, 32, 0, Math.PI), new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.9, side: THREE.DoubleSide }));
  tab.position.set(0, INV_CARD.h / 2, -0.0005);
  invCard.add(face, tab);
  invite.add(invCard);

  // one unseen pane over the whole front takes the clicks
  invPick = new THREE.Mesh(new THREE.PlaneGeometry(1.0, CH + 0.14), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  invPick.position.set(0, 0.07, D + 0.012);
  invite.add(invPick);
  invite.traverse((o) => { o.userData.invite = true; });
  invite.userData.station = ST.detInvite;
  invite.userData.D = D; invite.userData.CH = CH;
  scene.add(invite);
})();

// ---- its stand, the partner of the save-the-date's on the other half of the table
const invStand = new THREE.Group();
invStand.position.set(0.5, TABLE_TOP, DET.zMid - 0.55 + 0.26);
invStand.rotation.y = -0.2;
scene.add(invStand);
const INV_REST = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
(function invitationStand() {
  const W = 0.62, LEAN = 0.21, BH = 0.135, S = INV.SIZE, D = invite.userData.D * S, CHh = invite.userData.CH * S;
  const prof = [[-0.12, 0], [0.14, 0], [0.14, 0.015], [0.02, BH], [-0.12, BH]].map(([x, y]) => new THREE.Vector2(x, y));
  const base = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(prof), { depth: W, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-rail.jpg'), color: '#d9b48c', roughness: 0.5 }));
  base.rotation.y = -Math.PI / 2;
  base.position.x = W / 2;
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(S + 0.03, 0.012, 0.008), brass);
  ledge.position.set(0, BH + 0.006, 0.006);
  invStand.add(base, ledge);
  // the card leans back with its front foot behind the ledge; the struts meet its back
  const lean = new THREE.Quaternion().setFromEuler(new THREE.Euler(-LEAN, 0, 0));
  const foot = new THREE.Vector3(0, BH + 0.004, -0.004);
  const onBack = (x, h) => new THREE.Vector3(x, h, -D).applyQuaternion(lean).add(foot);
  [-0.13, 0.13].forEach((x) => {
    const a = new THREE.Vector3(x, BH, -0.112), b = onBack(x, 0.25);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, a.distanceTo(b), 8), brass);
    strut.position.copy(a).add(b).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(Y_AXIS, b.clone().sub(a).normalize());
    invStand.add(strut);
  });
  // the illustrator's credit, which is the condition of his permission to show the piece
  const plaque = engravedPlaque(0.58, 0.155, [
    [0.33, 176, [['TRUONG HOAI VU', '600', 22]]],
    [0.60, 150, [['Pop-Up Invitation', 'italic 500', 3], [', 2026', '500', 3]]],
    [0.85, 128, [['Paper and ink', '500', 4], ['    ·    ', '500', 0], ['vuth.art', '500', 5]]]
  ]);
  plaque.position.set(0, (0.015 + BH) / 2 + 0.0025, 0.08 + 0.0025);
  plaque.rotation.x = -Math.PI / 4;
  invStand.add(plaque);
  invStand.traverse((o) => { o.userData.station = ST.detInvite; });
  invStand.updateMatrixWorld(true);
  INV_REST.quat.copy(invStand.quaternion).multiply(lean);
  // the group's origin is the centre of the box's back; put its bottom-front edge on the foot
  INV_REST.pos.copy(foot).applyMatrix4(invStand.matrixWorld).sub(new THREE.Vector3(0, -CHh / 2, D).applyQuaternion(INV_REST.quat));
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sx = sc.getContext('2d'), sg = sx.createRadialGradient(64, 64, 30, 64, 64, 64);
  sg.addColorStop(0, 'rgba(40,30,15,.5)'); sg.addColorStop(1, 'rgba(40,30,15,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.35, 0.26 * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.set(-Math.PI / 2, 0, invStand.rotation.y);
  shadow.position.set(invStand.position.x, TABLE_TOP + 0.002, invStand.position.z - 0.01);
  scene.add(shadow);
})();

// ---- handling it: click the front to slide the doors, click the tab to draw the card, move the mouse to look inside
const invHeld = () => INV.lift > 0.97;
canvas.addEventListener('click', (e) => {
  if (!invHeld()) return;
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = raycaster.intersectObjects([invPick, invCard], true)[0];
  if (!hit) return;
  if (INV.cardTarget) { INV.cardTarget = 0; return; }               // the card is out: any click puts it back
  const p = invite.worldToLocal(hit.point.clone());
  if (Math.abs(p.x) < 0.08 && p.y > invite.userData.CH / 2 - 0.02) INV.cardTarget = 1;   // the tab
  else INV.doorsTarget = 1 - INV.doorsTarget;
});
function updateInvitation() {
  const want = idx === ST.detInvite && !leg && !queue.length && settled() ? 1 : 0;
  if (!want) { INV.doorsTarget = 0; INV.cardTarget = 0; }           // put down: doors shut, card away
  INV.lift += (want - INV.lift) * 0.09;
  if (Math.abs(want - INV.lift) < 0.002) INV.lift = want;
  INV.doors += (INV.doorsTarget - INV.doors) * 0.1;
  INV.card += (INV.cardTarget - INV.card) * 0.085;
  const k = easeInOut(INV.lift);
  // in the hand it turns a little with the mouse, so you can look into the box; square-on while the card is out
  const r = canvas.getBoundingClientRect(), calm = invHeld() && pointer.inside && !INV.cardTarget ? 1 : 0;
  const nx = ((pointer.x - r.left) / r.width) * 2 - 1, ny = ((pointer.y - r.top) / r.height) * 2 - 1;
  INV.tiltY += (calm * nx * 0.14 - INV.tiltY) * 0.08;
  INV.tiltX += (calm * ny * 0.09 - INV.tiltX) * 0.08;
  const held = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(INV.HOLD).add(camera.position);
  const heldQuat = camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(INV.tiltX, INV.tiltY, 0)));
  invite.position.lerpVectors(INV_REST.pos, held, k);
  invite.position.y += Math.sin(k * Math.PI) * 0.06;
  invite.quaternion.slerpQuaternions(INV_REST.quat, heldQuat, k);
  invite.scale.setScalar(INV.SIZE);
  const slide = easeInOut(Math.min(1, Math.max(0, INV.doors))) * 0.405;
  invDoorL.position.x = invDoorL.userData.homeX - slide;
  invDoorR.position.x = invDoorR.userData.homeX + slide;
  // the card: up out of its pocket, then forward and down to the middle, a little larger
  const c = easeInOut(Math.min(1, Math.max(0, INV.card))), D = invite.userData.D;
  const a = Math.min(1, c / 0.5), b = Math.max(0, (c - 0.5) / 0.5);
  // stowed, only the tab shows over the frame. Held close, the frame's top edge would hide a tab at the back of
  // so deep a box, so in the hand the card rides a little higher in its pocket (still out of sight behind the frame)
  const stowY = invite.userData.CH / 2 + 0.05 * k - INV_CARD.h / 2, topY = stowY + 0.76;
  invCard.position.set(0, b > 0 ? topY + (0.0 - topY) * Math.max(0, (b - 0.35) / 0.65) : stowY + 0.76 * a,
    INV_CARD.stowZ + (D + 0.14 - INV_CARD.stowZ) * Math.min(1, b / 0.5));
  invCard.scale.setScalar(1 + 0.12 * b);
}

// ---------------------------------------------------------------- the gift-shop stand (a first mock-up, to be decided on)
// A walnut counter under the main frame on the details room's end wall ("the only thing missing is you", and
// right below it, the way to say you are coming): a revolving rack of postcards of
// the gallery's pictures, a burgundy enamel letterbox for the RSVP, and a tent card for the registry note.
// Planned, not built yet: click the rack to spin it and draw a postcard; the postcard flips to its writing side,
// which is the RSVP form; posting it sends the reply to a form service.
let shopRack = null;
(function giftShop() {
  const g = new THREE.Group();
  const walnut = new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-rail.jpg'), color: '#ffe2bd', roughness: 0.5, emissive: '#2a1a0c', emissiveIntensity: 0.6 });
  const W = 1.6, D = 0.56, Hc = 0.84;                               // kept low, so the rack and letterbox stay under the picture
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, Hc - 0.04, D), walnut);
  body.position.y = (Hc - 0.04) / 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.04, D + 0.05), marbleWhite);
  top.position.y = Hc - 0.02;
  const kick = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.07, D + 0.02), brass);
  kick.position.y = 0.035;
  g.add(body, top, kick);
  [-0.5, 0, 0.5].forEach((x) => {                                    // three recessed panels on the front
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.52, 0.012), new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-panel.jpg'), color: '#f0cfa6', roughness: 0.55, emissive: '#2a1a0c', emissiveIntensity: 0.5 }));
    panel.position.set(x, 0.43, D / 2 + 0.004);
    g.add(panel);
  });
  const sign = engravedPlaque(0.62, 0.13, [[0.46, 150, [['THE GIFT SHOP', '600', 20]]], [0.84, 84, [['Postcards  ·  RSVP  ·  Registry', 'italic 500', 3]]]]);
  sign.position.set(0, Hc - 0.135, D / 2 + 0.012);
  g.add(sign);

  // the postcards: one small atlas drawn from the gallery's own pictures as they load
  const COLS = 4, ROWS = 3, CW = 256, CHh = 176, atlas = document.createElement('canvas');
  atlas.width = COLS * CW; atlas.height = ROWS * CHh;
  const ax = atlas.getContext('2d');
  ax.fillStyle = '#f4eee0'; ax.fillRect(0, 0, atlas.width, atlas.height);
  const atlasTex = new THREE.CanvasTexture(atlas);
  atlasTex.colorSpace = THREE.SRGBColorSpace; atlasTex.anisotropy = 8;
  // the postcards carry the pictures as the world knows them: the two with a pet painted in use their untouched originals.
  // They are drawn from small copies in assets/rack/ (twice a card's size), not the full-size pictures
  ['birth-of-venus', 'postcard-primavera', 'w1-three-graces', 'w1-happy-union', 'w1-mars-and-venus', 'postcard-amaryllis', 'w2-parnassus', 'w2-nastagio-banquet',
    'w2-banquet-still-life', 'w2-watermelon-still-life', 'fresco-venus-and-graces', 'fresco-liberal-arts'].forEach((name, i) => {
    const img = new Image();
    img.onload = () => {
      const cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * CHh, m = 12, w = CW - 2 * m, h = CHh - 2 * m;
      const k = Math.max(w / img.width, h / img.height), sw = w / k, sh = h / k;     // fill the card, cropping the overflow
      ax.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, cx + m, cy + m, w, h);
      atlasTex.needsUpdate = true;
    };
    img.src = 'assets/rack/' + name + '.jpg';
  });
  const cardMat = new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.8, side: THREE.DoubleSide });
  const card = (i) => {
    const geo = new THREE.PlaneGeometry(0.15, 0.103), uv = geo.attributes.uv, c = i % COLS, r = Math.floor(i / COLS);
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (c + uv.getX(k)) / COLS, 1 - (r + 1 - uv.getY(k)) / ROWS);
    return new THREE.Mesh(geo, cardMat);
  };
  // the rack: a brass pole on a round foot, four wire faces, three pockets a face
  shopRack = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.6, 10), brass);
  pole.position.y = 0.3;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.025, 28), brass);
  foot.position.y = 0.0125;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), brass);
  knob.position.y = 0.61;
  shopRack.add(pole, foot, knob);
  for (let f = 0; f < 4; f++) {
    const face = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      const c = card(f * 3 + r);
      c.position.set(0, 0.13 + r * 0.155, 0.118);
      c.rotation.x = -0.2;
      const lip = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.008, 0.02), brass);   // the pocket's wire
      lip.position.set(0, 0.085 + r * 0.155, 0.122);
      face.add(c, lip);
    }
    face.rotation.y = f * Math.PI / 2;
    shopRack.add(face);
  }
  shopRack.position.set(-0.42, Hc, 0);
  shopRack.scale.setScalar(1.05);
  g.add(shopRack);

  // the letterbox: burgundy enamel with an arched top, a brass-lipped slot and gold lettering
  const enamel = new THREE.MeshStandardMaterial({ color: BURGUNDY_PAINT, roughness: 0.32, metalness: 0.1 });
  const box = new THREE.Group(), bw = 0.3, bh = 0.3, bd = 0.2;
  const lower = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), enamel);
  lower.position.y = bh / 2 + 0.02;
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(bw / 2, bw / 2, bd, 28, 1, false, 0, Math.PI), enamel);
  arch.rotation.set(Math.PI / 2, Math.PI / 2, 0); arch.position.y = bh + 0.02;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.03, 0.02, bd + 0.03), brass);
  plinth.position.y = 0.01;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.016, 0.01), new THREE.MeshBasicMaterial({ color: '#120509' }));
  slot.position.set(0, bh + 0.035, bd / 2 + 0.002);
  const slotLip = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.046, 0.008), brass);
  slotLip.position.set(0, bh + 0.035, bd / 2);
  const lc = document.createElement('canvas');
  lc.width = 512; lc.height = 384;
  const lx = lc.getContext('2d');
  lx.fillStyle = BURGUNDY_PAINT; lx.fillRect(0, 0, 512, 384);
  lx.strokeStyle = '#d9ab4c'; lx.lineWidth = 6; lx.strokeRect(26, 26, 460, 332);
  lx.fillStyle = '#e6c06a'; lx.textAlign = 'center';
  if ('letterSpacing' in lx) lx.letterSpacing = '14px';
  lx.font = '600 92px Georgia'; lx.fillText('POSTA', 256, 170);
  if ('letterSpacing' in lx) lx.letterSpacing = '10px';
  lx.font = 'italic 500 70px Georgia'; lx.fillText('R.S.V.P.', 256, 286);
  const lt = new THREE.CanvasTexture(lc);
  lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.19), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.35, emissive: '#ffffff', emissiveMap: lt, emissiveIntensity: 0.12 }));
  face.position.set(0, 0.145, bd / 2 + 0.002);
  box.add(lower, arch, plinth, slotLip, slot, face);
  box.position.set(0.4, Hc, 0.0);
  box.rotation.y = -0.18;
  box.scale.setScalar(1.1);
  g.add(box);

  // a tent card for the registry note
  const tc = document.createElement('canvas');
  tc.width = 512; tc.height = 320;
  const tx = tc.getContext('2d');
  tx.fillStyle = '#f6f0e2'; tx.fillRect(0, 0, 512, 320);
  tx.strokeStyle = '#b8934a'; tx.lineWidth = 4; tx.strokeRect(18, 18, 476, 284);
  tx.fillStyle = '#2b2520'; tx.textAlign = 'center';
  tx.font = 'italic 500 62px Georgia'; tx.fillText('Registry', 256, 140);
  tx.font = '500 40px Georgia'; tx.fillText('& the local guide', 256, 214);
  const tt = new THREE.CanvasTexture(tc);
  tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
  const tent = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.125), new THREE.MeshStandardMaterial({ map: tt, roughness: 0.85, side: THREE.DoubleSide }));
  tent.scale.setScalar(1.4);
  tent.position.set(-0.03, Hc + 0.085, 0.19); tent.rotation.x = -0.35;
  g.add(tent);

  g.position.set(0, 0, DET.zB + 0.38 + D / 2);                       // its front faces into the room; stood a little off the wall, clear of the curtain's hem
  g.traverse((o) => { o.userData.station = ST.detShop; o.userData.shop = true; });
  scene.add(g);
})();

// ---------------------------------------------------------------- the postcard (RSVP), the curtain, and SEE YOU IN SIENA
// The gift shop's rack holds twelve postcards of the collection. Clicking the shop from its stop opens one: arrows flip
// through them, "This one" turns it over to the written side (attending, plus-one, dietary, a note, the name), and
// "Post it" stamps it. Posting also draws back the curtain over the end wall's centrepiece. For now a posted card is
// kept in this browser only (`ka-rsvp`); the letterbox is not yet connected to a store — that is the next step.
const POSTCARDS = [
  ['birth-of-venus', 'The Birth of Venus · Botticelli'], ['postcard-primavera', 'Primavera · Botticelli'], ['w1-three-graces', 'The Three Graces · Furini'],
  ['w1-happy-union', 'Happy Union · Veronese'], ['w1-mars-and-venus', 'Mars and Venus United by Love · Veronese'], ['postcard-amaryllis', 'Amaryllis and Mirtillo · Van Dyck'],
  ['w2-parnassus', 'Parnassus · Mantegna'], ['w2-nastagio-banquet', 'The Wedding Banquet · Botticelli'], ['w2-banquet-still-life', 'Banquet Still Life · Van Utrecht'],
  ['w2-watermelon-still-life', 'Still Life with Fruit · Ruoppolo'], ['fresco-venus-and-graces', 'Venus and the Three Graces · Botticelli'], ['fresco-liberal-arts', 'The Seven Liberal Arts · Botticelli']
];
let pcIndex = 0, pcSide = 'front';
function atShop(hit) {
  if (STATIONS[idx].id !== 'detShop' || leg || queue.length) return false;
  for (let o = hit.object; o; o = o.parent) if (o.userData.shop) return true;
  return false;
}
function showPostcard(i) {
  pcIndex = (i + POSTCARDS.length) % POSTCARDS.length;
  el('pcPic').style.backgroundImage = 'url(assets/' + POSTCARDS[pcIndex][0] + '.jpg)';
  el('pcTitle').textContent = POSTCARDS[pcIndex][1];
  el('pcCount').textContent = (pcIndex + 1) + ' of ' + POSTCARDS.length;
}
function pcTurn(side) {
  pcSide = side;
  el('pcCard').style.transform = side === 'back' ? 'rotateY(180deg)' : '';
  el('pcNav').style.display = side === 'front' ? 'flex' : 'none';
  el('pcBackNav').style.display = side === 'back' ? 'flex' : 'none';
  el('pcEyebrow').textContent = side === 'back' ? 'The gift shop · your card' : 'The gift shop · postcards';
  if (side === 'back') setTimeout(() => el('pcName').focus(), 900);
}
function openPostcards() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('ka-rsvp') || 'null'); } catch (e) { return null; } })();
  el('pcScene').style.display = ''; el('pcScene').style.opacity = '1'; el('pcScene').style.transform = '';
  el('pcPosted').style.display = 'none';
  if (saved) {                                                           // already posted from this browser: show it stamped
    showPostcard(saved.card || 0);
    el('pcName').value = saved.name || ''; el('pcPlus').value = saved.plus || ''; el('pcDiet').value = saved.diet || ''; el('pcNote').value = saved.note || '';
    document.querySelectorAll('input[name=pcYes]').forEach((r) => { r.checked = r.value === saved.yes; });
    pcTurn('back');
    el('pcBackNav').style.display = 'none';
    el('pcPosted').style.display = 'block';
    el('pcPosted').textContent = 'Posted ' + new Date(saved.when).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) + '. Thank you — see you in Siena.';
  } else { showPostcard(pcIndex); pcTurn('front'); }
  el('postcard').style.display = 'grid';
}
function closePostcards() { el('postcard').style.display = 'none'; }
function postCard() {
  const yes = (document.querySelector('input[name=pcYes]:checked') || {}).value;
  const name = el('pcName').value.trim();
  if (!name || !yes) { el(!name ? 'pcName' : 'pcPost').focus(); el('pcPost').textContent = !name ? 'Your name, first' : 'Yes or no, first'; setTimeout(() => { el('pcPost').textContent = 'Post it'; }, 1800); return; }
  const rsvp = { card: pcIndex, yes, name, plus: el('pcPlus').value.trim(), diet: el('pcDiet').value.trim(), note: el('pcNote').value.trim(), when: Date.now() };
  try { localStorage.setItem('ka-rsvp', JSON.stringify(rsvp)); } catch (e) { /* private mode: it lasts the visit */ }
  el('pcBackNav').style.display = 'none';
  el('pcScene').style.transition = 'transform 900ms cubic-bezier(.5,0,.8,.4), opacity 900ms ease';
  el('pcScene').style.transform = 'translateY(70vh) rotate(4deg)'; el('pcScene').style.opacity = '0';   // into the letterbox
  setTimeout(() => {
    el('pcScene').style.display = 'none';
    el('pcPosted').style.display = 'block';
    el('pcPosted').textContent = yes === 'yes' ? 'Posted. Thank you — see you in Siena.' : 'Posted. We\u2019re sorry to miss you.';
    el('pcPosted').dataset.reveal = '1';                                 // either answer draws the curtain
    CURTAIN.sorry = yes !== 'yes'; try { localStorage.setItem('ka-posted-answer', yes); } catch (e) { /* the visit */ }
    if (CURTAIN.redraw) CURTAIN.redraw();                                // the words behind the curtain follow the answer
  }, 950);
}
el('pcPrev').addEventListener('click', () => showPostcard(pcIndex - 1));
el('pcNext').addEventListener('click', () => showPostcard(pcIndex + 1));
el('pcChoose').addEventListener('click', () => pcTurn('back'));
el('pcFlipBack').addEventListener('click', () => pcTurn('front'));
el('pcPost').addEventListener('click', postCard);
el('pcClose').addEventListener('click', () => {
  closePostcards();
  if (el('pcPosted').dataset.reveal) { el('pcPosted').dataset.reveal = ''; goTo(ST.detClose); setTimeout(() => revealCurtain(false), 900); }
});
el('postcard').addEventListener('click', (e) => { if (e.target === el('postcard')) closePostcards(); });
el('pcScene').addEventListener('keydown', (e) => { if (e.key === 'Enter' && pcSide === 'back') postCard(); });

// ---- the curtain: burgundy velvet in two halves under a fringed pelmet, hung over the end wall's centrepiece. It draws
// back when a card is posted, and stays back on later visits from the same browser (`ka-posted`). Behind it: SEE YOU
// IN SIENA, gilt lettering over a Sienese fresco of the hills toward the villa (assets/det-see-you-in-siena.jpg).
const CURTAIN = { open: false, t: 0, from: 0, halves: [], ties: [], sorry: false, redraw: null };
(function curtain() {
  if (!mainFrame) return;
  const p = DETAIL_PICTURES[0], z = 0.075 + 0.2, railY = p.h / 2 + 0.3, hemY = -p.h / 2 - 0.34;    // hung close over the frame's carving, out of reach of Apollo's hand   // in the frame's own space: the frame's own height, rail just above it
  const drop = railY - 0.1 - hemY, halfW = p.w / 2 + 0.22;                                       // and its width: it clears the statues either side
  const velvet = new THREE.MeshStandardMaterial({ color: '#3a0a1a', roughness: 0.95, side: THREE.DoubleSide });   // a deep wine velvet: darker than the burgundy wall, and nothing like the gilt
  const rope = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.5, metalness: 0.3 });
  // A half: a cloth hung from its outer edge. `gather` (0 closed .. 1 drawn) pulls it toward that edge: the folds deepen
  // and multiply as the width shrinks, the hem lifts a little where the tieback holds it in, and the whole swells forward
  const SEG = 180;
  const cloth = (sd) => {
    const g = new THREE.PlaneGeometry(halfW, drop, SEG, 24), pos = g.attributes.position, base = pos.array.slice();
    const mesh = new THREE.Mesh(g, velvet);
    mesh.userData.shape = (gather) => {
      const w = 1 - 0.8 * gather;                                     // how much of the width the cloth now spans
      for (let i = 0; i < pos.count; i++) {
        const x0 = base[3 * i], y0 = base[3 * i + 1];
        const u = x0 / halfW + 0.5, v = y0 / drop + 0.5;              // u: 0 at the inner (leading) edge .. 1 at the outer edge; v: 0 hem .. 1 rail
        const outer = sd < 0 ? -0.5 : 0.5;                            // the outer edge's x (as a fraction of the half's width), which stays put
        const nx = outer + ((u - 0.5) - outer) * w;                     // every point slides toward it as the cloth gathers
        const folds = 6 + 8 * gather, amp = 0.05 + 0.13 * gather;
        const wave = Math.cos(u * Math.PI * 2 * folds + 0.4) * 0.6 + Math.cos(u * Math.PI * 2 * folds * 2.3 + 1.7) * 0.4;
        const belly = (1.1 - 0.35 * v);                               // a little fuller toward the hem
        const waist = gather > 0 ? Math.exp(-Math.pow((v - 0.42) / 0.18, 2)) * gather : 0;   // the tieback pinches the cloth in at its height
        const zf = wave * amp * belly * (1 - 0.55 * waist) + 0.02 + 0.06 * gather;
        const lift = waist * 0.06 + gather * 0.04 * (1 - v);          // the hem lifts as the cloth bunches
        pos.setXYZ(i, nx * halfW, y0 + lift, zf);
      }
      pos.needsUpdate = true; g.computeVertexNormals();
    };
    mesh.userData.shape(0);
    return mesh;
  };
  // A tieback: a twisted rope round the gathered cloth, knotted at the front, with a tassel hanging from the knot
  const tieback = (sd) => {
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, 0.02, -0.02), new THREE.Vector3(-0.13, 0.04, 0.12), new THREE.Vector3(0, 0.03, 0.17), new THREE.Vector3(0.13, 0.04, 0.12), new THREE.Vector3(0.2, 0.02, -0.02)]);   // round the gathered cloth, hugging it
    const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.02, 10, false), rope);
    const strand2 = strand.clone(); strand2.position.y = 0.028; strand2.rotation.x = 0.35;   // two strands, laid as a twist
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 10), rope); knot.scale.set(1, 0.8, 0.9); knot.position.set(0, 0.02, 0.18);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), rope); cord.position.set(0, -0.11, 0.18);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), rope); cap.scale.y = 1.3; cap.position.set(0, -0.24, 0.18);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 24), rope); collar.rotation.x = Math.PI / 2; collar.position.set(0, -0.28, 0.18);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.062, 0.2, 18, 4, true), new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.75, side: THREE.DoubleSide }));
    skirt.position.set(0, -0.38, 0.18);
    const threads = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 0.05, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#a8863d', roughness: 0.85, side: THREE.DoubleSide }));
    threads.position.set(0, -0.5, 0.18);
    g.add(strand, strand2, knot, cord, cap, collar, skirt, threads);
    g.userData.full = 0.7;                                              // its size when shown: the rope spans the gathered cloth, the tassel a hand and a half long
    g.position.set(sd * (halfW - 0.2), railY - 0.1 - drop * 0.56, z + 0.06); g.scale.setScalar(0.001);
    return g;
  };
  [-1, 1].forEach((sd) => {
    const hinge = new THREE.Group();
    hinge.position.set(0, railY - 0.1 - drop / 2, z);
    const half = cloth(sd); half.position.x = sd * halfW / 2;
    hinge.add(half); hinge.userData.half = half;
    const tie = tieback(sd);
    mainFrame.add(hinge, tie);
    CURTAIN.halves.push(hinge); CURTAIN.ties.push(tie);
  });
  // the pelmet: a valance of the same velvet hanging in three swags, each a hung curve of cloth, with a gold fringe along its edge
  const PW = halfW * 2 + 0.24, PH = 0.5, swags = 3;
  const pelmetGeo = new THREE.PlaneGeometry(PW, PH, 150, 14), pp = pelmetGeo.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const u = pp.getX(i) / PW + 0.5, v = pp.getY(i) / PH + 0.5;      // v: 0 lower edge .. 1 rail
    const sw = (u * swags) % 1, dip = Math.sin(sw * Math.PI);          // each swag sags in the middle
    pp.setY(i, pp.getY(i) - dip * 0.18 * (1 - v));                    // the lower edge scallops
    pp.setZ(i, dip * 0.16 * (1 - v * 0.6) + Math.cos(u * Math.PI * 2 * swags * 5) * 0.015 * (1 - v));   // and bellies out, with fine gathers
  }
  pelmetGeo.computeVertexNormals();
  const pelmet = new THREE.Mesh(pelmetGeo, velvet);
  pelmet.position.set(0, railY + 0.02, z + 0.02);
  const fringePts = [];
  for (let k = 0; k <= 150; k++) { const u = k / 150, sw = (u * swags) % 1, dip = Math.sin(sw * Math.PI); fringePts.push(new THREE.Vector3((u - 0.5) * PW, railY + 0.02 - PH / 2 - dip * 0.18, z + 0.02 + dip * 0.16)); }
  const fringe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fringePts), 150, 0.03, 8, false), rope);   // the fringe's heading, as a gold cord along the scallops
  const bullion = new THREE.Mesh(new THREE.PlaneGeometry(PW, 0.09, 150, 1), new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.8, side: THREE.DoubleSide, alphaMap: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 16; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 16); x.fillStyle = '#fff'; for (let i = 0; i < 512; i += 4) x.fillRect(i, 0, 2, 16); const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 40; return t; })(), transparent: true }));
  const bp = bullion.geometry.attributes.position;                    // the bullion fringe hangs from the cord, following the scallops
  for (let i = 0; i < bp.count; i++) { const u = bp.getX(i) / PW + 0.5, sw = (u * swags) % 1, dip = Math.sin(sw * Math.PI); bp.setY(i, bp.getY(i) - dip * 0.18); bp.setZ(i, dip * 0.16); }
  bullion.geometry.computeVertexNormals(); bullion.position.set(0, railY + 0.02 - PH / 2 - 0.06, z + 0.02);
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, PW + 0.3, 12), giltPlain);
  rail.rotation.z = Math.PI / 2; rail.position.set(0, railY + 0.02 + PH / 2, z);
  [-1, 1].forEach((sd) => { const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), giltPlain); finial.position.set(sd * (PW / 2 + 0.15), railY + 0.02 + PH / 2, z); mainFrame.add(finial); });
  mainFrame.add(pelmet, fringe, bullion, rail);
  [pelmet, fringe, bullion, rail, ...CURTAIN.halves, ...CURTAIN.ties].forEach((m) => m.traverse((o) => { o.userData.station = ST.detClose; }));
  // what the curtain hides
  const pic = mainFrame.children[1];
  const draw = (img) => {
    const c = document.createElement('canvas'); c.width = 2048; c.height = Math.round(2048 * p.h / p.w);
    const x = c.getContext('2d');
    if (img) { const k = Math.max(c.width / img.width, c.height / img.height), sw = c.width / k, sh = c.height / k; x.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, c.width, c.height); }
    else { const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#b8c4c6'); g.addColorStop(0.5, '#d9c9a2'); g.addColorStop(1, '#a58a5a'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
    const gilt = (text, px, y) => {                                    // raised gilt lettering: a soft cast shadow, a dark bevel below, the gold, a bright edge above
      x.font = '700 ' + px + 'px "Cormorant Garamond", Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if ('letterSpacing' in x) x.letterSpacing = Math.round(px * 0.14) + 'px';
      const cx = c.width / 2;
      x.shadowColor = 'rgba(20,12,2,.7)'; x.shadowBlur = px * 0.22; x.shadowOffsetX = px * 0.05; x.shadowOffsetY = px * 0.1;
      x.fillStyle = '#3d2a0a'; x.fillText(text, cx + px * 0.03, y + px * 0.04);   // the relief's dark under-edge, casting the shadow
      x.shadowColor = 'transparent';
      const g = x.createLinearGradient(0, y - px * 0.42, 0, y + px * 0.42);
      g.addColorStop(0, '#f7e2a8'); g.addColorStop(0.2, '#d9b25a'); g.addColorStop(0.45, '#a8781f'); g.addColorStop(0.52, '#eacb7a'); g.addColorStop(0.66, '#8c5f14'); g.addColorStop(0.88, '#5e3f0c'); g.addColorStop(1, '#c9a24e');
      x.fillStyle = g; x.fillText(text, cx, y);
      x.lineWidth = Math.max(1.5, px * 0.014); x.strokeStyle = 'rgba(70,45,10,.75)'; x.strokeText(text, cx, y);   // a fine dark contour, as gilding on plaster has
      x.lineWidth = Math.max(1, px * 0.01); x.strokeStyle = 'rgba(255,250,230,.8)'; x.strokeText(text, cx, y - px * 0.02);   // the light catching the top edge
    };
    if (CURTAIN.sorry) { gilt('WE’RE SORRY TO MISS YOU', 118, c.height * 0.2); gilt('IV · XXIV · MMXXVII', 70, c.height * 0.33); }
    else { gilt('SEE YOU IN SIENA', 150, c.height * 0.2); gilt('IV · XXIV · MMXXVII', 70, c.height * 0.33); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    pic.material.map = t; pic.material.needsUpdate = true;
  };
  const img = new Image();
  CURTAIN.redraw = () => draw(img.complete && img.naturalWidth ? img : null);
  img.onload = () => document.fonts.load('700 150px "Cormorant Garamond"').then(() => draw(img), () => draw(img));
  img.onerror = () => draw(null);
  img.src = 'assets/det-see-you-in-siena.jpg';
  try { CURTAIN.sorry = localStorage.getItem('ka-posted-answer') === 'no'; } catch (e) { /* nothing kept */ }
  if (localStorage.getItem('ka-posted')) revealCurtain(true);
})();
function closeCurtain() {                                            // for the owner's testing: R at the centrepiece closes the curtain and forgets the post
  try { localStorage.removeItem('ka-posted'); localStorage.removeItem('ka-rsvp'); localStorage.removeItem('ka-posted-answer'); } catch (e) { /* nothing kept */ }
  CURTAIN.open = false; CURTAIN.t = 0; CURTAIN.sorry = false; setCurtain(0); if (CURTAIN.redraw) CURTAIN.redraw();
}
function revealCurtain(instant) {
  if (!CURTAIN.halves.length) return;
  try { localStorage.setItem('ka-posted', String(Date.now())); } catch (e) { /* the visit */ }
  CURTAIN.open = true; CURTAIN.from = performance.now(); CURTAIN.t = instant ? 1 : 0;
  if (instant) setCurtain(1);
}
function setCurtain(k) {
  CURTAIN.halves.forEach((h) => { h.userData.half.userData.shape(k); });
  CURTAIN.ties.forEach((t) => { t.scale.setScalar(Math.max(0.001, (k - 0.55) / 0.45) * t.userData.full); });
}
function tickCurtain() {
  if (!CURTAIN.open || CURTAIN.t >= 1) return;
  CURTAIN.t = Math.min(1, (performance.now() - CURTAIN.from) / 3400);
  setCurtain(smooth(CURTAIN.t));
}

// ---------------------------------------------------------------- loop
function resize() {
  const stage = el('stage');
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));   // 2 on a Retina screen is four times the pixels of 1, and costs frames while walking
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
// the panel below the view changes height (a Play or Read-more button comes and goes), which resizes the stage
// without a window resize; without this the picture is stretched to the new shape
let needResize = false;
if (window.ResizeObserver) new ResizeObserver(() => { needResize = true; }).observe(el('stage'));   // re-fitted just before the next draw, so no blank frame shows
resize();

// a gentle look-round: the view leans a few degrees towards wherever the cursor is on the screen, and settles
// back to the stop's own framing when the cursor leaves. Applied only when drawing, so the stops, the routes
// and where you end up are untouched. Off while the save-the-date or the invitation is in the hand (they tilt
// with the cursor themselves).
// At the details room's overview stops (`look: 'free'`) you can also turn to look round: with the cursor in
// the outer part of the screen the view turns that way, faster the further out it is, and stays turned until
// you click something. That turn goes into the stop's own heading (cam.yaw), so a walk from there starts
// from the way you are facing.
const LOOK = { yaw: 0.1, pitch: 0.055, ease: 0.06, x: 0, y: 0, edge: 0.55, spin: 1.5, limit: Math.PI / 2, last: 0, turning: 0 };   // limit: how far the free look may turn from the stop's facing   // edge: where the turning zone starts (fraction of half the width); spin: rad/s at the very edge
function updateLook(now) {
  const r = canvas.getBoundingClientRect(), on = pointer.inside && !volHeld() && !invHeld() && r.width > 0;
  const u = on ? (pointer.x - r.left) / r.width * 2 - 1 : 0;
  const tx = -u * LOOK.yaw;
  const ty = on ? -((pointer.y - r.top) / r.height * 2 - 1) * LOOK.pitch : 0;
  LOOK.x += (tx - LOOK.x) * LOOK.ease;
  LOOK.y += (ty - LOOK.y) * LOOK.ease;
  const dt = Math.min(0.1, (now - LOOK.last) / 1000); LOOK.last = now;
  const free = on && STATIONS[idx].look === 'free' && !leg && !queue.length && el('card').style.display !== 'grid' && el('postcard').style.display !== 'grid';
  const k = free ? Math.max(0, (Math.abs(u) - LOOK.edge) / (1 - LOOK.edge)) : 0;
  LOOK.turning = k > 0 ? Math.sign(u) : 0;
  if (k > 0) {                                                       // moved: keep reading what is under the cursor as the view turns
    const home = STATIONS[idx].yaw, off = shortAngle(home, cam.yaw - Math.sign(u) * k * k * LOOK.spin * dt) - home;
    cam.yaw = home + Math.max(-LOOK.limit, Math.min(LOOK.limit, off));   // never more than a quarter turn from the stop's own facing
    pointer.moved = true;
  }
}
// a stop that carries a game: arriving shows its write-up; the game opens when you click the frame again or the
// panel's Play button, and closing it (Esc or the cross) leaves you standing before the frame
function openArcade() {
  const st = STATIONS[idx];
  if (!window.Arcade || !st.game || Arcade.open) return;
  Arcade.launch(st.game, { onClose: () => {} });
}
function updateArcade() {}
// ?fps: a frame-rate readout, for checking the gallery on a real laptop or iPad (kaweddinggallery.com/?fps). Top line: frames
// a second over the last second, and the slowest single frame of the last five (a stutter shows there). Then each room's
// average so far, so a slow room can be found by walking round; then the canvas size and the triangles drawn.
// Nothing is measured or shown without ?fps.
const FPS = /[?&]fps/.test(location.search) ? (() => {
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:8px;right:8px;z-index:200;padding:6px 10px;border-radius:8px;background:rgba(0,0,0,.72);color:#F2DFA8;font:12px/1.45 ui-monospace,Menlo,monospace;white-space:pre;pointer-events:none';
  document.body.appendChild(box);
  return { box, last: 0, frames: [], rooms: {}, shown: 0 };
})() : null;
const ROOM_NAMES = { atrium: 'Atrium', w1: 'Wing I', w2: 'Wing II', det: 'Details' };
function tickFps(now) {
  const f = FPS, dt = f.last ? now - f.last : 0;
  f.last = now;
  if (dt > 0 && dt < 1000) {                                              // a longer gap is a hidden tab, not a stutter
    f.frames.push([now, dt]);
    const r = STATIONS[idx].room, s = f.rooms[r] || (f.rooms[r] = { t: 0, n: 0 });
    s.t += dt; s.n++;
  }
  while (f.frames.length && f.frames[0][0] < now - 5000) f.frames.shift();
  if (now - f.shown < 500) return;
  f.shown = now;
  const recent = f.frames.filter(([t]) => t > now - 1000), ms = recent.reduce((a, [, d]) => a + d, 0);
  const worst = f.frames.reduce((a, [, d]) => Math.max(a, d), 0);
  f.box.textContent = `${ms ? Math.round(1000 * recent.length / ms) : '-'} fps · slowest frame ${Math.round(worst)} ms\n` +
    Object.entries(f.rooms).map(([r, s]) => `${ROOM_NAMES[r] || r} ${Math.round(1000 * s.n / s.t)}`).join(' · ') +
    `\n${renderer.domElement.width}×${renderer.domElement.height} px · ${(renderer.info.render.triangles / 1e6).toFixed(2)}M triangles`;
}
function frame(now) {
  if (!leg && (queue.length || !settled())) startLeg();
  updateArcade();
  if (leg && leg.kind === 'path') {
    if (stepPath(leg, now)) leg = null;
  } else if (leg) {
    const k = Math.min(1, (now - leg.t0) / leg.ms);
    const e = easeInOut(k);
    if (leg.kind === 'turn') {
      cam.yaw = leg.from + (leg.to - leg.from) * e;
      cam.pitch = leg.pf + (leg.pt - leg.pf) * e;
      cam.eye = leg.ef + (leg.et - leg.ef) * e;
    } else {
      cam.x = leg.fx + (leg.tx - leg.fx) * e;
      cam.z = leg.fz + (leg.tz - leg.fz) * e;
    }
    if (k >= 1) { leg = null; }
  }
  updateLook(now);
  camera.position.set(cam.x, cam.eye, cam.z);
  camera.rotation.set(cam.pitch + LOOK.y, cam.yaw + LOOK.x, 0, 'YXZ');
  camera.updateMatrixWorld();
  if (needResize) { needResize = false; resize(); }
  updateVolvelle();
  updateInvitation();
  if (shopRack) shopRack.rotation.y += 0.003;                      // the postcard rack turns idly
  tickCurtain(); tickSand(performance.now());
  updatePointer();
  renderer.render(scene, camera);
  if (FPS) tickFps(now);
  requestAnimationFrame(frame);
}
paintLabel(STATIONS[0]);
markRoom('atrium');
requestAnimationFrame(frame);
