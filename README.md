# Aethera — Cinematic Hero Section

A fullscreen, single-page hero built with React + Vite + TypeScript + Tailwind CSS, featuring
a looping background video with a custom fade-in/fade-out transition.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  components/
    VideoBackground.tsx   # looping video w/ manual rAF fade in/out + gradient overlay
    Navbar.tsx             # logo, nav links, "Begin Journey" CTA
    Hero.tsx                # headline, description, hero CTA
  styles/
    fonts.css               # Instrument Serif + Inter imports
    theme.css                # fade-rise keyframes / animation utility classes
  App.tsx
  main.tsx
  index.css                  # Tailwind directives + global resets
public/
  hero-video.mp4             # background video (converted from the uploaded .mov, H.264/mp4, no audio)
```

## Notes

- The uploaded `.mov` was re-encoded to `hero-video.mp4` (H.264, faststart) for reliable
  autoplay/looping across browsers. Swap `public/hero-video.mp4` for any other source clip —
  the component doesn't need changes.
- `VideoBackground.tsx` implements the loop manually: a `requestAnimationFrame` loop tracks
  `currentTime`/`duration` to drive opacity for the first/last 0.5s, and the `ended` handler
  resets `currentTime` to `0` after a 100ms blackout before calling `play()` again — this avoids
  the visible jump-cut of the native `loop` attribute.
- Colors, spacing, letter-spacing, and animation timings follow the brief exactly (e.g.
  `letterSpacing: -2.46px`, `paddingTop: calc(8rem - 75px)`).
- `prefers-reduced-motion` is respected for the fade-rise entrance animations.
