// GitHub GraphQL loader plus the numbers the cards need (streaks, weekly totals, language split).

async function gql(query, variables, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-generator' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GitHub GraphQL: ${json.errors.map((e) => e.message).join('; ')}`);
  return json.data;
}

const USER_QUERY = `query($login: String!) {
  user(login: $login) {
    name login location company createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name url isPrivate isArchived pushedAt stargazerCount
        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
      }
    }
    contributionsCollection {
      totalCommitContributions restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount weekday } } }
    }
  }
}`;

const REPO_QUERY = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name description url isPrivate pushedAt stargazerCount forkCount
    primaryLanguage { name }
    latestRelease { tagName publishedAt }
    refs(refPrefix: "refs/tags/", last: 1, orderBy: {field: TAG_COMMIT_DATE, direction: ASC}) { nodes { name } }
    defaultBranchRef { target { ... on Commit { history { totalCount } } } }
  }
}`;

export async function loadUser(login, token) {
  const { user } = await gql(USER_QUERY, { login }, token);
  if (!user) throw new Error(`GitHub user ${login} not found`);
  return user;
}

export async function loadRepo(owner, name, token) {
  const { repository: r } = await gql(REPO_QUERY, { owner, name }, token);
  if (!r) return null;
  return {
    name: r.name,
    description: r.description,
    url: r.url,
    isPrivate: r.isPrivate,
    pushedAt: r.pushedAt,
    stars: r.stargazerCount,
    forks: r.forkCount,
    language: r.primaryLanguage?.name ?? null,
    latestTag: r.latestRelease?.tagName ?? r.refs.nodes[0]?.name ?? null,
    commits: r.defaultBranchRef?.target?.history?.totalCount ?? null,
  };
}

export function calendarStats(calendar) {
  const days = calendar.weeks.flatMap((w) => w.contributionDays).sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0, run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  // Today may not have contributions yet; don't let that break the current streak.
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].contributionCount > 0) {
    current++;
    i--;
  }

  const best = days.reduce((a, d) => (d.contributionCount > a.contributionCount ? d : a), days[0]);
  const weekdays = Array(7).fill(0);
  for (const d of days) weekdays[d.weekday] += d.contributionCount;

  return {
    total: calendar.totalContributions,
    activeDays: days.filter((d) => d.contributionCount > 0).length,
    dayCount: days.length,
    current,
    longest,
    best,
    busiestWeekday: weekdays.indexOf(Math.max(...weekdays)),
    weeks: calendar.weeks.map((w) => w.contributionDays.reduce((s, d) => s + d.contributionCount, 0)),
  };
}

export function languageSplit(repos, { ignore = [], exclude = [], top = 6 } = {}) {
  const totals = new Map();
  const skipped = new Set();
  for (const repo of repos) {
    if (repo.isArchived || exclude.includes(repo.name)) continue;
    for (const { size, node } of repo.languages.edges) {
      if (ignore.includes(node.name)) {
        skipped.add(node.name);
        continue;
      }
      totals.set(node.name, (totals.get(node.name) ?? 0) + size);
    }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const langs = sorted.slice(0, top).map(([name, size]) => ({ name, size, pct: (size / sum) * 100 }));
  const rest = sorted.slice(top).reduce((s, [, size]) => s + size, 0);
  if (rest / sum >= 0.001) langs.push({ name: 'Other', size: rest, pct: (rest / sum) * 100 });
  return {
    langs,
    bytes: sum,
    repoCount: repos.filter((r) => !r.isArchived && !exclude.includes(r.name)).length,
    // Ignored languages that actually occur, so the card can say what it left out.
    skipped: [...skipped],
  };
}
