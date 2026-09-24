# Handoff — Wheelis · Alvarez wedding site (the 3D gallery)

_Written 18 September 2026, at the end of a long working session, so that anyone (a person or
an AI agent) can pick the project up cold. Read this first, then `PROCESS.md` for the creative
reasoning, then `CLAUDE.md` for the owner's working rules._

---

## 1. What this is

A wedding website for **Kelly Wheelis and Anthony Alvarez** — Villa Cetinale, Sovicille (near
Siena), Italy, **24 April 2027** (weekend of 22–26 April). The motto is *"I am a museum of
everything I've ever loved…"*, so the site **is** a museum: a 3D building you walk through in
the browser.

- **Wing I** = the ceremony, anchored by Botticelli's *Birth of Venus*.
- **Wing II** = the reception, anchored by Botticelli's *Primavera*.
- **Details room** = travel, lodging, program, RSVP. A burgundy salon-hung room modelled on
  the Galleria Borghese reference photo `assets/ref-terracotta.jpg`.
- **Atrium** = the entrance hall, with a small photo gallery each for Kelly and Anthony.

The owner (Kelly) is **not a developer**. She directs by looking at the result in a browser,
marking up screenshots, and describing what she wants in plain language. Explain things in
plain language; don't assume git, JavaScript or 3D vocabulary.

## 2. Where everything is

Project root (a local git repository, branch `main`):

    /Users/kellywheelis/Desktop/wedding website/

Everything that matters lives in one subfolder:

    /Users/kellywheelis/Desktop/wedding website/Wedding website planning/

| Path (inside `Wedding website planning/`) | What it is |
|---|---|
| `The Gallery 3D.html` | **The live page.** Entry doors, motto, info panel, buttons, credits panel, import map. |
| `gallery3d.js` | **The live build** — all of the 3D gallery (~1,900 lines, three.js 0.184 from unpkg). |
| `assets/` | Paintings, textures, the KA monogram, reference photos. |
| `assets/sculpture/` | The ten real sculpture scans (`.glb`) + `SOURCES.md` (where each came from, licence, how it was converted). |
| `assets/door-walnut-*.jpg` | Generated walnut grain for the entry doors (`tools/make_walnut_textures.html` regenerates them). |
| `tools/convert_scan.py` | Turns a raw museum scan (`.stl`/`.obj`, often 100 MB+) into a small `.glb`. No dependencies. |
| `tools/harness/` | The screenshot/test harness (see §6). **Use it — it is how changes get verified.** |
| `HANDOFF.md` | This file. |
| `PROCESS.md` | The owner's creative-process document: concept, what was rejected and why, the building as built. |
| `CLAUDE.md` | The owner's working rules (also copied to the repo root so agents load them automatically). |
| `The Gallery.dc.html`, `*.dc.html`, `doc-page.js`, `image-slot.js` | Earlier prototypes and design studies from a previous tool. **Not the live build.** Kept for reference. The entry page of `The Gallery.dc.html` is LOCKED (see `CLAUDE.md`). |
| `screenshots/` | Old screenshots from the earlier prototyping phase. |

### Running it

The page loads a JavaScript module and image textures, which browsers block from `file://`.
Serve the folder and open it over http:

    cd "/Users/kellywheelis/Desktop/wedding website/Wedding website planning"
    python3 -m http.server 8000 --bind 127.0.0.1
    # then open  http://127.0.0.1:8000/The%20Gallery%203D.html

After any change, hard-refresh the browser (Cmd+Shift+R). three.js loads from unpkg.com, so an
internet connection is needed.

## 3. The owner's working rules (from `CLAUDE.md`, plus what this session established)

- **Change ONLY what is asked.** No unrequested improvements, moves or removals. When she says
  "fix what you think needs fixing" that is permission for that one thing, not a standing licence.
- **Verify before claiming.** Check the file or the rendered result. Never say a change worked
  without confirming it. In practice: take a harness screenshot and look at it.
- **If an instruction is ambiguous, ask ONE short question** rather than guessing.
- **Small targeted edits.** Bulk scripted edits corrupted `The Gallery.dc.html` once.
- **The entry page of `The Gallery.dc.html` is LOCKED.** For the live 3D page she lifted this:
  the doors were rebuilt at her request, **but the names, the "and", both buttons and their
  positions must stay exactly as they are.**
- She often sends **annotated screenshots** with numbered circles. Treat each number as a task.
- She likes to be told honestly what was NOT verified (e.g. "I can't see animation, only stills").
- Report in plain language. Say what was wrong, what changed, and what she will see.

## 4. What was built this session (all in `gallery3d.js` unless noted)

**Building**
- Groin vaults rebuilt from scratch (the old surface was upside-down *and* dome-shaped). Bays
  follow the plan: 3 atrium bays, one square bay over the crossing, ending on the details-arch
  wall. Every bay: diagonal ribs, an arch on every edge (wall rib or transverse arch), a carved
  boss at the crown. Walls continue up into the arches as plaster "lunettes".
- Wing doorways are thick walls set back *into* the wings (flush on the hall side).
- Stone floor is drawn in code (`floorTexture`): staggered honed slabs. The old `tex-stone.jpg`
  is unused.
- **Details room**: 10 × 9 m, walls in the invitation burgundy (`BURGUNDY = #7A1A3C`, sampled
  from the monogram; the paint value `BURGUNDY_PAINT = #6c1637` is darker so that it *renders*
  close to the swatch under the warm lamps), pale dado, gilt cornice, **coved ceiling** with a
  placeholder sky panel, 14-frame salon hang (`DETAIL_PICTURES`), centre table, three gilt
  consoles, four Roman busts, two large statues flanking the principal picture.
- **Atrium galleries**: three frames a side (`ATRIUM_PICTURES`) — Kelly on the LEFT wall,
  Anthony on the RIGHT — each with an engraved brass name plaque (`GALLERY_NAMES`).
- Gilt numerals **I** and **II** above the wing arches (solid bars, not text).
- Architectural dressing: cornices, atrium pilasters, arch surrounds with keystones, bosses, the
  inside face of the entrance doors on the atrium's back wall.
- **Ornate frames** everywhere (`ornateFrame`): a moulded profile swept round the picture and
  mitred, carved via a bump map (beads, frieze, leaf band, twisted ribbon), corner pieces, crests.
- Brass bar picture lights with a soft wash (`pictureLight`).
- Wing I objects: two urns of **cascading roses** built petal by petal (`roseCascade`,
  `addRose`), Thorvaldsen's *Venus with the Apple* and *Cupid Playing the Lyre*.
- Wing II objects: two **citrus trees** built leaf by leaf (`citrusTree`), Canova's
  *Venus Italica*, a Laurana bust.
  The crowns have no solid core: an inner layer of dark leaves instead (a smooth dark ball showed through as a
  ball). Orange blossom is ~50 five-petalled flowers per tree on a jittered grid over the room-facing side only;
  the owner asked for more, spread evenly rather than clustered.
- Wing II side walls: four paintings in two pairs (`W2_PICTURES`), a larger one towards the entrance and a
  smaller beside it, each with its own picture light; both pictures on a wall lead to that wall's stop
  (`w2a` "The Banquet": van Utrecht and Ruoppolo still lifes; `w2b` "The Dancing": Mantegna's *Parnassus*
  and Botticelli's Nastagio wedding banquet). Wing I is hung the same way (`W1_PICTURES`, shared helper
  `hangSideWalls`), and its four pictures each have their own close-up stop with its own wall text
  (`close:` on the picture; `w1graces`, `w1amaryllis`, `w1union`, `w1mars`, each with `back:` its wall's stop).
  Wing II's four have them too (`w2utrecht`, `w2ruoppolo`, `w2parnassus`, `w2nastagio`). Close-ups on one wall share
  the same `eye` height on purpose: that is what lets the sidestep between them skip the levelling-out.
  From a wall's stop, or from a neighbouring close-up, clicking a picture goes to its close-up. The owner
  asked for the Graces' text to be bridal-party themed ("every girl needs her squad", #girlgang).

**Real sculpture** — `SCULPTURE_SPOTS` (pedestals/plinths that register themselves) and
`SCULPTURES` (which scan goes on which spot, its height, title and credit). Scans load in the
background through a dynamically imported GLTFLoader; if one fails, the placeholder stays.
No scans of Villa Cetinale's own sculpture exist online (searched). See `assets/sculpture/SOURCES.md`.

**Entry page and motto** (`The Gallery 3D.html`)
- Walnut frame-and-panel doors, brass KA monogram across the seam (CSS mask of
  `assets/monogram-ka.png`), a mouse glow on the doors, buttons fade out when the doors open.
- Motto: consistent dark gold, condensed to the centre, soft ivory haze behind it, no rule lines.
- Credits panel (button at the right of the bottom bar) — built from `SCULPTURES`.

**The details room's sections** (owner's plan, 21 Sept 2026; all texts are still PLACEHOLDERS)
- Main frame, end wall: "The only thing missing from this exhibit is you" (kept for the guests), with the gift-shop
  stand (`giftShop`, stop `detShop`) under it: postcard rack, "POSTA · R.S.V.P." letterbox, registry card. The owner
  wants the RSVP to be a postcard drawn from the rack that flips to a writing side (the form) and is posted in the
  letterbox. NOT BUILT YET: it needs a form service behind it (a static page cannot collect replies).
- Layout (the owner's, 21 Sept): the END WALL carries only the main frame (she found clusters beside it too small).
  LEFT wall: 2 Schedule (entrance side) and 3 Travel (far side). RIGHT wall: 1 Main details (entrance side) and
  4 Accommodations, one good-sized picture (far side). ENTRANCE wall: 5 Logistics (left), 6 Guest policies (right).
  7 Registry & extras is the gift-shop stand. She rejected the Aurora on the travel wall (file kept in assets, unused)
  and three versions of one painting in a cluster. More pictures may come; Villa Cetinale art is still open (none
  exists in open collections, and she does not want the invitation artist's drawing used).
- Stops: `detMain`, `detSchedule`, `detTravel`, `detStay`, `detFrontL`, `detFrontR`, `detShop`, all in the Walk on tour in
  that order after `det` and `detTable`. `detClose`, `detVolvelle`, `detInvite` are click-only.
- A gold title on the wall above every section (`sectionTitle`), sized to read from the room's entry.
- Every picture has `sec` (its section) and `note` (title, anecdote, caption). Each picture with a note gets its own
  close-up stop, made at build time (`pic<index>`, `back:` its section, `card:` the section's), standing as near as its
  size allows at the picture's height. Click from elsewhere: walk to the section. Click from the section (or from a
  sibling's close-up): step up to the picture; its write-up fills the panel. The anecdotes are drafts.
- Beneath every section a gold-edged wall button "CLICK HERE FOR DETAILS" (`detailsButton`, `userData.cardKey`)
  opens its wall text from anywhere in the room. The panel's "Read the full details" does the same.
- In the details room a row of gold-trimmed section buttons (`#sections`) runs across the top between Step back and
  Walk on; the current section is highlighted. Turn around now sits at the bottom right of the stage. No console tables in the room any more (the owner removed them).
- Holding the save-the-date or the invitation, a click on anything else puts it down (`onHeldItem`); the open wall
  text closes on a click outside it.
- Pictures are `DETAIL_PICTURES` (`src`, optional `crop: [l, t, r, b]`). `tools/art-options.html` is the browsing
  page used to choose them.
- Wall texts: `CARDS`, named by a stop's `card:`; the panel shows "Read the full details", which opens a cream
  placard over the scene (Escape or a click outside closes it; arrow keys are ignored while it is open).

**Sculpture in the details room** (22 Sept 2026)
- Apollo and Diana flank the main frame. The Apollo scan was captured ~28 degrees off level (a hand-set `tilt` of
  10 degrees was not enough): `level: true` now straightens it automatically (`levelBase()` fits a plane to the
  underside of the base and stands it flat, then centres the figure by its base rather than its reach). `tilt`
  ([x, z] degrees) is still accepted for hand corrections. Diana is centred by `nudge`; her plinth is sized to her
  base (0.96 x 0.74). Rotated models are measured with the precise bounding box, otherwise they float.
- Every plinth in the museum is Siena marble (`plinthMat`, drawn by `sienaMarble()`); the walls' dado keeps the
  plaster `stoneMat`, so the plinths stand off it. The one-line switch to white marble is the `plinthMat` colour/map.
- The wing sculptures (Venus with the Apple, Cupid with the Lyre, Venus Italica, Costanza Bonarelli) have
  walk-up stops and write-ups too (21 Sept 2026): `SCULPTURE_NOTES` entries make a stop for any spot; the loader
  works out the room and the wall from the spot's position (`room`, `back`, accent and eyebrow follow the room).
- The four corner pedestals hold bust-sized pieces: a Roman head of Ariadne (Musée Saint-Raymond, Toulouse, CC BY —
  the reclining Sleeping Ariadne cast was tried first and rejected as too big for a bust plinth), Antinous as Dionysus (the Bacchus reference: the owner does not drink and
  wants guests told to enjoy the wine anyway), Beatrice d'Este and Isabella of Aragon (two Renaissance brides, either
  side of the entrance arch). Bernini's Costanza Bonarelli replaced the Laurana woman in Wing II. The owner did NOT
  want full-size statues shrunk to fit these pedestals (a shrunk Dancing Faun was tried and rejected), and does not
  want the Roman portrait busts back. No Cupid and Psyche scan exists in any open collection (searched).
- Scans face whichever way they were captured: `turn` (radians) spins each to face the room; set by eye from renders,
  because a nose-direction test misfires on busts with wide shoulders or hair.
- Every sculpture in the room has a walk-up stop made at load time (`sc_<spotId>`, from `SCULPTURE_NOTES`), standing
  straight off its wall at a distance and height that fill the view; Step back returns to the room's entry. The
  anecdotes are drafts.

**The save-the-date volvelle** (section "on the table" in `gallery3d.js`)
- A digital build of the owner's paper save-the-date. Her original build pack (print sheets, Cricut
  cut files, shopping list) lives OUTSIDE the project — it was removed on purpose so it is not
  published with the site. It was also scrubbed from the git history on 21 Sept 2026 (the seven commits
  from the volvelle onwards were rewritten), so it is safe to push this repository. What the gallery needs is in
  `assets/volvelle/`: `front.png` (the front panel, cropped from the pack's BLANK print sheet),
  `wheel.png` (the wheel art, downsized) and `MEASUREMENTS.txt` (the numbers the build is made from).
- The card front is a cut shape (window, pivot hole, thumb notch) with the print laid over it; the
  gold rails, white wainscot, two gilt oval rings with a pearl course, and the brass eyelet are real
  geometry. The wheel has five plates, 72 degrees apart.
- It stands propped on a walnut base (`volStand`) on the centre table, with an engraved brass plaque on
  the base's sloped front (the owner rejected a paper-card label: "looks like a print-out"). Clicking
  the card, the base or the plaque goes to the
  `detVolvelle` stop, where the card lifts off its stand to face the camera (`VOL.lift`). There you drag to turn the
  wheel, or click to advance one plate; it settles plate by plate. Step back puts it down (`back: 'detTable'`).

**The pop-up invitation** (section "on the table: the pop-up invitation" in `gallery3d.js`)
- The invitation is a commissioned illustrator's work. On 20 Sept 2026 the owner confirmed he permits
  showing it on the site **provided he is credited on a plaque, as the save-the-date credits her**. He
  is credited as she specified: "Truong Hoai Vu · vuth.art", medium "Paper and ink" — on the stand's brass
  plaque, in the info panel and in the Credits panel. Keep all three if the piece is ever reworked.
- His source files and her video live OUTSIDE the project (`~/Desktop/POPUP-INVITATION/invite/`).
  `tools/make_invitation_assets.py <that folder>` makes everything in `assets/invitation/`: it straightens
  the frame from a screenshot and re-draws its ink on clean cream (dividing out the photo's lighting),
  separates the gold-foil lettering, and cuts the three interior layers to paper silhouettes with a white
  margin (ink dilated, holes filled, a ground strip added), moving layer 1's clouds to the back wall.
  Pure Python + ffmpeg (`pip install --user imageio-ffmpeg`, which is how ffmpeg got onto this Mac).
- The frame comes from ONE video screenshot of the closed card held in two hands, so the script does a lot:
  the video crops off the card's left 2-4% and fingers cover both thumb notches, so the scrollwork (a
  mirror image left to right) is completed from the opposite side, with the little neither side shows taken
  from a second photograph (`opendoors.png`, straightened by its window corners). The notches are clean
  semicircles half way up; the ribbon's two tails overhang the window; every cut edge gets a fine shadow
  line. The owner checked this closely over several rounds: re-run the script and compare before changing it.
  A flat, hands-free photograph or the artist's frame file would replace all of that.
- The doors show only the middle of the door drawing (`ART` in `buildInvitation`), centred on the hill path,
  which the seam runs through, as on the real card.
- Built as a real box diorama, in units of one card width (`INV.SIZE` scales it): frame and foil planes, two
  door halves sharing one texture with the KA monogram across the seam, three layers and a sky back wall
  at different depths, a pull-out card (illustrated side only: the owner does not want the wording side
  shown), one unseen pick pane. It stands on its own walnut stand on the table's right half.
- At the `detInvite` stop it lifts to the camera. Click the front: doors slide apart. Click the tab at the
  top: the card draws out and comes forward; any click puts it back. Moving the mouse tilts it so you can
  look into the box. Putting it down shuts the doors and stows the card.

**The entrance hall** (the half of the atrium behind you as you enter; seen by pressing Turn around)
- Nobody walks there, so nothing in it is a stop. The Capitoline Venus and the Ludovisi Mars stand half way
  down it (`atriumStatues`; Mars sits, so his plinth is sized to his own base and he takes a `nudge`), lit by a
  soft spot each. The owner did not want David: she wanted the Venus-and-Mars theme of the wings.
- Two Botticelli wedding frescoes from Villa Lemmi hang on the walls nearest the atrium spot, each in a stone
  surround (fillet, architrave, frieze, cornice, sill on corbels), placed to clear the pilaster and the plinth.
- A burgundy swallow-tailed banner with the gold KA monogram hangs over the doors (`doorBanner`). Plain gilt
  lettering on the wall was tried first and was too faint from the atrium.
- `NOTES` / `userData.note`: a write-up-only click. It changes the bottom panel and does not move you. The two
  statues share one note on purpose (the owner wants them as a pair). Turning round restores the stop's text.
- `pedestal()` and `reservedPlinth()` take a footprint, for seated figures (Mars here, Cupid in Wing I).

**Page chrome** (`The Gallery 3D.html`)
- Turn around (`#turn`, in `#topLeft` with Step back): a half turn on the spot, levelling the view; turning again
  restores the stop's tilt and height. Hidden while the save-the-date or invitation is held. In the atrium Step
  back is `display:none`, so Turn around takes the top-left corner, mirroring Walk on.
- One themed cursor everywhere: Cupid's arrow, as two SVG data-URIs in `:root` (`--cur`, and `--cur-on` for
  anything clickable: rose heart, gold glow). `gallery3d.js` sets `canvas.style.cursor = 'var(--cur-on)'` and
  keeps re-probing for ~100 frames after a move ends, so the cursor is never stale. The save-the-date's wheel
  keeps the ordinary grab hand on purpose.
- The info panel's text is large and bright, and eases in afresh (`.fresh`) whenever `paintLabel` changes it:
  the owner found the write-ups too easy to miss.
- "Go ahead – touch the art": a small pill at the bottom centre of the stage (`#hint`), pointer-events none.
  The owner chose the wording and the place; she did not want an icon beside it.

**Navigation**
- Stops (`STATIONS`) are referred to by **id**, never by index (`ST.w1`, `ST.detTable`, …).
  `tour: false` marks stops reached only by clicking (skipped by Walk on / arrow keys).
  Ids: atrium, kelly, kelly1, kelly2, anthony, anthony1, anthony2, w1, w1close, w1a, w1b, w2,
  w1graces, w1amaryllis, w1union, w1mars, w2close, w2a, w2b, w2utrecht, w2ruoppolo, w2parnassus, w2nastagio, det, detL, detR, detLclose, detRclose, detTable, detMain, detSchedule, detTravel, detStay, detFrontL, detFrontR, detShop, detClose, detVolvelle, detInvite.
- A stop may name where Step back leads (`back: 'detTable'`); otherwise Step back goes to the room's entry stop, then the atrium.
- Click **doorways** (invisible arch-shaped panes), **pictures/frames/plaques/the table**
  (`userData.station`, and `userData.closer` for the two wing paintings' close-up).
- **Step back** (top left) goes one level: a picture → the room's entry stop → the atrium.
  **Walk on** (top right) advances the tour.
- Going to a stop on the very spot you stand on, facing the same way (the table and the two things on it),
  skips the levelling-out, so the view does not nod up and back down.
- A stop may carry a `pitch` (camera tilt, radians, negative = down) and an `eye` (viewing height in
  metres; default 1.62). The close-up stops use `eye` to look at a picture square-on from its own
  height instead of tilting up at it. The view levels out and returns to standing height before walking.
- `planRoute()` plans routes as steps (turn, walk, turn): free movement inside the details room **round
  the centre table** (`detWalk` finds the shortest route round the corners of `TABLE_KEEPOUT`), moves
  inside a wing stay in the wing, everything else runs along the hall's centre line through the crossing.
- `goTo()` = plan, then `compileWalk()` (21 Sept 2026): the steps become ONE continuous walk (`WALK` settings):
  the same points with rounded corners, a steady 2.5 m/s that eases off through corners and at both ends (a
  pace table every 2 cm), the heading read off a smoothed curve and followed with a little lag, a big initial
  turn taken on the spot first, the final turn to face the stop given more of the path the bigger it is, the
  view levelling and the stop's own tilt/height folded into the same motion, and the view never swinging faster
  than ~125 deg/s. A route with no walking (Turn around) still runs as a plain turn step.
- Mouse-look (`LOOK`, `updateLook()`): the view leans up to ~6 deg sideways and ~3 deg up/down towards the
  cursor, easing back when it leaves the canvas; applied only at draw time (`camera.rotation` = cam + LOOK), so
  nothing about stops or routes sees it. Off while the save-the-date or invitation is held. The harness's
  `build.sh` rewrites that camera.rotation line to add its `pitch=` offset, so keep the line's text in step.
- Free look in the details room: at stops marked `look: 'free'` (entry, table, the six section stops) the cursor
  in the outer part of the screen (`LOOK.edge`) turns the view that way, up to `LOOK.spin` rad/s, folded into
  `cam.yaw` so it persists and walks start from it. Off at close-ups, walk-ups, the stand, during walks and cards.
- Frame rate while walking: the cursor's ray is tested against the scene every frame of a walk, so the sculpture
  scans (55k-118k triangles each) are left OUT of the ray test (`raycast = () => {}`) and each carries an
  invisible box (`colorWrite: false`) that the cursor and clicks meet instead.
  Harness: `trace=id,id,...` walks each and reports seconds, biggest per-frame step and turn, frames inside
  the table keep-out (should be 0) and how far off the stop it ended (should be 0).
- A warm point-light **glow** follows the mouse in the gallery.

## 4b. The mobile edition (`mobile/`, live at kaweddinggallery.com/mobile/) — 23 Sept 2026

Phones are sent here instead of the 3D build: Vercel does it before the page loads (a `redirects` rule in the
root `vercel.json` on the user-agent: iPhone, Android phones with "Mobile", etc.; tablets and desktops are not
matched), and the 3D page has a two-line fallback for other hosts. `/?desktop` on the address keeps a phone on
the 3D build; the mobile page's footer links there.

It is a scrolling exhibition guide, not a port: the doors (the same markup as the 3D entry, restyled for
portrait), then a chapter per room (Atrium, Wing I, Wing II, Exhibit Details), each with a "postcard" rendered
from the 3D build as its header, every painting in a CSS gilt frame with its write-up (tap = lightbox), every
sculpture as a postcard with its write-up, the save-the-date as a working wheel (front panel drawn to a canvas
with the window cut out, `img/vol-wheel.png` turning behind it; tap advances a plate, drag spins, "turn it
over" shows the monogram back), the pop-up invitation (doors open on tap, the villa's three layers shift with
the phone's tilt, the tab draws the card out), the seven detail sections with their wall-text cards, and RSVP.

- **Text lives in one place.** `mobile/content.js` is GENERATED from the 3D build's own tables: run the harness
  with `dump=1` (`tools/harness/extra.js`) and the python in the session log, or simply re-run the generator
  after editing `gallery3d.js`. Do not hand-edit content.js; the atrium's `NOTES` are the one exception (copied
  into the generator).
- **Pictures**: `mobile/img/` holds phone-sized copies (`sips`, 1400 px and 700 px `-s` versions for srcset) of
  every painting, the card assets, and the postcards (`room-*.jpg`, `sc-*.jpg`) rendered with the harness at
  900x1200 with `clean=1&slow=1` (`tools/harness/shotp.sh OUT URL W H SCALE BUDGET`).
- **Checking it**: `tools/harness/.work/phone.html?p=?open%23sec-schedule` frames the page in a true 390 px
  viewport (headless Chrome will not go narrower than 500 px on its own); `?open` skips the doors, `?dbg`
  lists anything wider than the screen.
- Benchmarks: iPhone 14 (390 px) and Pixel 10 Pro (412 px); about 1 MB to first paint, images lazy.
- To adapt it towards a touch version of the 3D gallery later: keep the redirect, and point `/mobile/` at
  whatever replaces this page.

## 5. Known loose ends / ideas not yet done

- `PROCESS.md` "Still to do": real artwork for the wing side paintings (currently colour
  studies), all the placeholder pictures in the details room and atrium, the RSVP mechanism
  (needs a service — a static page can't collect responses), real content for the info panel
  texts marked "Placeholder", logistics beyond 24 April 2027.
- The owner plans to put **interactive objects on the centre table** (the `detTable` stop and
  camera tilt were built for this).
- Offered, not done: petals drifting down in Wing I; pietra serena (grey stone) trim; compressing
  the sculpture files further (they total ~14 MB); moving the details-room side-wall tour stops
  to the room's middle; a level (non-tilted) end-wall close-up would need the table moved ~0.5 m.
- Performance has only been checked on a desktop. Wing I carries ~300k triangles of roses.
- Dead code that could be removed: `sign()` / `signTexture()` (the old WING I/II wall labels).
- Two small test servers may be left running (ports 8000 and 8011). Harmless; `pkill -f http.server` stops them.

## 6. How to verify changes — the harness (`tools/harness/`)

You cannot see the owner's browser. The harness renders the real build in headless Chrome and
saves a screenshot you can look at.

    cd "Wedding website planning/tools/harness"
    ./build.sh                                   # ALWAYS rebuild after editing the project
    ./shot.sh myshot "x=-5.75&z=-7.5&yaw=1.5708" # -> tools/harness/.work/myshot.png

`build.sh` copies the page with the doors/panel/bar/motto hidden and appends `extra.js` (test
hooks) to a copy of `gallery3d.js`. Query parameters:

| Parameter | Effect |
|---|---|
| `x`, `z`, `yaw`, `pitch` | Put the camera somewhere. yaw 0 looks down the hall (−z); π/2 looks left (−x); −π/2 right. |
| `btn=w1` | Press a bottom-bar room button (`atrium`, `w1`, `w2`, `det`). |
| `click=fx,fy` | One click at a fraction of the canvas, straight away. |
| `click2=fx,fy;fx,fy` | Clicks one after another, after `btn`/`goto` have settled. Reports the planned steps. |
| `goto=id,id,…` | Walk to stops by id in sequence; reports each route and end position. |
| `back2=n`, `fwd=n` | Press Step back / Walk on n times. |
| `hover=fx,fy` | Move the mouse (tests the glow and the pointer cursor). |
| `hold=1`, `turn=n` | Save-the-date: jump to the lifted pose (go to `detVolvelle` first); show plate n. |
| `press=fx,fy;…`, `drag=fx,fy>fx,fy` | Save-the-date: simulated clicks / a drag on the held card; reports the plates turned. |
| `ihold=1`, `idoors=1`, `icard=1`, `itilt=x,y`, `iclick=fx,fy;…` | Invitation (go to `detInvite` first): lifted pose, doors open, card drawn, look-in tilt (-1..1), real clicks with a report. |
| `gate=1`, `ajar=1`, `open=1`, `motto=1`, `credits=1` | Show the entry doors / part-open doors / click Open / the motto / the credits panel. |

**Gotchas learned the hard way**
- Headless Chrome's virtual clock **never plays animations or CSS transitions**. The hooks step
  the walk animation by hand and jump transitions to their end state. So you can verify where a
  move *ends* and what was *planned*, never the motion itself. Say so when reporting.
- During the hooks the viewport is 1400×673 but the saved image is 1400×760, so horizontal click
  fractions are ~0.885× closer to centre than they look in a saved image.
- Headless Chrome does not tick `requestAnimationFrame` on its own either: a hook that changes state must
  run `frame()` once itself before measuring anything (see the save-the-date hooks in `extra.js`).
- Kill headless Chrome after each shot (the script does) or the profile lock blocks the next one.
- `const` declarations are not hoisted: code that runs at load must come after the things it uses
  (this bit twice — `el` and the materials).

## 7. Conventions in `gallery3d.js`

- Units are metres. The hall runs along −z from `P.backZ` (12) to the details arch at
  `P.wingFarZ` (−10); wings lie along ±x between z −5 and −10; the details room is z −10.145 to −19,
  x ±5. `H` = 3.95 (wall height / vault springing). Eye height 1.62.
- Sections are marked with `// ---------------- name` banners: plan, scene, details room,
  architectural detail, objects in the wings, real sculpture, camera moves, ui, clickable doorways, loop.
- Botanical pieces use `InstancedMesh` via the small `instancer()` helper.
- Match the file's existing comment style: short, explains *why*.

## 8. Version control

The repo is on GitHub (private): github.com/kellywheelis/wedding-website, pushed over SSH (key in ~/.ssh/id_ed25519,
added to the owner's account 23 Sept 2026). Push after each approved commit. Vercel deploys from it (kaweddinggallery.vercel.app), from the repo root with
no build step: the root `vercel.json` rewrites `/`, `/gallery3d.js` and `/assets/*` to the files inside this folder,
and the root `.vercelignore` keeps everything but the page, `gallery3d.js` and `assets/` off the live site. History so far:

    146d569  prototyping
    fd3b79b  Add empty txt file
    1c55908  Rebuild the 3D gallery: true vaults, details room, galleries, navigation
    (next)   the commit made together with this handoff

Commit with `git add -A && git commit` from the repo root. The owner asks for commits explicitly;
don't commit or push on your own initiative.
