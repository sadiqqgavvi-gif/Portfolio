export const site = {
  name: 'Gavriel Sadiq',
  role: 'Full stack web developer',
  email: 'gavisadiq1122@gmail.com',
  phone: '+92 3095242002',
  location: 'Jhelum, Pakistan',
  github: 'https://github.com/sadiqqgavvi-gif',
  githubHandle: 'sadiqqgavvi-gif',
  linkedin: 'https://linkedin.com/in/gavriel-sadiq',
  linkedinHandle: 'gavriel-sadiq',
  resume: 'resume.pdf'
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' }
];

export const roles = ['real-time', 'AI-powered', 'full stack', 'secure', '3D'];

export const services = [
  {
    icon: 'frontend',
    title: 'Frontend',
    text: 'Responsive React interfaces built from reusable components and styled with Tailwind CSS, with 3D and scroll-driven motion where it helps.',
    tags: ['React', 'Tailwind', 'Three.js']
  },
  {
    icon: 'backend',
    title: 'Backend & APIs',
    text: 'REST APIs on Node.js and Express with validation middleware, structured responses and MongoDB schemas modeled in Mongoose.',
    tags: ['Node', 'Express', 'MongoDB']
  },
  {
    icon: 'auth',
    title: 'Auth & security',
    text: 'bcrypt passwords, Google OAuth, short-lived JWTs with rotating httpOnly refresh tokens, Helmet, CORS and rate limits.',
    tags: ['JWT', 'OAuth', 'Helmet']
  },
  {
    icon: 'realtime',
    title: 'Real-time',
    text: 'Socket.io rooms, WebRTC calls and Server-Sent Events for instant delivery, presence, read receipts and live order tracking.',
    tags: ['Socket.io', 'WebRTC', 'SSE']
  },
  {
    icon: 'ai',
    title: 'AI integration',
    text: 'OpenAI-powered evaluation with fallbacks and guardrails, plus voice input and read-back with the Web Speech API.',
    tags: ['OpenAI API', 'Web Speech']
  },
  {
    icon: 'ship',
    title: 'Ship it',
    text: 'Docker images, GitHub Actions CI that tests on every push, and deploys to Netlify and Vercel.',
    tags: ['Docker', 'CI', 'Netlify', 'Vercel']
  }
];

export const proof = [
  { value: '4', label: 'full stack builds' },
  { value: '3', label: 'live demos' },
  { value: '30k+', label: 'questions served' },
  { value: '2026', label: 'BS Software Eng.' }
];

export const process = [
  {
    title: 'Understand & plan',
    text: 'I break a feature into screens, data and endpoints before writing code: the Mongoose schema, the API contract and the edge cases. ChatGPT and Claude help me pressure-test the plan.',
    points: ['Data model first', 'API contract', 'Edge cases listed'],
    code: ['POST /api/orders', '  body  { items, type, table }', '  201   { id, status: "pending" }']
  },
  {
    title: 'Build',
    text: 'React components on the front, Express routes and middleware behind them, in a folder structure someone else can find their way around. AI pair programming in VS Code and Antigravity speeds up the boring parts.',
    points: ['Reusable components', 'Validation middleware', 'Clean structure'],
    code: ["router.patch('/:id/status',", '  requireStaff, validate(status),', '  updateStatus)']
  },
  {
    title: 'Test & secure',
    text: 'Unit and API tests for the logic that matters, then hardening: bcrypt, short-lived JWTs, Helmet, a strict CORS list and rate limits. I check accessibility and Lighthouse scores before calling it done.',
    points: ['Unit & API tests', 'Auth & rate limits', 'Accessibility checks'],
    code: ['$ npm test', '$ npx lighthouse <url>', '$ npx axe <url>']
  },
  {
    title: 'Ship & iterate',
    text: 'Docker images and a GitHub Actions pipeline that tests every push, then deploys to Netlify or Vercel. A clear README so the next developer can run it in minutes.',
    points: ['CI on every push', 'Docker', 'Docs & README'],
    code: ['$ git push origin main', '  ✓ CI  tests passed', '  ✓ deployed to production']
  }
];

// Brand icons come from simple-icons by key; entries without one use a plain monogram.
export const skillGroups = [
  { title: 'Frontend', items: [['React', 'siReact'], ['JavaScript', 'siJavascript'], ['HTML5', 'siHtml5'], ['CSS', 'siCss'], ['Tailwind CSS', 'siTailwindcss'], ['Vite', 'siVite'], ['Three.js', 'siThreedotjs'], ['GSAP', 'siGreensock']] },
  { title: 'Backend', items: [['Node.js', 'siNodedotjs'], ['Express', 'siExpress'], ['REST APIs', null], ['Socket.io', 'siSocketdotio'], ['WebRTC', 'siWebrtc']] },
  { title: 'Data & auth', items: [['MongoDB', 'siMongodb'], ['Mongoose', 'siMongoose'], ['MySQL', 'siMysql'], ['JWT', 'siJsonwebtokens'], ['Google OAuth', 'siGoogle']] },
  { title: 'DevOps', items: [['Git', 'siGit'], ['GitHub', 'siGithub'], ['GitHub Actions', 'siGithubactions'], ['Docker', 'siDocker'], ['Netlify', 'siNetlify'], ['Vercel', 'siVercel']] },
  { title: 'AI tools', items: [['ChatGPT', null], ['Claude', 'siClaude'], ['Gemini', 'siGooglegemini'], ['Codex', null], ['Antigravity', null]] }
];

export const marqueeLogos = [
  ['React', 'siReact'], ['Node.js', 'siNodedotjs'], ['Express', 'siExpress'], ['MongoDB', 'siMongodb'], ['Tailwind CSS', 'siTailwindcss'],
  ['Socket.io', 'siSocketdotio'], ['Three.js', 'siThreedotjs'], ['Docker', 'siDocker'], ['GitHub Actions', 'siGithubactions'],
  ['Vite', 'siVite'], ['JavaScript', 'siJavascript'], ['WebRTC', 'siWebrtc'], ['Vercel', 'siVercel'], ['Netlify', 'siNetlify'], ['GSAP', 'siGreensock']
];
