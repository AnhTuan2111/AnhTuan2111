// Language split across owned repos (private ones too when the token can read them), by bytes.
import { doc, text, capBaseline, fit, r } from '../lib/svg.mjs';
import { languageSplit } from '../lib/github.mjs';
import { fmtBytes } from '../lib/format.mjs';

export default async function languages({ config, theme: t, data }) {
  const user = await data.user();
  const { langs, bytes, repoCount, skipped } = languageSplit(user.repositories.nodes, config.languages);
  const fixed = { Java: t.orange, TypeScript: t.blue, JavaScript: t.yellow, Python: t.lime, Kotlin: t.violet, Other: t.paper };
  const spare = [t.pink, t.violet, t.lime, t.yellow, t.blue, t.orange].filter((c) => !langs.some((l) => fixed[l.name] === c));
  const color = (name) => fixed[name] ?? (fixed[name] = spare.shift() ?? t.paper);

  const W = 500, H = 344, C = { x: 4, y: 4, w: 486, h: 330 };
  let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
  b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="56" fill="${t.blue}" stroke="${t.ink}" stroke-width="3.5"/>`;
  b += text('LANGUAGES', { x: 22, y: capBaseline(C.y, 56, 'display', 22), font: 'display', size: 22, fill: t.ink });
  b += t.chip('ALL REPOS', { x: 472, y: 19, size: 11, h: 26, anchor: 'end', fill: t.ink, color: t.paper, shadow: 0 }).svg;

  // Stacked bar.
  const bar = { x: 22, y: 80, w: 450, h: 52 };
  b += t.box({ ...bar, fill: t.paper, stroke: 3, shadow: 5 });
  let x = bar.x;
  for (const l of langs) {
    const w = (l.pct / 100) * bar.w;
    b += `<rect x="${r(x)}" y="${bar.y}" width="${r(w)}" height="${bar.h}" fill="${color(l.name)}" stroke="${t.ink}" stroke-width="2.5"/>`;
    x += w;
  }
  b += `<rect x="${bar.x}" y="${bar.y}" width="${bar.w}" height="${bar.h}" stroke="${t.ink}" stroke-width="3"/>`;

  // Legend, two columns.
  const pitch = Math.min(40, 104 / Math.max(1, Math.ceil(langs.length / 2) - 1));
  langs.forEach((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const lx = 22 + col * 240, ly = 156 + row * pitch;
    b += t.box({ x: lx, y: ly, w: 18, h: 18, fill: color(l.name), stroke: 2.5, shadow: 2 });
    b += text(fit(l.name.toUpperCase(), 'monoBold', 13.5, 140), { x: lx + 30, y: capBaseline(ly, 18, 'monoBold', 13.5), font: 'monoBold', size: 13.5, fill: t.ink });
    b += text(`${l.pct.toFixed(1)}%`, { x: lx + 210, y: capBaseline(ly, 18, 'mono', 13.5), font: 'mono', size: 13.5, fill: t.ink, anchor: 'end' });
  });

  const note = `${fmtBytes(bytes)} OF CODE / ${repoCount} REPOS` + (skipped.length ? ` / NOT COUNTED: ${skipped.join(', ').toUpperCase()}` : '');
  b += `<path d="M${C.x} 290H${C.x + C.w}" stroke="${t.ink}" stroke-width="3"/>`;
  b += text(note, { x: 22, y: capBaseline(290, 44, 'mono', 11.5), font: 'mono', size: 11.5, fill: t.ink });

  return [{
    file: 'languages.svg',
    svg: doc({
      w: W, h: H, theme: t, body: b,
      title: 'Most used languages',
      desc: langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', '),
    }),
  }];
}
