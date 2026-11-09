// Everything the profile says lives here. Edit, push, and the "Build profile" workflow re-renders the cards.
// Text is drawn with embedded fonts that only cover ASCII, so Vietnamese accents are folded (e.g. "Việt" -> "Viet").

export default {
  login: 'AnhTuan2111',
  timeZone: 'Asia/Ho_Chi_Minh',
  outDir: 'profile',

  // Modules to render, one file each in generator/modules/. The README is a plain YAML block plus the snake
  // now, so nothing is rendered. Every module (orbit, hero, marquee, sections, stats, languages, wakatime,
  // footer, projects, roadmap, learning) still works with its settings below: add its name here and an
  // <img> or <picture> to README.md to bring a card back.
  modules: [],

  // Red, blue and yellow, each in a strong and a light tone, on cream. The cards were first written for six
  // unrelated accents, so the slot names (pink, orange, lime, violet) are historical: go by the comments.
  // Every colour here must be light enough for ink text on top of it.
  palette: {
    ink: '#141414',
    paper: '#F4ECD8',
    pink: '#EE4B3A', // red: the lead colour
    orange: '#F59C8E', // light red
    blue: '#3F82E0',
    lime: '#9DBFF0', // light blue
    yellow: '#F4C92E',
    violet: '#FAE395', // light yellow
    // Hard shadows are ink on light pages; on GitHub dark mode they switch to this colour.
    darkShadow: '#F4ECD8',
  },

  hero: {
    greeting: "HELLO, I'M",
    name: ['NGUYEN', 'ANH TUAN'],
    role: 'DEVOPS ENGINEER',
    // Set `next` (e.g. 'SRE') to draw "ROLE -> NEXT" with a loading bar after it; null draws the role alone.
    next: null,
    // Loading bar after `next`: 'learning' fills it from the DevOps roadmap below, or pin it with a number 0-6.
    nextProgress: 'learning',
    // Sparkle-separated line under the role; empty draws nothing.
    meta: [],
    // "Currently pushing to" sticker picks your most recently pushed public repo, except these.
    nowExclude: ['AnhTuan2111'],
  },

  stack: [
    'DOCKER', 'KUBERNETES', 'OPENSHIFT', 'RANCHER', 'ARGO CD', 'GITLAB CI', 'HARBOR', 'PORTAINER',
    'PROMETHEUS', 'GRAFANA', 'LOKI', 'NGINX', 'HAPROXY', 'PATRONI', 'POSTGRESQL', 'MINIO', 'KEYCLOAK',
  ],
  // Band colour of the scrolling stack strip (a palette slot name).
  marquee: { fill: 'pink' },

  // Section dividers, rendered to profile/section-<id>.svg.
  sections: [
    { id: 'numbers', title: 'BY THE NUMBERS', note: 'UPDATED DAILY' },
    { id: 'contrib', title: 'CONTRIBUTION GRAPH', note: 'EATEN DAILY' },
  ],

  // Header: name and role in the middle, tool logos circling them. Rings fill in order from config.tools,
  // innermost first, and their counts must add up to the number of tools. `seconds` is one lap.
  orbit: {
    name: 'Nguyễn Anh Tuấn',
    role: 'DevOps engineer',
    rings: [
      { rx: 205, ry: 98, count: 6, seconds: 46 },
      { rx: 305, ry: 148, count: 10, seconds: 64, reverse: true },
      { rx: 405, ry: 205, count: 13, seconds: 84 },
    ],
  },

  // Tools I have run myself. `id` names the logo in generator/logos/ (official marks, see logos/SOURCES.md).
  tools: [
    { id: 'docker', name: 'Docker' }, { id: 'kaniko', name: 'Kaniko' }, { id: 'harbor', name: 'Harbor' },
    { id: 'gitlab', name: 'GitLab CI' }, { id: 'githubactions', name: 'GitHub Actions' }, { id: 'argocd', name: 'Argo CD' },
    { id: 'kubernetes', name: 'Kubernetes' }, { id: 'openshift', name: 'OpenShift' }, { id: 'rancher', name: 'Rancher' },
    { id: 'longhorn', name: 'Longhorn' }, { id: 'portainer', name: 'Portainer' }, { id: 'ubuntu', name: 'Ubuntu' },
    { id: 'bash', name: 'Bash' }, { id: 'incus', name: 'Incus' }, { id: 'nginx', name: 'Nginx' },
    { id: 'npm', name: 'Nginx Proxy Manager' }, { id: 'haproxy', name: 'HAProxy' }, { id: 'keycloak', name: 'Keycloak' },
    { id: 'openvpn', name: 'OpenVPN' }, { id: 'prometheus', name: 'Prometheus' }, { id: 'grafana', name: 'Grafana' },
    { id: 'loki', name: 'Loki' }, { id: 'alloy', name: 'Alloy' }, { id: 'postgresql', name: 'PostgreSQL' },
    { id: 'patroni', name: 'Patroni' }, { id: 'etcd', name: 'etcd' }, { id: 'redis', name: 'Redis' },
    { id: 'minio', name: 'MinIO' }, { id: 'rclone', name: 'rclone' },
  ],

  languages: {
    top: 6,
    // Languages to leave out, e.g. ['HTML', 'CSS']. The card then says "NOT COUNTED: ..." so nobody misreads it.
    ignore: [],
    exclude: ['AnhTuan2111'],
  },

  // Project cards, rendered to profile/project-<id>.svg. `repo` pulls live data (last push, stars, language);
  // private repos only resolve when the workflow token can read them. `tag` may be a function of that data.
  //
  // The grid is deliberately uneven: four rectangles of four sizes, each tilted its own way (`tilt`, degrees).
  // `width` and `height` are viewBox units. The two cards of a README row must share a height and have widths
  // that add up to 1000; the README then shows them at those widths as percentages (57% + 42%, 46% + 53%),
  // on one line with no space between the tags so the pair never wraps on a phone.
  projects: [
    {
      id: 'offline-translate',
      repo: 'DictPocket',
      title: 'DICTPOCKET',
      kicker: 'EN <-> VI DESKTOP APP',
      color: 'pink',
      width: 576, height: 326, tilt: -1.6,
      tag: (repo) => `${repo?.latestTag ?? 'v1.0.0'} SHIPPED`,
      blurb: 'Offline EN-VI dictionary + sentence translator for Windows, in a Win9x pixel UI. 109K entries, 13.7 µs lookups, local neural MT on ONNX.',
      stack: ['Java 25', 'JavaFX', 'ONNX Runtime', 'jpackage'],
    },
    {
      id: 'rims',
      repo: 'RIMS',
      title: 'RIMS',
      kicker: 'RESTAURANT INTERNAL MANAGEMENT',
      color: 'blue',
      width: 424, height: 326, tilt: 1.4,
      tag: 'TEAM LEAD',
      blurb: 'Five roles, one system: real-time kitchen board over WebSocket, VNPay checkout, JWT + OTP auth. SWP391 capstone, leading a team of 6.',
      stack: ['Spring Boot 4', 'React 19', 'WebSocket', 'PostgreSQL'],
    },
    {
      id: 'iwork',
      title: 'iWORK',
      kicker: 'AT DTH SOFTWARE JSC',
      color: 'orange',
      width: 464, height: 304, tilt: 1,
      tag: 'DAY JOB',
      private: 'COMPANY PROJECT',
      blurb: 'Directive, task and KPI tracking platform. AI reads PDF directives, pulls out tasks and summarizes reports; Gantt, Kanban and calendar views.',
      stack: ['Jmix 3', 'Vaadin 25', 'Spring AI', 'React 19'],
    },
    {
      id: 'devops-self-learning',
      repo: 'devops-self-learning',
      title: 'DEVOPS SELF-LEARNING',
      kicker: '42 LESSONS, DOCKER -> GITOPS',
      color: 'yellow',
      width: 536, height: 304, tilt: -1.3,
      tag: 'IN PROGRESS',
      blurb: 'DevOps from zero to enterprise-ready, learned in public: Docker, a real server, GitLab CI, Kubernetes, Rancher, then GitOps with Argo CD. Theory, labs and real errors.',
      stack: ['Docker', 'GitLab CI', 'Kubernetes', 'Rancher'],
    },
  ],

  // DevOps progress, read from the public devops-self-learning repo (curriculum.json + progress.json).
  // Feeds the roadmap strip and the hero's loading bar; `tag` and `cta` are only used by the full `learning` card.
  learning: {
    title: 'DEVOPS FROM ZERO',
    tag: 'THEORY / LAB / REAL ERRORS',
    curriculum: 'https://raw.githubusercontent.com/AnhTuan2111/devops-self-learning/main/curriculum.json',
    progress: 'https://raw.githubusercontent.com/AnhTuan2111/devops-self-learning/main/progress.json',
    cta: 'READ THE LOG',
    labels: { M0: 'BASICS', M1: 'DOCKER', M2: 'SERVER', M3: 'GITLAB CI', M4: 'K8S', M5: 'RANCHER' },
  },
};
