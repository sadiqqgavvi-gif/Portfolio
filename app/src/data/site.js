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
  { id: 'services', label: 'Services' },
  { id: 'stack', label: 'Stack' },
  { id: 'work', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' }
];

export const roles = ['MERN web apps', 'real-time chat systems', 'AI-powered tools', '3D web experiences', 'Chrome extensions'];

export const marquee = {
  tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Three.js', 'Tailwind CSS', 'OpenAI API', 'Docker', 'GitHub Actions'],
  traits: ['Full stack', 'Real-time', 'AI-assisted', 'Secure by default', 'Built & deployed', 'Clean structure']
};

export const stats = [
  { to: 4, label: 'Projects built end to end, from an AI interview coach to a Chrome extension.' },
  { to: 30000, suffix: '+', separator: ',', label: 'Interview questions served by SmartHire, my final year project.' },
  { to: 5, label: 'AI tools in my daily workflow, alongside VS Code and Antigravity.' },
  { from: 2022, to: 2026, label: 'Graduated with a BS in Software Engineering.' }
];

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

// Listed top to bottom the way a request travels through the stack. `layer` matches a slab in the 3D scene.
export const mern = [
  { letter: 'M', name: 'MongoDB', role: 'Stores the data, modeled with Mongoose', layer: 3 },
  { letter: 'E', name: 'Express.js', role: 'Routes and secures the API', layer: 1 },
  { letter: 'R', name: 'React.js', role: 'Builds the interface', layer: 0 },
  { letter: 'N', name: 'Node.js', role: 'Runs the server', layer: 2 }
];

export const skills = [
  { title: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Three.js', 'GSAP', 'Responsive design'] },
  { title: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs'] },
  { title: 'Database', items: ['MongoDB (Mongoose)', 'MySQL'] },
  { title: 'AI development tools', items: ['ChatGPT', 'Claude', 'Codex', 'Google Antigravity', 'Gemini'], accent: true },
  { title: 'Authentication & security', items: ['JWT', 'Google OAuth', 'bcrypt', 'Helmet', 'CORS', 'Rate limiting'] },
  { title: 'Real-time & integrations', items: ['Socket.io', 'WebRTC', 'Server-Sent Events', 'OpenAI API', 'Web Speech API'] },
  { title: 'Tools & DevOps', items: ['VS Code', 'Git', 'GitHub Actions', 'Docker', 'Netlify', 'Vercel'] },
  { title: 'Core concepts', items: ['AI-assisted development', 'Project structure', 'OOP', 'Component architecture', 'CRUD'] }
];

export const journey = [
  {
    years: '2022 – 26',
    status: 'Graduated',
    title: 'BS Software Engineering',
    place: 'PMAS Arid Agriculture University, Rawalpindi',
    note: 'Final year project: SmartHire, an AI-powered interview preparation platform.'
  },
  {
    years: '2020 – 22',
    status: 'Completed',
    title: 'Intermediate in Computer Science (ICS)',
    place: 'Degree College, Jhelum'
  },
  {
    years: '2018 – 20',
    status: 'Completed',
    title: 'Matriculation, Computer Science',
    place: 'M.A Jinnah Grammar High School'
  }
];
