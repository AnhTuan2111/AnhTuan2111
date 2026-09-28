// Numbered section dividers: [01][TITLE]=========[NOTE]
import { doc, text, measure, capBaseline } from '../lib/svg.mjs';

export default async function sections({ config, theme: t }) {
  const W = 1000, H = 64, y = 8, h = 44;
  const colors = [t.yellow, t.pink, t.blue, t.lime, t.orange, t.violet];

  return config.sections.map((s, i) => {
    const no = String(i + 1).padStart(2, '0');
    let b = t.box({ x: 4, y, w: 60, h, fill: colors[i % colors.length], shadow: 5 });
    b += text(no, { x: 34, y: capBaseline(y, h, 'display', 22), font: 'display', size: 22, fill: t.ink, anchor: 'middle' });

    const tw = measure(s.title, 'display', 22) + 36;
    b += t.box({ x: 76, y, w: tw, h, fill: t.paper, shadow: 5 });
    b += text(s.title, { x: 94, y: capBaseline(y, h, 'display', 22), font: 'display', size: 22, fill: t.ink });

    let end = 988;
    if (s.note) {
      const note = t.chip(s.note, { x: 988, y: y + 8, size: 11.5, h: 28, anchor: 'end', fill: t.ink, color: t.paper, shadow: 0, cls: 'edge' });
      b += note.svg;
      end = note.x - 12;
    }
    const start = 76 + tw + 18;
    if (end - start > 20) b += `<rect x="${start}" y="${y + h / 2 - 5}" width="${end - start}" height="10" fill="${t.paper}" stroke="${t.ink}" stroke-width="2.5"/>`;

    return {
      file: `section-${s.id}.svg`,
      svg: doc({ w: W, h: H, theme: t, body: b, title: `${no} ${s.title}`, desc: s.note ?? '' }),
    };
  });
}
