# Gavriel Sadiq · Portfolio

Personal portfolio of Gavriel Sadiq, full stack web developer (MERN).

**Live:** https://sadiqqgavvi-gif.github.io/Portfolio/

## Stack

- **React 19 + Vite** with **Tailwind CSS 4**
- **Three.js / React Three Fiber** for the 3D stage (the four floating layers of the stack)
- **GSAP** (ScrollTrigger, SplitText) and **Motion** (Framer Motion) for scroll and interaction
- **Lenis** for smooth scrolling
- **React Bits** components in `app/src/components/reactbits/` (SplitText, ScrollReveal, ScrollVelocity,
  RotatingText, DecryptedText, CountUp, ShinyText, SpotlightCard, Magnet)

## Project layout

```
app/                  source (this is what you edit)
  index.html          page shell and SEO tags
  public/             files copied as-is: résumé, favicons, og-image, shots/ (project screenshots)
  src/
    data/             all text content: site.js (about, skills, journey) and projects.js (the four projects)
    sections/         Hero, About, Services, Stack, Work, Journey, Contact
    components/       shared UI, the case-study overlay and the screenshot lightbox
    three/Scene.jsx   the 3D scene
index.html, assets/, shots/, …   the production build (generated, do not edit by hand)
```

GitHub Pages serves this repository from the root of `main` with no build step, so the production build is
committed at the repository root.

## Develop

```bash
npm install
```

```bash
npm run dev
```

## Update the live site

Edit files under `app/`, then rebuild and commit the result:

```bash
npm run build
```

`npm run build` clears the previous build from the repository root and writes a new one.

To change a project's text, links or screenshots, edit `app/src/data/projects.js`. Screenshots live in
`app/public/shots/<project>/` as WebP, with a `-sm` copy (720px wide) for small screens, and their sizes are
listed in `app/src/data/shots.json`.
