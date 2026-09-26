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

Everything that matters lives in one subfolder (apart from the deployment files at the root: `vercel.json`,
`.vercelignore` and the scoreboard's `api/scores.js`; see §8 and §4c):

    /Users/kellywheelis/Desktop/wedding website/Wedding website planning/

| Path (inside `Wedding website planning/`) | What it is |
|---|---|
| `The Gallery 3D.html` | **The live page.** Entry doors, motto, info panel, buttons, credits panel, import map. |
| `gallery3d.js` | **The live build** — all of the 3D gallery (~4,300 lines, three.js 0.184, served from `assets/lib/three/`). |
| `assets/fonts/` | Cormorant Garamond and EB Garamond (SIL Open Font License, `OFL-*.txt`), hosted with the site since 26 Sept 2026: the woff2 files and `gallery.css` / `mobile.css`, fetched from Google Fonts' css2 API exactly as each page used to request them. Checked with Google Fonts blocked: the text renders identically. |
| `assets/lib/three/` | three.js 0.184.0, hosted with the site since 25 Sept 2026 so the gallery does not depend on unpkg being up: `build/three.module.js` + `three.core.js` (their sha384 matched the integrity hashes the page used to carry), `GLTFLoader.js` and the two utils it imports, and `libs/meshopt_decoder.module.js` for the compressed sculptures. The page's import map points here. |
| `assets/` | Paintings, textures, the KA monogram, reference photos. |
| `assets/sculpture/` | The twelve real sculpture scans (`.glb`; `isabella.glb` is no longer used) + `SOURCES.md` (where each came from, licence, how it was converted), and `amelia.glb` (Anthony's dog: a 3D generation, not a scan; §4). |
| `assets/door-walnut-*.jpg` | Generated walnut grain for the entry doors (`tools/make_walnut_textures.html` regenerates them). |
| `tools/convert_scan.py` | Turns a raw museum scan (`.stl`/`.obj`, often 100 MB+) into a small `.glb`. No dependencies. |
| `tools/reduce_glb.py` | Shrinks a generated, textured `.glb` (image-to-3D output) into a small vertex-coloured one. Uses macOS `sips` for the texture. |
| `tools/compact_glb.py` | The step before gltfpack for any sculpture `.glb` (see §5): drops the stored normals (the gallery computes them), uses 16-bit indices where it can and byte colors, and checks the result against the original. Needs numpy. |
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

After any change, hard-refresh the browser (Cmd+Shift+R). three.js and the fonts are served from `assets/`, so the
page itself needs nothing from the internet.

To check smoothness on a real device, open the gallery with `?fps` on the address (kaweddinggallery.com/?fps): a
readout top right gives frames a second, the slowest frame of the last five seconds, each visited room's average,
the canvas size and the triangles drawn (`tickFps` in gallery3d.js; nothing is measured without `?fps`).

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
- **American spelling** in everything visitors see (color, center, gray, traveling, canceled): the couple are American,
  and the owner had the whole site changed over on 25 Sept 2026. Proper names and official titles stay as they are.

## 4. What has been built (all in `gallery3d.js` unless noted)

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
  painted panel (a placeholder sky until Tiepolo's sketch went in on 25 Sept 2026), a 16-frame salon hang
  (`DETAIL_PICTURES`: the centrepiece, 13 pictures and two empty ovals), centre table, four corner pedestals,
  two large statues flanking the principal picture (the three gilt consoles and four Roman busts it first had are gone).
- **Atrium galleries**: three frames on Kelly's wall (LEFT), two on Anthony's (RIGHT: the main frame and
  the arcade; his right-hand frame was removed on 25 Sept 2026 to make room for his artifacts) —
  `ATRIUM_PICTURES` — each wall with an engraved brass name plaque (`GALLERY_NAMES`).
- **Anthony's artifacts** (25 Sept 2026, `hangArtifact`): a graded slab of his favourite card,
  Destiny HERO – Diamond Dude, on brass clips on a walnut trophy plaque at eye level to the right of his main frame
  (`cardSlab`; the card face is `assets/diamond-dude.png`, the owner's image of the real card; if that
  file is missing the drawing in `cardFaceCanvas` shows instead); and, beside it, an IN CASE OF EMERGENCY BREAK
  GLASS case (`emergencyCase`: Peach Red Bull, Last Dab, Southern Cuts, hammer on a
  chain; the three carry the owner's product images `assets/case-can.png`, `case-sauce.png`,
  `case-pack.png`, with drawn stand-ins if a file is missing). The third is
  Amelia, their dog: a JEKCA Japanese Spitz brick model (ST19PT31) the owner built (her first gift to him).
  Hand-building her from photos never matched (a day lost to it, 25 Sept); she is now
  `assets/sculpture/amelia.glb`, a 3D generation from the maker's three product renders (front, left,
  right; Tripo via the Magnific connector), reduced from 57 MB to 4.5 MB with `tools/reduce_glb.py`, which
  clusters the mesh like `convert_scan.py` and bakes the texture (black nose and eyes) into vertex colours.
  `amelia()` loads it with GLTFLoader, scales it to half a metre long, and stands it on a small Siena marble plinth on the floor
  to the right of his main frame, below the slab and the case, an AMELIA plaque on the plinth. Each piece clicks like a small frame: first click to
  his wall, second to a close-up stop (`anthonyCard`, `anthonyCase`, `anthonyAmelia`, a step in from
  the wall; `planRoute` steps straight back out again without turning round).
- **25 Sept 2026 review batch**: a loading line along the top edge while textures and models load (`loading()`,
  three's DefaultLoadingManager). The doors wait for the collection (evening of 25 Sept): "Hanging the collection…"
  (`#hanging`) sits inside the Open the doors button's outlined box, which is there from the start in its locked
  position, and the button does nothing yet; when loading finishes the note fades out and "Open the doors"
  (`#enterText`) fades in in the same box, and only then does the button work. After 8 s the note becomes
  "…a moment more"; at 45 s the button is released regardless. (The old note at the foot of the doors is gone.) A
  **collection tally** top-left of the view ("Collection · 7 of 54", distinct stop titles, kept in
  localStorage `ka-seen`; `paintTally`/`noteSeen`); the pill's hint changes by room (`HINTS`); the
  details room's ceiling is Tiepolo's *Allegory of the Planets and Continents* sketch
  (`assets/det-ceiling-tiepolo.jpg`, the Met, turned to lie along the room); a second frame style,
  ebonised with a gilt slip (`ornateFrame(w, h, 'plain')`, `PLAIN_PROFILE`; `frame: 'plain'` on four of
  the salon hang's smaller pictures); a spot on each of the six large statues.
- **The three who hid** (25 Sept 2026): Kelly paints her pets into prints, so three of the family are painted
  into three of the pictures in each painter's manner and left unmarked: Amelia (white spitz) in the flowers at
  Mercury's feet in *Primavera*; Mishka (Nenets herding laika), head and shoulders, lying with Van Dyck's own hound in the bottom-right
  corner of *Amaryllis and Mirtillo* (Wing I); Trogdor (sulcata tortoise) on the road among the mule trains in
  Lorenzetti's *Good Government* (Logistics wall). Amelia was inpainted into the panel (Magnific, Nano Banana) with her photos as references; Mishka was generated
  in Van Dyck's manner, placed, and then finished by the owner herself in Photoshop (her patch is the final word:
  do not regenerate or move him); Trogdor was generated with the fresco as style reference, cut out and composited. The
  results are pasted into the picture files (`assets/primavera.jpg`,
  `w1-amaryllis-and-mirtillo.jpg`, `det-good-government-countryside.jpg`; the untouched originals are not in the repo —
  the three pet-bearing pictures' originals are kept as `assets/postcard-primavera.jpg`, `postcard-amaryllis.jpg` and
  `postcard-good-government.jpg`; the postcards use the first two so they show the paintings as the world knows them,
  and the third is there for the day the Lorenzetti is put on a postcard). `HIDDEN` in gallery3d.js holds each one's box
  on its picture and its write-up; `markHidden` tags the canvas meshes; a click on the animal from the picture's own
  close-up stop (`hiddenHit`/`atHiddenStop`) calls `foundHidden`, which names it in the panel and counts it in the
  tally as a bonus line, "Hidden bonuses" with three stars that fill gold (localStorage `ka-found`; the works
  count stays 54). Over a hidden pet, from its stop, the pointer becomes a magnifying glass (`assets/cursor-find.png`, `--cur-find`).
- **The bottom panel, slimmed** (25 Sept 2026): the room buttons are 32 px tall with gold arrows between
  Atrium → Wing I → Wing II → Details (`.navarrow`, decorative: the buttons are still the way you move; Credits
  sits outside the chain), tighter to the panel's bottom edge; the text box is `font * 5.2 + 44px` (was 6.48 + 54)
  and the panel's padding smaller, so the panel is about 27% of the window instead of 35% and the picture sits
  nearer the centre of the view. The compass sits on the stage's bottom edge. With the room gained, the close-up stops
  moved in: the wings' principal works are seen from 1.95 m (`CLOSE_X` 10.45, was 2.4 m), the wings' side pictures
  from 1.15 m (was 1.83), the salon hang from `max(0.95h, 0.55w)` clamped 0.9–2.3 m (was 1.25h/0.72w, 1.2–3.0), with the
  eye at the picture's centre (clamp raised to 2.9) so the tall-hung ones sit level; the artifacts are seen level too.
  The tally sits bottom-left of the stage (`#tally`). The owner found it easy to miss in the corner, so on 25 Sept it
  moved in from the corner onto the stage's bottom edge and widened (the `#tally` rule in the page's style block: 111 px
  in and 384 px wide on a wide window, text centered, shrinking so it always stays clear of the compass; below 960 px
  it goes back to the corner). The compass no longer steps to the corner at details-room close-ups
  (the owner wants it in one place, always).
- **The RSVP postcard and the curtain** (25 Sept 2026, step 1 of the RSVP). Clicking the gift shop (rack or
  letterbox, `userData.shop`) from its own stop opens `#postcard`: the twelve postcards of the collection
  (`POSTCARDS`, the front is the picture with the KA monogram in gilt at the corner, 14% of the card's width with a
  shadow and a faint gold glow so it stands off the picture, and the title beneath;
  arrows flip through), "This one" turns it over (CSS flip) to the written side: attending yes/no, plus-one,
  dietary, a note, the name on the address side under a monogram stamp. "Post it" drops the card out of view
  and stamps a thank-you; for now the card is kept only in that browser (`ka-rsvp`; a return visit shows it
  posted). Steps 2 and 3 (the guest store and personal links) are still to do. A **curtain** of burgundy velvet
  under a fringed pelmet hangs over the end wall's centrepiece (`curtain()`, two folded halves scaled about
  their outer edges; gilt tiebacks appear as it gathers). Posting a "yes" and closing the card walks you to
  the centrepiece and draws the curtain (`revealCurtain`, 3.4 s; `ka-posted` keeps it open on later visits).
  Behind it: SEE YOU IN SIENA and the date in raised gilt lettering drawn over a Sienese fresco of the hills
  (`assets/det-see-you-in-siena.jpg`, generated in Lorenzetti's manner with Magnific). Harness:
  `postcard=front|back|posted&pc=n`, `reveal=1|no`, `noreveal=1`, `dumpreveal=1` (the panel texture alone). A "no"
  reveals WE'RE SORRY TO MISS YOU instead (`CURTAIN.sorry`, `ka-posted-answer`); R at the centrepiece stop closes the
  curtain and forgets the post, for testing. The wall buttons fade at the centrepiece stop. The curtain (rebuilt
  25 Sept, evening): deep wine velvet; each half is a cloth whose `userData.shape(gather)` gathers it toward its outer
  edge (folds deepen and multiply, the tieback pinches its waist, the hem lifts); the tiebacks are rope-and-tassel
  groups that grow in as the cloth gathers; the pelmet is a valance hung in three swags with a gold cord and bullion
  fringe, on a gilt rail with finials. The date reads IV · XXIV · MMXXVII. Harness: `half=0.5` for a part-drawn curtain. The centre table stands
  at `DET.zMid - 0.55` (was -0.9) and the shop 0.38 m off the back wall (was 0.03), so the curtain (a little taller and
  wider than the frame) clears both.
- Gilt numerals **I** and **II** above the wing arches (solid bars, not text).
- Architectural dressing: cornices, atrium pilasters, arch surrounds with keystones, bosses, the
  inside face of the entrance doors on the atrium's back wall.
- **Ornate frames** everywhere (`ornateFrame`): a moulded profile swept round the picture and
  mitred, carved via a bump map (beads, frieze, leaf band, twisted ribbon), corner pieces, crests.
- Brass bar picture lights with a soft wash (`pictureLight`).
- Wing I objects: two urns of **cascading roses** built petal by petal (`roseCascade`,
  `addRose`), Thorvaldsen's *Venus with the Apple* and *Cupid Playing the Lyre*.
- Wing II objects: two **citrus trees** built leaf by leaf (`citrusTree`), Canova's
  *Venus Italica*, Bernini's *Costanza Bonarelli* (a bust; it replaced a Laurana bust).
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
The scans' color (25 Sept 2026): every scan without `keep` is drawn in `marbleScan` with vertex colors made as it
loads. `fixWinding` turns round the tiny inside-out triangles that `convert_scan.py`'s clustering leaves, which showed
as dark pinholes; `marbleShade` darkens and warms the hollows (folds, curls, eyes) from a smoothed measure of how far
each vertex's neighbors rise above it, and clouds the stone faintly, so the carving reads instead of one flat cream.
A few dark flecks remain on the thin edge of Apollo's cloak: real gaps in the scan. Beatrice's scan has little carved
detail, so she gains least; re-converting her at more triangles would help.

**Entry page and motto** (`The Gallery 3D.html`)
- Walnut frame-and-panel doors, brass KA monogram across the seam (CSS mask of
  `assets/monogram-ka.png`), a mouse glow on the doors, buttons fade out when the doors open.
- Motto: consistent dark gold, condensed to the centre, soft ivory haze behind it, no rule lines.
- Credits panel (button at the right of the bottom bar) — built from `SCULPTURES`.

**The details room's sections** (owner's plan, 21 Sept 2026; all texts are still PLACEHOLDERS)
- Main frame, end wall: "The only thing missing from this exhibit is you" (kept for the guests), with the gift-shop
  stand (`giftShop`, stop `detShop`) under it: postcard rack, "POSTA · R.S.V.P." letterbox, registry card. The owner
  wants the RSVP to be a postcard drawn from the rack that flips to a writing side (the form) and is posted in the
  letterbox. Step 1 of that was built on 25 Sept 2026 (see "The RSVP postcard and the curtain" above); a store for
  the replies is still to come (§5): a static page cannot collect them.
- Layout (the owner's, 21 Sept): the END WALL carries only the main frame (she found clusters beside it too small).
  LEFT wall: 2 Schedule (entrance side) and 3 Travel (far side). RIGHT wall: 1 Main details (entrance side) and
  4 Accommodations, one good-sized picture (far side). ENTRANCE wall: 5 Logistics (left), 6 Guest policies (right).
  7 Registry & extras is the gift-shop stand. She rejected the Aurora on the travel wall (the file is not in the repo)
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
- In the details room a row of gold-trimmed section buttons (`#sections`) runs across the top centre of the view;
  the current section is highlighted. Turn around now sits at the bottom right of the stage. No console tables in the room any more (the owner removed them).
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
- Every plinth in the museum is Siena marble (`plinthMat`, drawn by `marbleTexture()`); the walls' dado keeps the
  plaster `stoneMat`, so the plinths stand off it. The one-line switch to white marble is the `plinthMat` colour/map.
- The wing sculptures (Venus with the Apple, Cupid with the Lyre, Venus Italica, Costanza Bonarelli) have
  walk-up stops and write-ups too (21 Sept 2026): `SCULPTURE_NOTES` entries make a stop for any spot; the loader
  works out the room and the wall from the spot's position (`room`, `back`, accent and eyebrow follow the room).
- The four corner pedestals hold bust-sized pieces: a Roman head of Ariadne (Musée Saint-Raymond, Toulouse, CC BY —
  the reclining Sleeping Ariadne cast was tried first and rejected as too big for a bust plinth), at the far left;
  Beatrice d'Este and Antinous as Dionysus (the Bacchus reference: the owner does not drink and wants guests told
  to enjoy the wine anyway) either side of the entrance arch, welcoming; and on the far-right pedestal, since
  25 Sept 2026, **the hourglass** (`hourglass()`): a brass-framed glass whose sand runs from the site's opening
  (18 Sept 2026) to the wedding, with DAYS / n / UNTIL SIENA engraved on three lines on a plaque on the pedestal's face, refreshed
  every minute (`setHourglass`, `WEDDING`; the bulbs have an antique profile, broad low and drawing out to a long neck; the sand masses are lathed from the bulb's own profile so their surface
  meets the glass, and the top bulb never quite fills nor the bottom quite empties, so both read as sand in glass). The falling sand
  is a fine thread with 90 grains running down it (`tickSand`), speeding up as they fall and spreading a little as they land; the
  stream is re-scaled to run from the neck to the peak of the bottom pile whatever the level (`HOURGLASS.thread`). It has a stop of its own (`sc_hourglass`, made at build time, with a
  write-up in STATIONS) and clicks like a sculpture. Bacchus's and Ariadne's write-ups point at each other across
  the room; Apollo's was rewritten. Isabella of Aragon was removed the same day (the owner did not like her;
  `isabella.glb` stays in assets/sculpture, unused). Bernini's Costanza Bonarelli replaced the Laurana woman in Wing II. The owner did NOT
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
  `wheel.png` (the wheel art, downsized), `back.png` (the printed monogram back) and `MEASUREMENTS.txt` (the
  numbers the build is made from).
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
- Turn around (`#turn`, at the bottom right of the stage): a half turn on the spot, levelling the view; turning again
  restores the stop's tilt and height. Hidden while the save-the-date or invitation is held, and until the entrance
  motto has gone.
- One themed cursor everywhere: Cupid's arrow, as two pre-rendered PNGs named in `:root` (`--cur` is
  `assets/cursor.png`, and `--cur-on`, `assets/cursor-on.png`, for anything clickable: rose heart, gold glow; they were
  SVG data-URIs until 24 Sept 2026, but an SVG cursor flashed the default arrow on every change). `gallery3d.js` sets `canvas.style.cursor = 'var(--cur-on)'` and
  keeps re-probing for ~100 frames after a move ends, so the cursor is never stale. The save-the-date's wheel
  keeps the ordinary grab hand on purpose.
- The info panel's text is large and bright, and eases in afresh (`.fresh`) whenever `paintLabel` changes it:
  the owner found the write-ups too easy to miss.
- "Go ahead – touch the art": a small pill at the bottom centre of the stage (`#hint`), pointer-events none.
  The owner chose the wording and the place; she did not want an icon beside it.

**Navigation**
- Stops (`STATIONS`) are referred to by **id**, never by index (`ST.w1`, `ST.detTable`, …).
  `tour: false` marks stops reached only by clicking (skipped by Walk on and the Up key).
  Ids in `STATIONS` itself: atrium, kelly, kelly1, kelly2, anthony, anthony2, anthonyCard, anthonyCase, anthonyAmelia,
  w1, w1close, w1a, w1b, w1graces, w1amaryllis, w1union, w1mars, w2, w2close, w2a, w2b, w2utrecht, w2ruoppolo,
  w2parnassus, w2nastagio, det, detTable, detMain, detSchedule, detTravel, detStay, detFrontL, detFrontR, detShop,
  detClose, detVolvelle, detInvite. More are added to it as the scene is built, so they are not in that list: the
  details-room picture close-ups (`pic<index>`), the sculpture walk-ups (`sc_<spotId>`, as each scan loads) and
  `sc_hourglass`.
- A stop may name where Step back leads (`back: 'detTable'`); otherwise Step back goes to the room's entry stop, then the atrium.
- Click **doorways** (invisible arch-shaped panes), **pictures/frames/plaques/the table**
  (`userData.station`, and `userData.closer` for a piece's own close-up, reached by a second click from its wall's stop).
- **Step back** (the compass's down arrow, or the Down key) goes one level: a picture → the room's entry stop → the atrium.
  **Walk on** (the up arrow, or the Up key) advances the tour.
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
- Navigation (24 Sept 2026): a compass (a cross of arrows round the "Go ahead" hint, `#compass`) at the bottom
  centre of the view, sized compactly (28 px arrows, ~80 px tall) so it sits in the band under the walls'
  "click here" buttons at the details-room stops even on a 760 px-high window. (It used to move to the bottom-left
  corner at a details-room picture close-up; the owner asked on 25 Sept 2026 that it never move, so it stays put): up = Walk on
  (`tourStep(1)`, kept as `[data-fwd]`), down = Step back (`#back`, dimmed at the atrium's own stop), left/right =
  `sideStep(+1/-1)`: the nearest stop in the room that faces ~90 degrees that way and is not behind you (wall stops
  preferred over close-ups), else a quarter turn on the spot. The arrow keys do the same. Turn around stays bottom
  right. It fades in only after the entrance motto has gone.
  The old Step back / Walk on pills at the top are gone. Harness: `steps=goto:id,left,right,fwd,back,...`.
- Mouse-look (`LOOK`, `updateLook()`): the view leans up to ~6 deg sideways and ~3 deg up/down towards the
  cursor, easing back when it leaves the canvas; applied only at draw time (`camera.rotation` = cam + LOOK), so
  nothing about stops or routes sees it. Off while the save-the-date or invitation is held. The harness's
  `build.sh` rewrites that camera.rotation line to add its `pitch=` offset, so keep the line's text in step.
- Free look in the details room: at stops marked `look: 'free'` (entry, table, the six section stops) the cursor
  in the outer part of the screen (`LOOK.edge`) turns the view that way, up to `LOOK.spin` rad/s, folded into
  `cam.yaw` so it persists and walks start from it, but never more than `LOOK.limit` (a quarter turn) from the
  stop's own facing, so you cannot spin round and lose your bearings. Off at close-ups, walk-ups, the stand, during walks and cards.
- Frame rate while walking: the cursor's ray test is the dearest thing in a frame, so it runs only when the mouse
  moves (and for ~100 frames after a walk ends), not on every frame of a walk (`updatePointer`); and the sculpture
  scans (55k-118k triangles each) are left OUT of it (`raycast = () => {}`), each carrying an
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

## 4c. The arcade (`game/`) — 24 Sept 2026

Playable pieces, in plain code. `game/arcade.js` is the shell: the overlay (`#arcade`, gilt frame, pixel canvas
scaled to the screen, touch pad on coarse pointers, Esc/cross to close), keyboard + touch input, a fixed 60 Hz
step, sprite sheets with a drawn-in-code fallback, a 4x6 pixel font, and `Arcade.attract(id)`: the game's title
screen on a canvas, redrawn a few times a second, for a picture frame. A game registers `Arcade.games[id] =
{ title, w, h, create(api) -> { update, draw, drawTitle } }`.

`game/italy.js` — GETTING TO ITALY, a Donkey Kong-style barrel-jumper: six platforms from Departures to the villa
gate, ladders, three items (passport, ticket, bouquet or ring), hazards: suitcases from the baggage belt, CANCELLED
paper planes, a rain cloud (a slip, no life lost) and a Vespa. Choose bride or groom; the other waits at the gate. Score, 5000-point time
bonus, three lives. Sprites: `assets/game/bride.png` and `groom.png`, 9 frames of 32x32 in a row (stand, walk 1,
walk 2, climb 1, climb 2, jump, hit, win, slip); made by the owner in PixelLab (raw exports live in the repo root folders `8bit assets/`, `8bit bride and groom/`,
`plain plane/`, `bouquet 8 bit/`, which are git-ignored; the later batches, `more 8 bit assets for games/`,
`even more 8 bit assets/` and `newest game 8bit assets/`, are tracked in git); the sheets were assembled from single poses (idle, walk,
climb from behind, jump, knocked down, celebrate, slip) with a pure-python PNG script in the session log. All the
other art (suitcases x6, planes, cloud, Vespa, belt, passport, ticket, ring, bouquet) is hers too, drawn at game
scale with nearest-neighbour from `api.image()`. The code-drawn figures remain as fallbacks.

The atrium walls click like the wings (24 Sept 2026): any frame on Kelly's or Anthony's wall goes to the wall's
centred stop (`station` = the main frame's stop); from there a small frame steps you across (`closer`), and Step
back returns to the wall (`back:`). The panel under the view has a FIXED height (the write-up column is
`calc(font * 5.2 + 44px)`, since 25 Sept 2026, was 6.48 + 54, and scrolls if longer), because the 3D view is re-fitted
to the stage and a panel that grows with its text made the picture stretch at stops with long write-ups. A
ResizeObserver on `#stage` re-fits inside the draw loop as a safety net. Scripts are stamped with `Date.now()`
by a small loader in both pages, so a browser never runs a stale copy after a change; the harness build swaps
the loader for plain tags.
Where it hangs: the small frame to the left of Anthony's main frame, further from the doors (`anthony2`, `game: 'menu'` on its stop: the arcade's menu, `Arcade.games.menu`, lists `Arcade.menuList`; planned titles show as coming soon; a game launched from it gets `back: 'menu'` so Esc returns to the list)
is a lit screen showing the attract loop; arriving shows the write-up; a second click on the frame, or the panel's Play button, opens the game
(`openArcade()` in gallery3d.js); closing it leaves you before the frame. The mobile edition has a card in the atrium chapter.
Vercel serves `/game/*`. Test page: `game/test.html?sim=title|select|run` (`run` steps the game deterministically
with `Arcade.step`, no timers; headless Chrome's timers are unreliable). Harness: `.work/game` is a symlink.

`game/piazza.js` — CROSS THE PIAZZA, a Frogger: twelve rows of 22 px from Via di Citta up to the Duomo's door:
four street lanes (Vespas, Fiat 500s), the Campo pavement with a gelato cart, four piazza lanes (tour groups,
pigeons, a nonna), the steps, the door with the other half of the couple. Hop a column or a row per key press;
`LANES` sets each row's kind, direction, speed and gap. Sprites: `bride-topdown.png`/`groom-topdown.png` (9 frames
of 32x32: idle/walk facing N, S, E, W, then knocked down, assembled from the PixelLab rotations). The traffic, the
crowd and the door are the owner's files, loaded with `api.image()`: `vespa.png`, `fiat1.png`–`fiat4.png` and
`tourist1.png`/`tourist2.png` (each car or group picks one), `nonna.png`, `pigeon.png`, `gelato.png` (the cart) and
`duomo.png` (the door). Each has a code-drawn stand-in (`FIAT`, `TOURIST`, `NONNA`, `PIGEON`, `CART`, a red block
for the Vespa, a plain doorway for the Duomo) that shows until the file loads, or if it is missing.

`game/bouquet.js` — CATCH THE BOUQUET: night on the terrace; bouquets (+100), rings (+300) and champagne (+50)
fall (consecutive bouquet catches multiply, x2 to x5; a drop resets), cake and pigeons cost a life; 45 seconds, quickening (`KINDS` sets each thing's odds, size and worth).
Uses the side-view sheets and the owner's `bouquet.png`, `ring.png`, `champagne.png`, `cake.png` and
`pigeon-flying.png` (the falling pigeon), each with a code-drawn stand-in (`GLASS`, `CAKE`, `PIGEON`, and small
drawings for the bouquet and ring) until the file loads, or if it is missing.

`game/flight.js` — FLIGHT TO SIENA, a one-button flier: space/jump lifts the plane (`plane-plain.png`; no pilot is
drawn in it, the chosen figure shows only on the select screen), gravity pulls it down; rings (+10; a miss or a clip is only a miss), storm clouds and
birds come at you over rolling hills while the sky goes dawn to dusk; 30 rings (`GOAL`) and the villa arrives, you
glide down and land. Scoring spreads by skill: consecutive rings multiply (x2..x5, a miss resets), bouquets
(+150) and champagne (+75) drift by, 200 a life left at the landing, +500 for a flight with no hits. The owner's files: storm, swallow (a gull), villa, Golden Gate, Liberty, liner, whale,
Eiffel, Colosseum, Pisa; Paris (a mansard block as the landmark, two Haussmann fronts tiled as the street) and Florence (the Duomo, with a
rooftops file passing first) are the owner's too; the code-drawn streets remain as fallbacks.

The scoreboard (25 Sept 2026): `api/scores.js` at the repo root is a Vercel serverless function backed by
Upstash Redis (created through Vercel's marketplace; its env vars are injected by Vercel). GET returns the top
ten for a game; POST takes { game, name (3 letters), score }, refuses a short list of words and scores above a
per-game ceiling, rate-limits by address, keeps the best hundred in a sorted set, and returns the board and the
rank. In the shell, `Arcade.board` handles the ENTER YOUR INITIALS screen and the board; each game opens it once
at 'over'/'won' (`S.boarded`), defers update() to it while it is on, and draws it last. The menu shows each
game's top three. `game/test-board.html` mocks the API for looking at the screens.

`game/seating.js` — THE SEATING CHART, a falling-blocks puzzle set in a chapel: guest groups (`KINDS` — a couple,
the family, four friends, the wedding party, colleagues, the cousins, the in-laws, the odd plus-one) fall as
tetrominoes of little pixel guests (`figure()`: women and men by seed, four hairstyles, dress or shirt-and-tie)
into 8 x 14 pews split by an aisle (`sx()`). A full pew sits and shuffles forward (100/300/500/800 x level),
each seat is +10, a couple seated together +50 and a heart; 96 guests seated wins (vows, +1000 and the hearts).
Level rises every six pews. Up turns, down hurries, space seats. HUD is one burgundy line on top (seated, pews,
score, hearts), NEXT sits left of the altar, the "X HAVE ARRIVED" caption under the pews. No named guests and no
bride/groom sprites (the owner asked for both). No character select: it is the hosts' game.

All five games live in one cabinet (the arcade menu).

## 5. Known loose ends / ideas not yet done

_Brought up to date 25 Sept 2026 (the repo at `3e55499`)._

**Open, in whatever order the owner chooses**
- **RSVP, steps 2 and 3.** Step 1 (the postcard and the curtain) is built, but a posted card is kept only in that
  guest's own browser (`ka-rsvp`). Still to do: somewhere to store the replies (the guest store) and a personal
  link for each guest. Needed from the owner first: the card's final questions and the columns of her guest list.
  (The arcade's scoreboard already runs on Upstash Redis through Vercel, `api/scores.js`.)
- **The phone edition** (`mobile/`, §4b) is behind the 3D build: Anthony's artifacts, the three hidden pets, the
  RSVP postcard and the hourglass are not in it yet.
- **Photographs for the atrium walls.** The four photo frames (three on Kelly's wall, Anthony's main frame; his
  other frame is the arcade screen) are still empty (`blank: true` in `ATRIUM_PICTURES`), and their write-ups say
  "Photographs to come." (`meta: 'Placeholder'`).
- **The two oval frames** either side of the centrepiece on the details room's end wall are empty.
- **The wall texts** (`CARDS`, the "Read the full details" cards) are placeholder text, most of it "To be
  confirmed."; the anecdotes in the pictures' and sculptures' write-ups are drafts.
- **Sound**: not started; the owner has not decided whether she wants it.

**Offered, not done**
- Pietra serena (grey stone) trim; compressing the sculpture files (about 26 MB in `assets/sculpture/`); moving the
  details-room side-wall tour stops to the room's middle.

**Declined by the owner** (do not offer these again)
- Petals drifting down in Wing I, and a walk whose pace scales with distance (short hops gentle, long crossings
  quicker) plus a very slight head-bob: both declined 25 Sept 2026; the walking stays as it is.

**Housekeeping**
- Download size: the doors wait until every picture and scan has loaded. On 25 Sept 2026 the gallery's JPEGs were
  re-saved at quality 85 with their pixel sizes kept (the postcard copies of Primavera and Amaryllis cut to 2048 px
  wide), taking the load from ~92 MB to ~69 MB (~61 MB over the wire; Vercel brotli-compresses the `.glb` scans).
  Save new pictures the same way. Later the same day the postcard rack moved to small copies in `assets/rack/` (twice a
  card's size; 0.6 MB instead of 10.6 MB of full-size pictures), and the scans were rewritten by
  `tools/compact_glb.py` (no stored normals, the loaders compute them; 16-bit indices; Amelia's colors as bytes):
  26 MB -> 14 MB. That evening they were compressed with gltfpack (meshopt): 14 MB -> 3.3 MB, compared side by side with
  no visible change. The gallery now loads ~39 MB (~36 MB over the wire), from ~92 MB that morning.
  A new or re-converted sculpture: `convert_scan.py` (or `reduce_glb.py`), then `compact_glb.py`, then
  `gltfpack -i IN.glb -o assets/sculpture/NAME.glb -cc` (gltfpack 1.3, the macOS build from
  github.com/zeux/meshoptimizer/releases; not kept in the repo). The files then need the meshopt decoder, which the
  page loads from `assets/lib/three/` (`gltfLoaderReady` in gallery3d.js); `plainAttr` unpacks their 16-bit positions
  for the marble shading.
- WebP for the paintings was tested on 26 Sept 2026 and not adopted: at the quality that matches today's JPEGs it
  saves only ~14% (from the originals; less from the re-saved JPEGs), about 4 MB in all, for a second copy of every
  picture and a fallback for old Safari.
- Graphics memory: the pictures take roughly 700 MB of it once loaded (4 bytes a pixel plus mipmaps), which could
  trouble an iPad (iPads get the 3D build). Measured 25 Sept 2026 with the harness's `texneed` hook: on the largest
  screens most paintings are already drawn at or above their file's size, so smaller files would soften them; only
  Primavera and the Birth of Venus are much bigger than they are ever drawn. Shrinking those two (to 2,600 px, and
  Primavera to exactly half) and a smaller per-device set (1,280 px) were tried and compared side by side: all
  visibly softer (fine flowers, faces). The owner's rule is no visible change, so none of it was kept. If iPads
  are ever seen to reload the page, a lighter set for them is the lever, accepting a slight softening there.
- The 3D build's performance has only been checked on a desktop (phones get the mobile edition). Wing I carries
  ~300k triangles of roses.
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
| `texneed=1800` | For every flat picture, the most screen pixels one of its texels covers from any stop, on a view that many device pixels tall (JSON in `<pre id="texneed">`; read it with `--dump-dom`). Under 1: the file is bigger than it is ever drawn. |

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
  architectural detail, objects in the wings, real sculpture, camera moves, ui, clickable doorways, on the table
  (the save-the-date; the pop-up invitation), the gift-shop stand, the postcard (RSVP) and the curtain, loop.
- Botanical pieces use `InstancedMesh` via the small `instancer()` helper.
- Match the file's existing comment style: short, explains *why*.

## 8. Version control

The repo is on GitHub (private): github.com/kellywheelis/wedding-website, pushed over SSH (key in ~/.ssh/id_ed25519,
added to the owner's account 23 Sept 2026). Push after each approved commit. Vercel deploys from it (kaweddinggallery.vercel.app), from the repo root with
no build step: the root `vercel.json` sends phones to `/mobile/` (§4b) and rewrites `/`, `/gallery3d.js`, `/assets/*`,
`/game/*` and `/mobile/*` to the files inside this folder; `api/scores.js` is served as `/api/scores` (§4c). Its
`headers` (26 Sept 2026) let browsers keep `/assets/*` and `/mobile/img/*` for an hour without asking again, then
use their copy while checking for a newer one in the background (`stale-while-revalidate`, a week): return visits
open almost at once, and a changed picture reaches a returning guest within the hour, or on their visit after
that. The page and `gallery3d.js` are not covered, so a code change is seen straight away. The root
`.vercelignore` keeps the working material off the live site: the `.md` files, the `*.dc.html` prototypes and their
scripts, `walls.json`, `tools/`, `uploads/` and `screenshots/`, and (since 25 Sept 2026) the three tracked folders of
raw game-art exports at the repo root. The history is in `git log`; each commit message says
what changed.

Commit with `git add -A && git commit` from the repo root. The owner asks for commits explicitly;
don't commit or push on your own initiative.
