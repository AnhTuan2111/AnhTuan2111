// "By the numbers": four stat tiles and a 52-week bar strip from the contribution calendar.
import { doc, text, measure, capBaseline, r } from '../lib/svg.mjs';
import { fmtNum, fmtDate, WEEKDAYS } from '../lib/format.mjs';

export default async function stats({ config, theme: t, data }) {
  const s = await data.stats();
  const W = 500, H = 344, C = { x: 4, y: 4, w: 486, h: 330 };

  let b = t.box({ ...C, fill: t.paper, stroke: 3.5, shadow: 8 });
  b += `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="56" fill="${t.yellow}" stroke="${t.ink}" stroke-width="3.5"/>`;
  b += text('ACTIVITY', { x: 22, y: capBaseline(C.y, 56, 'display', 22), font: 'display', size: 22, fill: t.ink });
  b += t.chip('LAST 365 DAYS', { x: 472, y: 19, size: 11, h: 26, anchor: 'end', fill: t.ink, color: t.paper, shadow: 0 }).svg;

  const tiles = [
    { value: fmtNum(s.total), label: 'CONTRIBUTIONS', color: t.pink },
    { value: String(s.current), unit: s.current === 1 ? 'DAY' : 'DAYS', label: 'CURRENT STREAK', color: t.blue },
    { value: String(s.longest), unit: 'DAYS', label: 'LONGEST STREAK', color: t.lime },
    { value: String(s.activeDays), unit: `/ ${s.dayCount}`, label: 'DAYS WITH COMMITS', color: t.orange },
  ];
  const tw = 217, th = 78;
  tiles.forEach((tile, i) => {
    const x = 22 + (i % 2) * (tw + 16), y = 74 + Math.floor(i / 2) * (th + 14);
    b += t.box({ x, y, w: tw, h: th, fill: tile.color, stroke: 3, shadow: 4 });
    b += text(tile.value, { x: x + 14, y: y + 42, font: 'display', size: 32, fill: t.ink });
    if (tile.unit) b += text(tile.unit, { x: x + 22 + measure(tile.value, 'display', 32), y: y + 42, font: 'monoBold', size: 13, fill: t.ink });
    b += text(tile.label, { x: x + 14, y: y + 63, font: 'monoBold', size: 11.5, fill: t.ink, ls: 0.5 });
  });

  // Last 16 weeks as chunky bars; the busiest one gets the accent colour.
  const weeks = s.weeks.slice(-16), max = Math.max(1, ...weeks);
  const x0 = 22, span = 450, base = 316, maxH = 36, pitch = span / weeks.length, bw = pitch - 8;
  const peak = weeks.lastIndexOf(max);
  weeks.forEach((v, i) => {
    const bh = v ? Math.max(4, Math.sqrt(v / max) * maxH) : 0;
    if (bh) b += `<rect x="${r(x0 + 4 + i * pitch)}" y="${r(base - bh)}" width="${r(bw)}" height="${r(bh)}" fill="${i === peak ? t.pink : t.yellow}" stroke="${t.ink}" stroke-width="2"/>`;
  });
  b += `<path d="M${x0} ${base}H${x0 + span}" stroke="${t.ink}" stroke-width="3"/>`;

  const best = `BEST DAY ${s.best.contributionCount} ON ${fmtDate(s.best.date + 'T12:00:00Z', config.timeZone)}`;
  const busiest = `LAST 16 WEEKS / MOSTLY ${WEEKDAYS[s.busiestWeekday]}S`;
  b += text(best, { x: 22, y: 270, font: 'mono', size: 11, fill: t.ink });
  b += text(busiest, { x: 472, y: 270, font: 'mono', size: 11, fill: t.ink, anchor: 'end' });

  return [{
    file: 'stats.svg',
    svg: doc({
      w: W, h: H, theme: t, body: b,
      title: 'GitHub stats',
      desc: `${fmtNum(s.total)} contributions in the last year, current streak ${s.current} days, longest streak ${s.longest} days, ${s.activeDays} active days. ${best}.`,
    }),
  }];
}
