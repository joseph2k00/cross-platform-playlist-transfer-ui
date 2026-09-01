import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

/**
 * The OAuth redirect target. When the user authorizes on Spotify/Google, the
 * provider redirects the popup here with ?code=... . This page forwards the
 * code to the opener window (which started the popup and listens for it) via
 * postMessage, then closes itself.
 */
export function CallbackPage() {
  const { platform } = useParams<{ platform: string }>()
  const [status, setStatus] = useState<string>('Processing…')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const origin = window.location.origin

    const deliver = () => {
      window.opener?.postMessage(
        { type: 'oauth-code', platform, code, error },
        origin,
      )
      window.close()
    }

    if (!code || (error && !code)) {
      setStatus('Authorization failed — you can close this window.')
      deliver()
      return
    }

    setStatus('Redirecting you back — you can close this window.')
    deliver()
  }, [platform])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
      <p className="text-sm">{status}</p>
    </div>
  )
}
