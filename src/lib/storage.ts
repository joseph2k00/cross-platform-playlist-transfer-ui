import type { Platform, UserPlaylistDTO } from './types'

const TOKEN_KEY = (platform: Platform) => `pt_token_${platform}`
const DATA_KEY = (platform: Platform) => `pt_playlists_${platform}`

export function getStoredToken(platform: Platform): string | null {
  return localStorage.getItem(TOKEN_KEY(platform))
}

export function setStoredToken(platform: Platform, token: string): void {
  localStorage.setItem(TOKEN_KEY(platform), token)
}

export function clearStoredToken(platform: Platform): void {
  localStorage.removeItem(TOKEN_KEY(platform))
}

export function getStoredPlaylists(
  platform: Platform,
): UserPlaylistDTO | null {
  const raw = localStorage.getItem(DATA_KEY(platform))
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserPlaylistDTO
  } catch {
    return null
  }
}

export function setStoredPlaylists(
  platform: Platform,
  dto: UserPlaylistDTO,
): void {
  localStorage.setItem(DATA_KEY(platform), JSON.stringify(dto))
}

export function clearStoredPlaylists(platform: Platform): void {
  localStorage.removeItem(DATA_KEY(platform))
}
