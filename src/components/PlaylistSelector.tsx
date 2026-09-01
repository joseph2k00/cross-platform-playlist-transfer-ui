import type { Platform, Playlist } from '../lib/types'
import { useApp } from '../lib/AppContext'

function ConnectButton({ platform }: { platform: Platform }) {
  const { apps, connect } = useApp()
  const app = apps[platform]
  return (
    <button
      onClick={() => void connect(platform)}
      disabled={app.connecting || !!app.token}
      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
    >
      {app.connecting
        ? 'Authorizing…'
        : app.token
          ? 'Connected'
          : `Connect ${platform === 'spotify' ? 'Spotify' : 'YouTube'}`}
    </button>
  )
}

interface SelectorProps {
  platform: Platform
  selectedIds: string[]
  onToggle: (playlist: Playlist) => void
}

export function PlaylistSelector({
  platform,
  selectedIds,
  onToggle,
}: SelectorProps) {
  const { apps, loadPlaylists } = useApp()
  const app = apps[platform]
  const playlists = app.playlists?.playlists ?? []

  if (!app.token) {
    return (
      <div className="space-y-3">
        <ConnectButton platform={platform} />
        {app.oauthError ? (
          <p className="text-sm text-red-400">{app.oauthError}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          {app.loadingPlaylists
            ? 'Loading playlists…'
            : `${app.playlists?.count ?? 0} playlist${
                (app.playlists?.count ?? 0) === 1 ? '' : 's'
              }`}
        </span>
        <button
          onClick={() => void loadPlaylists(platform)}
          disabled={app.loadingPlaylists}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-4 w-4 ${app.loadingPlaylists ? 'animate-spin' : ''}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {app.loadError ? (
        <p className="text-sm text-red-400">{app.loadError}</p>
      ) : null}

      <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
        {app.loadingPlaylists ? (
          <p className="p-4 text-center text-sm text-zinc-500">
            Loading playlists…
          </p>
        ) : playlists.length === 0 ? (
          <p className="p-4 text-center text-sm text-zinc-500">
            No playlists found.
          </p>
        ) : (
          playlists.map((p) => {
            const checked = selectedIds.includes(p.id)
            return (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(p)}
                  className="h-4 w-4 shrink-0 accent-indigo-600"
                />
                {p.img_url ? (
                  <img
                    src={p.img_url}
                    alt=""
                    className="h-11 w-11 rounded object-cover"
                  />
                ) : (
                  <span className="h-11 w-11 rounded bg-zinc-700" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-100">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {p.songs.length} songs
                  </p>
                </div>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
