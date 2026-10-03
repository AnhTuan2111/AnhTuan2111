// One card per project in config.projects; public repos get live push date, language and stars.
// A project may set `width` and `height` (viewBox units, default 500 x 300) for an uneven grid: give the
// two cards of a README row the same height and widths that add up to 1000, and use those as the <img> widths.
// `tilt` (degrees) turns a card off the horizontal. Every card is then shrunk by the same factor, so the most
// tilted one still fits its frame and all of them keep the same text size.
import { doc, text, measure, capBaseline, fit, fitSize, wrap, toAscii, r } from '../lib/svg.mjs';
import { fmtDate } from '../lib/format.mjs';

// Scale at which a w x h box rotated by `deg` still fits inside w x h.
function fitScale(w, h, deg) {
  const a = (Math.abs(deg) * Math.PI) / 180;
  return Math.min(w / (w * Math.cos(a) + h * Math.sin(a)), h / (w * Math.sin(a) + h * Math.cos(a)));
}

export default async function projects({ config, theme: t, data }) {
  const maxTilt = Math.max(0, ...config.projects.map((p) => Math.abs(p.tilt ?? 0)));
  const scale = maxTilt ? Math.min(...config.projects.map((p) => fitScale(p.width ?? 500, p.height ?? 300, maxTilt))) : 1;

  return Promise.all(config.projects.map(async (p) => {
    const repo = p.repo ? await data.repo(p.repo) : null;
    const accent = t[p.color] ?? p.color ?? t.yellow;
    const W = p.width ?? 500, H = p.height ?? 300, C = { x: 4, y: 4, w: W - 14, h: H - 14 };
    const left = 22, right = W - 28;
    // Wide cards put the stack in a column beside the story; slim ones drop the less important footer facts.
    const column = W >= 520, slim = W < 440, custom = p.width !== undefined;

    let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
    b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="76" fill="${accent}" stroke="${t.ink}" stroke-width="3.5"/>`;

    // Tag sticker hangs off the top-right corner; the title shrinks to stay clear of it.
    const tagText = toAscii(typeof p.tag === 'function' ? p.tag(repo) : p.tag ?? '');
    let tagW = 0;
    if (tagText) {
      const tag = t.chip(tagText, { x: W - 26, y: 18, size: 11.5, h: 28, anchor: 'end', fill: t.ink, color: accent, rotate: 4, shadow: 3 });
      b += tag.svg;
      tagW = tag.w;
    }
    const titleMax = C.w - 36 - tagW - 18;
    const tSize = fitSize(p.title, 'display', 26, titleMax, 16);
    b += text(fit(p.title, 'display', tSize, titleMax), { x: left, y: 44, font: 'display', size: tSize, fill: t.ink });
    b += text(fit(p.kicker, 'monoBold', 11.5, titleMax, 0.8), { x: left, y: 65, font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.8 });

    const chip = (s, x, y) => t.chip(s, { x, y, size: 11.5, h: 26, ls: 0.3, fill: t.paper, shadow: 2.5, stroke: 2 }).svg;
    const chipW = (s) => measure(s, 'monoBold', 11.5, 0.3) + 20;

    if (column) {
      // The story on the left, slightly larger to fill the room; the stack as a column on the right.
      const colW = Math.max(...p.stack.map(chipW)), colX = right - colW;
      wrap(p.blurb, 'mono', 14.5, colX - left - 26, 5).forEach((line, i) => {
        b += text(line, { x: left, y: 112 + i * 23, font: 'mono', size: 14.5, fill: t.ink });
      });
      p.stack.forEach((s, i) => {
        b += chip(s, colX, 96 + i * 34);
      });
    } else {
      // The story, then the stack as chips that wrap to a second row if needed.
      const lines = wrap(p.blurb, 'mono', 13.5, right - left, custom ? 4 : 3);
      lines.forEach((line, i) => {
        b += text(line, { x: left, y: 110 + i * 21, font: 'mono', size: 13.5, fill: t.ink });
      });
      let cx = left, cy = custom ? 110 + (lines.length - 1) * 21 + 24 : 180;
      for (const s of p.stack) {
        const w = chipW(s);
        if (cx + w > right) {
          cx = left;
          cy += 32;
        }
        b += chip(s, cx, cy);
        cx += w + 10;
      }
    }

    // Footer: language + stars for public repos, a lock for private ones; last push on the right.
    const fy = C.y + C.h - 52, mid = capBaseline(fy, 52, 'monoBold', 12);
    b += `<path d="M${C.x} ${fy}H${C.x + C.w}" stroke="${t.ink}" stroke-width="3"/>`;
    if (p.private) {
      b += `<rect x="${left}" y="${mid - 9}" width="13" height="10" fill="${t.ink}"/><path d="M${left + 2.5} ${mid - 9}v-3.5a4 4 0 0 1 8 0v3.5" stroke="${t.ink}" stroke-width="2.2"/>`;
      b += text(toAscii(p.private).toUpperCase(), { x: left + 22, y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
    } else if (repo) {
      let x = left;
      if (repo.language) {
        b += `<rect x="${x}" y="${mid - 10}" width="12" height="12" fill="${accent}" stroke="${t.ink}" stroke-width="2"/>`;
        b += text(repo.language.toUpperCase(), { x: x + 20, y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
        x += 20 + measure(repo.language.toUpperCase(), 'monoBold', 12, 0.4) + 22;
      }
      if (!slim) {
        b += `<path d="${star(x + 7, mid - 4.5, 7.5)}" fill="${t.ink}"/>`;
        b += text(String(repo.stars), { x: x + 20, y: mid, font: 'monoBold', size: 12, fill: t.ink });
        if (repo.commits) b += text(`${repo.commits} COMMITS`, { x: x + 44 + measure(String(repo.stars), 'monoBold', 12), y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
      } else if (repo.commits) {
        b += text(`${repo.commits} COMMITS`, { x, y: mid, font: 'monoBold', size: 12, fill: t.ink, ls: 0.4 });
      }
    }
    if (repo?.pushedAt && !slim) {
      b += text(`UPDATED ${fmtDate(repo.pushedAt, config.timeZone)}`, { x: right, y: mid, font: 'mono', size: 12, fill: t.ink, anchor: 'end' });
    }

    if (maxTilt) b = `<g transform="translate(${W / 2} ${H / 2}) rotate(${p.tilt ?? 0}) scale(${scale.toFixed(3)}) translate(${-W / 2} ${-H / 2})">${b}</g>`;

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
