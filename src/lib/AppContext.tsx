import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Platform,
  Step,
  UserPlaylistDTO,
} from './types'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getStoredPlaylists,
  setStoredPlaylists,
  clearStoredPlaylists,
} from './storage'
import { useOAuth } from './useOAuth'
import { fetchPlaylists, ApiError } from './api'

type PlaylistsState = UserPlaylistDTO | null

export interface PlatformState {
  token: string | null
  playlists: PlaylistsState
  oauthError: string | null
  connecting: boolean
  loadingPlaylists: boolean
  loadError: string | null
}

interface AppContextValue {
  apps: Record<Platform, PlatformState>
  connect: (platform: Platform) => Promise<void>
  disconnect: (platform: Platform) => void
  logoutAll: () => void
  loadPlaylists: (platform: Platform) => Promise<void>
  step: Step
  setStep: (step: Step) => void
  source: Platform | null
  setSource: (platform: Platform | null) => void
  destination: Platform | null
  setDestination: (platform: Platform | null) => void
  selectedPlaylistIds: string[]
  setSelectedPlaylistIds: (ids: string[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function initialPlatform(platform: Platform): PlatformState {
  return {
    token: getStoredToken(platform),
    playlists: getStoredPlaylists(platform),
    oauthError: null,
    connecting: false,
    loadingPlaylists: false,
    loadError: null,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [spotify, setSpotify] = useState<PlatformState>(() =>
    initialPlatform('spotify'),
  )
  const [youtube, setYoutube] = useState<PlatformState>(() =>
    initialPlatform('youtube'),
  )
  const [step, setStep] = useState<Step>(1)
  const [source, setSource] = useState<Platform | null>(null)
  const [destination, setDestination] = useState<Platform | null>(null)
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([])

  const apps: Record<Platform, PlatformState> = useMemo(
    () => ({ spotify, youtube }),
    [spotify, youtube],
  )
  const setApp = useCallback(
    (platform: Platform, patch: Partial<PlatformState>) => {
      const setter =
        platform === 'spotify' ? setSpotify : setYoutube
      setter((prev) => ({ ...prev, ...patch }))
    },
    [],
  )

  const spotifyOAuth = useOAuth('spotify')
  const youtubeOAuth = useOAuth('youtube')
  const oauthFor = (platform: Platform) =>
    platform === 'spotify' ? spotifyOAuth : youtubeOAuth

  const connect = useCallback(
    async (platform: Platform) => {
      setApp(platform, {
        connecting: true,
        oauthError: null,
      })
      try {
        const token = await oauthFor(platform).connect()
        setStoredToken(platform, token)
        setApp(platform, { token, connecting: false })
      } catch (err) {
        setApp(platform, {
          connecting: false,
          oauthError:
            err instanceof ApiError
              ? `Backend error (${err.status}): ${err.message}`
              : err instanceof Error
                ? err.message
                : 'Connection failed.',
        })
      }
    },
    [setApp, spotifyOAuth, youtubeOAuth],
  )

  const disconnect = useCallback(
    (platform: Platform) => {
      clearStoredToken(platform)
      clearStoredPlaylists(platform)
      setApp(platform, {
        token: null,
        playlists: null,
        oauthError: null,
        loadError: null,
      })
    },
    [setApp],
  )

  const logoutAll = useCallback(() => {
    ;(['spotify', 'youtube'] as Platform[]).forEach(disconnect)
    setSource(null)
    setDestination(null)
    setSelectedPlaylistIds([])
    setStep(1)
  }, [disconnect])

  const loadPlaylists = useCallback(
    async (platform: Platform) => {
      const token = apps[platform].token
      if (!token) return
      setApp(platform, { loadingPlaylists: true, loadError: null })
      try {
        const dto = await fetchPlaylists(platform, token)
        setStoredPlaylists(platform, dto)
        setApp(platform, { playlists: dto, loadingPlaylists: false })
      } catch (err) {
        setApp(platform, {
          loadingPlaylists: false,
          loadError:
            err instanceof ApiError
              ? `Backend error (${err.status}): ${err.message}`
              : 'Could not load playlists.',
        })
      }
    },
    [apps, setApp],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      apps,
      connect,
      disconnect,
      logoutAll,
      loadPlaylists,
      step,
      setStep,
      source,
      setSource,
      destination,
      setDestination,
      selectedPlaylistIds,
      setSelectedPlaylistIds,
    }),
    [
      apps,
      connect,
      disconnect,
      logoutAll,
      loadPlaylists,
      step,
      setStep,
      source,
      setSource,
      destination,
      setDestination,
      selectedPlaylistIds,
      setSelectedPlaylistIds,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
