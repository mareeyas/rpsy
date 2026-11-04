# RPsy

Study app for the Philippine psychologist (RPsy) and guidance counselor (RGC) licensure exams. Static front end (`index.html`, `app.js`, `online.js`, `chars3d.js`, `data.js`) plus an optional Cloudflare backend (`worker/index.js`) that provides accounts, cross-device progress sync, the leaderboard and live multiplayer battles. Without the backend the app still works fully as a guest on one device.

## Deploy the online features (Cloudflare)

The D1 database `rpsy` is created automatically in your Cloudflare account on the first deploy (wrangler 4 provisions it from the binding in `wrangler.toml`), and its tables are created on the first request.

1. Create an API token at Cloudflare dashboard > My Profile > API Tokens using the "Edit Cloudflare Workers" template (add D1 edit permission).
2. In the GitHub repo, add secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Push to `main` (or run the "Deploy to Cloudflare" workflow). The Worker serves the whole app and the `/api` routes from one origin, e.g. `https://rpsy.<your-subdomain>.workers.dev`.

Or deploy by hand: `npx wrangler deploy`.

The deployed Worker is at https://rpsy.mareeyaclemente.workers.dev. `index.html` already points the GitHub Pages copy at it. If you host the static files elsewhere, add this before the scripts in `index.html` so the app talks to the Worker: `<script>window.RPSY_API='https://rpsy.<your-subdomain>.workers.dev'</script>`.

## Local development

`npx wrangler dev` runs the app and API together on http://localhost:8787 with a local database.
