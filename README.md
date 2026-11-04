# RPsy

Study app for the Philippine psychologist (RPsy) and guidance counselor (RGC) licensure exams. Static front end (`index.html`, `app.js`, `online.js`, `chars3d.js`, `data.js`) plus an optional Cloudflare backend (`worker/index.js`) that provides accounts, cross-device progress sync, the leaderboard and live multiplayer battles. Without the backend the app still works fully as a guest on one device.

## Deploy the online features (Cloudflare)

The D1 database `rpsy` already exists in the Cloudflare account and is wired in `wrangler.toml`. Tables are created automatically on the first request.

1. Create an API token at Cloudflare dashboard > My Profile > API Tokens using the "Edit Cloudflare Workers" template (add D1 edit permission).
2. In the GitHub repo, add secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Push to `main` (or run the "Deploy to Cloudflare" workflow). The Worker serves the whole app and the `/api` routes from one origin, e.g. `https://rpsy.<your-subdomain>.workers.dev`.

Or deploy by hand: `npx wrangler deploy`.

If you keep hosting the static files elsewhere (for example GitHub Pages), add this before the scripts in `index.html` so the app talks to the Worker: `<script>window.RPSY_API='https://rpsy.<your-subdomain>.workers.dev'</script>`.

## Local development

`npx wrangler dev` runs the app and API together on http://localhost:8787 with a local database.
