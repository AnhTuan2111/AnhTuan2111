// Renders every enabled module in config.mjs to an SVG in the output folder.
//   node generator/build.mjs            all modules
//   node generator/build.mjs hero stats only these
// Needs GH_TOKEN (or GITHUB_TOKEN) for the GitHub API; WAKATIME_API_KEY is optional.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import config from './config.mjs';
import { makeTheme } from './lib/svg.mjs';
import { loadUser, loadRepo, calendarStats } from './lib/github.mjs';
import { loadLearning } from './lib/learning.mjs';

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const memo = (fn) => {
  let p;
  return () => (p ??= fn());
};
const repos = new Map();

const data = {
  user: memo(() => {
    if (!token) throw new Error('Set GH_TOKEN to a GitHub token (in Actions: secrets.GITHUB_TOKEN works).');
    return loadUser(config.login, token);
  }),
  stats: memo(async () => calendarStats((await data.user()).contributionsCollection.contributionCalendar)),
  // Resolves to null when the repo is missing or the token cannot see it.
  repo: (name) => {
    if (!repos.has(name)) repos.set(name, token ? loadRepo(config.login, name, token).catch(() => null) : Promise.resolve(null));
    return repos.get(name);
  },
  json: async (url) => {
    const res = await fetch(url, { headers: { 'User-Agent': 'profile-generator' } });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  },
  // DevOps roadmap progress, shared by the hero loading bar and the learning card.
  learning: memo(() => loadLearning(config.learning, data.json)),
};

const ctx = { config, theme: makeTheme(config.palette), data, now: new Date() };
const only = process.argv.slice(2);
const outDir = join(process.cwd(), config.outDir);
await mkdir(outDir, { recursive: true });

const failed = [];
for (const id of config.modules.filter((m) => !only.length || only.includes(m))) {
  try {
    const { default: render } = await import(`./modules/${id}.mjs`);
    const files = (await render(ctx)) ?? [];
    for (const { file, svg } of files) await writeFile(join(outDir, file), svg);
    console.log(`✓ ${id}${files.length ? ': ' + files.map((f) => f.file).join(', ') : ' (skipped)'}`);
  } catch (err) {
    // One broken module must not take the others down; its previous SVG stays in place.
    failed.push(id);
    console.error(`✗ ${id}: ${err.stack ?? err}`);
  }
}
if (failed.length) process.exitCode = 1;
