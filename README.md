# 🐧 Penguin Rescue Parade

A joyful, personalized interactive parade toy for children ages 3–6. Pop balloons to rescue animals and build a growing celebration parade!

---

## What It Is

Animals float upward on colorful balloons. Your child taps the balloons to pop them, rescues the animals, and watches them join a growing parade behind their character. Every rescue triggers confetti, music, and a big celebration announcement.

**There is no losing. There is no failure. Only joy.**

---

## Features

- 🎈 **Balloon pop mechanic** — tap balloons to free floating animals
- 🦒 **6 animal types** — Penguin, Tiger, Llama, Bunny, Elephant, Unicorn
- 🎉 **Growing parade** — every rescued animal permanently joins the parade during the session
- 🎊 **Confetti + announcer** — every rescue triggers a big celebration
- 😄 **Funny escape events** — animals that float away trigger silly messages, never sadness
- 👨‍👩‍👦 **Companion system** — invite Dad, Mom, Grandpa, or Grandma to cheer you on
- 🧒 **Personalization** — enter child's name and pick their avatar
- 🌊 **Wave system** — 3 waves per scene, escalating parade energy
- 2 scenes — Sky Festival & Rainbow Sky

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Vite | 5+ | Build tool |
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 12 | All animation |
| Zustand | 5 | Game state |
| Web Audio API | native | Sound effects |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output is in `dist/` — fully static, no backend needed.

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── types/index.ts          # All TypeScript types
├── data/
│   ├── animals.ts          # 6 animal definitions
│   ├── companions.ts       # 4 companion definitions
│   └── scenes/             # JSON scene configs
├── store/gameStore.ts      # Zustand global state
├── engine/sceneEngine.ts   # Animal spawning logic
├── hooks/
│   ├── useAudio.ts         # Web Audio sound effects
│   └── useSceneSpawner.ts  # Wave spawning timing
└── components/
    ├── screens/            # Welcome, Personalize, Game
    └── game/               # All in-game components
```

See `CLAUDE.md` for full architecture documentation.

---

## Design Philosophy

| Principle | Implementation |
|-----------|---------------|
| No failure | Escaped animals → funny messages |
| No punishment | Missed taps → nothing bad happens |
| Immediate feedback | Every tap has visible + sound response |
| Large targets | 64px minimum touch target everywhere |
| Parade as reward | Growing chain of friends IS the win condition |

---

## Deployment (Cloudflare Pages)

1. Push to GitHub `main` branch
2. Cloudflare Pages auto-deploys on push
3. Build command: `npm run build`
4. Output directory: `dist`
5. Node version: 18+

No environment variables required — fully static.

---

## Security

- Content Security Policy meta tag in `index.html`
- All user text input sanitized (strips HTML tags, max length enforced)
- No external API calls with personal data
- No persistent storage of child data (session only)
- CSP-compatible — no unsafe inline scripts

---

## Roadmap

- [ ] Real sound effects (balloon pop, fanfare, parade music)
- [ ] Wind swipe interaction to redirect animals
- [ ] Parachute mechanic for alternate rescue style
- [ ] Color-matching educational layer
- [ ] Photo upload → cartoon avatar stylization
- [ ] Additional scenes (underwater, space, jungle)
- [ ] Counting interactions ("Let's save 3 penguins!")
- [ ] Progressive Web App (offline support, home screen install)

---

## Credits

Built with ❤️ for Liam and every little hero who loves animals and parades.
