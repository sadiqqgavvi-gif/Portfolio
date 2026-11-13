import sizes from './shots.json';

// Resolves a screenshot name to its files and intrinsic size (see app/public/shots/).
export const shot = (project, name) => {
  const [w, h] = sizes[project][name];
  return { src: `shots/${project}/${name}.webp`, sm: `shots/${project}/${name}-sm.webp`, w, h };
};

const withShots = project => ({
  ...project,
  heroShot: shot(project.id, project.hero),
  phoneShot: project.phone ? shot(project.id, project.phone) : null,
  floatShot: project.float ? shot(project.id, project.float) : null,
  shots: project.shots.map(([name, caption]) => ({ ...shot(project.id, name), name, caption }))
});

export const projects = [
  {
    id: 'smarthire',
    name: 'SmartHire',
    kind: 'AI interview preparation platform',
    tag: 'Final year project · Live',
    accent: '#7c9bff',
    address: 'smarrthire.netlify.app',
    live: 'https://smarrthire.netlify.app/',
    code: 'https://github.com/sadiqqgavvi-gif/smarthire',
    lede: 'An AI interview coach. Practice technical, behavioral and situational questions by voice or text, and get every answer scored on five criteria with a plan to improve.',
    highlights: [
      { value: '30,000+', label: 'interview questions' },
      { value: '5', label: 'scoring criteria' },
      { value: '97–100', label: 'Lighthouse scores' }
    ],
    chips: ['React 19', 'Vite 7', 'Tailwind CSS', 'React Router 7', 'Recharts', 'Node.js', 'Express 5', 'MongoDB', 'Mongoose 8', 'OpenAI API', 'Web Speech API', 'JWT', 'Google OAuth', 'Docker', 'GitHub Actions', 'Vitest'],
    idea: 'Interview practice usually stops at reading questions. SmartHire makes you answer them, out loud if you want, then scores each answer out of 10 on relevance, depth, structure, clarity and examples, shows what you missed, and tracks your progress over time.',
    features: [
      { title: 'Practice & mock modes', text: 'Three tracks, Easy to Hard, with 5 to 20 questions, or a 10-question mock interview with skip, a timer and a per-question breakdown.' },
      { title: 'Voice interviews', text: 'The Web Speech API reads questions aloud, transcribes answers live and checks speaking pace in words per minute.' },
      { title: 'Five-criteria scoring', text: 'Relevance, depth, structure, clarity and examples, weighted per interview type, with STAR checks for behavioral answers.' },
      { title: 'Reference answers', text: '1,231 technical answers are compared with an answer key, so feedback names the concepts you missed and offers a model answer.' },
      { title: 'Guardrails & fallback', text: 'Short, off-topic or gibberish answers are capped. OpenAI can write richer feedback, and the built-in engine takes over if that call fails.' },
      { title: 'Secure by default', text: 'bcrypt, Google sign-in, short-lived JWTs with rotating httpOnly refresh tokens, Helmet, a strict CORS allow-list and per-route rate limits.' }
    ],
    meta: [
      ['Role', 'Solo build: design, frontend, backend'],
      ['Type', 'Final year project, BS Software Engineering'],
      ['Question bank', '30,000+ across 20+ technologies'],
      ['Quality', 'Lighthouse 97–100, WCAG 2 AA checks'],
      ['Status', 'Live on Netlify and Vercel']
    ],
    flow: {
      title: 'How an answer gets scored',
      steps: [
        ['Input', 'Your answer', 'Typed, or spoken and transcribed live with the Web Speech API.'],
        ['Context', 'Reference answer', 'Looked up from 1,231 curated question and answer pairs.'],
        ['Scoring', 'Five criteria', 'Each scored 0 to 10 and weighted by interview type.'],
        ['Guardrails', 'Score caps', 'Short, off-topic or keyword-stuffed answers cannot inflate a score.'],
        ['Output', 'Feedback', 'Strengths, missing concepts, filler words and a model answer.']
      ]
    },
    hero: 'hero-light',
    phone: 'mobile',
    float: 'dashboard-dark',
    shots: [
      ['hero-light', 'Landing page, light mode'],
      ['hero-dark', 'Landing page, dark mode'],
      ['practice-tracks', 'Three interview tracks'],
      ['configure', 'Configure a practice session'],
      ['practice-feedback', 'Practice feedback with a model answer'],
      ['mock-interview', 'Mock interview in progress'],
      ['mock-feedback', 'AI feedback on a STAR answer'],
      ['mock-results', 'Mock interview results'],
      ['dashboard', 'Progress dashboard'],
      ['dashboard-dark', 'Dashboard, dark mode'],
      ['features', 'Feature overview'],
      ['signup', 'Sign up with Google or email'],
      ['login-dark', 'Log in, dark mode'],
      ['faq', 'Frequently asked questions'],
      ['contact', 'Contact form'],
      ['final-cta', 'Call to action'],
      ['mobile', 'SmartHire on a phone']
    ]
  },
  {
    id: 'ember',
    name: 'Ember',
    kind: 'Restaurant management system',
    tag: 'Full stack MERN · Live',
    accent: '#ffab4a',
    address: 'ember-restaurant-henna.vercel.app',
    live: 'https://ember-restaurant-henna.vercel.app',
    code: 'https://github.com/sadiqqgavvi-gif/Restaurant-Management-System',
    lede: 'A restaurant platform with online ordering, table reservations, live order tracking and a staff dashboard, presented through an interactive 3D, scroll-driven frontend.',
    highlights: [
      { value: 'Live', label: 'order tracking over SSE' },
      { value: '3D', label: 'React Three Fiber scenes' },
      { value: 'CI', label: 'tests on every push' }
    ],
    chips: ['React 19', 'Vite', 'Tailwind CSS 4', 'React Three Fiber', 'Three.js', 'GSAP ScrollTrigger', 'Lenis', 'Node.js', 'Express 5', 'MongoDB', 'Mongoose', 'JWT', 'Server-Sent Events', 'GitHub Actions', 'Vercel'],
    idea: 'A restaurant needs more than a menu page. Ember lets customers order and book online, gives staff a live dashboard, and pushes every status change from the kitchen to the customer’s tracking page without a refresh.',
    features: [
      { title: 'Online ordering', text: 'A menu with category filters, search and a persistent cart, then checkout for pickup, delivery or dine-in.' },
      { title: 'Live order tracking', text: 'Server-Sent Events push each status change, from pending to served, to the tracking page and the staff feed.' },
      { title: 'Tamper-proof pricing', text: 'The server recalculates every price and the tax from the database, and the public tracking view never exposes phone, email or address.' },
      { title: 'Reservations', text: 'Table bookings with party size, time slots and occasion, which staff confirm, seat, complete or cancel.' },
      { title: 'Staff dashboard', text: 'A JWT-protected overview of revenue, active orders and best sellers, plus order, reservation and menu management.' },
      { title: '3D & motion', text: 'A 3D hero dish, a pinned orbit of dishes around a cloche, a horizontal scroll journey and a stacked card deck, tuned for performance.' }
    ],
    meta: [
      ['Role', 'Solo build: design, frontend, backend'],
      ['Type', 'Full stack MERN web app'],
      ['Real-time', 'Server-Sent Events with a polling fallback'],
      ['Tests', 'Unit and API integration tests in CI'],
      ['Status', 'Live on Vercel']
    ],
    flow: {
      title: 'How an order update travels',
      steps: [
        ['Staff', 'Status change', 'The kitchen moves an order to preparing, ready or served.'],
        ['Server', 'Event bus', 'The API saves the change and emits an order event.'],
        ['Stream', 'Server-Sent Events', 'Open connections for the customer and the staff feed receive it.'],
        ['Customer', 'Tracking page', 'The progress steps update with no refresh and no polling.'],
        ['Fallback', 'Light polling', 'On serverless hosting, a short poll covers a dropped stream.']
      ]
    },
    hero: 'hero',
    phone: 'mobile',
    float: 'tracking',
    shots: [
      ['hero', 'Home page with an interactive 3D dish'],
      ['orbit', 'Orbital menu, pinned and scroll-driven'],
      ['experiences', 'Experiences card deck'],
      ['journey', 'Horizontal scroll journey'],
      ['cta', 'Reservation call to action'],
      ['tracking', 'Live order tracking'],
      ['dashboard', 'Staff dashboard overview'],
      ['dashboard-orders', 'Live orders feed'],
      ['mobile', 'Ember on a phone']
    ]
  },
  {
    id: 'chat',
    name: 'Chat App',
    kind: 'Real-time messaging platform',
    tag: 'Real-time messaging',
    accent: '#5aa2ff',
    address: 'Chat App · Messages',
    live: null,
    code: 'https://github.com/sadiqqgavvi-gif/chat-app',
    lede: 'One-to-one and group chat with read receipts, media and voice messages, reactions, and voice and video calls, all updating instantly over Socket.io.',
    highlights: [
      { value: 'WebRTC', label: 'voice and video calls' },
      { value: '25 MB', label: 'media uploads' },
      { value: '3', label: 'receipt states' }
    ],
    chips: ['React 19', 'Vite', 'Tailwind CSS 4', 'React Router', 'Socket.io', 'WebRTC', 'Axios', 'Node.js', 'Express 5', 'MongoDB', 'Mongoose', 'GridFS', 'JWT', 'bcrypt', 'Docker'],
    idea: 'A messaging app built to learn real-time systems properly. Messages send optimistically, retry on failure and resync after a reconnect, so a conversation stays correct even on a shaky connection.',
    features: [
      { title: 'Instant delivery', text: 'Socket.io with optimistic sending, retry on failure and automatic resync after a reconnect.' },
      { title: 'Receipts & presence', text: 'Sent, delivered and read ticks in direct and group chats, typing indicators, online status and last seen.' },
      { title: 'Message actions', text: 'Reply, forward, edit, copy, star, react with any emoji, and delete for me or for everyone.' },
      { title: 'Media & voice notes', text: 'Photos, videos and documents up to 25 MB with upload progress, plus voice messages recorded in the browser.' },
      { title: 'Voice & video calls', text: 'One-to-one WebRTC calls with mute and camera toggles, signalled over Socket.io and logged in the chat.' },
      { title: 'Groups & control', text: 'Multiple admins, member management, pin, archive, mute and block, with light, dark and system themes.' }
    ],
    meta: [
      ['Role', 'Solo build: design, frontend, backend'],
      ['Type', 'Full stack real-time web app'],
      ['Files', 'MongoDB GridFS, so uploads survive redeploys'],
      ['Auth', 'JWT with bcrypt and authenticated sockets'],
      ['Tests', 'End-to-end API tests over HTTP and Socket.io']
    ],
    flow: {
      title: 'How a message travels',
      steps: [
        ['Send', 'Optimistic message', 'It appears in the thread at once, before the server replies.'],
        ['Server', 'Saved', 'The API stores it and confirms. One tick.'],
        ['Deliver', 'Socket.io rooms', 'It reaches every device of the other person. Two ticks.'],
        ['Read', 'Read receipt', 'The ticks change colour once the chat is opened.'],
        ['Reconnect', 'Resync', 'After a dropped connection, missed messages are fetched again.']
      ]
    },
    hero: 'chat-window',
    phone: 'mobile-chat',
    float: 'dark-mode-message-menu',
    shots: [
      ['chat-window', 'Conversation view with media and a voice note'],
      ['dark-mode-message-menu', 'Dark mode and the message menu'],
      ['group-info', 'Group info with members and shared media'],
      ['login', 'Sign in'],
      ['video-call', 'Video call, shown with a test camera feed'],
      ['mobile-chat-list', 'Chat list on a phone'],
      ['mobile-chat', 'Group chat on a phone']
    ]
  },
  {
    id: 'mintlist',
    name: 'MintList',
    kind: 'Smart bookmarks and new tab, Chrome extension',
    tag: 'Chrome extension · Manifest V3',
    accent: '#3ddc97',
    address: 'New Tab · MintList',
    live: 'https://sadiqqgavvi-gif.github.io/MintList-Smart-bookmarks/',
    code: 'https://github.com/sadiqqgavvi-gif/MintList-Smart-bookmarks',
    lede: 'Turns Chrome’s new tab into a calm, organised home for every link: boards, pages, drag and drop, and a search that finds anything in a keystroke.',
    highlights: [
      { value: '0', label: 'servers or accounts' },
      { value: 'Ctrl K', label: 'smart search' },
      { value: '25', label: 'built-in wallpapers' }
    ],
    chips: ['Vanilla JavaScript', 'HTML5', 'CSS custom properties', 'Manifest V3', 'Service worker', 'chrome.storage', 'chrome.tabs', 'Context menus', 'GitHub Pages'],
    idea: 'Bookmark bars get crowded and folders hide things. MintList groups links into boards and boards into pages, keeps everything in your browser with no account, server or analytics, and saves the page you are on without leaving it.',
    features: [
      { title: 'Pages, boards, links', text: 'Drag links between boards, boards between columns, or drop a URL from any website straight onto a board.' },
      { title: 'Smart search', text: 'Ctrl/Cmd+K searches links, boards, pages, tags and open tabs, with scope filters, fuzzy matching and commands.' },
      { title: 'Save from anywhere', text: 'A toolbar popup, a quick-save shortcut, a right-click menu, and an open-tabs panel that saves a whole window as a board.' },
      { title: 'Import & share', text: 'Import Chrome bookmarks or files from other browsers, then share a board as a code, Markdown or a standalone page.' },
      { title: 'Safe by design', text: 'Trash with 30-day restore, undo after every delete, a duplicate finder and optional sync through your own Chrome profile.' },
      { title: 'Make it yours', text: 'Themes that match the wallpaper, six accent colours, 25 built-in gradients or your own photo, and a privacy blur.' }
    ],
    meta: [
      ['Role', 'Solo build: design and code'],
      ['Type', 'Chrome extension plus a live web demo'],
      ['Storage', 'chrome.storage.local, no servers'],
      ['Build', 'No framework and no build step']
    ],
    flow: {
      title: 'One library, everywhere',
      steps: [
        ['Save', 'Any entry point', 'The popup, a shortcut, the right-click menu or a drag and drop.'],
        ['Model', 'store.js', 'One data model shared by the new tab, the popup and the service worker.'],
        ['Storage', 'chrome.storage.local', 'A single record that stays on the device.'],
        ['Update', 'Live new tabs', 'Every open new tab re-renders the moment something is saved.'],
        ['Sync', 'Optional', 'The library is compressed, chunked and synced through Chrome.']
      ]
    },
    hero: 'boards',
    phone: 'popup',
    float: 'search',
    shots: [
      ['boards', 'Default boards on the new tab'],
      ['search', 'Smart search with Ctrl/Cmd+K'],
      ['board-menu', 'Board options'],
      ['light', 'Light theme'],
      ['starred', 'Starred view'],
      ['welcome', 'Welcome and onboarding'],
      ['popup', 'Toolbar save popup'],
      ['home-batman', 'Home page with a custom wallpaper'],
      ['empty-page', 'Empty page, ready for boards'],
      ['settings-general', 'Settings: General'],
      ['settings-appearance', 'Settings: Appearance'],
      ['settings-wallpaper', 'Settings: Wallpaper']
    ]
  }
].map(withShots);
