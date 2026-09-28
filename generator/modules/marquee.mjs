// Endless scrolling strip of the tech stack.
import { doc, text, measure, capBaseline, sparkle, r } from '../lib/svg.mjs';

export default async function marquee({ config, theme: t }) {
  const W = 1000, H = 64, band = { x: 4, y: 6, w: 984, h: 46 };
  const size = 20, gap = 20, star = 9;

  let seq = '', x = 0;
  for (const item of config.stack) {
    seq += text(item, { x, y: capBaseline(band.y, band.h, 'display', size), font: 'display', size, fill: t.ink });
    x += measure(item, 'display', size) + gap;
    seq += sparkle(x + star, band.y + band.h / 2, star, t.ink);
    x += star * 2 + gap;
  }
  const seqW = x;
  const copies = Math.ceil((band.w + seqW) / seqW);
  let track = '';
  for (let i = 0; i < copies; i++) track += `<g transform="translate(${r(band.x + 16 + i * seqW)} 0)">${seq}</g>`;

  const body =
    t.box({ ...band, fill: t.yellow, stroke: 3, shadow: 6 }) +
    `<clipPath id="band"><rect x="${band.x + 2}" y="${band.y}" width="${band.w - 4}" height="${band.h}"/></clipPath>` +
    `<g clip-path="url(#band)"><g class="track">${track}</g></g>`;

  const css = `
.track{animation:scroll ${Math.round(seqW / 45)}s linear infinite}
@keyframes scroll{to{transform:translateX(-${r(seqW)}px)}}`;

  return [{
    file: 'marquee.svg',
    svg: doc({ w: W, h: H, theme: t, css, body, title: 'Tech stack', desc: config.stack.join(', ') }),
  }];
}
