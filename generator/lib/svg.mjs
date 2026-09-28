// Neo-brutalist SVG primitives: embedded fonts, text metrics, boxes with hard shadows.
import { readFileSync } from 'node:fs';

const fontDir = new URL('../fonts/', import.meta.url);
const metrics = JSON.parse(readFileSync(new URL('metrics.json', fontDir), 'utf8'));
const fontData = Object.fromEntries(
  Object.keys(metrics).map((k) => [k, readFileSync(new URL(`${k}.woff`, fontDir)).toString('base64')]),
);

// Class names used on <text> so doc() can embed only the fonts a file actually uses.
const FONT_CLASS = { display: 'fd', mono: 'fm', monoBold: 'fb' };

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Fold anything the subset fonts cannot draw (Vietnamese diacritics, emoji, ...) into ASCII.
export function toAscii(s) {
  const known = metrics.mono.widths;
  return String(s ?? '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[⇄↔]/g, '<->')
    .replace(/\s+/g, ' ')
    .split('')
    .filter((c) => c in known)
    .join('')
    .trim();
}

export function measure(str, font = 'mono', size = 14, ls = 0) {
  const m = metrics[font];
  let w = 0;
  for (const c of String(str)) w += m.widths[c] ?? m.fallback;
  return w * size + ls * Math.max(0, String(str).length - 1);
}

// Baseline that vertically centres capital letters inside [top, top + h].
export function capBaseline(top, h, font, size) {
  return top + h / 2 + (metrics[font].capHeight * size) / 2;
}

export function fit(str, font, size, maxW, ls = 0) {
  str = String(str);
  if (measure(str, font, size, ls) <= maxW) return str;
  while (str.length > 1 && measure(str + '…', font, size, ls) > maxW) str = str.slice(0, -1).trimEnd();
  return str + '…';
}

// Largest font size (<= size) at which str fits in maxW.
export function fitSize(str, font, size, maxW, min = 10) {
  while (size > min && measure(str, font, size) > maxW) size -= 1;
  return size;
}

export function wrap(str, font, size, maxW, maxLines = 3) {
  const words = String(str).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, font, size) <= maxW || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = fit(lines[maxLines - 1] + ' …', font, size, maxW).replace(/ …$/, '…');
  }
  return lines;
}

export function text(str, { x, y, font = 'mono', size = 14, fill, anchor, ls, cls = '', attrs = '' }) {
  const a = [
    `x="${r(x)}"`,
    `y="${r(y)}"`,
    `class="${FONT_CLASS[font]}${cls ? ' ' + cls : ''}"`,
    `font-size="${size}"`,
    fill && `fill="${fill}"`,
    anchor && anchor !== 'start' && `text-anchor="${anchor}"`,
    ls && `letter-spacing="${ls}"`,
    attrs,
  ].filter(Boolean);
  return `<text ${a.join(' ')}>${esc(str)}</text>`;
}

export const r = (n) => Math.round(n * 10) / 10;

export function makeTheme(palette) {
  const t = { ...palette };

  // Filled rectangle with a thick ink border and an offset hard shadow.
  t.box = ({ x, y, w, h, fill = t.paper, stroke = 3, shadow = 6, rx = 0, cls = '', attrs = '' }) =>
    (shadow
      ? `<rect class="sh" x="${r(x + shadow)}" y="${r(y + shadow)}" width="${r(w)}" height="${r(h)}" rx="${rx}"/>`
      : '') +
    `<rect${cls ? ` class="${cls}"` : ''} x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${rx}" fill="${fill}" stroke="${t.ink}" stroke-width="${stroke}" ${attrs}/>`;

  // Pill of text sized to its content. Returns { svg, w, h }.
  t.chip = (label, o = {}) => {
    const {
      x = 0, y = 0, font = 'monoBold', size = 12, fill = t.paper, color = t.ink,
      padX = 10, h = Math.round(size * 2.1), stroke = 2.5, shadow = 3, anchor = 'start', rotate = 0, ls = 0.5, cls = '',
    } = o;
    const w = Math.ceil(measure(label, font, size, ls) + padX * 2);
    const left = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    const body =
      t.box({ x: left, y, w, h, fill, stroke, shadow, cls }) +
      text(label, { x: left + padX, y: capBaseline(y, h, font, size), font, size, fill: color, ls });
    const cx = left + w / 2, cy = y + h / 2;
    const svg = rotate ? `<g transform="rotate(${rotate} ${r(cx)} ${r(cy)})">${body}</g>` : body;
    return { svg, w, h, x: left };
  };

  return t;
}

// Concave four-point sparkle.
export function sparkle(cx, cy, rad, fill, attrs = '') {
  const p = (dx, dy) => `${r(cx + dx)},${r(cy + dy)}`;
  const k = rad * 0.18;
  return `<path d="M${p(0, -rad)} C${p(k, -k)} ${p(k, -k)} ${p(rad, 0)} C${p(k, k)} ${p(k, k)} ${p(0, rad)} C${p(-k, k)} ${p(-k, k)} ${p(-rad, 0)} C${p(-k, -k)} ${p(-k, -k)} ${p(0, -rad)}Z" fill="${fill}" ${attrs}/>`;
}

// Spiky starburst sticker outline.
export function burst(cx, cy, outer, inner, points) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${r(cx + rad * Math.cos(a))},${r(cy + rad * Math.sin(a))}`);
  }
  return pts.join(' ');
}

// Wraps a body in an <svg> document with fonts, theme CSS and a11y text.
export function doc({ w, h, title, desc = '', body, css = '', theme }) {
  const used = Object.entries(FONT_CLASS).filter(([, c]) => new RegExp(`class="${c}[" ]`).test(body));
  const faces = used
    .map(([k]) => {
      const family = k === 'display' ? 'NB Display' : 'NB Mono';
      const weight = k === 'monoBold' ? 700 : 400;
      return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff;base64,${fontData[k]}) format('woff')}`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>
${faces}
.fd{font-family:'NB Display','Arial Black',Impact,sans-serif;font-weight:400}
.fm{font-family:'NB Mono',Consolas,'Courier New',monospace;font-weight:400}
.fb{font-family:'NB Mono',Consolas,'Courier New',monospace;font-weight:700}
.sh{fill:${theme.ink}}
@media (prefers-color-scheme:dark){.sh{fill:${theme.darkShadow}}.edge{stroke:${theme.darkShadow}}}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}
