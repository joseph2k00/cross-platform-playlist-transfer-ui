# Cross-Platform Playlist Transfer UI

A React + Vite + TypeScript + Tailwind frontend for the stateless Spring Boot
playlist transferer (see `Backend_architecture.md`). It lets users connect
Spotify and YouTube, load their playlists, and transfer a playlist between the
two platforms.

## Requirements

- Node.js 18+
- The backend running at `http://localhost:8080`

## Setup

```bash
npm install
cp .env.example .env   # optional, defaults already point to localhost:8080
npm run dev            # starts at http://localhost:5173
```

## Configuration

All config lives in `.env` (see `.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base | `http://localhost:8080` |
| `VITE_SPOTIFY_REDIRECT_URI` | OAuth redirect for Spotify | `http://localhost:5173/callback/spotify` |
| `VITE_YOUTUBE_REDIRECT_URI` | OAuth redirect for YouTube | `http://localhost:5173/callback/youtube` |

> The redirect URIs here **must match exactly** the values registered in the
> Spotify App Dashboard / Google Cloud Console *and* the backend's
> `spotify.redirect-uri` / `youtube.redirect-urls` config. The SPA listens on
> `/callback/:platform` for the OAuth `code`.

## How OAuth works (same-page flow)

1. Clicking **Connect** fetches `GET /:platform/auth-link` and opens it in a
   centered popup.
2. The user authorizes; the provider redirects the popup to
   `/callback/:platform?code=...`.
3. `CallbackPage` reads the `code` and posts it back to the opener via
   `postMessage`, then closes the popup.
4. `useOAuth` exchanges the code via `POST /:platform/get-access-token` and
   stores the returned `access_token` in `localStorage`.

## Scripts

```bash
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview    # serve the build
npm run typecheck  # TS only
```

## Project layout

- `src/lib/api.ts` — typed calls to all backend endpoints
- `src/lib/useOAuth.ts` — popup + code-capture flow
- `src/lib/AppContext.tsx` — shared token/playlist state
- `src/lib/storage.ts` — localStorage persistence
- `src/components/PlaylistSelector.tsx` — connect / load / pick
- `src/pages/HomePage.tsx` — source/destination + transfer
- `src/pages/CallbackPage.tsx` — OAuth redirect target
