# Wheelis · Alvarez — Wedding Site
### Progress & creative process
_Villa Cetinale, Sovicille (SI), Italy · 24 April 2027 · weekend of 22–26 April_

---

## Where the concept came from

The motto — *"I am a museum of everything I've ever loved…"* — drove everything.
Rather than decorate with a museum theme, the site **is** a museum: a building you
walk through.

The save-the-date volvelle already carried the line **"Two collections — one
exhibit,"** so the plan follows it literally:

| Wing | Event | Anchor work |
|---|---|---|
| **Wing I** | The ceremony | Botticelli, *The Birth of Venus*, c. 1485 |
| **Wing II** | The reception | Botticelli, *Primavera*, c. 1480 |
| **Exhibit Details** | Travel, lodging, program, RSVP | — |

*Venus* was chosen for tone, not for water: a woman given the whole centre of the
canvas, in gold light, unhurried — the register of the ceremony, and a nod to the
Wona Kassel dress. *Primavera* is the reception: a garden that refuses to stop,
tables dressed as banquet still life.

Both paintings hang an hour up the road in the Uffizi, which makes them geography
as well as reference.

### Rejected, and why
- **Invitation artwork** — not licensed for web use. The site borrows nothing from it.
  _Update, 20 Sept 2026: the illustrator has since agreed to the invitation itself being shown as
  an exhibit in the details room, credited to him on a plaque. The site's own design still borrows
  nothing from his artwork._
- **Restyled imitations of it** — worse than not using it at all.
- **Dutch still life, Veronese's *Cana*** — magnificent, wrong world; would have made
  the exhibit look assembled rather than curated.
- Curatorial rule held throughout: **Italian, c. 1480–1650, two to three works per wing.**

---

## The build, in order

1. **Scrolling pages** (three mechanics: invisible artist / walk the gallery / lit by
   attention) — rejected: a page can never feel like walking through a gallery.
2. **CSS-3D walkable gallery** — the right idea, the wrong engine. Endless clipping,
   smearing and white-outs because CSS has no real camera.
3. **WebGL rebuild (current)** — three.js with a real camera, real lighting, real
   depth. Every clipping problem disappeared.

### Current file
`The Gallery 3D.html` + `gallery3d.js` — the live build.
`The Gallery.dc.html` — the CSS-3D version, kept intact for reference.
`HANDOFF.md` — the full technical handoff: where everything is, how to run and test it.

---

## The building as built

_Updated 18 September 2026._

Plan, in metres, measured from the entrance standing point:

- **Entry hall (atrium)** — 5 m wide, running from a back wall at z +12 to the crossing. The
  back wall carries the inside face of the walnut entrance doors. Shallow pilasters mark each
  vault bay. Two small photo galleries face each other across the hall — **Kelly** on the left
  wall, **Anthony** on the right — three ornate frames each over an engraved brass name plaque.
- **Crossing** at z −7.5 — arched openings left and right, 2.6 m wide, springing 2.3 m, with
  moulded stone surrounds and keystones, and gilt numerals **I** and **II** above them.
- **Wing I** left, **Wing II** right — each 10 m deep, principal Botticelli on the end wall,
  two complementary plates on the side walls.
  - Wing I (Venus): urns of cascading roses flank the painting; Thorvaldsen's *Venus with the
    Apple* and *Cupid Playing the Lyre* stand on the side walls.
  - Wing II (Primavera): orange trees in terracotta pots flank the painting; Canova's
    *Venus Italica* and a Laurana bust stand on the side walls.
- **Details room** straight ahead through a third arch — now a 10 × 9 m salon after the
  Galleria Borghese reference: walls in the invitation burgundy over a pale dado, a gilt cornice,
  a coved ceiling with a sky panel, a 14-frame salon hang, a centre table, three gilt consoles,
  four Roman busts, and the *Apollo Belvedere* and a *Diana* flanking the principal picture.
- **Columns** — one pair, framing the details arch. A wall-mounted directory plaque above it.

**Materials:** warm plaster walls, pale honed stone slabs laid in staggered courses (drawn in
code), stone-coursed groin vaults, warm stone dressing (cornices, pilasters, surrounds). Carved
gilt frames throughout. Brass for plaques and picture lights.

**Ceiling:** true groin vaults over the hall and both wings — walls stop at the springing line
(3.95 m) and the vault sweeps 2.45 m to the crown, with diagonal ribs, an arch on every bay edge
and a carved boss at each crown. The details room has a coved ceiling instead.

**Movement:** three beats — square up, walk, turn. You never pass through a wall (or the
details-room table), and never face the details room when crossing between wings. Beyond the
bottom-bar buttons you can now click doorways, pictures, frames, plaques and the table;
**Step back** goes one level at a time; **Walk on** advances the tour; the two Botticellis and
the details room's principal pictures have close-up views.

**Entrance:** walnut frame-and-panel double doors with the brass KA monogram across the seam.
They part, the dark-gold motto rises over the atrium on a soft ivory haze, and fades.

**Sculpture:** real 3D scans from museum collections (see `assets/sculpture/SOURCES.md`), credited
in the page's Credits panel. No scans of Villa Cetinale's own sculpture exist online.

---

## Still to do

- Wing I's two complementary plates are still colour studies, not artwork. (Wing II's side walls now
  carry four paintings: van Utrecht's *Banquet Still Life* and Ruoppolo's *Still Life with Fruit* on "The Banquet"
  wall; Mantegna's *Parnassus* and Botticelli's Nastagio wedding banquet on "The Dancing" wall.)
- Every picture in the details room and both atrium galleries is a placeholder
  (`DETAIL_PICTURES` and `ATRIUM_PICTURES` in `gallery3d.js` — add `src: 'assets/…'` to hang one)
- Info-panel text marked "Placeholder" (the atrium galleries, the table, two entrance-wall frames)
- The save-the-date volvelle is on the details-room table and can be picked up and turned.
  The pop-up invitation stands beside it and opens, credited to its illustrator, Truong Hoai Vu
  (vuth.art), on a brass plaque: the condition of his permission to show it
- RSVP mechanism (needs a service — a static page can't collect responses)
- All dates/logistics beyond 24 April 2027 are placeholders pending decisions
- Check performance on phones (so far only seen on a desktop)

---

## Assets in use

`assets/birth-of-venus.jpg`, `assets/primavera.jpg` — public-domain Uffizi scans
`assets/tex-plaster.jpg` — wall plaster (the floor and vault textures are now drawn in code)
`assets/door-walnut-stile.jpg`, `-rail.jpg`, `-panel.jpg` — generated walnut grain for the entry doors
`assets/monogram-ka.png` — the KA monogram from the save-the-date (burgundy; used as a brass stencil on the doors)
`assets/sculpture/*.glb` — ten sculpture scans; sources and licences in `assets/sculpture/SOURCES.md`
`assets/ref-*.jpg` — reference photographs (`ref-terracotta.jpg` is the details-room reference)
No longer used by the live page: `tex-stone.jpg`, `tex-wood.jpg`, `tex-ceiling.jpg`, `tex-vault.jpg`
