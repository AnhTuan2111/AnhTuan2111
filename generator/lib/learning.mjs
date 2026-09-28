// Reads curriculum.json + progress.json from the learning repo into modules, lessons and overall progress.
import { toAscii } from './svg.mjs';

export async function loadLearning(L, json) {
  const [curriculum, progress] = await Promise.all([json(L.curriculum), json(L.progress)]);
  const status = (id) => progress.lessons?.[id]?.status ?? 'todo';

  const modules = curriculum.modules.map((m) => {
    const lessons = m.lessons.map((l) => ({ id: l.id, status: status(l.id) }));
    const done = lessons.filter((l) => l.status === 'done').length;
    return {
      id: m.id,
      label: L.labels?.[m.id] ?? toAscii(m.title.split(' — ')[0]).toUpperCase(),
      lessons,
      done,
      state: done === lessons.length ? 'done' : lessons.some((l) => l.status !== 'todo') ? 'doing' : 'todo',
    };
  });
  const all = modules.flatMap((m) => m.lessons);
  const current = all.find((l) => l.status === 'doing') ?? all.find((l) => l.status !== 'done');

  return {
    meta: curriculum.meta ?? {},
    modules,
    all,
    doneCount: all.filter((l) => l.status === 'done').length,
    current,
    hereIdx: Math.max(0, modules.findIndex((m) => m.lessons.includes(current))),
  };
}
