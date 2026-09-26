# Sculpture scans — sources, licences, and how each was converted

All scans were downloaded from Wikimedia Commons (direct, no login) and converted with
`tools/convert_scan.py`, which simplifies the mesh, stands it upright, and scales it to 1 unit
tall standing on y = 0. The gallery's `SCULPTURES` list (in `gallery3d.js`) sets the real height.

The raw downloads (~520 MB in total) are NOT kept in the project; re-download from the URLs below.
Searched and not found: any 3D scan of the sculpture at Villa Cetinale itself, or of any Cupid and Psyche group.
The Roman busts (young-man, woman-1, woman-2, augustus), the Laurana woman, and a Faun / Bacchus head / Hygieia that
were tried briefly, were all replaced on 22 Sept 2026 and their files removed.

| File | Work | Scan by / holding museum | Licence | Raw file | Convert with |
|---|---|---|---|---|---|
| `venus-italica.glb` | Venus Italica, Antonio Canova | Rama · Musées d'art et d'histoire de Genève | CC BY-SA 3.0 FR | https://upload.wikimedia.org/wikipedia/commons/4/4a/Venus_Italica-Antonio_Canova-MAHG_1846-0003-High_poly.stl | `--up z --tris 90000` |
| `venus-apple.glb` | Venus with the Apple, Bertel Thorvaldsen, 1809 | Statens Museum for Kunst, Copenhagen | Public domain | https://upload.wikimedia.org/wikipedia/commons/c/cb/Bertel_Thorvaldsen%2C_Venus_med_%C3%A6blet%2C_1809%2C_KMS6004%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 80000` |
| `amor-lyre.glb` | Cupid Playing the Lyre, Bertel Thorvaldsen | Statens Museum for Kunst | Public domain | https://upload.wikimedia.org/wikipedia/commons/4/48/Bertel_Thorvaldsen%2C_Den_lyrespillende_Amor%2C_%2C_KMS5680%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |
| `apollo-belvedere.glb` | Apollo Belvedere (cast of the Vatican marble) | Statens Museum for Kunst | CC0 | https://upload.wikimedia.org/wikipedia/commons/6/61/Apollo_Belvedere_-_KAS353.stl | `--up y --tris 110000`  (this one is Y-up; with `--up z` it lies on its back) |
| `diana.glb` | Diana of Villa Bartholoni ("Diane chasseresse", Diana the Huntress), unknown sculptor, 1831, marble, Geneva; in the pose of the Diana of Versailles | Rama | Scan CC BY-SA 3.0 FR / CC BY-SA 2.0 FR / CeCILL (the statue itself is public domain); corrected 25 Sept 2026, it was listed as public domain | https://upload.wikimedia.org/wikipedia/commons/d/da/Diana_of_Villa_Bartholoni-High_poly-001.stl | `--up z --tris 100000` |
| `venus-capitoline.glb` | The Capitoline Venus (cast of the marble in the Capitoline Museums, Rome) | Statens Museum for Kunst, KAS493 | Public domain | https://upload.wikimedia.org/wikipedia/commons/9/9c/Ubekendt%2C_Afrodite%2C_Den_Capitolinske_Venus%2C_%2C_KAS493%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 110000` |
| `mars-ludovisi.glb` | The Ludovisi Mars (Ares Ludovisi), with Eros at his feet (cast of the marble in Palazzo Altemps, Rome) | Statens Museum for Kunst, KAS250 | Public domain | https://upload.wikimedia.org/wikipedia/commons/3/3f/Ubekendt%2C_Siddende_ung_mand%2C_Ares_Ludovisi%2C_Jason_%2C_%2C_KAS250%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 120000` |
| `ariadne-head.glb` | Head of Ariadne, Roman, 2nd century (replaced the reclining *Sleeping Ariadne* cast, KAS134, which was too large for a bust plinth; removed 21 Sept 2026) | Musée Saint-Raymond, Toulouse · Scan the World | Attribution (CC BY) | https://upload.wikimedia.org/wikipedia/commons/a/af/Msr-ariane-head-repaired.stl | `--up z --tris 90000`, then `turn: Math.PI` in `SCULPTURES` |
| `antinous-dionysus.glb` | Antinous as Dionysus (cast of the Vatican marble) | Statens Museum for Kunst, KAS1513 | Public domain | https://upload.wikimedia.org/wikipedia/commons/8/8b/Ubekendt%2C_Buste_fra_statue_af_Antinoos_som_Dionysos%2C_med_efeukrans_med_druer%2C_%2C_KAS1513%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |
| `beatrice.glb` | Beatrice d'Este, after Gian Cristoforo Romano (cast of the Louvre marble) | Statens Museum for Kunst, KAS333 | Public domain | https://upload.wikimedia.org/wikipedia/commons/8/82/Ubekendt%2C_Portr%C3%A6t_af_Beatrice_d%27Este_1475-1497_%2C_%2C_KAS333%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |
| `isabella.glb` | Isabella of Aragon, attributed to Francesco Laurana (cast) | Statens Museum for Kunst, KAS894 | Public domain | https://upload.wikimedia.org/wikipedia/commons/c/c1/Ubekendt%2C_Portr%C3%A6t_af_kvinde%2C_Isabella_af_Aragonien_%2C_%2C_KAS894%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |
| `costanza.glb` | Costanza Bonarelli, Bernini (cast of the Bargello marble); in Wing II | Statens Museum for Kunst, KAS1819 | Public domain | https://upload.wikimedia.org/wikipedia/commons/b/bb/Ubekendt%2C_Portr%C3%A6t_af_Constanza_Bonarelli%2C_%2C_KAS1819%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |

Notes
- The share-alike (BY-SA) and "Attribution" files need crediting; the page's Credits panel does
  this from the `credit` text in `SCULPTURES`. The "Attribution" tag's full wording has not been read.
- When fetching from upload.wikimedia.org, send a descriptive User-Agent (`curl -A "…"`).
- Example: `python3 tools/convert_scan.py raw/apollo.stl assets/sculpture/apollo-belvedere.glb --up y --tris 110000`
- Other good candidates seen on Commons but not used: *Venus and Adonis* (Canova, MAH Genève,
  public domain, 20 MB), Venus de Milo (SMK cast), Castor and Pollux (SMK).
