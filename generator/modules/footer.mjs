// Closing strip with the build date, so it's obvious the page is alive.
import { doc, text, capBaseline, sparkle } from '../lib/svg.mjs';
import { fmtDate } from '../lib/format.mjs';

export default async function footer({ config, theme: t, now }) {
  const W = 1000, H = 72, bar = { x: 4, y: 8, w: 984, h: 50 };
  const built = `AUTO-BUILT BY GITHUB ACTIONS / ${fmtDate(now, config.timeZone)}`;

  let b = t.box({ ...bar, fill: t.ink, shadow: 6, cls: 'edge' });
  b += sparkle(34, bar.y + bar.h / 2, 11, t.yellow);
  b += text('THANKS FOR SCROLLING', { x: 56, y: capBaseline(bar.y, bar.h, 'display', 20), font: 'display', size: 20, fill: t.paper });
  b += t.chip(built, { x: 972, y: bar.y + 11, size: 11.5, h: 28, anchor: 'end', fill: t.yellow, shadow: 0 }).svg;

  return [{ file: 'footer.svg', svg: doc({ w: W, h: H, theme: t, body: b, title: 'Thanks for scrolling', desc: built }) }];
}
