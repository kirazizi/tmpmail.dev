# Tmp Mail

A free, disposable temporary email service built with Next.js. Generate a random email address instantly, receive messages in real time, and let it expire automatically after 1 hour — no sign-up, no tracking.

---

## How it works

1. Click **Generate** — a random email address is created instantly.
2. Share or use that address anywhere you need a throwaway inbox.
3. Incoming emails appear in real time.
4. After 1 hour the address expires and all data is wiped from the browser.

All state is ephemeral — no database, no accounts, no persistence beyond your current browser tab.

---

## Features

- Instant email generation with realistic random addresses
- Live inbox with unread/read indicators and message counter
- Full HTML email rendering in a sandboxed iframe
- 1-hour countdown timer with auto-expiry
- Copy-to-clipboard with visual confirmation
- Dark / light theme (defaults to dark)
- IP-based rate limiting (distributed via Vercel KV)
- Fully responsive, mobile-friendly layout

---

## Tech stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16 (App Router) + React 19                 |
| Language      | TypeScript                                         |
| Styling       | Tailwind CSS 4                                     |
| Icons         | Lucide React                                       |
| Theming       | next-themes                                        |
| Rate limiting | Upstash Redis via Vercel KV                        |
| Analytics     | Vercel Analytics + Speed Insights                  |
| Email backend | External mail API (proxied via Cloudflare Workers) |
| Deployment    | Vercel                                             |

---

## Architecture

```
Browser (localStorage: token only)
    │
    ├── GET  /api/temp-mail/me
    ├── POST /api/temp-mail          ← rate limited (5 req / 10 min per IP)
    ├── GET  /api/temp-mail/messages
    └── GET  /api/temp-mail/messages/[id]
                │
        Cloudflare Worker (proxy)
                │
           Mail API
```

- **No database** — all email/message data lives in the upstream mail service.
- **Proxy layer** — a Cloudflare Worker sits in front of the mail API to handle CORS and reduce direct API exposure.
- **Retry logic** — all upstream calls retry up to 3 times with exponential backoff.
- **Domain caching** — the available email domain is cached for 1 hour; stale cache is used if the upstream is unreachable.
- **Rate limiting** — uses a sliding-window counter in Vercel KV (Upstash Redis). Falls back to an in-memory store if KV is not configured (not reliable across serverless instances — see below).

---

## Environment variables

| Variable                      | Required    | Description                                           |
| ----------------------------- | ----------- | ----------------------------------------------------- |
| `MAIL_API_BASE`               | Yes         | Base URL of the mail proxy (Cloudflare Worker URL)    |
| `KV_REST_API_URL`             | Recommended | Vercel KV REST endpoint for distributed rate limiting |
| `KV_REST_API_TOKEN`           | Recommended | Vercel KV write token                                 |
| `KV_REST_API_READ_ONLY_TOKEN` | Optional    | Vercel KV read-only token                             |
| `KV_URL`                      | Optional    | Auto-added by Vercel KV integration                   |
| `REDIS_URL`                   | Optional    | Auto-added by Vercel KV integration                   |

Copy `.env.example` to `.env.local` and fill in the values before running locally.

---

## Getting started

```bash
# 1. Clone
git clone https://github.com/kirazizi/tmpmail.dev.git
cd tmpmail.dev

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and set MAIL_API_BASE (and optionally KV vars)

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add `MAIL_API_BASE` in **Settings → Environment Variables**.
3. Create a **KV database** in the Vercel dashboard (Storage tab) and link it to the project — `KV_REST_API_URL` and `KV_REST_API_TOKEN` are added automatically.
4. Deploy.

---

## Rate limiting notes

Rate limiting uses a **sliding window** (5 requests per IP per 10 minutes) on the email generation endpoint.

- **With Vercel KV configured** — limits are enforced globally across all serverless instances. Recommended for production.
- **Without Vercel KV** — falls back to an in-memory Map. Limits only apply within a single lambda instance and are lost on cold starts. Sufficient for low-traffic or local development.

---

## License

MIT
