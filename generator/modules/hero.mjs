// Top banner: name, role, a live contributions starburst and a "currently pushing to" sticker.
import { doc, text, measure, capBaseline, fitSize, fit, sparkle, burst, toAscii, r } from '../lib/svg.mjs';
import { fmtNum, fmtDate } from '../lib/format.mjs';

export default async function hero({ config, theme: t, data }) {
  const h = config.hero;
  const [user, stats] = await Promise.all([data.user(), data.stats()]);
  const latest = user.repositories.nodes.find((r) => !r.isPrivate && !h.nowExclude.includes(r.name));
  const segs = 6;
  // 'learning' fills the bar from real lesson progress; a number pins it. An unreachable repo just shows 0.
  const filled = h.nextProgress === 'learning'
    ? await data.learning().then((l) => Math.floor((l.doneCount / l.all.length) * segs), () => 0)
    : h.nextProgress;

  const W = 1000, H = 440;
  const F = { x: 4, y: 4, w: 984, h: 420 }; // frame
  let b = '';

  // Frame, dotted paper and the black title bar.
  b += t.box({ ...F, fill: t.paper, stroke: 4, shadow: 8, cls: 'edge' });
  b += `<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="${t.ink}" opacity=".16"/></pattern></defs>`;
  b += `<rect x="6" y="52" width="980" height="370" fill="url(#dots)"/>`;
  b += `<rect class="edge" x="4" y="4" width="984" height="48" fill="${t.ink}" stroke="${t.ink}" stroke-width="4"/>`;
  b += text(`${config.login.toLowerCase()} / README.md`, { x: 24, y: capBaseline(4, 48, 'monoBold', 15), font: 'monoBold', size: 15, fill: t.paper });
  [t.pink, t.yellow, t.lime].forEach((c, i) => {
    b += `<rect x="${904 + i * 26}" y="19" width="18" height="18" fill="${c}" stroke="${t.paper}" stroke-width="2.5"/>`;
  });

  // Name, with an offset colour copy of the first line and a highlighter block behind the second.
  const nameSize = Math.min(96, ...h.name.map((l) => fitSize(l, 'display', 96, 560)));
  const cap = 0.688 * nameSize;
  const [l1, l2] = h.name;
  const base1 = 192, base2 = base1 + cap + 30;
  b += t.chip(h.greeting, { x: 40, y: 78, size: 14, fill: t.lime, rotate: -3, shadow: 4 }).svg;
  b += text(l1, { x: 45, y: base1 + 5, font: 'display', size: nameSize, fill: t.pink });
  b += text(l1, { x: 40, y: base1, font: 'display', size: nameSize, fill: t.ink });
  const w2 = measure(l2, 'display', nameSize);
  b += t.box({ x: 30, y: base2 - cap - 12, w: w2 + 20 + nameSize * 0.6, h: cap + 26, fill: t.yellow, stroke: 3, shadow: 6 });
  b += text(l2, { x: 40, y: base2, font: 'display', size: nameSize, fill: t.ink });
  b += `<rect class="cursor" x="${r(40 + w2 + 10)}" y="${r(base2 - cap)}" width="${r(nameSize * 0.34)}" height="${r(cap)}" fill="${t.ink}"/>`;

  // Role: "FULLSTACK DEVELOPER -> DEVOPS [#-----]".
  const roleY = base2 + 30;
  const role = t.chip(h.role, { x: 40, y: roleY, size: 15, h: 38, fill: t.ink, color: t.paper, shadow: 4, padX: 14 });
  b += role.svg;
  const ax = 40 + role.w + 14, ay = roleY + 19;
  b += `<path d="M${ax} ${ay}h26" stroke="${t.ink}" stroke-width="5"/><path d="M${ax + 22} ${ay - 9}l12 9-12 9z" fill="${t.ink}"/>`;
  const nx = ax + 48, segW = 11;
  const nw = measure(h.next, 'monoBold', 15, 0.5) + 28 + segs * (segW + 3) + 8;
  b += t.box({ x: nx, y: roleY, w: nw, h: 38, fill: t.paper, stroke: 2.5, shadow: 4 });
  b += text(h.next, { x: nx + 14, y: capBaseline(roleY, 38, 'monoBold', 15), font: 'monoBold', size: 15, fill: t.ink, ls: 0.5 });
  const sx = nx + nw - 8 - segs * (segW + 3);
  for (let i = 0; i < segs; i++) {
    const on = i < filled;
    const cls = i === filled ? ' class="pulse"' : '';
    b += `<rect${cls} x="${r(sx + i * (segW + 3))}" y="${roleY + 11}" width="${segW}" height="16" fill="${on || cls ? t.pink : t.paper}" stroke="${t.ink}" stroke-width="2"/>`;
  }

  // Meta line separated by sparkles.
  let mx = 40;
  const metaY = roleY + 70;
  h.meta.forEach((item, i) => {
    if (i) {
      b += sparkle(mx + 9, metaY - 5, 7, t.ink);
      mx += 26;
    }
    b += text(item, { x: mx, y: metaY, font: 'monoBold', size: 14, fill: t.ink, ls: 0.3 });
    mx += measure(item, 'monoBold', 14, 0.3) + 8;
  });

  // Starburst: contributions over the last year.
  const cx = 836, cy = 176;
  b += `<g class="spin"><polygon points="${burst(cx + 6, cy + 6, 112, 94, 20)}" class="sh"/><polygon points="${burst(cx, cy, 112, 94, 20)}" fill="${t.blue}" stroke="${t.ink}" stroke-width="3.5" stroke-linejoin="round"/></g>`;
  const total = fmtNum(stats.total);
  b += text(total, { x: cx, y: cy + 4, font: 'display', size: fitSize(total, 'display', 46, 150), fill: t.ink, anchor: 'middle' });
  b += text('CONTRIBUTIONS', { x: cx, y: cy + 30, font: 'monoBold', size: 13, fill: t.ink, anchor: 'middle', ls: 0.5 });
  b += text('IN THE LAST YEAR', { x: cx, y: cy + 50, font: 'mono', size: 12, fill: t.ink, anchor: 'middle' });

  // Sticker: most recently pushed public repo.
  if (latest) {
    const name = toAscii(latest.name).toUpperCase();
    const s = { x: 700, y: 306, w: 262, h: 92 };
    const size = fitSize(name, 'display', 26, s.w - 36, 14);
    b += `<g transform="rotate(3 ${s.x + s.w / 2} ${s.y + s.h / 2})">`;
    b += t.box({ ...s, fill: t.pink, stroke: 3, shadow: 6 });
    b += text('CURRENTLY PUSHING TO', { x: s.x + 18, y: s.y + 24, font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.8 });
    b += text(fit(name, 'display', size, s.w - 36), { x: s.x + 18, y: s.y + 56, font: 'display', size, fill: t.ink });
    b += text(`LAST PUSH ${fmtDate(latest.pushedAt, config.timeZone)}`, { x: s.x + 18, y: s.y + 77, font: 'mono', size: 11.5, fill: t.ink });
    b += `</g>`;
  }

  // Loose decorations.
  b += sparkle(640, 104, 20, t.yellow, `stroke="${t.ink}" stroke-width="3" stroke-linejoin="round"`);
  b += sparkle(672, 138, 10, t.pink, `stroke="${t.ink}" stroke-width="2.5" stroke-linejoin="round"`);

  const css = `
.spin{transform-origin:${cx}px ${cy}px;animation:spin 48s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.pulse{animation:pulse 1.1s steps(1) infinite}
@keyframes pulse{50%{fill:${t.paper}}}`;

  const who = `${h.name.join(' ')}: ${h.role.toLowerCase()} heading into ${h.next.toLowerCase()}`;
  return [{
    file: 'hero.svg',
    svg: doc({
      w: W, h: H, theme: t, css, body: b,
      title: who,
      desc: `${h.meta.join(' / ')}. ${total} contributions in the last year.${latest ? ` Currently pushing to ${latest.name}.` : ''}`,
    }),
  }];
}
