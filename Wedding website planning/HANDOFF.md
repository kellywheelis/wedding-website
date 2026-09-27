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
| `lego/figs.js`, `lego/station.js` | The LEGO shelf's figures and the build station (§4, "The LEGO shelf"); served at `/lego/` (vercel.json). |
| `assets/lego/`, `tools/lego_relief.py` | Kelly's LEGO Sunflowers: the maps made from her photo, and the script that makes them (§4, "The LEGO shelf"). |
| `rsvp-admin.html`, `../api/guest.js`, `../api/admin.js`, `../api/_lib.js`, `../api/_private.js`, `../api/_notify.js` | The RSVP and guest sign-in (§5, "The RSVP"): the owner's private page, and the server side at the repository root. The private wall texts live in `api/_private.js`; the reply emails in `api/_notify.js`. |
| `tools/dev_server.mjs`, `tools/make_mobile_content.py` | A local stand-in for the live site with its api (§5); the phone guide's text builder (§4b). |
| `assets/og-preview.jpg`, `assets/icons/` | The card a shared link shows (1200x630: the entry doors without their buttons, rendered with the harness's `gate=1&nobtn=1`), named in both pages' `og:` tags with absolute URLs; and the gilt KA on burgundy as the browser-tab icon, the home-screen icon (`apple-touch-icon.png`, 180 px) and `favicon.ico` (`vercel.json` also serves the last two at the site root). Both pages are titled "Kelly & Anthony · The Gallery". Added 26 Sept 2026. |
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
- **Atrium galleries**: Kelly's wall (LEFT) holds her photographs and the LEGO Sunflowers frame; Anthony's (RIGHT) the
  main frame and the arcade (his right-hand frame was removed on 25 Sept 2026 to make room for his artifacts) —
  `ATRIUM_PICTURES` — each wall with an engraved brass name plaque (`GALLERY_NAMES`).
- **Kelly's photographs** (26-27 Sept 2026): from her folder "kelly gallery wall portraits" on the Desktop, prepared into
  `assets/kelly-wall/` (her ovals and circles came cut out on clear grounds: trimmed to their edges, the edge colours
  carried outward so no rim shows). Their arrangement is data, `assets/kelly-wall/layout.json`, which gallery3d.js reads
  before it builds anything (`KELLY_WALL`; each photo: src, z, y, h, aspect, oval, frame 'gilt' | 'plain', fw, and a mat
  as `mat` or `box`; the plaque's z, y). She arranges it herself in the **wall editor**, `tools/wall-editor.html`, at
  http://127.0.0.1:8020/wall-editor on the local dev server: her wall to scale (pilasters, the Sunflowers and shelf, the
  plaque), drag with snapping to the others' centres and edges, size, frame (gilt / black and gold), frame width, a white
  mat, a tray of all thirteen photos, undo, three starting options (A symmetric salon, B series in rows, C matted
  grid), and Make symmetric (`makeSymmetric`: the centre line through the largest photo; pairs across it mirrored at
  their average distance and height; what stands on the line between the top and the lowest spaced evenly). Blank
  frames (27 Sept 2026): placeholders for photographs to come, `src: 'blank'` carrying their own `aspect` and `oval`
  (oval, circle, portrait, landscape, square; any size, frame, mat); the gallery hangs them as empty mounts with no
  close-up, the phone as empty mounts. Every photograph on a wall also has a small copy, `<name>-s.jpg` (480 px on the long
  side), which the phone's wall panels show (the full one opens in the lightbox; a missing small copy falls back to the
  full): make one whenever a photograph is added. Anthony's selfie is `selfie.jpg` (renamed from its first name, since
  file names show in the page's code). A piece can be locked (`locked: true`, the Locked box when it is selected; a padlock
  shows on it): it cannot be dragged or nudged, and Make symmetric builds around it (its partner mirrors it; on the
  centre line it stays and the pieces between it and the next fixed one are spaced evenly). Anthony's main portrait is
  locked at its twin's place (z -2.0, y 2.309), at her wish. The editor keeps every piece of a saved layout, known or not (it once dropped
  what its catalogue lacked, and a note typed into Anthony's catalogue hid his round portrait from it for a while). Save posts to the dev server (`/__save-wall?wall=kelly|anthony`, local only), which writes that wall's layout.json; reload the gallery
  to see it. The `kelly` stop stands back to take in whatever she hangs (`KELLY_VIEW`); each photo has a close-up stop
  (`kellyPhoto0`..). Mats (`matBoard`), black oval frames and slimmer mouldings (`fw`) were added to `framedPicture`,
  `ornateFrame` and `ornateOvalFrame` for her. Her first request was one salon cluster; she found it one big cluster, then
  "a living room wall", and asked for curated options or to arrange them herself. The wall left of her photographs is
  kept for her artifacts, as Anthony's are across the hall.
- **Anthony's photographs** (27 Sept 2026, for now: his childhood photos and perhaps a better formal portrait are still
  to come): five from ~/Desktop/anthony gallery wall portraits, in `assets/anthony-wall/` with its own layout.json, hung
  where his big empty frame was (removed), between the arcade and his artifacts. The code is shared: `PHOTO_WALLS`,
  `wallFrame` / `WALL_VIEW` (both walls' stops share one height, tilt and distance), `photoBox`; close-up stops `anthonyPhoto0`..; the wall editor switches walls (`?wall=anthony`, drawn from
  the hall so its left is -z, with the arcade, card, case and Amelia drawn in; option A "Portrait column"). His heights
  match hers (the owner's wish): the portrait's centre at 2.309 as hers, the round one at her top row's, the snapshots
  at her bottom row's, the plaque at 1.2; and the arcade screen now hangs at `SUN_Y`, level with the Sunflowers across
  the hall (it was 2.12; the `anthony2` stop's eye follows). On the phone his panel comes before the arcade
  (`wallSection` / `drawWall` in mobile.js draw both walls). His wall's write-up is "Write-up to come.".
  His whole arrangement was then moved 52 cm along the hall so its main portrait mirrors hers exactly (z -2.0, y 2.309;
  his plaque at hers, z -2.0, y 1.2). His main portrait was then made her main portrait's twin (84 x 107 cm outside, the
  picture 65 x 88, moulding 9.5): his oval reshaped to hers (aspect 0.743; main-portrait.jpg cut from his PNG 19 px off
  the top and 37 off the bottom), the pieces beside it moved out 5.5 cm and the one below down 2.5 cm to keep his gaps. His artifacts were moved to suit (the owner, 27 Sept 2026; `ART` at the top of
  gallery3d.js): the card slab and the case centred in the wall between his photographs (with her placeholders) and the
  pilaster (about 18 cm clear each side), 15 cm higher (y 2.1); Amelia's plinth under the
  middle of the pair and 30 cm taller, so she stands in view from his wall's stop. Their close-up stops follow; the
  wall editor draws them from the same numbers.
- The LEGO Sunflowers and the build station's shelf were raised
  together (27 Sept 2026, her wish, to balance the photographs): `SUN_Y` (2.31, it was 1.88) sets the Sunflowers' centre,
  level with her main portrait; the shelf, the kelly2 frame and the kelly2 / kellyShelf stops all follow it, so the
  joke's petal still lands on the accessories bin. The wall editor draws them from the same number.
  On the phone (27 Sept 2026), "The atrium · Kelly" comes before her Sunflowers: the same layout.json drawn small on a
  plaster panel (`kwall` in mobile.js / mobile.css: gilt or black frames, ovals, mats, the plaque), each photo a button
  to the lightbox, where ovals open as ovals. It reads the file at runtime, so it follows the wall editor with no
  rebuild. The line under "The two galleries" now says only Anthony's frame is waiting. Not in the sideways gallery view.
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
  Fireworks (26 Sept 2026, the owner's wish): when every work is seen and all three are found, five small rockets go up
  from the tally's top edge and burst in the gallery's colors, about four seconds, once (`celebrate` / `fireworks`,
  remembered in localStorage `ka-fireworks`; left out under Reduce motion). They wait for the tally to be showing and
  every sculpture's stop to exist, since the count is short until the scans load; a collection already complete gets
  them when the tally first shows. Asked to look more real, they are a fine spray: about ninety thin sparks a burst, each
  a streak that shortens to a glittering speck as it slows, droops and twinkles out, in deep colors with a faint dark
  edge so they read on the cream walls and the burgundy ones (streaks batched into a few paths a burst, for speed).
  The rockets climb on a slight curve, leaning to one side near the top (the sideways drift lags the climb).
  Harness: `fireworks=1.2` draws the moment 1.2 s in (a comma list lays moments over one another, to trace the paths); `complete=1` fills the collection and reports when they fire.
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
  letterbox. Step 1 of that was built on 25 Sept 2026 (see "The RSVP postcard and the curtain" above); the store for
  the replies, guest sign-in and the private page followed on 26 Sept 2026 (§5, "The RSVP").
- Layout (the owner's, 21 Sept): the END WALL carries only the main frame (she found clusters beside it too small).
  LEFT wall: 2 Schedule (entrance side) and 3 Travel (far side). RIGHT wall: 1 Main details (entrance side) and
  4 Accommodations, one good-sized picture (far side). ENTRANCE wall: 5 Logistics (left), 6 Guest policies (right).
  7 Registry & extras is the gift-shop stand. (Those were the section numbers of her plan. Since 26 Sept 2026 the
  numbers in the panel's eyebrows follow the tour loop instead, as she asked: 1 Main details, 2 Guest policies,
  3 Logistics, 4 Schedule, 5 Travel, 6 Accommodations, 7 the gift shop. The tour is what the compass's up arrow and
  the Up key step through; the old "Walk on" button is gone, its name kept only in the code and the aria-label.)
  She rejected the Aurora on the travel wall (the file is not in the repo)
  and three versions of one painting in a cluster. More pictures may come; Villa Cetinale art is still open (none
  exists in open collections, and she does not want the invitation artist's drawing used).
- Stops: `detMain`, `detFrontR`, `detFrontL`, `detSchedule`, `detTravel`, `detStay`, `detShop`, all in the Walk on tour in
  that order after `det` and `detTable` (a loop round the walls since 26 Sept 2026, with the gift shop last as the owner
  asked: 40 s of walking instead of 51 in the section-number order, which crossed the room four times). `detClose`,
  `detVolvelle`, `detInvite` are click-only. Walk on follows the order of `STATIONS`, skipping `tour: false`.
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
- Wall texts: `CARD_TITLES` here, their text in `api/_private.js` (fetched after sign-in, §5 "The RSVP"), named by a
  stop's `card:`; the panel shows "Read the full details", which opens a cream
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
  w2parnassus, w2nastagio, det, detTable, detMain, detFrontR, detFrontL, detSchedule, detTravel, detStay, detShop,
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
  26 Sept 2026, at the owner's request: a walk's top speed rises with its length (`WALK.long`: up to 45% faster
  from 15 m, with a proportionally longer ramp at each end), so the longest crossings take ~10 s instead of ~13;
  short hops are unchanged. The first turn is taken on the spot only above `WALK.bigTurn` = 100 degrees (was 52),
  so a 90-degree turn off a side wall now happens while stepping off, the step-off slowed until the view has come
  round. Checked with `trace` over 14 walks: same end positions, no faster view swing, the table still avoided.
  `trace` now says which walks turn on the spot first, and takes `bigturn=` / `long=` to try other settings.
  Then the owner found turns whipped (in and out of the wings, Turn around, turning to face side paintings). Measured:
  on-the-spot turns used `easeInOut`, peaking at twice their average speed (Turn around ~210 deg/s, the turn to
  Anthony's wall ~270), and walks swung at up to 126 deg/s. Now every swing is held to `WALK.turnRate` = 90 deg/s:
  turn legs use the gentler `smooth` curve (peak 1.5x average) and are lengthened to fit (`startLeg`), so Turn around
  takes ~3 s; walks use the same cap, keep the old pace through corners (the long-walk speed-up is for straights),
  corners slow a little more (`WALK.slow` 0.5), and the last turn to face a picture starts earlier (`lookOut`).
  `trace` reports `fast-swing` (time spent swinging faster than 75 deg/s).
  Paths (26 Sept 2026): corners on the hall's centre line in the crossing (out of a wing, or off the line into one)
  are rounded with a 2 m radius instead of 0.9 (`WALK.crossing`; open floor there, the curve stays inside the hall)
  and slow the walk half as much (a corner's weight in `alongPath`): same walk times, a third less fast swinging
  (measured over 18 wing walks). The Birth of Venus and Primavera close-ups (`w1close`, `w2close`) are on the Walk on
  tour. Measured and left alone: the routes to the details room's entrance-wall sections walk in and turn back,
  but a stop facing the wall you came in through needs that half-turn whatever the path. Harness: `routes=1`
  (length and turning of every route between the main stops), `tour=1` (the Walk on order), `crossing=` on `trace`.
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
- Touch screens (26 Sept 2026, `touchLook`): a finger has no cursor to hold at the edge, so a one-finger drag looks
  round instead: at `look: 'free'` stops it turns the view (the scene follows the finger, same `LOOK.limit`), elsewhere
  it gives the cursor's few-degree lean and eases back on release. A tap stays a tap (under 10 px of movement); the
  click arriving within 400 ms of a drag's end is ignored. A touch no longer drives the cursor lean or edge-turn.
- "Reduce motion" (26 Sept 2026, `REDUCED`, `motionClock`, `calmAfterRender`): with the system setting on, or `?calm` on
  the address, the frame on screen when a walk or turn begins is copied onto a canvas laid over the view (right after
  it is drawn, the only moment WebGL pixels can be read back); the move runs 8 times faster unseen beneath it, and at
  the stop that copy dissolves (450 ms) into the new view: a crossfade, no dark moment (the owner chose it over a fade
  to black). Routes and end positions are the same (checked over 11 walks). Walks and turns read their own clock,
  `mnow`, held for the one copied frame. The postcard rack's idle spin stops too.
- Frame rate while walking: the cursor's ray test is the dearest thing in a frame, so it runs only when the mouse
  moves (and for ~100 frames after a walk ends), not on every frame of a walk (`updatePointer`); and the sculpture
  scans (55k-118k triangles each) are left OUT of it (`raycast = () => {}`), each carrying an
  invisible box (`colorWrite: false`) that the cursor and clicks meet instead.
  Harness: `trace=id,id,...` walks each and reports seconds, biggest per-frame step and turn, frames inside
  the table keep-out (should be 0) and how far off the stop it ended (should be 0).
- A warm point-light **glow** follows the mouse in the gallery.

**The LEGO shelf and build station** (26 Sept 2026, the owner's idea; she is an avid LEGO builder)
- Under the frame across from the arcade (Kelly's wall, `kelly2`), a white shelf: on its left four LEGO storage bins
  (red, blue, yellow, green) of loose parts labeled HEADS, TORSOS, LEGS, ACCESSORIES (`loosePart` in lego/figs.js,
  kept inside the walls by their bounding boxes) over a brass BUILD STATION plaque; on its right a tan studded
  baseplate for the figures (`SHELF`, `paintShelf` in gallery3d.js; stop `kellyShelf`, `build: true`, whose panel
  button reads "Build a figure"). A signed-in household sees its own figures standing there, and nobody else's, ever
  (the owner's rule); signed out, the baseplate is bare. At the stop a click on the shelf, or the button, opens the
  build station (`openShelf`, after `needGuest`).
- `lego/figs.js`: the parts catalog and `buildFigure()`, a LEGO-style minifigure modeled in millimeters (about 40 tall,
  shown at 11 cm on the shelf): 30 hair styles and hats, 13 hair colors, 16 faces (beards take the hair color), 7 skin
  tones, 29 torsos, 17 legs and skirts, 22 things to hold, plain to Italian (gondolier, Azzurri jersey, Vespa helmet,
  gelato, pizza, mandolin, prosecco, a map of Italy). Faces and torsos are canvas prints; everything else is geometry.
  A saved figure is `{ name, p: { hair, hc, face, skin, torso, legs, acc }, when }`; unknown ids fall back to the first
  part, so renaming a part never breaks a saved figure (but changing an id changes what old figures show).
- `lego/station.js`: the pop-up (a still preview, the figure facing forward, with two arrows that turn it a quarter at a
  time to either side view and no further, `S.view` -2..2, a wheel with arrows per part, swatches for hair
  color and skin tone, "Surprise me", a name up to 20 letters, one figure per seat, "Put it on the shelf" / "Take it
  off the shelf"), shared by the 3D gallery and the phone guide, and `snapshot()` for still pictures. The name box is
  the third place the phone keyboard may appear (with the RSVP and the arcade initials); it is never focused on its own.
- Revised 26 Sept 2026 after the owner tried it: hair rebuilt as thick moulded caps (`cap`: an ellipsoid shell whose
  inside hugs the head, `hr`, so no skin shows through; `vol` adds moulded volume) with 15 plain styles and more; faces'
  features printed a third larger (`FACE.k`); facial hair (13) and glasses (12) are their own wheels, `fh` and `gl`,
  printed on their own sheets over the face (the mouth cut clear of any beard; a cut-out lens never erases the eyes);
  an old saved face that was a beard or glasses is read as face + layer (`OLD_FACES`, `normal()`). Arms end in a wrist
  peg and a proper C hand (`handGeo`), tipped forward. Shorts are two pieces per leg (no lip); the long skirt is LEGO's
  sloped dress piece, the gowns a bell (`skirtGeo`), the short skirts over bare legs. New torsos: the KA monogram tee (gold
  on burgundy, from assets/lego/monogram-ka-256.png; `picturesReady` waits for it before snapshots) and six tourist
  shirts. Joke pieces (the owner's list): pirate hat, cutlass, a parrot on the shoulder (`shoulder: true`), Viking and
  aviator and firefighter helmets, cowboy hat, three lightsabers, a ray gun, two wands, rolling pin, whisk, frying pan.
  The parts bins are full: 60 heads, 34 torsos, 32 legs, 56 accessories at under half the figures' size, dropped one by
  one onto a coarse height map so they heap over the low front rim, on a dark fill block, and baked into one mesh per
  material per bin (`bake`, with BufferGeometryUtils' mergeGeometries). Test pages for all of it are in the session's
  scratch (`figgrid.html`, `figclose.html`); harness `bincount=1` reports the bins' counts.
- Second round, same day (the owner's notes): removed the receding, shoulder-length, top knot, low bun, big curls and
  spiky hair, the chin strap, the espresso and the selfie phone; "Bald" is "No hair". Rebuilt: the fedora (pinched crown,
  snap brim), flower crown (a green band set with five-petal flowers), bridal veil (opaque white, a pearl tiara), party hat
  (striped, sitting on the hair), pirate hat (the captain's bicorne: tall half-moons front and back, gold trim, skull);
  the skirts (`skirtGeo` was inside-out, so its inner wall showed and legs seemed to cut through; now A-line, a fuller
  gown with a sash, short skirts over bare legs); the toothy smile's lines kept on the teeth; and the whisk, pizza,
  bouquet, gelato, camera, baguette, map, suitcase, mandolin, cake, ring box and guidebook. Held things follow the hand's
  tipped grip (`gripRot`) unless `level: true` (they sit or hang level: plate, box, case, book, map, pizza, mandolin).
  New: a Pet wheel (`PETS`, a figure's `pet`): four dogs, four cats and a turtle at the figure's feet, two butterflies
  perched on its free hand. On the shelf each figure stands on its own small plinth (`onPlinth`: marble, a gray foot,
  a brass plate with the figure's name, 27 x 22 mm, the figure set back when it has a pet); more than fit are shown a
  little smaller. The phone guide draws the plinths in CSS under each picture.
- Third round, same day: the hair shell (`cap`) was inside-out, so its thin inner layer showed (darker than the buns and
  tails built from the same color, odd at the head's stud); it is the right way out now. Hats are their own wheel
  (`HATS`, a figure's `hat`, the owner's wish), worn over any hair: `cut` is where the hat meets the head, and under a
  hat `capMesh` starts the hair there (the global `CUT`), anything of the hair above it (a bun) left off; a figure saved
  with a hat as its hair is read as hair + hat (`normal()`). Removed the quiff and short curls; the side part has a groove
  and a darker crease; new pigtails (a center part, tails tied behind the ears, hanging down); the aviator helmet's
  goggles sit clear of it. The pets were remade as LEGO's are, single moulded forms (`rbox`: rounded blocks, smooth
  shading via BufferGeometryUtils' `toCreasedNormals`) with printed eyes and noses: a sitting dog with collar and tag, a
  standing cat on two leg panels, a turtle with a printed shell, butterflies with printed wings. The bin labels are
  larger and bold. The Sunflowers sit in the gold frame now, as the arcade screen does (the frame's blank picture is
  hidden, `SUN.k` 1.0 / 0.54 so the piece fits its opening). The shelf's write-up is the owner's wording.
- The shelf itself is a museum wall console (the owner asked for it nicer and in keeping): a white statuary marble top
  (`marbleStatuary`) with a gilt ogee along its front edge, a full-depth walnut body (`walnutTable`) with a gilt bead
  beneath, the brass BUILD STATION plaque centered on its front, and two carved gilt scroll brackets (`corbel`, with
  volutes and a leaf). On-screen text says "minifigure" throughout (the owner's word), not "figure".
- Fourth round (26 Sept, the owner's notes; supersedes the rounds above where they differ): the side part's darker
  crease is gone (it stood off the hair as a stray strand), leaving the molded groove. The map of Italy is removed. The
  guidebook is a plain book ("Book": LEGO's unprinted one, a dark red cover with a raised edge, cream pages, a rounded
  spine with two ridges). Held things stand upright in the hand again: `gripRot` and `level` are gone (tipped with the
  hand, wands and rolling pins leaned toward the viewer), and the wizard wand's own slight lean is gone too. The
  suitcase is bigger and stands on the floor (`floor: true`): an upright case on four wheels with a top handle, ribs and
  the SIENA sticker, beside the figure's right foot, or just in front of it when a pet stands at the other side. On a
  plinth with a suitcase, `onPlinth` centers what stands on it (feet, case, pet; the hands may reach past the edge, as
  with a pet alone) and shrinks the figure only if that would not fit (only suitcase + turtle, by 3.6%). Harness
  `shelfp=[{parts},...]` puts chosen figures on the gallery shelf.
- Fifth round (26 Sept; supersedes the fourth where they differ): the book is gone. The suitcase is LEGO's own (part 4449,
  measured from its LDraw model: 16 x 9.6 x 6.4 mm, two halves meeting at a seam, a round bar on two posts, two small
  feet), reddish brown, at 0.85 of true size, standing on the floor just behind the figure's right leg with most of it
  showing (a little further behind it when a pet stands at the other side). `onPlinth` never shrinks the figure now: with
  a suitcase and a pet together the plinth is made a little larger instead (about 30-32 x 22-24 mm); the shelf's spacing
  leaves room. The pizza slice is minifigure-sized and held up by its crust with the hand turned on its wrist (`across:
  true`: the grip across, its opening up; `armMesh` keeps the hand in `userData.hand`). Six more long hairstyles: center
  part, side-swept, over one shoulder (a flattened lock, `strand()`), side braid, half up (a small knot), long curls with
  bangs. Three more hats: Batman cowl (it hides the hair, `hidesHair`), Disney ears (the Mickey ear hat), a facehugger
  (its fingers sit outside the hair, `hat.build(p)` getting the figure's parts; over the crown the top pair follows the
  hair's own curve, `reach`, or they sank into it). A Darth Vader helmet was made and then removed at her word. The
  Hawaiian shirt was redrawn (big hibiscus and leaves all over, an open camp collar, buttons: `hibiscus`, `leaf`) and the
  lemon shirt too (an Amalfi print of lemons with leaves in even staggered rows, `lemon`; the V-neck drawn over it).
  After that commit (a65ada6), the painter's smock was redrawn: a gathered yoke, a big soft burgundy artist's bow, a
  stitched patch pocket with two brushes, irregular paint splatters with drips and spray, and a brush wiped across it.
  The facehugger's fingers are now measured against the actual hair and head under them (`buildFigure` passes them to
  `hat.build(p, under)`; rays from outside find the surface at each point of each finger, which is lifted 0.3 mm clear
  where it would sink in): a fringe had hidden the top pair where they leave the body. Its body was made a little bigger
  (1.14 x 1.16, raised 0.3 mm) so the tips of printed eyes and lashes no longer show beside it.
- Server: `api/guest.js` sends `figs` with sign-in and takes `{ action: 'figs', figs }` (the household's whole shelf);
  store `figs:<id>`, and `figlog` keeps every save for the owner's record. The private page shows each household's
  figures with pictures ("The LEGO shelf", `paintLego` in rsvp-admin.html).
- Phone: a "The LEGO Shelf" block in the atrium chapter after Anthony's pieces (text from the `kellyShelf` stop via
  content.js), the household's figures as `snapshot()` pictures on a CSS shelf, and "Build a figure". The phone page
  and the private page have an import map for three.js, loaded only when needed. Not in the sideways gallery view.
- LEGO's Fair Play rules for fan sites: never the LEGO logo; "LEGO" only as an adjective; its disclaimer is in Credits.
- (27 Sept 2026) The Sunflowers' colour and normal maps are WebP (`sunflowers.webp`, `sunflowers-normal.webp`: 1.35 MB
  instead of 2.1 MB as JPEG, compared at the kelly2 stop: 99.8% of pixels unchanged); tools/lego_relief.py writes WebP.
- **Her LEGO Art Sunflowers** (31215: 2,615 pieces, 41 x 54 cm with LEGO's frame, which she keeps on) hang in place of
  the `kelly2` frame, at that frame's size: modeled at true size and the group scaled by `SUN.k` (1.94, so 0.80 x 1.05 m;
  at true size the owner found it too small to take in). `SUN`, `sun` in gallery3d.js; the frame shows again if the
  maps fail to load. Its surface is her own phone's original photo of her build, hung on a stone wall in soft daylight
  (uploads/lego-sunflowers/PXL_20260926_203331025.jpg, 3072 x 4080, 26 Sept 2026; its frame about 2,240 px across);
  `tools/lego_relief.py` straightens it to the set's size and makes, in assets/lego/, the color map (2050 x 2700), a
  height map (1230 x 1620, 0..25 mm above the picture's plate, a displacement on a 246 x 324 segment plane), a normal map
  from the heights plus the photo's own fine detail (2050 x 2700: studs, tile seams, petal slats), the piece that
  comes loose (its own picture, heights and normals; the color map shows the yellow studded plate beneath it, 4 mm
  below the petal's lowest point, in the petal's yellow at 64% (the owner wanted it a touch darker than 74%, so the gap
  shows; nearer the petal, it poked through as a brown stain)), and the phone guide's picture (mobile/img/sunflowers.jpg, whole, the piece in place).
  The owner's changes, 26 Sept 2026: the piece that falls is the yellow petal just left of the central flower's orange
  center (`PIECE`, a hand-traced wedge with a rounded end; it was the green leaf cluster at the lower left, too big), and
  the stems, sand green in her build (olive in the photo's warm light), are the bright green of the leaves: their pixels
  (the curved and upright stems and the sand green wedges under the central flower) are recolored keeping their shading,
  followed into the shadows where they run under other pieces, and kept only as groups of 400 px or more (so a shaded
  spot on the wall and the curled tendrils on the heads stay as they are); never the heads' lime centers.
  Glare (the owner, same day): daylight on the shiny plastic left whitish patches in the photo, worst on the top rows of
  tiles and the top flower's slats. The script moves each washed-out pixel of the wall, the heads and the petals back
  toward its material's usual hue and saturation (measured below the glare, `yy > 300`), capping its brightness a little
  above the usual, in proportion to how washed out it is; a piece of another color is left alone; whitish glare high on
  the wall counts as wall (flat), not a raised part; and pale wall seen at a head's edge (joined to the wall outside it)
  is told from a pale speck of glare on a slat. Depths were measured from her photos taken low along its side
  (uploads/lego-sunflowers/, 26 Sept 2026): the frame is a brick box 34 mm deep (tan bricks drawn on its sides, and four
  dark brown round tiles along each long side at 13.5, 39, 61 and 86.5% of its length, 10 mm from the wall); the
  picture's plate 28 mm off the wall, 6 mm below the frame's top; the seven big round tan heads are placed by hand in the
  script (`HEADS`: center, radius, and a lift where one is built in front of another), each a stacked cone, its disc 21 mm
  up and its petal tips 9 mm; the yellow and wilting flowers 6 to 12 mm (`CENTERS` raise their middles); leaves and
  tendrils as far; stems 4, vase 3 (a hand-drawn region, as its yellow shoulder matches the petals' color). The wall is
  told from raised parts by hue and saturation, not brightness. Compared side by side with her low photos (harness
  `solo=1`): the frame, its dots and the heights match; the one known difference is that at very low angles the
  displaced photo reads as soft mounds where the real plates have crisp stacked edges, a limit of relief from one photo.
  Quality fixes after the owner saw it (blown out, flashing): the backing box sits 5 mm behind the picture's plate (level
  with it, the two z-fought in stripes); the frame's tan rim in the height map sits just under the box's top for the same
  reason; roughness 0.55 and normal scale 0.7 (at 0.3 the hall's lights washed the colors out and the fine relief
  glittered as the view moved); and raised parts rise a few px inside their colored edge (a MinFilter on the heights), so
  their steep sides take their own color, not a pale halo of the wall's. The color map is limited by the photo: hers came
  through Facebook at 1536 x 2040 (uploads/lego-sunflowers-kelly.jpeg), and was replaced the same day by her phone's
  original, about 1.7 times as sharp. The maps load about 2.7 MB. The wall test (`pale`) allows a slight sheen (tiles
  along the top, shaded by the frame, read as wall); head circles are filled solid (a shiny gray petal is head, not wall).
  No 3D model of the set exists online; other people's photos (some from Reddit) were used only as a guide, never shipped.
  Its stop `kelly2` stands 1.2 m out (eye 1.86), so the whole piece fills the view with the parts bins at its foot,
  `lego: true`. A click on it there runs the joke (`sunflowerGag`, `updateGag`, owner's idea): the view first leans in 15 cm, rising to
  the piece's middle and looking square at it, level (tilting up read as looking up at it; closer was more than she
  wanted), over 0.85 s (`GAG.lean`, applied to the camera in `frame()` after its own placement), a beat's pause, then the petal works loose, falls
  turning onto the ACCESSORIES bin below and bounces, the view glances left, pauses, right, pauses, back (`GAG.yaw`, added
  to the camera's yaw), and the petal floats back up in an arc and presses home with a small give of the whole piece,
  and the view eases back to the stop over 0.9 s; about seven seconds. Reduce motion: no lean, no glance, a shorter drop. Walking away mid-joke puts all back.
  Harness: `goto=kelly,kelly2&gag=1.6` shows the joke 1.6 s in (its clock is pinned, as the capture redraws; add `fov=34`
  for a closer look from the stop, as the petal is small); `solo=1`
  draws the Sunflowers alone on gray with the page hidden, to be seen from any angle (`x`, `z`, `yaw`, `eye`).

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

- **Text lives in one place.** `mobile/content.js` is GENERATED from the 3D build's own tables by
  `tools/make_mobile_content.py` (saved as a file on 26 Sept 2026; until then the generator lived only in a session
  log, which is how the phone edition fell three days behind). After editing text in `gallery3d.js`: build the
  harness, save `index.html?dump=1&credits=1` with headless Chrome's `--dump-dom` (the `dump` hook exports every text
  table, the atrium `NOTES`, `HIDDEN`, `POSTCARDS` and the countdown dates), then
  `python3 tools/make_mobile_content.py DUMP.html`. What the 3D tables do not hold (chapter heroes, the principal
  works' framing, each sculpture card's file) is set at the top of the script. Do not hand-edit content.js.
- **Pictures**: `mobile/img/` holds phone-sized copies (`sips`, 1400 px and 700 px `-s` versions for srcset) of
  every painting, the card assets, and the postcards (`room-*.jpg`, `sc-*.jpg`) rendered with the harness at
  900x1200 with `clean=1&slow=1` (`tools/harness/shotp.sh OUT URL W H SCALE BUDGET`), cropped to 900x1150 and
  saved at JPEG quality 88. Re-rendered 26 Sept 2026 (the curtain, the moved table, the marble shading, Bacchus at
  the door): rooms from their entry stops (`goto=atrium` / `w1` / `w2` / `det`, the shop `goto=det,detShop`), each
  sculpture from its walk-up (`goto=<room>,sc_<spot>`), Venus and Mars from `x=±0.4&z=2.4&yaw=±2.345&pitch=-0.1`.
  The phone lists the details sections in reading order (Main, Schedule, Travel, Accommodations, Logistics,
  Policies, RSVP) and numbers them 1 to 7 in that order; the 3D build numbers them in its walking order.
  (The harness's `clean=1` hides the collection tally too since 26 Sept: the first re-render caught its top edge.)
- **Added 26 Sept 2026**: Anthony's three artifacts on the atrium chapter (`atrium.artifacts`, cards
  `img/art-<stop>.jpg` from their close-up stops); the hourglass with a live count of days (`det.hourglass`, card
  `img/sc-hourglass.jpg`, the wedding time from the 3D build's `WEDDING`); and the three who hid: pictures with a pet
  carry `hidden` (from `HIDDEN`), and in the lightbox a tap on the animal (its box plus a 5% margin, measured inside
  the gilt border) names it and fills a star in the "Hidden bonuses" line under the atrium's intro. Finds are kept in
  localStorage `ka-found` by picture, the same key as the 3D build, so they carry across. The phone copies of
  Primavera, Amaryllis and Good Government were re-made from `assets/` then, as the 23 Sept copies predated the pets.
  "Tap to look closer" sits directly under each frame (the owner's request).
- **The gallery view** (26 Sept 2026, the owner chose it over a phone 3D build): held sideways (`(orientation:
  landscape) and (max-height: 500px)`, past the doors) the guide is hidden and `#gv` shows the museum as a walk, one
  work to a screen: 57 slides built from the same CONTENT (`slides` in mobile.js: each room's wide hero
  `img/room-*-wide.jpg`, rendered 1600x760 from the room's entry stop and cropped to 1600x720; the paintings; wall
  texts; sculptures and artifacts; the arcade; the hourglass; the details sections in reading order with their
  "Tap here for details" cards; the gift shop last). A CSS scroll-snap strip swipes between them, with arrows, room
  buttons and a counter; a tap on a work slides in its write-up (a tap on a hidden pet finds it, same `petHit` /
  `petNote` as the lightbox). The save-the-date and the invitation stay upright-only (a note says so). It opens at the
  room you were reading (`curRoom`, from the room observer and plain scroll events; a link to `#w2` etc. opens there)
  and turning upright returns to the room you were viewing, with an instant jump (the page's own scrolling is smooth).
  The change is caught on the media query and on `resize` (older iPhones lack `addEventListener` on it). Headless
  Chrome sends neither when a test frame is resized, and plays no smooth scrolling: the tests dispatch `resize`
  themselves and switch `scroll-behavior` off. A hint under the atrium intro says to turn the phone.
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
Removing a score (26 Sept 2026, the owner's wish): a guest may take their own initials off. Each posted score's member
in the sorted set is NAME:when:secret; POST returns that id, and the device keeps it (localStorage `ka-scores`). The
board never shows the secret, so `POST { game, remove: id }` works only from the device that posted it; scores from
before have no secret and stay. The shell draws a small X beside this device's own entries on the board, and in the
menu's top-three line (where the whole entry is the tap target); a click or tap (canvas `click`, hit spots gathered
each frame in `hits`) opens `Arcade.ask`, a YES / NO box drawn over the game with NO lit first (arrows change it,
start answers, Esc or the close button means no). The local dev server has sorted sets, so the real API can be tried
there.
On a phone the initials are typed through an invisible text box (`showEntry`), the only thing on the phone guide that
may raise the keyboard (the owner's rule: the keyboard belongs to the RSVP and the initials, nowhere else). Since 26 Sept
2026 `hideEntry` also takes it out of the layout (display none): left in place, it sat over the middle of the game
screen and a tap there mid-game raised the keyboard, which guests reported as the keyboard popping up while tapping.
The games are portrait (224x288, like an upright cabinet): on a phone held sideways the shell's fit left the screen
about 170x220 above its controls. So on a touch device held sideways (`(orientation: landscape) and (max-height:
500px)`, the same test as the phone's gallery view; iPads are taller and unaffected) a "Turn your phone upright to
play" cover (`.ar-turn`) sits over the arcade and `loop` skips its updates, so the game waits; the close button stays
on top. The gallery view's arcade slide plays the attract loop and says to turn upright rather than opening the
arcade (the owner preferred that to a landscape version).
The phone guide's own wording is made touch-friendly by `phone()` in mobile.js ("click" becomes "tap", the mouse
becomes a tilt of the phone), so the text can stay as the 3D gallery writes it.

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

_Brought up to date 26 Sept 2026 (after `b5897ba`)._

**Open, in whatever order the owner chooses**
- **The guest list.** The RSVP is built (below, "The RSVP"); what waits is the owner's guest list (save-the-dates not
  yet out; the in-laws' names to come). She pastes it into her private page; per household: names, phone number(s),
  seats, events. Two sample households may be loaded on the live store for trying it; loading the real list replaces
  them. Then she prints the invitation codes from the page for the packs. Her step-by-step guide to all of this is a
  Claude Doc, "Guest List & RSVP: Setup Guide" (https://claude.ai/code/artifact/0874a20e-d028-4d36-b80d-c3a081a8c869);
  keep it in step when the RSVP changes.

**The RSVP** (built 26 Sept 2026; the owner's design throughout)
- Anyone may walk the gallery; the wall texts (addresses, schedule, travel, hotels, policies, registry) and the RSVP
  are for guests. In the 3D gift shop anyone may flip through the postcards; "This one" (turning a card over to
  write on it) asks for sign-in, then turns the chosen card over (the owner's wish, 26 Sept 2026). A household signs in either by typing one of its phone numbers AND its own code (VENUS-4827, a word
  from the gallery and four digits, printed in its invitation pack), or by scanning the QR code in the pack, a link
  `kaweddinggallery.com/?k=<key>` whose 22-character key signs it in with nothing typed (the key is not the printed
  code, so the code alone is never enough). She chose household codes over one shared code, and phone plus code on
  computers; no texts are ever sent. A device stays signed in (localStorage `ka-guest`, shared by the 3D gallery and
  the phone guide, which are on one address); "Guest sign-in" / "Signed in · names" in the 3D bottom bar and a line
  under the phone guide's atrium intro open the sign-in, or sign out.
- Server: `api/guest.js` (sign in, the household's data and reply and the private texts, post a reply, sign out) and
  `api/admin.js` (the private page), sharing `api/_lib.js` (the store's layout is described at its top; the events
  and the code words live there) and `api/_private.js` (the wall texts, moved out of gallery3d.js; files in api/ that
  start with "_" are not endpoints). Upstash Redis, the scoreboard's store, read as plain text
  (`automaticDeserialization: false`, or an id like "1e5..." comes back a number). Ten wrong sign-ins per address per
  ten minutes, then a wait. A reply is checked against the household: never more seats than it has, never an event it
  is not invited to.
- The card (3D: the postcard; phone: the "Write your postcard" sheet in the gift shop section and on the gallery
  view's shop slide): yes/no, seats ("2 of 4 seats"), an Events box that opens a window of only that household's
  events (tick, Confirm, back to the card; `pcEv` / `rsEv`), plus-one, allergies or dietary needs, a note, the name.
  Posted, it shows stamped with "Change my reply". The events: Welcome movie & pizza night (Thu Apr 22), Siena day
  (Fri 23), Gelato pool day (Sun 25), Farewell brunch (Mon 26); Saturday, the wedding, is the card's yes/no.
- The private page: `rsvp-admin.html`, served at `/rsvp-admin` (vercel.json). It holds nothing: the key arrives once
  in its link (`/rsvp-admin#key=...`), is kept in that browser, and every call sends it (header `x-admin-key`); only
  the key's SHA-256 is in `api/_lib.js` (`ADMIN_SHA256`). The key was given to the owner, never saved in the project.
  It shows totals (households replied, seats coming, each event's seats), every household with its code, phones and
  reply, the dietary list, a spreadsheet download (with each household's QR link), "Print the invitation codes" (a
  card per household: names, QR code, code; drawn by qrcode-generator 1.4.4 from cdnjs, pinned by its SRI hash), and
  the guest list paste box (tab- or comma-separated, header row optional, an optional Code column to keep chosen
  codes). Loading replaces the list but keeps each household's code, QR key and reply when its code, names or a phone
  number carries over; a household with no phone is allowed and can sign in only by QR.
- The deadline (26 Sept 2026, the owner's choice: eight weeks before the wedding): replies close once Saturday,
  February 27, 2027 has ended everywhere, noon UTC on the 28th (`RSVP_BY`, `RSVP_CLOSES` and `rsvpState` in
  `api/_lib.js`). Every signed-in answer carries `rsvp: { open, by }`. After it `api/guest.js` refuses a reply (403,
  with `rsvp`), and both cards (`openPostcards` in gallery3d.js, `showPosted` in mobile.js) show the posted card
  without "Change my reply", or, to a household that never replied, a card's picture and "The RSVP closed on …;
  please get in touch". Signing in and the details still work; the private page's Clear still works, but a cleared
  household cannot post again. The Guest Policies card gives the date. To move it: `RSVP_CLOSES` and `RSVP_BY`, and
  the Guest Policies text in `api/_private.js`.
- Reply emails (26 Sept 2026, the owner's request): each posted or changed reply is emailed to the couple by
  `api/_notify.js` through Resend's API (a plain `fetch`, no package; five seconds at most, and a failure is only
  logged, never the guest's problem). The subject says who and what ("Changed RSVP from …: Yes, 3 of 4 seats"); a
  change carries a "Before:" line. Off until the Vercel project has `RESEND_API_KEY` and `RSVP_NOTIFY_TO`. It sends
  from Resend's test address, `onboarding@resend.dev`, which only reaches the Resend account's own email; to add
  Anthony, verify kaweddinggallery.com with Resend and change `FROM`. The dev server prints the emails instead of
  sending them (`DEV_MAIL=fail` plays a refusal).
- The preview guest (the owner's, 26 Sept 2026, for showing friends the gallery): phone 777-777-7777 and the code
  test123 (`PREVIEW` in `api/_lib.js`) sign in as "Guest Preview", 4 seats, every event, the details cards shown. It is
  not in the store and never appears on the private page: its token is the word `preview`, its RSVP and minifigures
  come back to the page but are never saved (and no email is sent), and the pages do not remember the sign-in
  (`d.preview`: no `ka-guest`; its post does not keep the curtain open, `GUEST.preview`). A refresh or a new visit
  starts fresh, as if for the first time.
- Trying it locally: `tools/dev_server.mjs` runs the site and the api against an in-memory store (Node.js needed;
  none is installed on this Mac, a copy was used from the session's scratch folder). With `DEV_EXTRA=<folder>` it
  also serves test pages at `/__test/` and gives them `window.__ka` (openPostcards, postCard, openCard, GUEST);
  with `DEV_RSVP_CLOSED=N` the deadline falls N seconds after it starts (0: already past). The harness has no
  server: `fakeguest=1|2` stands in a signed-in household for renders (`postcard=` uses it).
- **Kept out of search engines** (27 Sept 2026, the owner's choice): every response carries `X-Robots-Tag: noindex,
  nofollow, noimageindex` (vercel.json) and the gallery and phone pages a matching robots meta tag (the private page
  already had one). Guests reach the site by its link and the invitation QR codes.
- **Real-phone checks.** The phone edition caught up with the 3D build on 26 Sept 2026 (§4b: Anthony's artifacts,
  the hourglass and the three who hid in `0f9ea7e`, the gallery view in `7c00b14`, the RSVP in `b5897ba`). On her
  own phone the owner found the gallery view and the arcade's pause when held sideways working (26 Sept 2026). Not
  yet tried on a real phone: scanning a printed invitation QR code.
- **Photographs for the atrium walls.** Kelly's are hung (26 Sept 2026) and on the phone (from the same layout file); her
  wall's write-up is "The Kelly Collection" (her choice of four options, 27 Sept 2026). Each photograph's own write-up is
  still to come (she will go through them; the close-ups and the phone's lightbox show the wall's title for now). Anthony's wall has
  five of his photographs for now (27 Sept 2026); its write-up is "Write-up to come." (`meta: 'Placeholder'`).
- **The two oval frames** either side of the centrepiece on the details room's end wall are empty.
- **The wall texts** (the "Read the full details" cards; `CARDS` in `api/_private.js`, served only to signed-in
  guests) are placeholder text, most of it "To be confirmed." (the RSVP deadline under Guest Policies was filled
  in 26 Sept 2026); the anecdotes in the pictures' and sculptures' write-ups are drafts.
- **Sound**: not started; the owner has not decided whether she wants it.

**Offered, not done**
- Pietra serena (grey stone) trim; moving the details-room side-wall tour stops to the room's middle.
- An iPad check of the 3D build (graphics memory, see Housekeeping), which needs the owner's iPad.

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
| `midwalk=id&frames=n` | Start walking to a stop and stop n frames in, drawing each frame: shows the view part-way (with `calm`, what "Reduce motion" shows mid-move). |
| `fakeguest=1\|2`, `pcev=1\|ok` | A signed-in household stood in without a server (1: The Sample Family, all four events; 2: Sample Friends, two); open the card's events window, or tick and confirm it. |
| `tdrag=dx`, `calm` | A simulated finger dragged dx px across the view, then a tap: reports the turn, the lean and whether the tap was ignored. `calm` turns on "Reduce motion". |
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
