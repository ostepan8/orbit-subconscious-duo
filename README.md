# Orbit x Subconscious

AI-powered deep research platform built for **MIT's Orbit Jetpack** system. Upload documentation, and let Subconscious agents perform deep research, generate verified citations, and deliver actionable recommendations.

## What This Does

1. **PDF Upload** — Drop in any Orbit Jetpack document (technical specs, research papers, mission briefs)
2. **AI Deep Research** — Subconscious agents analyze the document, cross-reference sources, and surface key insights
3. **Citations & Recommendations** — Receive a structured report with traceable citations and priority-ranked action items

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 with Subconscious brand tokens
- **AI Agents:** [Subconscious.dev](https://subconscious.dev) multi-agent platform
- **Fonts:** Geist Sans & Geist Mono

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/       # PDF upload endpoint (stub)
│   │   ├── research/     # Research trigger & results (stub)
│   │   └── citations/    # Citation retrieval & export (stub)
│   ├── globals.css       # Brand CSS variables + Tailwind config
│   ├── layout.tsx        # Root layout (Navbar + Footer)
│   └── page.tsx          # Homepage
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Hero, HowItWorks, Features, AgentShowcase,
│   │                       ResearchPreview, UploadCTA
│   └── ui/               # Button, Card, Badge, SectionHeading
├── constants/
│   └── colors.ts         # Brand color constants
├── hooks/
│   └── useResearch.ts    # Research pipeline hook (stub)
├── lib/
│   ├── pdf.ts            # PDF processing utilities (stub)
│   └── subconscious.ts   # Subconscious SDK integration (stub)
└── types/
    └── index.ts          # TypeScript interfaces
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

- [ ] Wire up PDF upload with drag-and-drop
- [ ] Integrate Subconscious SDK for agent orchestration
- [ ] Implement real-time agent status tracking (SSE/WebSocket)
- [ ] Build citation generation pipeline
- [ ] Add recommendation engine with priority ranking
- [ ] Build research results dashboard page
- [ ] Add export functionality (PDF reports, BibTeX)
- [ ] Add authentication and user sessions
- [ ] Mobile responsive navigation
- [ ] Add analytics and event tracking

## Environment Variables

```env
# TODO: Add these when integrating
SUBCONSCIOUS_API_KEY=     # Subconscious.dev API key
# NEXT_PUBLIC_APP_URL=    # Public app URL for callbacks
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Black | `#101820` | Text, dark backgrounds |
| Primary Orange | `#FF5C28` | CTAs, accents, brand identity |
| Light Orange | `#FFC0A4` | Hover states, light accents |
| Teal | `#3ED0C3` | Secondary actions, highlights |
| Green | `#B5E800` | Success states, agent status |
| Graphite Gray | `#5A5A5A` | Body text, muted elements |
| Background Cream | `#F0F3EF` | Page background (light mode) |
