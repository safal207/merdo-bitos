# Atelier 23 Global Social — experimental
REACTION-002 is an opt-in prototype, not a deployed service. Existing per-device likes continue working with SOCIAL_API empty. No old local clicks are backfilled.

## Run locally
Requires Node.js 22.13+ (node:sqlite) and a writable persistent disk.
```sh
node --test server/atelier23-social/server.test.mjs
SOCIAL_ORIGIN=https://safal207.github.io SOCIAL_SECRET="$(openssl rand -hex 32)" SOCIAL_DB=/path/to/private/social.sqlite PORT=8787 node server/atelier23-social/server.mjs
```
Choose an HTTPS hosting endpoint and persistent volume before production use. Configure the exact allowed browser origin, keep SOCIAL_SECRET on the server only, and set SOCIAL_API in atelier23/fashion-overlay/global-social.js to the verified HTTPS base URL in a separate reviewed release. Never commit the DB, secrets, or logs containing request headers. Run the tests before enabling. Back up the DB; counts must not reset silently.

## Semantics
- GET /v1/stats: confirmed counts per product/film and deterministic product-only ranking.
- POST /v1/session: opaque 24-hour session; only a hash is stored server-side.
- POST /v1/likes: allowlisted target and UUID; one committed increment per event ID, retries within the session are idempotent.
- SQLite transactions and persistent totals; no generated seed likes. Global counts are accepted taps, not people, purchases, or demand validation.
- Limits: 30 taps/session/minute, 120/source/minute, 1000/source/day; 10 session issues/source/minute and 100/day. Fixed windows, not a proof of human identity. Source key is a daily HMAC of socket address. Expired metadata is removed on writes; operational retention and privacy review remain required.
- Behind a reverse proxy the socket address can be shared by all clients; do not enable production until trusted ingress / rate limiting is configured. Do not blindly trust X-Forwarded-For. CORS is not authentication. Distributed bot traffic remains possible. HTTPS, proxy configuration, load testing, retention cleanup, privacy notice, monitoring and backup/restore are release gates.
- Local clicks remain independent if the network is unavailable or server rejects a tap. Global UI shows last confirmed counts and status; no retroactive uploads.
