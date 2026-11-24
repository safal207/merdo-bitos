# Atelier 23 · Fashion Journey

Independent mobile-first demonstration at `/atelier23/fashion-journey/`. Existing Atelier 23 demo, Film 01 and Merdo pages are unchanged. Native ES modules and CSS; no additional runtime dependency.

## Product contract
- Intro film uses the already checked-in 17.64s user-provided concept. Three preview cards explicitly show examples, not user progress.
- Five event routes, catalogue-based recommendations, touch/keyboard/button navigation, private likes and bookmarks, share actual product links. A like is never a choice.
- Six preparation tasks derive from actual choices: event, date or unknown, chosen look, reviewed wardrobe, prepared summary, user-reported completed visit. No automatic booking/visit completion. Changing garment choices or dates invalidates downstream steps.
- Separate local plans for each event, browser localStorage only, no contacts or backend, no analytics. Saved items are private and do not represent sales.
- Prices (where clear) and product photos/links from the official catalogue checked 24 Nov 2026. Trouser prices are intentionally not displayed since visible original prices were crossed out. No stock guarantee or total outfit price; official manager confirms availability and cost. Brand rating 4.8 / 37 reviews was displayed on https://atelier-23.ru/personal-tailoring/; not a product rating. Recheck before production.
- `noindex,nofollow` and visible independent-concept disclosure; use of branding/photos for commercial rollout requires approval.

## QA
`node scripts/atelier23-fashion-journey-smoke.mjs` with Playwright 1.55.0. Chromium 390 and 1440, test external photos mocked, exact local video source and reduced-motion checked (not actual playback), event switching, swipe and keyboard, likes/bookmarks, progress, date validation, wardrobe/summary invalidation, local reload persistence, no overflow, booking link contract. Real media playback and image availability should be separately checked on a physical phone.