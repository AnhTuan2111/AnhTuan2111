// Everything the profile says lives here. Edit, push, and the "Build profile" workflow re-renders the cards.
// Text is drawn with embedded fonts that only cover ASCII, so Vietnamese accents are folded (e.g. "Việt" -> "Viet").

export default {
  login: 'AnhTuan2111',
  timeZone: 'Asia/Ho_Chi_Minh',
  outDir: 'profile',

  // Modules to render, one file each in generator/modules/. Remove a name to stop rendering that card;
  // add a new file + name here to plug in your own. `wakatime` skips itself until WAKATIME_API_KEY is set.
  modules: ['hero', 'marquee', 'sections', 'stats', 'languages', 'projects', 'learning', 'wakatime', 'footer'],

  palette: {
    ink: '#111111',
    paper: '#FFF4DE',
    yellow: '#FFD23F',
    pink: '#FF7AC6',
    blue: '#74B9FF',
    lime: '#B8F36B',
    orange: '#FF8A4C',
    violet: '#B69CFF',
    // Hard shadows are ink on light pages; on GitHub dark mode they switch to this colour.
    darkShadow: '#FFF4DE',
  },

  hero: {
    greeting: "HELLO, I'M",
    name: ['NGUYEN', 'ANH TUAN'],
    role: 'FULLSTACK DEVELOPER',
    next: 'DEVOPS',
    // Loading bar after `next`: 'learning' fills it from the DevOps roadmap below, or pin it with a number 0-6.
    nextProgress: 'learning',
    meta: ['DTH SOFTWARE JSC', 'VIETNAM, GMT+7', 'SPRING BOOT x JMIX x REACT'],
    // "Currently pushing to" sticker picks your most recently pushed public repo, except these.
    nowExclude: ['AnhTuan2111'],
  },

  stack: [
    'JAVA', 'SPRING BOOT', 'SPRING SECURITY', 'JMIX', 'VAADIN', 'REACT', 'TYPESCRIPT',
    'POSTGRESQL', 'SQLITE', 'DOCKER', 'GITLAB CI', 'JAVAFX', 'ONNX RUNTIME', 'SPRING AI',
  ],

  // Section dividers, rendered to profile/section-<id>.svg.
  sections: [
    { id: 'numbers', title: 'BY THE NUMBERS', note: 'UPDATED DAILY' },
    { id: 'building', title: "WHAT I'M BUILDING", note: '3 PUBLIC / 1 AT WORK' },
    { id: 'learning', title: 'ROAD TO DEVOPS', note: 'LEARNING IN PUBLIC' },
    { id: 'contrib', title: 'CONTRIBUTION GRAPH', note: 'EATEN DAILY' },
  ],

  languages: {
    top: 6,
    // Languages to leave out, e.g. ['HTML', 'CSS']. The card then says "NOT COUNTED: ..." so nobody misreads it.
    ignore: [],
    exclude: ['AnhTuan2111'],
  },

  // Project cards, rendered to profile/project-<id>.svg. `repo` pulls live data (last push, stars, language);
  // private repos only resolve when the workflow token can read them. `tag` may be a function of that data.
  projects: [
    {
      id: 'offline-translate',
      repo: 'offline-translate-vi-en',
      title: 'OFFLINE TRANSLATE',
      kicker: 'EN <-> VI DESKTOP APP',
      color: 'yellow',
      tag: (repo) => `${repo?.latestTag ?? 'v1.0.0'} SHIPPED`,
      blurb: 'Dictionary + sentence translator for Windows that never touches the internet. 109K entries, 13.7 µs lookups, local neural MT on ONNX.',
      stack: ['Java 25', 'JavaFX', 'ONNX Runtime', 'SQLite'],
    },
    {
      id: 'rims',
      repo: 'RIMS',
      title: 'RIMS',
      kicker: 'RESTAURANT INTERNAL MANAGEMENT',
      color: 'pink',
      tag: 'TEAM LEAD',
      blurb: 'Five roles, one system: real-time kitchen board over WebSocket, VNPay checkout, JWT + OTP auth. SWP391 capstone, leading a team of 6.',
      stack: ['Spring Boot 4', 'React 19', 'WebSocket', 'PostgreSQL'],
    },
    {
      id: 'devops-self-learning',
      repo: 'devops-self-learning',
      title: 'DEVOPS SELF-LEARNING',
      kicker: '39 LESSONS, DOCKER -> K8S',
      color: 'lime',
      tag: 'IN PROGRESS',
      blurb: 'DevOps from zero, learned in public: Docker first, then a real server, GitLab CI, Kubernetes and Rancher. Each lesson has theory, a lab and real errors.',
      stack: ['Docker', 'GitLab CI', 'Kubernetes', 'Rancher'],
    },
    {
      id: 'iwork',
      title: 'iWORK',
      kicker: 'AT DTH SOFTWARE JSC',
      color: 'blue',
      tag: 'DAY JOB',
      private: 'COMPANY PROJECT',
      blurb: 'Directive, task and KPI tracking platform. AI reads PDF directives, pulls out tasks and summarizes reports; Gantt, Kanban and calendar views.',
      stack: ['Jmix 3', 'Vaadin 25', 'Spring AI', 'React 19'],
    },
  ],

  // Progress card fed by the public devops-self-learning repo (curriculum.json + progress.json).
  learning: {
    title: 'DEVOPS FROM ZERO',
    tag: 'THEORY / LAB / REAL ERRORS',
    curriculum: 'https://raw.githubusercontent.com/AnhTuan2111/devops-self-learning/main/curriculum.json',
    progress: 'https://raw.githubusercontent.com/AnhTuan2111/devops-self-learning/main/progress.json',
    cta: 'READ THE LOG',
    labels: { M0: 'BASICS', M1: 'DOCKER', M2: 'SERVER', M3: 'GITLAB CI', M4: 'K8S', M5: 'RANCHER' },
  },
};
