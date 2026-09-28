// Roadmap card for the devops-self-learning repo: one stop per module, one square per lesson.
import { doc, text, measure, capBaseline, fit, toAscii, r } from '../lib/svg.mjs';
import { fmtDate } from '../lib/format.mjs';

export default async function learning({ config, theme: t, data }) {
  const L = config.learning;
  const { meta, modules, all, doneCount, current, hereIdx } = await data.learning();

  const W = 1000, H = 330, C = { x: 4, y: 4, w: 984, h: 316 };
  let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
  b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="60" fill="${t.lime}" stroke="${t.ink}" stroke-width="3.5"/>`;
  b += text(L.title, { x: 22, y: capBaseline(C.y, 60, 'display', 26), font: 'display', size: 26, fill: t.ink });
  b += t.chip(L.tag, { x: 22 + measure(L.title, 'display', 26) + 18, y: 20, size: 11, h: 28, fill: t.paper, shadow: 3, rotate: -2 }).svg;
  if (meta.started) {
    b += t.chip(`SINCE ${fmtDate(meta.started + 'T12:00:00Z', config.timeZone)}`, { x: 968, y: 20, size: 11, h: 28, anchor: 'end', fill: t.ink, color: t.paper, shadow: 0 }).svg;
  }

  // Left: big counter.
  const num = String(doneCount).padStart(2, '0');
  b += text(num, { x: 22, y: 170, font: 'display', size: 84, fill: t.ink });
  b += text(`/${all.length}`, { x: 30 + measure(num, 'display', 84), y: 170, font: 'display', size: 28, fill: t.ink });
  b += text('LESSONS DONE', { x: 24, y: 196, font: 'monoBold', size: 12.5, fill: t.ink, ls: 0.8 });
  if (current) b += t.chip(`NOW: LESSON ${current.id}`, { x: 24, y: 214, size: 12, h: 30, fill: t.yellow, shadow: 4 }).svg;
  b += `<path d="M236 ${C.y + 60}V${C.y + C.h}" stroke="${t.ink}" stroke-width="3"/>`;

  // Right: roadmap track with a stop per module.
  const x0 = 290, x1 = 940, ty = 148, step = (x1 - x0) / (modules.length - 1);
  const hereX = x0 + hereIdx * step;
  b += `<rect x="${x0 - 18}" y="${ty - 7}" width="${x1 - x0 + 36}" height="14" fill="${t.paper}" stroke="${t.ink}" stroke-width="2.5"/>`;
  b += `<rect x="${x0 - 16.5}" y="${ty - 5.5}" width="${r(hereX - x0 + 16.5)}" height="11" fill="${t.pink}"/>`;

  modules.forEach((m, i) => {
    const cx = x0 + i * step;
    const fill = m.state === 'done' ? t.ink : i === hereIdx ? t.yellow : t.paper;
    b += t.box({ x: cx - 16, y: ty - 16, w: 32, h: 32, fill, stroke: 3, shadow: 3 });
    b += text(String(i), { x: cx, y: capBaseline(ty - 16, 32, 'monoBold', 14), font: 'monoBold', size: 14, fill: m.state === 'done' ? t.paper : t.ink, anchor: 'middle' });
    b += text(fit(m.label, 'monoBold', 11, step - 6), { x: cx, y: 196, font: 'monoBold', size: 11, fill: t.ink, anchor: 'middle', ls: 0.3 });

    const sq = 9, gap = 3, rowW = m.lessons.length * (sq + gap) - gap;
    m.lessons.forEach((l, j) => {
      const lf = l.status === 'done' ? t.ink : l.status === 'doing' ? t.yellow : t.paper;
      const cls = l.status === 'doing' ? ' class="blink"' : '';
      b += `<rect${cls} x="${r(cx - rowW / 2 + j * (sq + gap))}" y="208" width="${sq}" height="${sq}" fill="${lf}" stroke="${t.ink}" stroke-width="1.6"/>`;
    });
    b += text(`${m.done}/${m.lessons.length}`, { x: cx, y: 238, font: 'mono', size: 10.5, fill: t.ink, anchor: 'middle' });
  });

  // "You are here" pin above the current stop.
  const pin = t.chip('YOU ARE HERE', { x: hereX, y: 84, size: 10.5, h: 24, anchor: 'middle', fill: t.pink, shadow: 3 });
  b += `<g class="bob">${pin.svg}<path d="M${hereX - 7} 108l7 9 7-9z" fill="${t.ink}"/></g>`;

  // Footer: practice stack + call to action.
  b += `<path d="M236 262H${C.x + C.w}" stroke="${t.ink}" stroke-width="3"/>`;
  const stack = toAscii(meta.stack ?? '').toUpperCase();
  const cta = t.chip(`${L.cta} ->`, { x: 968, y: 276, size: 12, h: 30, anchor: 'end', fill: t.yellow, shadow: 4 });
  b += text(fit(stack, 'monoBold', 11.5, cta.x - 256 - 16, 0.3), { x: 256, y: capBaseline(276, 30, 'monoBold', 11.5), font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.3 });
  b += cta.svg;
  b += text(`${modules.length} MODULES`, { x: 24, y: capBaseline(276, 30, 'mono', 11.5), font: 'mono', size: 11.5, fill: t.ink });

  const css = `
.bob{animation:bob 1.6s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-5px)}}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:.25}}`;

  return [{
    file: 'learning.svg',
    svg: doc({
      w: W, h: H, theme: t, css, body: b,
      title: `${L.title}: ${doneCount} of ${all.length} lessons done`,
      desc: `Roadmap: ${modules.map((m) => `${m.label} ${m.done}/${m.lessons.length}`).join(', ')}.${current ? ` Now on lesson ${current.id}.` : ''}`,
    }),
  }];
}
