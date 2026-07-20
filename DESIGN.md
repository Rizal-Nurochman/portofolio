<!-- SEED — high-level visual direction from init. Re-run `/impeccable document` once there's real code to capture actual tokens. -->
---
name: Portfolio
description: A daytime-sky portfolio for a Go/Gin web developer, with a Gopher climbing the clouds as you scroll
colors:
  sky-low: "oklch(0.940 0.030 230)"
  sky: "oklch(0.880 0.060 232)"
  sky-high: "oklch(0.780 0.090 236)"
  cloud: "oklch(1.000 0.000 0)"
  cloud-soft: "oklch(0.975 0.008 235)"
  primary: "oklch(0.580 0.150 240)"
  primary-deep: "oklch(0.470 0.140 242)"
  sun: "oklch(0.820 0.150 78)"
  sun-deep: "oklch(0.680 0.150 62)"
  ink: "oklch(0.270 0.045 250)"
  muted: "oklch(0.520 0.035 245)"
  on-primary: "oklch(1.000 0.000 0)"
  on-sun: "oklch(0.270 0.045 250)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
  full: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.cloud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  badge-tech:
    backgroundColor: "{colors.cloud-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.on-sun}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  cloud-card:
    backgroundColor: "{colors.cloud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

## Overview

A creative developer's portfolio built around one committed idea: the whole site is a **daytime sky**, and the visitor climbs it. As you scroll down a page you move *upward* through the sky, and a Go **Gopher mascot** hops from cloud to cloud, following the scroll. Each page sits at its own altitude — Home low near the horizon, then Projects, then About, with Contact at the top of the sky — so a multi-page site still reads as one continuous ascent. The register is brand (design IS the product); the platform is web, responsive and mobile-first.

The strategy is **committed / environmental color**: the sky is not a decorative tint behind a white page, it is the surface. This is the deliberate exception to the "pure-white bg" default — the environment *is* the brand here. Content rides on white **cloud cards** floating over the blue, which is also what keeps text readable. Personality comes from the sky, the Gopher, characterful serif type, and choreographed motion — never from busy decoration.

Purpose stays front of mind: the site exists to convert interest into contact, and **Projects is the most important surface** (mostly Go/Gin websites with live previews). Layout leans editorial and airy — generous, varied spacing (see the `spacing` scale) that gives the ascent a sense of pace.

### Site structure & altitude

Each page owns an altitude; the Gopher transitions up one cloud layer when navigating deeper.

- **Home** — lowest layer. Hero (name + one-line role), a few featured projects, a clear path onward.
- **Projects** — the core. A varied grid of project cards, each with a screenshot preview, name, and Go/Gin tech tags. Clicking a card opens its own detail page.
- **Projects / [detail]** — one page per project: the problem and what was built (architecture/API, since the work is backend-heavy), the tech stack, and two buttons — **Live Demo** (to the site) and **Source Code** (to the GitHub repo).
- **About** — higher up. Short story, tools/stack, and a vertical **timeline** of education and organization experience that climbs bottom-to-top, matching the ascent metaphor.
- **Articles** — a deliberate **coming-soon** state: the Gopher in a waiting pose (sitting on a cloud, watching the clock) with a short line. Stays in the nav so the site feels like it will grow.
- **Contact** — top of the sky. Primary CTA of the whole site: email + socials, with the Gopher waving.

## Colors

The mood lives in the sky and the brand blue, not in a warm neutral. Body copy sits on white cloud surfaces or uses dark navy `ink`; text never floats on open sky without a contrast guarantee.

- **sky-low** `oklch(0.940 0.030 230)` — pale horizon blue. The lightest band of the sky gradient (near the ground / lower pages).
- **sky** `oklch(0.880 0.060 232)` — the base daytime sky. The default page background.
- **sky-high** `oklch(0.780 0.090 236)` — deeper zenith blue for higher pages (About, Contact) and the top of gradients. Still light enough to carry `ink`.
- **cloud** `oklch(1.000 0.000 0)` — pure white. The floating cards and panels that hold content; the reason text stays readable over the sky.
- **cloud-soft** `oklch(0.975 0.008 235)` — barely-cool off-white for quieter panels and tech badges that need separation from pure `cloud`.
- **primary** `oklch(0.580 0.150 240)` — confident azure. The brand action color: primary buttons, links, key accents. Always white text (`on-primary`).
- **primary-deep** `oklch(0.470 0.140 242)` — hover/pressed and blue-on-blue layering.
- **sun** `oklch(0.820 0.150 78)` — warm golden sun. The second brand color, distinct in hue and lightness, for small playful moments: the Gopher's scarf, "available for work" pills, highlights. It is pale, so it carries dark `ink` (`on-sun`), never white.
- **sun-deep** `oklch(0.680 0.150 62)` — warmer amber for sun hover states or a sunset accent if needed.
- **ink** `oklch(0.270 0.045 250)` — dark navy body text with a whisper of blue. ≥7:1 on `cloud`, `cloud-soft`, `sky-low`, and `sky`.
- **muted** `oklch(0.520 0.035 245)` — secondary text, captions, metadata. Meets AA (≥4.5:1) on `cloud`; keep it on white surfaces, don't lighten it for "elegance."

Contrast rules of thumb: white text on `primary` / `primary-deep`; `ink` on everything light (`cloud`, `cloud-soft`, `sky-*`, `sun`). Verify hero text placed directly on sky hits ≥4.5:1 — if it's close, move it onto a cloud card or darken toward `ink`.

## Typography

A contrast pairing: an expressive serif for display, a clean humanist sans for reading, plus a mono for code/tech tags (this is a developer's site).

- **display / headline** — Fraunces. A characterful variable serif with soft, slightly playful shapes; used large for the name, hero line, and section headings. Keep letter-spacing tight but not cramped (≥ -0.02em) and apply `text-wrap: balance` on h1–h3.
- **body** — Instrument Sans (or a similar warm humanist sans). Comfortable and contemporary. Cap measure at 65–75ch and use `text-wrap: pretty` on long prose.
- **mono** — JetBrains Mono for tech tags (Go, Gin, Postgres…), code snippets, and small technical labels on project pages. It signals "developer" without turning the site cold.
- **label** — Instrument Sans, semibold, for buttons, tags, and small UI text.

Fonts are a recommendation to confirm at build time. The rule that matters: pair on a contrast axis (serif + sans), never two similar sans families. Hero display max stays ≤ 6rem.

## Elevation

Elevation is literal here: cloud cards **float** over the sky. Lean on soft, diffuse, slightly cool shadows to sell the floating feel — never hard gray drop shadows.

- **rest** — clouds carry a soft ambient shadow, e.g. `0 8px 24px oklch(0.470 0.140 242 / 0.12)`, so they read as hovering, not stuck.
- **raised** (hover on project cards) — the card lifts and the shadow deepens/spreads, e.g. `0 18px 40px oklch(0.470 0.140 242 / 0.18)`.
- **overlay** (dialogs, menus) — a larger diffuse shadow plus a light backdrop scrim tinted toward the sky.

Build a semantic z-index scale (background-sky → clouds → content → gopher → sticky-nav → modal-backdrop → modal → toast → tooltip), never arbitrary 9999s. The Gopher and background clouds sit on their own layers, clearly behind interactive content and never over buttons.

## Components

- **cloud-card** — the core surface: a white, well-rounded (`rounded.lg`) floating panel with a soft shadow. Holds project previews, about content, contact info. Deliberately varied in size across the Projects grid — not one uniform repeating card.
- **project card** — a cloud-card that is image-forward: screenshot preview on top, then title, a short line, and mono tech tags (Go, Gin, …). Lifts gently on hover; the whole card links to the project detail page.
- **project detail** — screenshot/preview, prose on the problem and architecture, a mono tech list, and two clear buttons: **button-primary** "Live Demo" and **button-secondary** "Source Code."
- **button-primary** — azure fill, white text, fully rounded pill, generous padding. Hover → `primary-deep`. The "get in touch / live demo" action.
- **button-secondary** — white fill, ink text, subtle border, same pill. Softer action (view work, source code).
- **badge-tech** — soft off-white pill, mono ink text, for stack tags.
- **badge-sun** — gold pill with ink text for playful status labels ("available for work").
- **timeline** (About) — a vertical rail climbing bottom-to-top for education + organization; each node is a small cloud-card. The Gopher can climb it.
- **gopher mascot** — see below.
- **nav** — light, minimal, with the name/logo and a contact affordance always reachable; sits above the sky on its own z-layer.

All interactive elements need visible focus states (an azure or sun focus ring, ≥3:1 against the background) and comfortable touch targets (≥44px).

### Gopher mascot (motion character)

The classic Renée French Go Gopher (light-blue body, big eyes, two teeth), kept in proportion so it stays recognizably the Gopher. Because its body is close to the sky color, give it a subtle outline or soft shadow plus a **sun-gold scarf** so it always reads against the clouds and gains a personal signature. Delivered as **SVG** with a few swappable poses: idle (breathing/blink), jump, land (slight squash), waiting (Articles), and waving (Contact).

Behavior: the Gopher follows scroll direction — scroll down → it hops *up* the clouds; scroll up → it comes back down. Between pages it transitions up one cloud layer to match each page's altitude.

Non-negotiables (WCAG AA, and the project's anti-references):
- It is **decorative**: `aria-hidden="true"`, never announced by screen readers, never covering buttons or text; scaled down and kept out of the way on mobile.
- **`prefers-reduced-motion`**: no hopping — the Gopher appears with a gentle fade or simply rests in place. Motion is an enhancement over an already-visible, already-usable page.
- Animate only `transform` and `opacity`, driven by `requestAnimationFrame` (throttled scroll), for smooth 60fps on phones.

Attribution: the Gopher is © Renée French, CC-BY 3.0 — credit it in the footer.

## Do's and Don'ts

**Do**
- Commit to the sky as the surface — this is the intentional environmental exception, and the whole concept depends on it.
- Keep content on white cloud cards (or dark `ink`) so it always clears AA contrast over the blue.
- Let the ascent metaphor carry the structure: altitude per page, Gopher climbing, About timeline going bottom-to-top.
- Lead with Projects — image-forward cards, real Go/Gin tech tags, clear Live Demo / Source Code actions.
- Choreograph motion: scroll-reveal entrances, playful hovers, the Gopher hopping. Ease out with exponential curves; stagger lists. Every animation needs a `prefers-reduced-motion` fallback, and content must be visible by default (reveals enhance, never gate).
- Keep a light warm accent (sun/gold) so the cool sky still feels friendly and personal.

**Don't**
- Don't drift into generic SaaS/startup, cold minimalism, dark/techy neon, or busy over-design — the four named anti-references. A sky full of too many clouds, particles, and floating icons *is* over-design; keep 3–4 parallax cloud layers, not dozens.
- Don't let text float on open sky without a verified contrast ratio; don't lighten `muted` for elegance.
- Don't animate layout properties (top/left/width) or gate content visibility behind a scroll class — reveals must enhance an already-visible page.
- Don't fall back to an identical icon-heading-text card grid, gradient text, side-stripe borders, or a tiny tracked uppercase eyebrow above every section.
- Don't let the Gopher become the product — it's delight around the work, and it must never block or obscure content.
