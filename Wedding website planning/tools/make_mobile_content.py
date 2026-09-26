#!/usr/bin/env python3
"""Build the mobile edition's text file, mobile/content.js, from the 3D gallery's own tables.

The phone guide shows the same write-ups as the 3D gallery, so its text is never typed twice: edit the text in
gallery3d.js, export the tables with the screenshot harness, and run this.

  1. cd tools/harness && ./build.sh
  2. open  http://127.0.0.1:8011/index.html?dump=1&credits=1  in headless Chrome with --dump-dom and save the page
     (the tables arrive as JSON in <pre id="dump">); or pass the saved JSON itself
  3. python3 tools/make_mobile_content.py DUMP.html-or-.json [mobile/content.js]

What the 3D tables do not hold is set here: which picture heads each chapter, the principal works' framing, and the
file each sculpture's card is drawn from (mobile/img/sc-<spot>.jpg, rendered with the harness). Picture shapes
(`aspect`) follow the 3D build's own framing, so a cropped picture is cropped the same way on the phone.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                                   # "Wedding website planning"

NAMES = ['Kelly Wheelis', 'Anthony Alvarez']
HEROES = {'atrium': 'img/room-atrium-hall.jpg', 'w1': 'img/room-wing1.jpg', 'w2': 'img/room-wing2.jpg', 'det': 'img/room-details.jpg'}
PRINCIPAL = {'w1': ('img/birth-of-venus.jpg', 1.6162790697674418), 'w2': ('img/primavera.jpg', 1.5467980295566504)}   # the 3D frames' own shape
FRESCOES = [('frescoBride', 'img/fresco-venus-and-graces.jpg', 'assets/fresco-venus-and-graces.jpg'),
            ('frescoGroom', 'img/fresco-liberal-arts.jpg', 'assets/fresco-liberal-arts.jpg')]
PAIR_IMAGES = ('img/room-atrium-venus.jpg', 'img/room-atrium-mars.jpg')
WING_SCULPTURE = {'w1': ['w1statue', 'w1small'], 'w2': ['w2statue', 'w2bust']}
DET_SCULPTURE = ['detStatueL', 'detStatueR', 'detEndL', 'detEntryL', 'detEntryR']   # detEndR holds the hourglass
ARTIFACTS = ['anthonyCard', 'anthonyCase', 'anthonyAmelia']       # on Anthony's wall; their cards are mobile/img/art-<stop>.jpg
SECTIONS = [('main', 'detMain'), ('schedule', 'detSchedule'), ('travel', 'detTravel'), ('stay', 'detStay'),
            ('logistics', 'detFrontL'), ('policies', 'detFrontR'), ('registry', 'detShop')]   # the phone's reading order, numbered 1 to 7


def load(path):
    text = open(path, encoding='utf-8').read()
    if path.endswith('.json'):
        return json.loads(text)
    m = re.search(r'<pre id="dump">(.*?)</pre>', text, re.S)
    if not m:
        sys.exit('no <pre id="dump"> in ' + path)
    return json.loads(html.unescape(m.group(1)))


def image_aspect(rel):
    from PIL import Image
    w, h = Image.open(os.path.join(ROOT, rel)).size
    return w / h


def tbm(o):                                                       # title, body, meta
    return {'title': o.get('title', ''), 'body': o.get('body', ''), 'meta': o.get('meta', '')}


def build(d):
    st = {s['id']: s for s in d['STATIONS']}
    notes = d['NOTES']
    sculpt = lambda spot: {'img': f'img/sc-{spot}.jpg', 'title': d['SCULPTURE_NOTES'][spot][0],
                           'body': d['SCULPTURE_NOTES'][spot][1], 'meta': d['SCULPTURE_NOTES'][spot][2]}

    def hidden(src):                                              # a family pet painted into this picture: where, and its write-up
        h = d['HIDDEN'].get('assets/' + os.path.basename(src))
        return {'hidden': {'key': 'assets/' + os.path.basename(src), 'at': h['at'], 'eyebrow': h['eyebrow'], 'title': h['title'],
                           'body': h['body'], 'meta': h['meta']}} if h else {}

    pic = lambda src, aspect, note: {'img': 'img/' + os.path.basename(src), 'aspect': aspect, 'title': note['title'], 'body': note['body'], 'meta': note['meta'], **hidden(src)}

    atrium = {'id': 'atrium', 'title': 'The Atrium', 'hero': HEROES['atrium'], 'intro': tbm(st['atrium']), 'items': [
        {'kind': 'sculpture', 'img': PAIR_IMAGES[0], 'img2': PAIR_IMAGES[1], **tbm(notes['pair'])},
        *[{'kind': 'fresco', 'img': img, 'aspect': image_aspect(asset), **tbm(notes[key])} for key, img, asset in FRESCOES]],
        'frames': {'kelly': tbm(st['kelly']), 'anthony': tbm(st['anthony'])},
        'artifacts': [{'img': f'img/art-{s}.jpg', **tbm(st[s])} for s in ARTIFACTS]}

    def wing(wid, numeral, title, pictures):
        img, aspect = PRINCIPAL[wid]
        walls = []
        for wall_stop in (wid + 'a', wid + 'b'):
            ps = [p for p in pictures if p.get('close') and st[p['close']].get('back') == wall_stop]
            walls.append({**tbm(st[wall_stop]), 'pictures': [pic(p['src'], p['aspect'], tbm(st[p['close']])) for p in ps]})
        return {'id': wid, 'numeral': numeral, 'title': title, 'hero': HEROES[wid],
                'principal': {'img': img, 'aspect': aspect, **tbm(st[wid]), **hidden(img)}, 'closeup': tbm(st[wid + 'close']),
                'walls': walls, 'sculptures': [sculpt(s) for s in WING_SCULPTURE[wid]]}

    sections = []
    for n, (key, stop) in enumerate(SECTIONS, 1):
        ps = [p for p in d['DETAIL_PICTURES'] if p.get('sec') == key and p.get('src') and p.get('note')]
        sections.append({'key': key, 'n': n, **tbm(st[stop]),
                         'pictures': [pic(p['src'], p['w'] / p['h'], dict(zip(('title', 'body', 'meta'), p['note']))) for p in ps],
                         'card': d['CARDS'][key]})
    det = {'id': 'det', 'title': 'Exhibit Details', 'hero': HEROES['det'], 'centre': tbm(st['det']), 'table': tbm(st['detTable']),
           'volvelle': tbm(st['detVolvelle']), 'invite': tbm(st['detInvite']), 'shop': 'img/room-details-shop.jpg',
           'hourglass': {'img': 'img/sc-hourglass.jpg', **tbm(st['sc_hourglass']), 'wedding': d['WEDDING']},   # the countdown is kept live on the phone
           'sections': sections, 'sculptures': [sculpt(s) for s in DET_SCULPTURE]}

    return {'names': NAMES, 'rooms': [atrium, wing('w1', 'I', 'Wing I', d['W1_PICTURES']), wing('w2', 'II', 'Wing II', d['W2_PICTURES']), det],
            'credits': d['credits'], 'sectionLabel': d['SECTION_LABEL']}


def write(content, out):
    text = json.dumps(content, ensure_ascii=False, indent=1)
    text = re.sub(r'\[\n\s+("[^"\n]*"),\n\s+("[^"\n]*")\n\s+\]', r'[\1, \2]', text)   # a credit's two lines on one line
    head = '// Generated from the 3D gallery\'s own text tables by tools/make_mobile_content.py. Edit the texts in gallery3d.js, then regenerate.\n'
    open(out, 'w', encoding='utf-8').write(head + 'window.CONTENT = ' + text + ';\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'mobile', 'content.js')
    write(build(load(sys.argv[1])), out)
    print('wrote', out)
