# Sculpture scans — sources, licences, and how each was converted

All scans were downloaded from Wikimedia Commons (direct, no login) and converted with
`tools/convert_scan.py`, which simplifies the mesh, stands it upright, and scales it to 1 unit
tall standing on y = 0. The gallery's `SCULPTURES` list (in `gallery3d.js`) sets the real height.

The raw downloads (~520 MB in total) are NOT kept in the project; re-download from the URLs below.
Searched and not found: any 3D scan of the sculpture at Villa Cetinale itself.

| File | Work | Scan by / holding museum | Licence | Raw file | Convert with |
|---|---|---|---|---|---|
| `venus-italica.glb` | Venus Italica, Antonio Canova | Rama · Musées d'art et d'histoire de Genève | CC BY-SA 3.0 FR | https://upload.wikimedia.org/wikipedia/commons/4/4a/Venus_Italica-Antonio_Canova-MAHG_1846-0003-High_poly.stl | `--up z --tris 90000` |
| `laurana.glb` | Bust of a woman, Francesco Laurana, c. 1472 (after a cast of the Berlin original) | ALoopingIcon | CC BY-SA 4.0 | https://upload.wikimedia.org/wikipedia/commons/2/20/Laurana.stl | `--up y --tris 45000` |
| `augustus.glb` | Bust of Augustus | Rama · MAH Genève | CC BY-SA 3.0 FR | https://upload.wikimedia.org/wikipedia/commons/8/86/Bust_of_Augustus-MAHG_009164-High_poly.stl | `--up z --tris 45000` |
| `young-man.glb` | Roman portrait bust of a young man | Scan the World · Musée Saint-Raymond, Toulouse | Commons "Attribution" tag | https://upload.wikimedia.org/wikipedia/commons/8/87/15-msr-bust-of-a-young-man-10.stl | `--up z --tris 45000` |
| `woman-1.glb` | Roman portrait bust of a woman | Scan the World · Musée Saint-Raymond | Commons "Attribution" tag | https://upload.wikimedia.org/wikipedia/commons/f/ff/14-msr-unknown-bust-of-a-woman-10.stl | `--up z --tris 45000` |
| `woman-2.glb` | Roman portrait bust of a woman | Scan the World · Musée Saint-Raymond | Commons "Attribution" tag | https://upload.wikimedia.org/wikipedia/commons/8/82/18-msr-bust-of-a-woman-2-10.stl | `--up z --tris 45000` |
| `venus-apple.glb` | Venus with the Apple, Bertel Thorvaldsen, 1809 | Statens Museum for Kunst, Copenhagen | Public domain | https://upload.wikimedia.org/wikipedia/commons/c/cb/Bertel_Thorvaldsen%2C_Venus_med_%C3%A6blet%2C_1809%2C_KMS6004%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 80000` |
| `amor-lyre.glb` | Cupid Playing the Lyre, Bertel Thorvaldsen | Statens Museum for Kunst | Public domain | https://upload.wikimedia.org/wikipedia/commons/4/48/Bertel_Thorvaldsen%2C_Den_lyrespillende_Amor%2C_%2C_KMS5680%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 60000` |
| `apollo-belvedere.glb` | Apollo Belvedere (cast of the Vatican marble) | Statens Museum for Kunst | CC0 | https://upload.wikimedia.org/wikipedia/commons/6/61/Apollo_Belvedere_-_KAS353.stl | `--up y --tris 110000`  (this one is Y-up; with `--up z` it lies on its back) |
| `diana.glb` | Diana of Villa Bartholoni | Rama · MAH Genève | Public domain | https://upload.wikimedia.org/wikipedia/commons/d/da/Diana_of_Villa_Bartholoni-High_poly-001.stl | `--up z --tris 100000` |
| `venus-capitoline.glb` | The Capitoline Venus (cast of the marble in the Capitoline Museums, Rome) | Statens Museum for Kunst, KAS493 | Public domain | https://upload.wikimedia.org/wikipedia/commons/9/9c/Ubekendt%2C_Afrodite%2C_Den_Capitolinske_Venus%2C_%2C_KAS493%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 110000` |
| `mars-ludovisi.glb` | The Ludovisi Mars (Ares Ludovisi), with Eros at his feet (cast of the marble in Palazzo Altemps, Rome) | Statens Museum for Kunst, KAS250 | Public domain | https://upload.wikimedia.org/wikipedia/commons/3/3f/Ubekendt%2C_Siddende_ung_mand%2C_Ares_Ludovisi%2C_Jason_%2C_%2C_KAS250%2C_Statens_Museum_for_Kunst%2C_3D_model.stl | `--up z --tris 120000` |

Notes
- The share-alike (BY-SA) and "Attribution" files need crediting; the page's Credits panel does
  this from the `credit` text in `SCULPTURES`. The "Attribution" tag's full wording has not been read.
- When fetching from upload.wikimedia.org, send a descriptive User-Agent (`curl -A "…"`).
- Example: `python3 tools/convert_scan.py raw/apollo.stl assets/sculpture/apollo-belvedere.glb --up y --tris 110000`
- Other good candidates seen on Commons but not used: *Venus and Adonis* (Canova, MAH Genève,
  public domain, 20 MB), Venus de Milo (SMK cast), Castor and Pollux (SMK).
