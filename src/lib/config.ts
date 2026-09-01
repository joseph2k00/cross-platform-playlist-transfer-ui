export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080'

export const SPOTIFY_REDIRECT_URI: string =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined) ??
  `${window.location.origin}/callback/spotify`

export const YOUTUBE_REDIRECT_URI: string =
  (import.meta.env.VITE_YOUTUBE_REDIRECT_URI as string | undefined) ??
  `${window.location.origin}/callback/youtube`
