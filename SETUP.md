# Playlist Showcase — Setup Guide

## 1. Prerequisites

- Node.js 18+
- A Spotify account
- An Anthropic account

---

## 2. Clone & Install

```bash
git clone <your-repo>
cd playlist-showcase
npm install
cp .env.local.example .env.local
```

---

## 3. Spotify Developer Dashboard

1. Go to https://developer.spotify.com/dashboard
2. Click **"Create app"**
3. Fill in:
   - App name: `Playlist Showcase` (any name)
   - App description: anything
   - Redirect URI: `http://localhost:3000/api/auth/callback`
   - ✅ Check "Web API"
4. Click **Save**
5. On the app page, click **Settings**
6. Copy your **Client ID** and **Client Secret**
7. Paste into `.env.local`:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

> For production, add your Vercel URL as an additional Redirect URI in the Spotify Dashboard.

---

## 4. Anthropic API Key

1. Go to https://console.anthropic.com
2. Click **API Keys** → **Create Key**
3. Copy it and paste into `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5. Session Secret

Generate a secure 32+ character random string:

```bash
openssl rand -hex 32
```

Paste the output as:

```
SESSION_SECRET=<output>
```

---

## 6. Run Locally

```bash
npm run dev
```

Open http://localhost:3000, click "Connect with Spotify", and authorize.

---

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

In the Vercel dashboard → **Environment Variables**, add all variables from `.env.local`.

Also update:
- `SPOTIFY_REDIRECT_URI` → `https://your-app.vercel.app/api/auth/callback`
- `NEXT_PUBLIC_APP_URL` → `https://your-app.vercel.app`
- Add the production redirect URI in Spotify Dashboard

---

## 8. Pre-merge Build Verification

Before merging or deploying, confirm all three commands pass cleanly in a local environment:

```bash
npm install
npm run type-check   # tsc --noEmit — must report zero errors
npm run build        # next build — must complete without errors
```

If `type-check` fails, do not skip it with `// @ts-ignore`. Fix the root cause.

---

## 9. Production Cache & Rate Limit Notes

The current `src/lib/rate-limit.ts` uses **in-process Maps** for both the analysis cache and rate limiting. This works correctly for:

- Local development
- Vercel Hobby / single-region deployments with a single warm instance

**Known limitation:** In multi-instance or multi-region serverless deployments, each function instance has its own memory. This means:
- A user could exceed the intended rate limit by hitting different instances
- A cached analysis on instance A won't be visible to instance B

**This is not a blocker for MVP**, but for production hardening, replace the in-memory store with a distributed cache:

| Option | Notes |
|---|---|
| **Upstash Redis** | Best fit for Vercel — serverless-native, free tier available at upstash.com |
| **Vercel KV** | Upstash-backed, zero-config on Vercel Pro |
| **Supabase** | If you're already using it for persistence |

The interface in `rate-limit.ts` (`getCachedAnalysis`, `setCachedAnalysis`, `checkRateLimit`) is designed to be swapped with minimal changes — only the backing store needs replacing, not the call sites.

---

## 10. Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Redirects to Spotify OAuth
│   │   │   ├── callback/route.ts    # Handles OAuth callback
│   │   │   ├── logout/route.ts      # Clears session
│   │   │   └── me/route.ts          # Returns current user
│   │   ├── playlists/
│   │   │   ├── route.ts             # GET all playlists
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET single playlist
│   │   │       └── tracks/route.ts  # GET playlist tracks
│   │   └── ai/
│   │       ├── analyze/route.ts     # POST →  analysis
│   │       └── chat/route.ts        # POST →  chat
│   ├── dashboard/
│   │   ├── page.tsx                 # Server component (auth check)
│   │   └── DashboardClient.tsx      # Main UI client component
│   ├── layout.tsx
│   ├── page.tsx                     # Landing/login page
│   └── globals.css
├── components/
│   ├── ai/
│   │   └── AIAnalysisPanel.tsx      # Floating AI analysis modal
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── FilterBar.tsx
│   └── playlist/
│       ├── PlaylistCard.tsx         # Grid + list card
│       └── PlaylistModal.tsx        # Detail modal with chat
├── hooks/
│   ├── usePlaylists.ts              # Fetch + filter state
│   └── useAIAnalysis.ts             # Analysis + chat hooks
├── lib/
│   ├── auth-guard.ts                # Reusable auth check for routes
│   ├── claude.ts                    # Anthropic SDK wrapper
│   ├── session.ts                   # iron-session config
│   ├── spotify.ts                   # Spotify API wrapper
│   └── utils.ts                     # Shared utilities
└── types/
    └── index.ts                     # All TypeScript types
```

---

## 11. Future Enhancements

- **Supabase persistence** — cache playlist + analysis data in PostgreSQL
- **Public profile pages** — shareable `/u/username` routes
- **Playlist comparison** — side-by-side AI comparison of two playlists
- **Export** — download playlist as PDF or image
- **Real-time updates** — webhook or polling for playlist changes
- **Genre detection** — use Spotify audio features API for BPM, energy, danceability
- **Embeds** — Spotify embed player in the detail modal
- **Social auth** — multiple Spotify accounts
```
