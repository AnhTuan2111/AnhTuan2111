// Compact DevOps roadmap: a slim strip with one stop per module and one square per lesson.
// A smaller sibling of `learning`, for when the full card takes more room than it deserves.
import { doc, text, measure, capBaseline, fit, r } from '../lib/svg.mjs';

export default async function roadmap({ config, theme: t, data }) {
  const L = config.learning;
  const { modules, all, doneCount, current, hereIdx } = await data.learning();
  const W = 1000, C = { x: 4, y: 4, w: 984, h: 170 }, H = C.h + 20, side = 236;

  let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });

  // Left: what this is and how far along.
  b += `<rect x="${C.x}" y="${C.y}" width="${side}" height="${C.h}" fill="${t.pink}" stroke="${t.ink}" stroke-width="3.5"/>`;
  // Two lines, split where they come out most even ("DEVOPS" / "FROM ZERO", not "DEVOPS FROM" / "ZERO").
  const words = L.title.split(' ');
  const splits = words.slice(1).map((_, i) => [words.slice(0, i + 1).join(' '), words.slice(i + 1).join(' ')]);
  const widest = (pair) => Math.max(...pair.map((l) => measure(l, 'display', 20)));
  const titleLines = measure(L.title, 'display', 20) <= side - 44 || !splits.length ? [L.title] : splits.sort((a, c) => widest(a) - widest(c))[0];
  titleLines.forEach((line, i) => {
    b += text(line, { x: C.x + 22, y: C.y + 38 + i * 24, font: 'display', size: 20, fill: t.ink });
  });
  const count = `${doneCount} / ${all.length}`;
  b += text(count, { x: C.x + 21, y: C.y + C.h - 44, font: 'display', size: 34, fill: t.ink });
  b += text('LESSONS DONE', { x: C.x + 22, y: C.y + C.h - 22, font: 'monoBold', size: 11, fill: t.ink, ls: 1 });

  // Right: the track.
  const x0 = C.x + side + 64, x1 = C.x + C.w - 64, ty = C.y + 76, step = (x1 - x0) / Math.max(1, modules.length - 1);
  const hereX = x0 + hereIdx * step;
  b += `<rect x="${x0 - 18}" y="${ty - 7}" width="${x1 - x0 + 36}" height="14" fill="${t.paper}" stroke="${t.ink}" stroke-width="2.5"/>`;
  b += `<rect x="${x0 - 16.5}" y="${ty - 5.5}" width="${r(hereX - x0 + 16.5)}" height="11" fill="${t.pink}"/>`;

  modules.forEach((m, i) => {
    const cx = x0 + i * step;
    const fill = m.state === 'done' ? t.ink : i === hereIdx ? t.yellow : t.paper;
    b += t.box({ x: cx - 15, y: ty - 15, w: 30, h: 30, fill, stroke: 3, shadow: 3 });
    b += text(String(i), { x: cx, y: capBaseline(ty - 15, 30, 'monoBold', 13), font: 'monoBold', size: 13, fill: m.state === 'done' ? t.paper : t.ink, anchor: 'middle' });
    b += text(fit(m.label, 'monoBold', 11, step - 6), { x: cx, y: ty + 40, font: 'monoBold', size: 11, fill: t.ink, anchor: 'middle', ls: 0.3 });

    const sq = 8, gap = 3, rowW = m.lessons.length * (sq + gap) - gap;
    m.lessons.forEach((l, j) => {
      const lf = l.status === 'done' ? t.ink : l.status === 'doing' ? t.yellow : t.paper;
      const cls = l.status === 'doing' ? ' class="blink"' : '';
      b += `<rect${cls} x="${r(cx - rowW / 2 + j * (sq + gap))}" y="${ty + 50}" width="${sq}" height="${sq}" fill="${lf}" stroke="${t.ink}" stroke-width="1.5"/>`;
    });
    b += text(`${m.done}/${m.lessons.length}`, { x: cx, y: ty + 76, font: 'mono', size: 10.5, fill: t.ink, anchor: 'middle' });
  });

  // "You are here" pin above the current stop.
  const pin = t.chip(current ? `NOW: LESSON ${current.id}` : 'YOU ARE HERE', { x: hereX, y: C.y + 18, size: 10.5, h: 24, anchor: 'middle', fill: t.yellow, shadow: 3 });
  b += `<g class="bob">${pin.svg}<path d="M${r(hereX - 7)} ${C.y + 42}l7 9 7-9z" fill="${t.ink}"/></g>`;

  const css = `
.bob{animation:bob 1.6s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-4px)}}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:.25}}`;

  return [{
    file: 'roadmap.svg',
    svg: doc({
      w: W, h: H, theme: t, css, body: b,
      title: `${L.title}: ${doneCount} of ${all.length} lessons done`,
      desc: `Roadmap: ${modules.map((m) => `${m.label} ${m.done}/${m.lessons.length}`).join(', ')}.${current ? ` Now on lesson ${current.id}.` : ''}`,
    }),
  }];
}
