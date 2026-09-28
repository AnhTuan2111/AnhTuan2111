// One card per project in config.projects; public repos get live push date, language and stars.
import { doc, text, measure, capBaseline, fit, fitSize, wrap, toAscii, r } from '../lib/svg.mjs';
import { fmtDate } from '../lib/format.mjs';

export default async function projects({ config, theme: t, data }) {
  return Promise.all(config.projects.map(async (p) => {
    const repo = p.repo ? await data.repo(p.repo) : null;
    const accent = t[p.color] ?? p.color ?? t.yellow;
    const W = 500, H = 300, C = { x: 4, y: 4, w: 486, h: 286 };

    let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
    b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="76" fill="${accent}" stroke="${t.ink}" stroke-width="3.5"/>`;

    // Tag sticker hangs off the top-right corner; the title shrinks to stay clear of it.
    const tagText = toAscii(typeof p.tag === 'function' ? p.tag(repo) : p.tag ?? '');
    let tagW = 0;
    if (tagText) {
      const tag = t.chip(tagText, { x: 474, y: 18, size: 11.5, h: 28, anchor: 'end', fill: t.ink, color: accent, rotate: 4, shadow: 3 });
      b += tag.svg;
      tagW = tag.w;
    }
    const titleMax = 486 - 36 - tagW - 18;
    const tSize = fitSize(p.title, 'display', 26, titleMax, 16);
    b += text(fit(p.title, 'display', tSize, titleMax), { x: 22, y: 44, font: 'display', size: tSize, fill: t.ink });
    b += text(fit(p.kicker, 'monoBold', 11.5, titleMax, 0.8), { x: 22, y: 65, font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.8 });

    wrap(p.blurb, 'mono', 13.5, 450, 3).forEach((line, i) => {
      b += text(line, { x: 22, y: 110 + i * 21, font: 'mono', size: 13.5, fill: t.ink });
    });

    // Stack chips, wrapping to a second row if needed.
    let cx = 22, cy = 180;
    for (const s of p.stack) {
      const w = measure(s, 'monoBold', 11.5, 0.3) + 20;
      if (cx + w > 472) {
        cx = 22;
        cy += 32;
      }
      b += t.chip(s, { x: cx, y: cy, size: 11.5, h: 26, ls: 0.3, fill: t.paper, shadow: 2.5, stroke: 2 }).svg;
      cx += w + 10;
    }

    // Footer: language + stars for public repos, a lock for private ones; last push on the right.
    const fy = 238, mid = capBaseline(fy, 52, 'monoBold', 12);
    b += `<path d="M${C.x} ${fy}H${C.x + C.w}" stroke="${t.ink}" stroke-width="3"/>`;
    if (p.private) {
      b += `<rect x="22" y="${mid - 9}" width="13" height="10" fill="${t.ink}"/><path d="M24.5 ${mid - 9}v-3.5a4 4 0 0 1 8 0v3.5" stroke="${t.ink}" stroke-width="2.2"/>`;
      b += text(toAscii(p.private).toUpperCase(), { x: 44, y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
    } else if (repo) {
      let x = 22;
      if (repo.language) {
        b += `<rect x="${x}" y="${mid - 10}" width="12" height="12" fill="${accent}" stroke="${t.ink}" stroke-width="2"/>`;
        b += text(repo.language.toUpperCase(), { x: x + 20, y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
        x += 20 + measure(repo.language.toUpperCase(), 'monoBold', 12, 0.4) + 22;
      }
      b += `<path d="${star(x + 7, mid - 4.5, 7.5)}" fill="${t.ink}"/>`;
      b += text(String(repo.stars), { x: x + 20, y: mid, font: 'monoBold', size: 12, fill: t.ink });
      if (repo.commits) b += text(`${repo.commits} COMMITS`, { x: x + 44 + measure(String(repo.stars), 'monoBold', 12), y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
    }
    if (repo?.pushedAt) {
      b += text(`UPDATED ${fmtDate(repo.pushedAt, config.timeZone)}`, { x: 472, y: mid, font: 'mono', size: 12, fill: t.ink, anchor: 'end' });
    }

    return {
      file: `project-${p.id}.svg`,
      svg: doc({
        w: W, h: H, theme: t, body: b,
        title: `${p.title}: ${p.kicker}`,
        desc: `${p.blurb} Built with ${p.stack.join(', ')}.`,
      }),
    };
  }));
}

function star(cx, cy, R) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? R * 0.45 : R;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    pts.push(`${r(cx + rad * Math.cos(a))} ${r(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}
