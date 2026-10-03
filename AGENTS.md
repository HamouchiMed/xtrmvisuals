# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable prototype feedback

- The desktop hero should be composed for the 1920×1080 display with a roughly 1400px-wide preview viewport; the portrait must remain prominent on the right without severe clipping, leaving the simple badge arc clear on its left.
- Keep the hero software badges in their original simple text-chip style unless a new placement is explicitly requested.
- The hero composition should adapt fluidly across desktop, laptop, tablet, and mobile widths while preserving the same portrait-and-badge visual language.
- Overall visual direction: a premium, award-site feel in the spirit of lusion.co — fixed minimal header with a "Let's talk" pill and a full-screen menu, big tight grotesk headlines (Inter Tight) with Instrument Serif italic accents, masked word-by-word reveals, mono "( 0X — Section )" labels, custom cursor with labels on media, magnetic buttons, scroll-driven motion (hero editor timeline, WebGL starfield warp, bending reel), and a giant footer wordmark. Keep the dark purple/magenta XTRM palette.
- All motion (smooth scroll, reveals, WebGL, cursor, marquees, loops) must run for every visitor. Do not gate animations behind `prefers-reduced-motion`: many desktops report it by default (Windows "Animation effects" off, work laptops) and those visitors got a static site.
- Hero background is the original simple timeline (WebGL, `src/HeroGL.jsx`): faint coloured clips (keep the original mostly purple/pink/blue clip colours — the owner tried a 9-colour NLE palette and undid it) sliding along NLE-style tracks with a pink playhead line and a glow behind the portrait, faded under the copy. The owner tried a realistic Premiere/Resolve version (filmstrips, ruler, waveforms, timecode) and preferred going back to this simpler one — don't reintroduce the realistic version unless asked.
- Keep the floating comment cards on roomy desktop screens, but never over the face: one sits up-left of the head, the other over the lower body.
