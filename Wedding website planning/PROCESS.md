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

---

## The building as built

Plan, in metres, measured from the entrance standing point:

- **Entry hall** — 5 m wide, running from a back wall at z +12 to the crossing.
  Long unbroken walls both sides, intended for hung pictures.
- **Crossing** at z −7.5 — arched openings left and right, 2.6 m wide, springing 2.3 m.
- **Wing I** left, **Wing II** right — each 10 m deep, principal Botticelli on the end
  wall, two complementary plates on the side walls.
- **Exhibit Details** straight ahead through a third arch, ending at z −15.
- **Columns** — one pair, framing the details arch.

**Materials:** warm plaster walls, pale stone floor with cut joints, stone-coursed
groin vaults. Brass for signage and picture lights.

**Ceiling:** groin-vaulted throughout — hall and both wings. Walls stop at the
springing line (3.95 m) and the vault sweeps 2.45 m to the crown, with diagonal
groin ribs and transverse arches on every bay. No flat ceiling anywhere.

**Movement:** three beats — square up, walk, turn. You never pass through a wall and
never face the details hall when crossing between wings.

**Entrance:** walnut double doors with recessed panels and brass pulls. They part,
the gilded motto floats up over the atrium, shimmers, and fades.

---

## Still to do

- Brass WING I / WING II signage (currently placeholder textures)
- The four complementary plates are colour studies, not artwork
- Exhibit Details hall content: Visiting, Everything We Love, RSVP
- Pictures along the lengthened entry hall
- RSVP mechanism (needs a service — a static page can't collect responses)
- All dates/logistics beyond 24 April 2027 are placeholders pending decisions

---

## Assets in use

`assets/birth-of-venus.jpg`, `assets/primavera.jpg` — public-domain Uffizi scans
`assets/tex-plaster.jpg`, `tex-stone.jpg`, `tex-wood.jpg`, `tex-ceiling.jpg`
`assets/monogram-ka.png` — the KA monogram from the save-the-date
