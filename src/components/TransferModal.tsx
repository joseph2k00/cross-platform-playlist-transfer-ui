import type { AllPlatform } from '../lib/types'
import { ALL_PLATFORM_LABELS } from '../lib/types'
import { PlatformIcon } from './PlatformIcon'

interface TransferModalProps {
  open: boolean
  transferring: boolean
  completed: number
  total: number
  currentPlaylistName: string | null
  source: AllPlatform
  destination: AllPlatform
  onClose: () => void
}

export function TransferModal({
  open,
  transferring,
  completed,
  total,
  currentPlaylistName,
  source,
  destination,
  onClose,
}: TransferModalProps) {
  if (!open) return null

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const done = !transferring && completed === total && total > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={transferring ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <PlatformIcon platform={source} />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-zinc-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5-5 5M6 7l5 5-5 5"
            />
          </svg>
          <PlatformIcon platform={destination} />
        </div>

        <h2 className="text-lg font-semibold text-white">
          {done ? 'Transfer complete' : 'Transferring playlists'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Moving{' '}
          <span className="text-zinc-200">{total} playlist{total === 1 ? '' : 's'}</span>{' '}
          from {ALL_PLATFORM_LABELS[source]} to{' '}
          {ALL_PLATFORM_LABELS[destination]}.
        </p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {done
                ? 'All done'
                : currentPlaylistName
                  ? `Importing “${currentPlaylistName}”…`
                  : 'Preparing…'}
            </span>
            <span className="font-semibold text-white">{percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                done ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs text-zinc-500">
            {completed} of {total}
          </div>
        </div>

        <div className="mt-6">
          {done ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm text-emerald-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Successfully transferred {total} playlist{total === 1 ? '' : 's'}
              to {ALL_PLATFORM_LABELS[destination]}.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Please wait, don't close this window.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={transferring}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {done ? 'Done' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
