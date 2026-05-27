# Liam's Animal Rescue — Project Bible for Claude Code

## Role & Stack

You are acting as a **senior UI developer specializing in kids' interactive web toys for tablet** (iPad-first design).

- **Framework**: React 18 + Vite 5
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Animation**: Framer Motion (primary — all motion through FM)
- **State**: Zustand (single `gameStore.ts` — no prop drilling)
- **Audio**: Web Audio API (via `useAudio` hook — no external libs)
- **Dev environment**: Windows 11 → GitHub → Cloudflare Pages (static SPA)
- **Security**: CSP headers in HTML, XSS-safe input sanitization, no external API calls with personal data

---

## What This App Is

A **joyful interactive parade toy** for children ages 3–6.

> Animals fall from the top of the screen, held up by balloons acting as parachutes. Children tap to pop the balloons — popping all of them rescues the animal into the parade. There is NO failure state — every interaction resolves into humor or celebration.

**This is not a game.** It is a roleplay-first interactive toy:
- No winning, losing, score pressure, or punishment
- Adult plays alongside child
- Designed for iPad in landscape + portrait

---

## Core Design Rules (NEVER VIOLATE)

1. **No failure states** — animals that float away trigger funny escape messages, not sadness
2. **No punishment** — every missed interaction becomes a silly event
3. **No game over** — sessions always end in celebration
4. **Parade is the reward** — rescued animals join a growing parade, that IS the win
5. **Large tap targets** — minimum 64px touch target, prefer 80px+
6. **Immediate feedback** — every tap must produce visible + audio response
7. **Positive only** — all text, animations, and audio must be celebratory

---

## File Structure

```
liamballoon/
├── CLAUDE.md                         # This file
├── README.md
├── index.html                        # Entry point, CSP meta, Google Fonts
├── vite.config.ts                    # React + Tailwind plugins
├── tsconfig.json                     # Strict TypeScript
├── tailwind.config.ts                # (not used — v4 uses CSS @theme)
├── package.json
│
├── public/
│   ├── favicon.svg                   # Penguin emoji favicon
│   └── audio/                        # (future) Sound asset files
│
└── src/
    ├── index.css                     # Tailwind @import + @theme + @keyframes
    ├── main.tsx                      # React root
    ├── App.tsx                       # Screen state machine with AnimatePresence
    │
    ├── types/
    │   └── index.ts                  # ALL TypeScript types/interfaces
    │
    ├── data/
    │   ├── animals.ts                # AnimalDefinition for 11 animal types (incl. skunk)
    │   ├── companions.ts             # 4 companions (dad/mom/grandpa/grandma)
    │   └── scenes/
    │       ├── scene-01.json         # "Sky Festival" — penguins, tigers, llamas
    │       └── scene-02.json         # "Rainbow Sky" — bunnies, elephants, unicorns
    │
    ├── store/
    │   └── gameStore.ts             # Zustand store: all game state + actions
    │
    ├── engine/
    │   └── sceneEngine.ts           # buildWaveAnimals(), pickSpacedX()
    │
    ├── hooks/
    │   ├── useAudio.ts              # Web Audio API tones (swap for real assets later)
    │   └── useSceneSpawner.ts       # Queue-based spawner: max 3 non-skunks on screen
    │
    └── components/
        ├── screens/
        │   ├── WelcomeScreen.tsx    # Title screen, animated balloons + animals
        │   ├── PersonalizeScreen.tsx # Name input, avatar picker, companion picker
        │   └── GameScreen.tsx       # Main play area — orchestrates all game components
        │
        └── game/
            ├── BalloonBubble.tsx    # Individual tappable SVG balloon
            ├── FloatingAnimalCard.tsx # Animal + balloons rising off screen
            ├── ParadeBar.tsx        # Bottom green strip + bus + speech bubbles
            ├── AnnouncerBanner.tsx  # Spring-in rescue banner (fires ~1 in 3 rescues)
            ├── ConfettiLayer.tsx    # Confetti particles on rescue
            ├── FireworksLayer.tsx   # Fireworks on wave complete
            ├── SceneBackground.tsx  # Sky gradient + clouds + sun + stars
            ├── StinkySaveBanner.tsx # Full-screen "STINKY SAVE!" overlay for skunk rescues
            ├── EscapeEvent.tsx      # Funny message when animal floats away un-rescued
            └── TapHint.tsx         # Animated hint after 2s idle
```

---

## Screen Flow

```
WelcomeScreen → PersonalizeScreen → GameScreen (waves loop) → Ending overlay → PlayAgain
```

---

## State Architecture

**Single Zustand store** (`gameStore.ts`) holds:

| Slice | Description |
|-------|-------------|
| `screen` | Current UI screen |
| `player` | Name, emoji avatar, companion ID |
| `currentSceneId` | Which scene JSON is loaded |
| `floatingAnimals` | All active animals in scene |
| `parade` | Rescued members, music intensity, count |
| `announcer` | Current banner message + auto-dismiss |
| `confetti` | Array of ConfettiPiece for ConfettiLayer |
| `stinkySave` | Boolean — true for 3s when skunk is rescued; drives StinkySaveBanner |
| `currentWave` | Wave index within scene |

**Key actions:**
- `popBalloon(animalId, balloonId)` — removes one balloon; when 0 remain, triggers rescue
- `rescueAnimal(id)` — marks `isRescued: true`, adds to parade; skunk → `triggerStinkySave()`; others → announcer fires ~1 in 3 times; calls `removeAnimal` after 700ms
- `spawnAnimal(animal)` — adds a FloatingAnimal to the scene
- `showAnnouncer(text)` — displays banner, auto-dismisses after 2.5s
- `triggerStinkySave()` — sets `stinkySave: true`, speaks "Stinky Save!" via Web Speech API, auto-clears after 3s

---

## Scene System

Scenes are JSON files in `src/data/scenes/`. Each defines:
- Background gradient colors
- `waveCount` — number of waves (currently 2 per scene)
- Animal spawn configs (type, balloon colors, base speed) — used as templates, cycled across generated animals
- Narration lines (future use)

`useSceneSpawner` hook drives waves:
1. Calls `buildWaveAnimals()` to generate the full animal list for the wave (20–30 animals) as a queue
2. Drains the queue reactively: whenever `floatingAnimals` changes and fewer than 3 non-skunks are active, the next animal is popped from the queue and spawned (minimum 700ms gap between spawns)
3. `pickSpacedX()` in `sceneEngine.ts` ensures each new animal is placed at least 24% screen-width away from all others currently on screen
4. `allSpawned` is set when the queue empties; wave completes when `allSpawned && floatingAnimals.length === 0`
5. The skunk does **not** count toward the 3-animal cap — it can appear alongside any 3 normal animals

**Wave scaling** is defined in `WAVE_SETTINGS` inside `sceneEngine.ts`:

| Wave | Animals | Max on screen | Rise speed multiplier |
|------|---------|---------------|-----------------------|
| 1    | 20      | 3 + skunk     | 0.936×                |
| 2    | 25      | 3 + skunk     | 1.260×                |
| 3    | 30      | 3 + skunk     | 1.593×                |

Animal configs in scene JSON are cycled as templates (e.g. 3 types → animal 4 reuses type 0 with the same balloon colors). One skunk is always injected at a random queue position per wave at 2× the wave's rise speed.

---

## Balloon / Rescue Flow

1. `FloatingAnimalCard` renders an animal falling from off-screen top (`top: -160px`) to off-screen bottom — balloons sit above the animal like a parachute
2. Each balloon is a `BalloonBubble` (SVG) — tapping calls `popBalloon()`
3. When all balloons are popped, `rescueAnimal()` fires → parade join + celebration
4. If animal falls off-screen bottom un-rescued → `EscapeEvent` shows a funny message
5. `riseSpeed` in the type/store is a legacy name — it controls fall speed (px/s downward)

---

## Animal Definitions

11 animals in `src/data/animals.ts`:
- `penguin` 🐧 — blue theme
- `tiger` 🐯 — orange theme
- `llama` 🦙 — purple theme
- `bunny` 🐰 — red theme
- `elephant` 🐘 — green theme
- `unicorn` 🦄 — gold theme
- `monkey` 🐵 — orange theme
- `panda` 🐼 — slate theme
- `frog` 🐸 — green theme
- `duck` 🦆 — yellow theme
- `skunk` 🦨 — green theme (**special**: guaranteed once per wave, 2× rise speed, triggers "Stinky Save!" on rescue)

Each has: `rescueLines`, `paradeLines`, `busLines` (6 funny in-bus quotes used by the ParadeBar speech bubble), `color`.

### Skunk special behavior
- Injected at a random queue position by `buildWaveAnimals()` — not in scene JSON
- Does not count toward the 3-animal on-screen cap
- On rescue: `triggerStinkySave()` fires → full-screen `StinkySaveBanner` + Web Speech API says "Stinky Save!" aloud
- Normal announcer banner is skipped for skunk rescues

### Bus speech bubbles
`ParadeBar` runs a stable 5s interval that picks a random window animal and displays one of their `busLines` in a comic speech bubble above the bus for 3 seconds. Lines are intentionally ridiculous ("I already licked three windows. Totally normal.") for parents to read aloud.

---

## Audio System

`useAudio` hook generates Web Audio API tones as placeholders:
- `playBalloonPop()` — white noise burst (band-pass filtered ~800Hz) + low sine thump (180→60Hz sweep); sounds like a real balloon pop, not a beep
- `playRescueFanfare()` — 4-note ascending melody
- `playParadeJoin()` — 3-note chord
- `playWindSwipe()` — sawtooth whoosh

To add real audio: load audio files in `public/audio/`, add `AudioBuffer` loading to the hook.

---

## Tailwind v4 Notes

- No `tailwind.config.js` — all custom tokens defined in `src/index.css` via `@theme {}`
- Custom animations defined as `@keyframes` + `--animate-*` tokens in `@theme`
- Plugin: `@tailwindcss/vite` added to `vite.config.ts`

---

## Personalization

- Child name: sanitized input (strips `<>'"`, max 20 chars)
- Avatar emoji: picker with 5 options
- Companion: optional — one of dad/mom/grandpa/grandma — shows cheer button in game
- Future: photo upload → cartoon stylization (never raw photo cutouts)

---

## iPad / Tablet Targets

- Portrait and landscape both supported
- Minimum touch target: 64px (prefer 80px+)
- `touch-action: manipulation` on all elements
- `-webkit-tap-highlight-color: transparent` globally
- `user-select: none` globally
- `overscroll-behavior: none` to prevent pull-to-refresh

---

## Security Rules

- All user text sanitized before render (name input strips tags)
- No external API calls containing personal data
- CSP meta tag in `index.html` restricts scripts to `'self'`
- No localStorage of sensitive data — only ephemeral session state
- File upload (future): validate MIME type + size client-side, never execute content

---

## Deployment

- Local dev: `npm run dev` → `http://localhost:5173`
- iPad / device testing: `vite.config.ts` has `host: true` — Vite binds to all interfaces. Find your PC's LAN IP (`ipconfig`) and open `http://<your-ip>:5173` on the iPad (both must be on the same Wi-Fi)
- Production build: `npm run build` → `dist/`
- Deploy: push `main` to GitHub → Cloudflare Pages auto-deploys
- Build size target: <200KB gzipped
- No backend — fully static SPA

---

## Extending the Game

### Add a new animal
1. Add `AnimalType` to `src/types/index.ts`
2. Add definition to `ANIMAL_DEFS` in `src/data/animals.ts`
3. Use in any scene JSON `animals[]` array

### Add a new scene
1. Create `src/data/scenes/scene-XX.json`
2. Add to `SCENES` record in `GameScreen.tsx`
3. Add scene picker UI (optional)

### Add real audio
1. Add `.mp3` or `.ogg` files to `public/audio/`
2. Load `AudioBuffer` in `useAudio.ts`
3. Replace `playTone()` calls with buffered playback

### Add wind swipe interaction
1. Add `onPointerMove` handler to game area
2. Track velocity vector
3. Apply force to `FloatingAnimal` x-position in store
4. Call `playWindSwipe()` on gesture
