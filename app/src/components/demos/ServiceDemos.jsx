import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Check, Lock, ShieldCheck } from 'lucide-react';

/* Small looping demos, one per service, each showing the work itself rather than describing it. They only
   animate while on screen and use transforms and opacity alone, so they cost very little. */

const loop = (duration, delay = 0, repeatDelay = 1.2) => ({ duration, delay, repeat: Infinity, repeatDelay, ease: [0.16, 1, 0.3, 1] });

function useLive() {
  const ref = useRef(null);
  const live = useInView(ref, { margin: '0px 0px -10% 0px' });
  return [ref, live];
}

function Frame({ title, children, className = '' }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#08090b] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
        <i className="size-2 rounded-full bg-[#ff5f57]" />
        <i className="size-2 rounded-full bg-[#febc2e]" />
        <i className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.62rem] text-fog">{title}</span>
      </div>
      <div className="relative p-3">{children}</div>
    </div>
  );
}

// Frontend: an interface assembling itself, block by block.
function FrontendDemo() {
  const [ref, live] = useLive();
  const pop = i => ({
    initial: { opacity: 0, y: 10, scale: 0.96 },
    animate: live ? { opacity: [0, 1, 1, 0], y: [10, 0, 0, 0], scale: [0.96, 1, 1, 1] } : {},
    transition: { ...loop(4.2, i * 0.25, 0.4), times: [0, 0.15, 0.85, 1] }
  });
  return (
    <div ref={ref} className="h-full">
      <Frame title="localhost:5173">
        <motion.div className="flex items-center justify-between" {...pop(0)}>
          <span className="h-2 w-10 rounded bg-white/25" />
          <span className="flex gap-1.5">
            <span className="h-2 w-6 rounded bg-white/10" />
            <span className="h-2 w-6 rounded bg-white/10" />
            <span className="h-2 w-8 rounded bg-sodium/80" />
          </span>
        </motion.div>
        <motion.div className="mt-3 space-y-1.5" {...pop(1)}>
          <span className="block h-3 w-3/4 rounded bg-gradient-to-r from-white/50 to-white/20" />
          <span className="block h-3 w-1/2 rounded bg-gradient-to-r from-sodium/80 to-[#ff5e7a]/60" />
        </motion.div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[2, 3, 4].map(i => (
            <motion.span key={i} className="block h-10 rounded-md border border-white/10 bg-white/[0.04]" {...pop(i)} />
          ))}
        </div>
        <motion.span className="mt-3 block h-5 w-16 rounded-full bg-bone/90" {...pop(5)} />
      </Frame>
    </div>
  );
}

// Backend: a request goes out and a typed JSON response comes back.
function BackendDemo() {
  const [ref, live] = useLive();
  const lines = ['{', '  "id": "44EE01",', '  "status": "pending",', '  "total": 101.52', '}'];
  return (
    <div ref={ref} className="h-full">
      <Frame title="api · orders">
        <div className="flex items-center gap-2 font-mono text-[0.68rem]">
          <span className="rounded bg-teal/15 px-1.5 py-0.5 font-semibold text-teal">POST</span>
          <span className="text-bone/80">/api/orders</span>
        </div>
        <div className="relative my-2.5 h-px bg-white/10">
          <motion.span
            className="absolute -top-[3px] size-[7px] rounded-full bg-sodium shadow-[0_0_12px_#ff8a3d]"
            animate={live ? { left: ['0%', '100%'], opacity: [0, 1, 1, 0] } : {}}
            transition={{ ...loop(1.2, 0, 2.6), times: [0, 0.1, 0.9, 1] }}
          />
        </div>
        <motion.div
          className="flex items-center gap-2 font-mono text-[0.68rem]"
          initial={{ opacity: 0 }}
          animate={live ? { opacity: [0, 1, 1, 0] } : {}}
          transition={{ ...loop(3.4, 1, 0.4), times: [0, 0.08, 0.92, 1] }}
        >
          <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 font-semibold text-emerald-300">201</span>
          <span className="text-fog">Created</span>
        </motion.div>
        <pre className="m-0 mt-2 font-mono text-[0.66rem] leading-[1.55] text-bone/80">
          {lines.map((line, i) => (
            <motion.span
              key={i}
              className="block whitespace-pre"
              initial={{ opacity: 0, x: -6 }}
              animate={live ? { opacity: [0, 1, 1, 0], x: [-6, 0, 0, 0] } : {}}
              transition={{ ...loop(3.2, 1.2 + i * 0.12, 0.6), times: [0, 0.1, 0.9, 1] }}
            >
              <span className={line.includes(':') ? 'text-teal/90' : ''}>{line}</span>
            </motion.span>
          ))}
        </pre>
      </Frame>
    </div>
  );
}

// Auth: a JWT in its three coloured parts, then verified.
function AuthDemo() {
  const [ref, live] = useLive();
  return (
    <div ref={ref} className="h-full">
      <Frame title="auth · verify token">
        <p className="m-0 break-all font-mono text-[0.64rem] leading-[1.6]">
          <span className="text-[#ff6b8b]">eyJhbGciOiJIUzI1NiJ9</span>
          <span className="text-fog">.</span>
          <span className="text-[#b58cff]">eyJzdWIiOiJnYXZyaWVsIiwicm9sZSI6InN0YWZmIn0</span>
          <span className="text-fog">.</span>
          <span className="text-teal">4fT9kR2xQm8vLz</span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center font-mono text-[0.58rem] text-fog">
          <span className="rounded border border-[#ff6b8b]/30 py-1">header</span>
          <span className="rounded border border-[#b58cff]/30 py-1">payload</span>
          <span className="rounded border border-teal/30 py-1">signature</span>
        </div>
        <div className="relative mt-3 h-9">
          <motion.div
            className="absolute inset-0 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[0.7rem] text-fog"
            animate={live ? { opacity: [1, 1, 0, 0, 1] } : {}}
            transition={{ ...loop(4, 0, 0), times: [0, 0.35, 0.42, 0.95, 1] }}
          >
            <Lock size={13} /> Verifying signature…
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.08] px-3 text-[0.7rem] text-emerald-200"
            initial={{ opacity: 0 }}
            animate={live ? { opacity: [0, 0, 1, 1, 0], scale: [0.96, 0.96, 1, 1, 0.96] } : {}}
            transition={{ ...loop(4, 0, 0), times: [0, 0.38, 0.45, 0.92, 1] }}
          >
            <ShieldCheck size={14} /> Valid · role: staff
          </motion.div>
        </div>
      </Frame>
    </div>
  );
}

// Real-time: someone types, the message lands, the ticks turn blue.
function RealtimeDemo() {
  const [ref, live] = useLive();
  const show = (delay, end = 0.95) => ({
    initial: { opacity: 0, y: 8 },
    animate: live ? { opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] } : {},
    transition: { duration: 5, delay: 0, repeat: Infinity, repeatDelay: 0.3, times: [delay, delay + 0.06, end, 1] }
  });
  return (
    <div ref={ref} className="h-full">
      <Frame title="chat · Weekend Trip">
        <div className="flex flex-col gap-1.5 text-[0.68rem]">
          <motion.span className="max-w-[80%] self-start rounded-xl rounded-bl-sm bg-white/[0.07] px-2.5 py-1.5" {...show(0.02)}>
            Pickup at 7?
          </motion.span>
          <motion.span className="flex w-12 items-center justify-center gap-1 self-end rounded-xl bg-[#3b82f6]/20 px-2 py-2" {...show(0.18, 0.3)}>
            {[0, 1, 2].map(i => (
              <motion.i key={i} className="size-1 rounded-full bg-[#93c5fd]" animate={live ? { y: [0, -3, 0] } : {}} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
            ))}
          </motion.span>
          <motion.span className="flex max-w-[85%] items-end gap-1.5 self-end rounded-xl rounded-br-sm bg-[#3b82f6] px-2.5 py-1.5 text-white" {...show(0.36)}>
            Count me in! I’ll bring snacks
            <span className="relative mb-0.5 inline-flex">
              <Check size={11} className="text-white/70" />
              <motion.span className="absolute left-1" initial={{ opacity: 0 }} animate={live ? { opacity: [0, 0, 1, 1, 0] } : {}} transition={{ duration: 5, repeat: Infinity, repeatDelay: 0.3, times: [0, 0.5, 0.52, 0.95, 1] }}>
                <Check size={11} className="text-white/70" />
              </motion.span>
            </span>
          </motion.span>
          <motion.span className="self-end font-mono text-[0.58rem] text-[#93c5fd]" initial={{ opacity: 0 }} animate={live ? { opacity: [0, 0, 1, 1, 0] } : {}} transition={{ duration: 5, repeat: Infinity, repeatDelay: 0.3, times: [0, 0.68, 0.7, 0.95, 1] }}>
            Read 7:43
          </motion.span>
        </div>
      </Frame>
    </div>
  );
}

// AI: an answer gets scored, criterion by criterion.
function AIDemo() {
  const [ref, live] = useLive();
  const bars = [
    ['Relevance', 0.86],
    ['Depth', 0.74],
    ['Structure', 0.9],
    ['Clarity', 0.8]
  ];
  return (
    <div ref={ref} className="h-full">
      <Frame title="smarthire · feedback">
        <div className="flex items-center gap-3">
          <div className="relative grid size-14 shrink-0 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#7c9bff"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                initial={{ strokeDashoffset: 1 }}
                animate={live ? { strokeDashoffset: [1, 0.16, 0.16, 1] } : {}}
                transition={{ ...loop(4.4, 0.2, 0.3), times: [0, 0.35, 0.9, 1] }}
              />
            </svg>
            <span className="text-[0.85rem] font-semibold">8.4</span>
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[0.7rem] font-medium">“Tell me about a conflict…”</p>
            <p className="m-0 mt-0.5 text-[0.62rem] text-emerald-300">STAR structure detected</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {bars.map(([label, value], i) => (
            <div key={label} className="grid grid-cols-[62px_1fr] items-center gap-2 text-[0.6rem] text-fog">
              {label}
              <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.span
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-[#7c9bff] to-[#b58cff]"
                  style={{ width: `${value * 100}%` }}
                  initial={{ scaleX: 0 }}
                  animate={live ? { scaleX: [0, 1, 1, 0] } : {}}
                  transition={{ ...loop(4.4, 0.35 + i * 0.12, 0.3), times: [0, 0.3, 0.9, 1] }}
                />
              </span>
            </div>
          ))}
        </div>
      </Frame>
    </div>
  );
}

// Ship: a push travels through the pipeline and goes green.
function ShipDemo() {
  const [ref, live] = useLive();
  const steps = ['Push', 'Test', 'Build', 'Deploy'];
  return (
    <div ref={ref} className="h-full">
      <Frame title="github actions · main">
        <div className="relative mt-1 flex items-center justify-between px-1">
          <span className="absolute inset-x-4 top-[13px] h-px bg-white/10" />
          <motion.span
            className="absolute left-4 top-[13px] h-px origin-left bg-emerald-400"
            style={{ right: '1rem' }}
            initial={{ scaleX: 0 }}
            animate={live ? { scaleX: [0, 1, 1, 0] } : {}}
            transition={{ ...loop(4.4, 0.2, 0.2), times: [0, 0.6, 0.92, 1] }}
          />
          {steps.map((step, i) => (
            <div key={step} className="relative flex flex-col items-center gap-1.5">
              <span className="grid size-[26px] place-items-center rounded-full border border-white/15 bg-[#08090b]">
                <motion.span
                  className="grid size-[26px] place-items-center rounded-full bg-emerald-400 text-ink"
                  initial={{ scale: 0 }}
                  animate={live ? { scale: [0, 0, 1, 1, 0] } : {}}
                  transition={{ ...loop(4.4, 0.2, 0.2), times: [0, i * 0.18 + 0.02, i * 0.18 + 0.08, 0.92, 1] }}
                >
                  <Check size={13} strokeWidth={3} />
                </motion.span>
              </span>
              <span className="font-mono text-[0.58rem] text-fog">{step}</span>
            </div>
          ))}
        </div>
        <motion.div
          className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-2 text-[0.68rem]"
          initial={{ opacity: 0, y: 6 }}
          animate={live ? { opacity: [0, 0, 1, 1, 0], y: [6, 6, 0, 0, 0] } : {}}
          transition={{ ...loop(4.4, 0.2, 0.2), times: [0, 0.62, 0.68, 0.92, 1] }}
        >
          <span className="text-emerald-200">Deployed to production</span>
          <span className="font-mono text-[0.6rem] text-fog">vercel</span>
        </motion.div>
      </Frame>
    </div>
  );
}

export const demos = {
  frontend: FrontendDemo,
  backend: BackendDemo,
  auth: AuthDemo,
  realtime: RealtimeDemo,
  ai: AIDemo,
  ship: ShipDemo
};
