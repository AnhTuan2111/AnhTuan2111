// Optional: coding time for the last 7 days from WakaTime. Skips itself when WAKATIME_API_KEY is not set.
import { doc, text, capBaseline, fit, r } from '../lib/svg.mjs';

export default async function wakatime({ theme: t }) {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) return [];

  const res = await fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
    headers: { Authorization: `Basic ${Buffer.from(key).toString('base64')}` },
  });
  if (!res.ok) throw new Error(`WakaTime ${res.status}: ${await res.text()}`);
  const { data: w } = await res.json();
  // WakaTime computes stats lazily; keep last week's card until they're ready.
  if (!w?.languages?.length) return [];

  const langs = w.languages.slice(0, 5);
  const colors = [t.orange, t.blue, t.yellow, t.pink, t.lime];
  const W = 500, H = 344, C = { x: 4, y: 4, w: 486, h: 330 };

  let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
  b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="56" fill="${t.violet}" stroke="${t.ink}" stroke-width="3.5"/>`;
  b += text('TIME IN THE EDITOR', { x: 22, y: capBaseline(C.y, 56, 'display', 22), font: 'display', size: 22, fill: t.ink });
  b += t.chip('LAST 7 DAYS', { x: 472, y: 19, size: 11, h: 26, anchor: 'end', fill: t.ink, color: t.paper, shadow: 0 }).svg;

  const tiles = [
    { value: w.human_readable_total ?? '-', label: 'TOTAL', color: t.yellow },
    { value: w.human_readable_daily_average ?? '-', label: 'DAILY AVERAGE', color: t.pink },
  ];
  tiles.forEach((tile, i) => {
    const x = 22 + i * 233;
    b += t.box({ x, y: 76, w: 217, h: 70, fill: tile.color, stroke: 3, shadow: 4 });
    b += text(fit(tile.value.toUpperCase(), 'display', 18, 190), { x: x + 14, y: 108, font: 'display', size: 18, fill: t.ink });
    b += text(tile.label, { x: x + 14, y: 132, font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.5 });
  });

  langs.forEach((l, i) => {
    const y = 170 + i * 30, pct = Math.max(0, Math.min(100, l.percent ?? 0));
    b += text(fit(l.name.toUpperCase(), 'monoBold', 12, 110), { x: 22, y: capBaseline(y, 18, 'monoBold', 12), font: 'monoBold', size: 12, fill: t.ink });
    b += `<rect x="140" y="${y}" width="200" height="18" fill="${t.paper}" stroke="${t.ink}" stroke-width="2"/>`;
    b += `<rect x="140" y="${y}" width="${r(2 * pct)}" height="18" fill="${colors[i]}" stroke="${t.ink}" stroke-width="2"/>`;
    b += text(fit(l.text ?? `${pct.toFixed(1)}%`, 'mono', 11.5, 118), { x: 472, y: capBaseline(y, 18, 'mono', 11.5), font: 'mono', size: 11.5, fill: t.ink, anchor: 'end' });
  });

  return [{
    file: 'wakatime.svg',
    svg: doc({
      w: W, h: H, theme: t, body: b,
      title: 'Coding time, last 7 days',
      desc: `${w.human_readable_total} total. ${langs.map((l) => `${l.name} ${l.text}`).join(', ')}.`,
    }),
  }];
}
