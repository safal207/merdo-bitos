# Atelier 23 × BitOS · React demo

Independent, **unofficial** public concept for a premium menswear atelier in Moscow. It is isolated from the Merdo fashion stylist in the parent repository.

## Routes

- GitHub Pages: `/merdo-bitos/atelier23/`
- Source entry: `atelier23/index.html`
- React application: `atelier23/app.js`
- Styles: `atelier23/styles.css`

The demo uses **React 19 + ReactDOM** via a browser import map. There is no build step and GitHub Pages serves the files directly. This was chosen to avoid changing the parent Merdo deployment pipeline or its existing static website. It requires network access to the public React ESM host.

## Features

- Editorial mobile-first landing screen and promotional concept film (external Grok MP4), with still-image fallback, lazy video load, pause control and reduced-motion handling.
- Occasion Engine: occasion → event date → style → budget and already-owned clothes → recommendation.
- If event is within **56 days**, do not promise bespoke tailoring; recommend checking ready-to-wear availability and possible alterations.
- If budget is below **150,000 ₽**, do not promise a bespoke suit.
- Copyable summary and direct links to official Atelier 23 booking / Telegram.
- No customer data collection, backend, payments, order submission, cookies, tracking or localStorage.
- `noindex,nofollow`, non-official disclaimer and concept-video disclosure.

## Verify

`node --check atelier23/app.js`

`node scripts/atelier23-smoke.mjs` when Playwright 1.55 is installed and Chromium is available.

CI runs the demo smoke check before publishing the parent repo. External media/ESM resources need connectivity; vendor dependencies in a later production stage.

## Source & use

Real product details: <https://atelier-23.ru/personal-tailoring/>.
Images from Atelier 23 public pages are linked, not bundled. Promotional video is a **generated advertising concept, not documentary footage** and is hosted by a third-party demo. Reconfirm permission before commercial rollout or use of the brand.
