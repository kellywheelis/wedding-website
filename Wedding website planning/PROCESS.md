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
  _Update, 21 Sept 2026: relaxed since. Each wing now hangs five pictures (its Botticelli and four on the side
  walls), two of them Flemish: van Dyck's Amaryllis and Mirtillo and van Utrecht's Banquet Still Life._

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

_Updated 18 September 2026; corrected 25 September 2026 (the full, current account is in `HANDOFF.md` §4)._

Plan, in metres, measured from the entrance standing point:

- **Entry hall (atrium)** — 5 m wide, running from a back wall at z +12 to the crossing. The
  back wall carries the inside face of the walnut entrance doors. Shallow pilasters mark each
  vault bay. Two small photo galleries face each other across the hall — **Kelly** on the left
  wall with three ornate frames, **Anthony** on the right with two (one of them the arcade's screen) and three
  of his artifacts — each wall with an engraved brass name plaque.
- **Crossing** at z −7.5 — arched openings left and right, 2.6 m wide, springing 2.3 m, with
  moulded stone surrounds and keystones, and gilt numerals **I** and **II** above them.
- **Wing I** left, **Wing II** right — each 10 m deep, principal Botticelli on the end wall,
  two pairs of pictures on the side walls.
  - Wing I (Venus): urns of cascading roses flank the painting; Thorvaldsen's *Venus with the
    Apple* and *Cupid Playing the Lyre* stand on the side walls. The side walls carry Furini's *Three Graces*
    and van Dyck's *Amaryllis and Mirtillo* ("The Procession"), and Veronese's *Happy Union* and *Mars and
    Venus United by Love* ("The Vows").
  - Wing II (Primavera): orange trees in terracotta pots flank the painting; Canova's
    *Venus Italica* and Bernini's bust of *Costanza Bonarelli* (it replaced a Laurana bust) stand on the side
    walls. The side walls carry van Utrecht's *Banquet Still Life* and Ruoppolo's *Still Life with Fruit* ("The
    Banquet"), and Mantegna's *Parnassus* and Botticelli's Nastagio wedding banquet ("The Dancing").
- **Details room** straight ahead through a third arch — now a 10 × 9 m salon after the
  Galleria Borghese reference: walls in the invitation burgundy over a pale dado, a gilt cornice,
  a coved ceiling with Tiepolo's sketch for a ceiling in its panel, a 16-frame salon hang, a centre table,
  four smaller pieces on corner pedestals (the three gilt consoles and four Roman busts are gone), and the
  *Apollo Belvedere* and a *Diana* flanking the principal picture. On the table, the save-the-date volvelle
  can be picked up and turned, and the pop-up invitation beside it opens, credited to its illustrator, Truong
  Hoai Vu (vuth.art), on a brass plaque: the condition of his permission to show it.
- **Columns** — one pair, framing the details arch. A wall-mounted directory plaque above it.

**Materials:** warm plaster walls, pale honed stone slabs laid in staggered courses (drawn in
code), stone-coursed groin vaults, warm stone dressing (cornices, pilasters, surrounds). Carved
gilt frames throughout, but for four small salon pictures in ebonised frames with a gilt slip. Brass for
plaques and picture lights.

**Ceiling:** true groin vaults over the hall and both wings — walls stop at the springing line
(3.95 m) and the vault sweeps 2.45 m to the crown, with diagonal ribs, an arch on every bay edge
and a carved boss at each crown. The details room has a coved ceiling instead.

**Movement:** one continuous walk (since 21 Sept 2026; at first it was three beats — square up, walk,
turn). You never pass through a wall (or the details-room table), and never face the details room when
crossing between wings. Beyond the bottom-bar buttons you can now click doorways, pictures, frames, plaques
and the table; a compass of arrows at the bottom of the view steps back one level at a time (down), walks on
along the tour (up) and looks to the neighbouring wall (left, right); the pictures in the wings and the
details room, and the sculptures there, have close-up views.

**Entrance:** walnut frame-and-panel double doors with the brass KA monogram across the seam.
They part, the dark-gold motto rises over the atrium on a soft ivory haze, and fades.

**Sculpture:** real 3D scans from museum collections (see `assets/sculpture/SOURCES.md`), credited
in the page's Credits panel. No scans of Villa Cetinale's own sculpture exist online.

---

## Still to do

_Brought up to date 25 Sept 2026. The full list, with what each item needs, is `HANDOFF.md` §5._

- RSVP, steps 2 and 3: somewhere to store the replies, and a personal link for each guest. Step 1 (the
  postcard from the gift shop, and the curtain it draws) is built; for now a posted card stays in the guest's
  own browser
- The phone edition (`mobile/`) is behind the 3D build: Anthony's artifacts, the three hidden pets, the RSVP
  postcard and the hourglass are not in it yet
- Photographs for the four atrium photo frames (still empty), and pictures for the two empty oval frames in
  the details room (`ATRIUM_PICTURES` and `DETAIL_PICTURES` in `gallery3d.js` — add `src: 'assets/…'` to hang one)
- The wall texts (the "Read the full details" cards) are placeholders, mostly "To be confirmed"; the
  write-ups' anecdotes are drafts
- Sound: not started; not yet decided
- Performance: the 3D build has only been checked on a desktop (phones get the mobile edition)

---

## Assets in use

`assets/birth-of-venus.jpg`, `assets/primavera.jpg` — public-domain Uffizi scans (`primavera.jpg` now has
Amelia painted into it; the untouched scan is `assets/postcard-primavera.jpg`)
`assets/tex-plaster.jpg` — wall plaster (the floor and vault textures are now drawn in code)
`assets/door-walnut-stile.jpg`, `-rail.jpg`, `-panel.jpg` — generated walnut grain for the entry doors
`assets/monogram-ka.png` — the KA monogram from the save-the-date (burgundy; used as a brass stencil on the doors)
`assets/sculpture/*.glb` — twelve sculpture scans (`isabella.glb` no longer used), and `amelia.glb` (Anthony's
dog, a 3D generation, not a scan); the scans' sources and licences in `assets/sculpture/SOURCES.md`
`assets/ref-*.jpg` — reference photographs (`ref-terracotta.jpg` is the details-room reference)
No longer used by the live page: `tex-stone.jpg`, `tex-wood.jpg`, `tex-ceiling.jpg`, `tex-vault.jpg`
