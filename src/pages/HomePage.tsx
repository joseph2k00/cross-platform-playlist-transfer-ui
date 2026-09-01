import { useEffect, useMemo, useState } from 'react'
import type {
  AllPlatform,
  Platform,
  Playlist,
  UserPlaylistDTO,
} from '../lib/types'
import { PLATFORM_META, ALL_PLATFORM_LABELS } from '../lib/types'
import { useApp } from '../lib/AppContext'
import { createPlaylist } from '../lib/api'
import { PlaylistSelector } from '../components/PlaylistSelector'
import { StepIndicator } from '../components/StepIndicator'
import { PlatformIcon } from '../components/PlatformIcon'

export function HomePage() {
  const {
    step,
    setStep,
    apps,
    source,
    setSource,
    selectedPlaylistIds,
    setSelectedPlaylistIds,
    logoutAll,
  } = useApp()

  const sourceApp = source ? apps[source] : null

  const { loadPlaylists } = useApp()

  useEffect(() => {
    if (step === 2 && source && sourceApp?.token && !sourceApp.playlists) {
      void loadPlaylists(source)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, source, sourceApp?.token, sourceApp?.playlists])

  const selectedPlaylists: Playlist[] = useMemo(() => {
    if (!source || !sourceApp?.playlists) return []
    return sourceApp.playlists.playlists.filter((p) =>
      selectedPlaylistIds.includes(p.id),
    )
  }, [source, sourceApp, selectedPlaylistIds])

  function selectPlatform(p: AllPlatform) {
    if (!PLATFORM_META[p].available) return
    setSource(p as Platform)
    setSelectedPlaylistIds([])
  }

  function togglePlaylist(playlist: Playlist) {
    setSelectedPlaylistIds(
      selectedPlaylistIds.includes(playlist.id)
        ? selectedPlaylistIds.filter((id) => id !== playlist.id)
        : [...selectedPlaylistIds, playlist.id],
    )
  }

  function goBack() {
    if (step === 2) {
      setStep(1)
      setSelectedPlaylistIds([])
    } else if (step === 3) {
      setStep(2)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Playlist Transfer</h1>
        <p className="mt-1 text-zinc-400">
          Move your playlists between music platforms.
        </p>
      </header>

      <StepIndicator current={step} />

      {step === 1 ? (
        <Step1 onSelect={selectPlatform} onNext={() => setStep(2)} />
      ) : null}

      {step === 2 && source ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={source} />
              <h2 className="text-lg font-semibold text-white">
                {ALL_PLATFORM_LABELS[source]}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedPlaylistIds([])
                setStep(1)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Change source
            </button>
          </div>
          <PlaylistSelector
            platform={source}
            selectedIds={selectedPlaylistIds}
            onToggle={togglePlaylist}
          />
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={goBack}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedPlaylistIds.length === 0}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Continue ({selectedPlaylistIds.length} selected)
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 && source ? (
        <DestinationStep
          selectedPlaylists={selectedPlaylists}
          onDone={logoutAll}
          onBack={goBack}
        />
      ) : null}
    </div>
  )
}

function Step1({
  onSelect,
  onNext,
}: {
  onSelect: (p: AllPlatform) => void
  onNext: () => void
}) {
  const { apps, source, connect, disconnect } = useApp()
  const platforms = Object.keys(PLATFORM_META) as AllPlatform[]
  const sourceApp = source ? apps[source] : null
  const isConnected = !!sourceApp?.token

  function handleSelect(p: AllPlatform) {
    onSelect(p)
  }

  return (
    <div>
      <h2 className="mb-6 text-center text-lg font-semibold text-white">
        Choose your source provider
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p]
          if (!meta.available) {
            return (
              <div
                key={p}
                className="flex items-center gap-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4 opacity-60"
              >
                <PlatformIcon platform={p} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{meta.label}</p>
                  <p className="text-xs text-zinc-500">Coming soon</p>
                </div>
              </div>
            )
          }
          const isSelected = source === p
          const selectedApp = apps[p as Platform]
          return (
            <button
              key={p}
              onClick={() => handleSelect(p)}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600/10'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              <PlatformIcon platform={p} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{meta.label}</p>
                <p className="text-xs text-zinc-500">
                  {selectedApp?.connecting
                    ? 'Authorizing…'
                    : selectedApp?.token
                      ? 'Connected'
                      : `Transfer your playlists from ${meta.label}`}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {source && (
        <div className="mt-6">
          {!isConnected ? (
            <button
              onClick={() => void connect(source)}
              disabled={sourceApp?.connecting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {sourceApp?.connecting
                ? 'Authorizing…'
                : `Connect ${PLATFORM_META[source].label}`}
            </button>
          ) : null}
          {sourceApp?.oauthError ? (
            <p className="mt-2 text-sm text-red-400">{sourceApp.oauthError}</p>
          ) : null}
          <button
            onClick={onNext}
            disabled={!isConnected}
            className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Continue
          </button>
          {isConnected ? (
            <button
              onClick={() => disconnect(source)}
              className="mt-3 w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Disconnect {PLATFORM_META[source].label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function DestinationStep({
  selectedPlaylists,
  onBack,
  onDone,
}: {
  selectedPlaylists: Playlist[]
  onBack: () => void
  onDone: () => void
}) {
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const {
    apps,
    source,
    destination,
    setDestination,
    selectedPlaylistIds,
  } = useApp()
  const platforms = Object.keys(PLATFORM_META) as AllPlatform[]

  const destApp = destination ? apps[destination] : null
  const selectedCount = selectedPlaylistIds.length
  const canTransfer =
    !!destination &&
    !!destApp?.token &&
    selectedCount > 0 &&
    source !== destination

  async function handleTransfer() {
    if (!destination || !source) return
    setTransferring(true)
    setTransferError(null)
    try {
      const dto = apps[source].playlists
      if (!dto) throw new Error('Source playlists unavailable.')
      if (selectedPlaylists.length === 0)
        throw new Error('No playlists selected.')
      const payload: UserPlaylistDTO = {
        ...dto,
        count: selectedPlaylists.length,
        playlists: selectedPlaylists.map((p) => ({ ...p })),
      }
      await createPlaylist(
        destination,
        apps[destination].token as string,
        payload,
      )
      onDone()
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : 'Transfer failed.',
      )
      setTransferring(false)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-center text-lg font-semibold text-white">
        Choose your destination
      </h2>

      <div className="mb-6">
        <p className="mb-3 text-sm text-zinc-400">
          Transferring {selectedCount} playlist
          {selectedCount === 1 ? '' : 's'} to:
        </p>
        <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          {selectedPlaylists.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 py-1 text-sm text-zinc-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {p.name}
            </div>
          ))}
          {selectedPlaylists.length > 3 ? (
            <p className="py-1 text-sm text-zinc-500">
              …and {selectedPlaylists.length - 3} more
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p]
          if (!meta.available) {
            return (
              <div
                key={p}
                className="flex items-center gap-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4 opacity-60"
              >
                <PlatformIcon platform={p} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{meta.label}</p>
                  <p className="text-xs text-zinc-500">Coming soon</p>
                </div>
              </div>
            )
          }
          const isSource = source === p
          const isSelected = destination === p
          const app = apps[p as Platform]
          if (isSource) {
            return (
              <div
                key={p}
                className="pointer-events-none flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 opacity-40"
              >
                <PlatformIcon platform={p} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{meta.label}</p>
                  <p className="text-xs text-zinc-400">Source provider</p>
                </div>
              </div>
            )
          }
          return (
            <button
              key={p}
              onClick={() => setDestination(p as Platform)}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600/10'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              <PlatformIcon platform={p} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{meta.label}</p>
                <p className="text-xs text-zinc-500">
                  {app.token ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {destination && destApp && !destApp.token ? (
        <div className="mt-4">
          <DestConnectButton platform={destination} />
          {destApp.oauthError ? (
            <p className="mt-2 text-sm text-red-400">{destApp.oauthError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          disabled={transferring}
          className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => void handleTransfer()}
          disabled={!canTransfer || transferring}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {transferring
            ? 'Transferring…'
            : destination && !apps[destination].token
              ? 'Connect to continue'
              : `Transfer to ${destination ? PLATFORM_META[destination].label : ''}`}
        </button>
      </div>

      {transferError ? (
        <p className="mt-3 text-center text-sm text-red-400">
          {transferError}
        </p>
      ) : null}
    </div>
  )
}

function DestConnectButton({ platform }: { platform: Platform }) {
  const { apps, connect } = useApp()
  const app = apps[platform]
  return (
    <button
      onClick={() => void connect(platform)}
      disabled={app.connecting || !!app.token}
      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
    >
      {app.connecting ? 'Authorizing…' : `Connect ${PLATFORM_META[platform].label}`}
    </button>
  )
}
