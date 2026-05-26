# Playlist Showcase

Editorial Spotify playlist showcase with AI-powered analysis.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

## Overview

A personal Spotify playlist showcase built with an editorial magazine aesthetic. Connects to your Spotify account, displays your playlists beautifully, and uses Groq AI to generate poetic editorial reviews for each playlist.

## Features

- **Spotify OAuth** — connects to your account, fetches all playlists with full pagination
- **Editorial UI** — dark Spotify aesthetic with magazine-inspired typography
- **Grid & List view** — toggle between layouts, sort by name / track count / followers
- **AI Analysis** — Groq (Llama 3.3) generates poetic editorial reviews per playlist
- **AI Chat** — ask questions about any playlist, get insightful answers
- **Detail Modal** — full track list, AI analysis, and chat in one view
- **Smart Cache** — analyses cached by playlist snapshot ID, invalidated on playlist changes
- **Rate Limiting** — session-based throttle to protect AI API usage

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | Spotify OAuth 2.0 + iron-session |
| Music API | Spotify Web API |
| AI | Groq API (Llama 3.3 70B) |
| Deployment | Vercel |

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/mehmetoya/playlist-showcase.git
cd playlist-showcase
npm install
cp .env.local.example .env.local
```

### 2. Spotify setup

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app → add Redirect URI: `http://localhost:3000/api/auth/callback`
3. Copy **Client ID** and **Client Secret**

### 3. Groq setup

1. Go to [console.groq.com](https://console.groq.com)
2. Create an API key — free, no credit card required

### 4. Environment variables

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
GROQ_API_KEY=your_groq_api_key
SESSION_SECRET=your_32_char_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate session secret:
```bash
openssl rand -hex 32
```

### 5. Run

```bash
npm run dev
```

## Deployment

```bash
vercel --prod
```

Add all environment variables in Vercel dashboard. Update `SPOTIFY_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` to your production URL. Add the production redirect URI in Spotify Dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth login, callback, logout, session
│   │   ├── playlists/     # Spotify playlist + track endpoints
│   │   └── ai/            # Groq analysis + chat endpoints
│   ├── dashboard/         # Main showcase page
│   └── page.tsx           # Landing / login page
├── components/
│   ├── ai/                # AI analysis panel
│   ├── layout/            # Header, filter bar
│   └── playlist/          # Cards, detail modal
├── hooks/                 # usePlaylists, useAIAnalysis, useAIChat
├── lib/                   # spotify.ts, claude.ts (Groq), session.ts, rate-limit.ts
└── types/                 # Shared TypeScript interfaces
```

## License

MIT
