# Gavriel Sadiq · Portfolio

Personal portfolio of Gavriel Sadiq, full stack web developer (MERN).

**Live:** https://sadiqqgavvi-gif.github.io/Portfolio/

## Stack

- **React 19 + Vite** with **Tailwind CSS 4**, set in Geist, Geist Mono and Instrument Serif
- **Three.js / React Three Fiber** for the hero's liquid-chrome orb, and **cobe** for the globe
- **Motion** (Framer Motion) for scroll and interaction, **Lenis** for smooth scrolling (driven by the GSAP ticker)
- **simple-icons** for the brand logos and **lucide-react** for the UI icons
- **React Bits** components in `app/src/components/reactbits/` (RotatingText, CountUp, Magnet)
- Effects in the spirit of Aceternity UI and Magic UI, written for this site: spotlight cards, bento grid,
  animated beams, orbiting logos, tracing beam, lamp and logo marquee

## Project layout

```
app/                  source (this is what you edit)
  index.html          page shell and SEO tags
  public/             files copied as-is: résumé, favicons, og-image, shots/ (project screenshots)
  src/
    data/             all text content: site.js (about, services, process, skills) and projects.js
                      (the four projects, their challenges and screenshots)
    sections/         Hero, LogoMarquee, About (bento), Work, Services, Process, Skills, Contact
    components/       shared UI, the case-study overlay, the screenshot lightbox and the globe
    three/HeroOrb.jsx the hero's 3D orb
index.html, assets/, shots/, …   the production build (generated, do not edit by hand)
```

GitHub Pages serves this repository from the root of `main` with no build step, so the production build is
committed at the repository root.

## Performance

The 3D orb and the globe only draw while they are on screen, nothing on the page uses a live
`backdrop-filter` over moving content, and the background is static.

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
