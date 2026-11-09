// Header: the name in the middle, tool logos circling it on dashed ellipses (config.orbit + config.tools).
// Rendered twice, orbit-light.svg and orbit-dark.svg, with fixed colours. A prefers-color-scheme query inside
// the SVG would follow the viewer's OS, not GitHub's theme, and gives white text on a white page when the two
// disagree; the README picks the file with <picture>, which GitHub matches to its own theme.
// Text uses system fonts because the embedded ones are ASCII-only and the name carries Vietnamese marks.
import { readFileSync } from 'node:fs';
import { esc } from '../lib/svg.mjs';

const logoDir = new URL('../logos/', import.meta.url);
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
const THEMES = {
  light: { ink: '#1f2328', muted: '#59636e', rule: '#afb8c1', tile: '#ffffff', tileEdge: '#d1d9e0' },
  dark: { ink: '#f0f6fc', muted: '#9198a1', rule: '#768390', tile: '#f6f8fa', tileEdge: '#f6f8fa' },
};

export default async function orbit({ config }) {
  const o = config.orbit, tools = config.tools;
  const total = o.rings.reduce((n, r) => n + r.count, 0);
  if (total !== tools.length) throw new Error(`orbit rings hold ${total} tiles but config.tools has ${tools.length}`);

  const W = 860, H = 470, cx = W / 2, cy = H / 2, T = 46, L = 28;
  // Each logo is embedded once and drawn with <use>.
  const defs = '<defs>' + tools.map(({ id }) =>
    `<image id="l-${id}" width="${L}" height="${L}" href="data:image/svg+xml;base64,${readFileSync(new URL(`${id}.svg`, logoDir)).toString('base64')}"/>`).join('') + '</defs>';
  const path = (r) => `M${cx - r.rx} ${cy}a${r.rx} ${r.ry} 0 1 0 ${2 * r.rx} 0a${r.rx} ${r.ry} 0 1 0 ${-2 * r.rx} 0`;

  const render = (c) => {
    let b = defs;
    for (const r of o.rings) b += `<ellipse cx="${cx}" cy="${cy}" rx="${r.rx}" ry="${r.ry}" fill="none" stroke="${c.rule}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 7"/>`;
    b += `<text x="${cx}" y="${cy - 2}" font-size="34" font-weight="600" fill="${c.ink}" text-anchor="middle">${esc(o.name)}</text>`;
    b += `<text x="${cx}" y="${cy + 28}" font-size="16" fill="${c.muted}" text-anchor="middle">${esc(o.role)}</text>`;
    let k = 0;
    for (const r of o.rings) {
      for (let j = 0; j < r.count; j++, k++) {
        const { id, name } = tools[k];
        // Negative begin spreads the tiles evenly round the ring from the first frame.
        const begin = (-(r.seconds * j) / r.count).toFixed(2);
        const back = r.reverse ? ' keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : '';
        b += `<g><title>${esc(name)}</title>` +
          `<rect x="${-T / 2}" y="${-T / 2}" width="${T}" height="${T}" rx="12" fill="${c.tile}" stroke="${c.tileEdge}" stroke-width="1"/>` +
          `<use href="#l-${id}" x="${-L / 2}" y="${-L / 2}"/>` +
          `<animateMotion dur="${r.seconds}s" begin="${begin}s" repeatCount="indefinite" path="${path(r)}"${back}/></g>`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">` +
      `<title>${esc(o.name)}, ${esc(o.role)}</title><desc>${esc(tools.map((t) => t.name).join(', '))}</desc>` +
      `<style>text{font-family:${FONT}}</style>${b}</svg>\n`;
  };

  return Object.entries(THEMES).map(([name, c]) => ({ file: `orbit-${name}.svg`, svg: render(c) }));
}
