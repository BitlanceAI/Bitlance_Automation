# SEO Landing Page — seo.bitlancetechhub.com

Standalone Vite + React landing page for the Bitlance SEO AI Agent.
Uses `@remotion/player` for embedded animated compositions.

## Quick Start

```bash
cd seo-landing
npm install
npm run dev        # → http://localhost:5174
npm run build      # Production build → dist/
```

## Remotion Preview (optional)

```bash
npm run remotion:preview   # Opens Remotion Studio to preview/edit compositions
```

## Customise the Demo Video

In `src/components/VideoSection.jsx`:

```js
const VIDEO_URL = 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0';
const THUMBNAIL_URL = 'https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg';
```

## Deploy to Vercel (subdomain)

1. Push `seo-landing/` as a new Vercel project (or monorepo root set to `seo-landing/`).
2. In **Vercel → Project Settings → Domains**, add: `seo.bitlancetechhub.com`
3. In your **DNS provider**, add a CNAME: `seo → cname.vercel-dns.com`

Build settings:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## File Structure

```
seo-landing/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── remotion/
│   │   ├── HeroComposition.jsx      # Animated hero sequence
│   │   ├── FeaturesComposition.jsx  # Features + Workflow animations
│   │   └── index.jsx                # Remotion Root (for Studio preview)
│   ├── components/
│   │   ├── NavBar.jsx
│   │   ├── HeroSection.jsx          # Embeds HeroComposition via @remotion/player
│   │   ├── StatsSection.jsx
│   │   ├── FeaturesSection.jsx      # Embeds FeaturesComposition via @remotion/player
│   │   ├── VideoSection.jsx         # YouTube/HeyGen embed with custom player UI
│   │   ├── HowItWorksSection.jsx    # Embeds WorkflowComposition via @remotion/player
│   │   ├── PricingSection.jsx       # Self-serve + Done-For-You toggle
│   │   ├── TestimonialsSection.jsx
│   │   ├── CtaSection.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html                       # Full SEO meta tags + JSON-LD
├── vercel.json                      # SPA rewrites + cache headers
├── vite.config.js
├── tailwind.config.js
└── package.json
```
