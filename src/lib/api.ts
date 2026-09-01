import type { Platform, UserPlaylistDTO } from './types'
import { API_BASE_URL } from './config'

interface AuthLinkResponse {
  link: string
}

interface AccessTokenResponse {
  access_token: string
  expires_in?: number
  token_type?: string
  scope?: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body?.message === 'string') message = body.message
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

function getAuthLinkPath(platform: Platform): string {
  return `/${platform}/auth-link`
}

function getTokenPath(platform: Platform): string {
  return `/${platform}/get-access-token`
}

function getPlaylistsPath(platform: Platform): string {
  return `/${platform}/playlists`
}

function getCreatePath(platform: Platform): string {
  return `/${platform}/playlist/create`
}

export function fetchAuthLink(platform: Platform): Promise<AuthLinkResponse> {
  return request<AuthLinkResponse>(getAuthLinkPath(platform))
}

export function exchangeCode(
  platform: Platform,
  code: string,
): Promise<AccessTokenResponse> {
  return request<AccessTokenResponse>(getTokenPath(platform), {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function fetchPlaylists(
  platform: Platform,
  token: string,
): Promise<UserPlaylistDTO> {
  return request<UserPlaylistDTO>(getPlaylistsPath(platform), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createPlaylist(
  platform: Platform,
  token: string,
  dto: UserPlaylistDTO,
): Promise<{ status: string }> {
  return request<{ status: string }>(getCreatePath(platform), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(dto),
  })
}
