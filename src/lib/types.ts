export type Platform = 'spotify' | 'youtube'

export type ComingSoonPlatform = 'apple_music' | 'amazon_music'

export type AllPlatform = Platform | ComingSoonPlatform

export type Step = 1 | 2 | 3

export interface Song {
  name: string
  artist: string
  isrc: string | null
}

export interface Playlist {
  id: string
  name: string
  desc: string | null
  img_url: string | null
  songs: Song[]
}

export interface UserPlaylistDTO {
  count: number
  source: string
  playlists: Playlist[]
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
}

export const ALL_PLATFORM_LABELS: Record<AllPlatform, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple_music: 'Apple Music',
  amazon_music: 'Amazon Music',
}

export interface PlatformInfo {
  label: string
  color: string
  icon: string
  available: boolean
}

export const PLATFORM_META: Record<AllPlatform, PlatformInfo> = {
  spotify: {
    label: 'Spotify',
    color: '#1DB954',
    icon: 'spotify',
    available: true,
  },
  youtube: {
    label: 'YouTube Music',
    color: '#FF0000',
    icon: 'youtube',
    available: true,
  },
  apple_music: {
    label: 'Apple Music',
    color: '#FC3C44',
    icon: 'apple',
    available: false,
  },
  amazon_music: {
    label: 'Amazon Music',
    color: '#25D1DA',
    icon: 'amazon',
    available: false,
  },
}
