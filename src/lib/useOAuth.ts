import { fetchAuthLink, exchangeCode, ApiError } from './api'
import type { Platform } from './types'

export type OAuthStatus = 'idle' | 'connecting' | 'error'

export interface OAuthHandle {
  status: OAuthStatus
  error: string | null
  /** Opens the OAuth consent page, waits for the redirected code, and
   *  exchanges it for an access token. Resolves with the access token. */
  connect: () => Promise<string>
}

const POPUP_WIDTH = 520
const POPUP_HEIGHT = 660

/**
 * Opens the platform auth link in a centered popup. The popup navigates to
 * the registered redirect URI (a /callback/:platform route in this SPA) with a
 * `code` query param. The callback page posts the code back to this window
 * via `postMessage` with origin `REDIRECT_ORIGIN`, then we exchange it for an
 * access token.
 */
export function useOAuth(platform: Platform): OAuthHandle {
  function connect(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const origin = window.location.origin
      let popup: Window | null = null
      let timer: ReturnType<typeof setTimeout> | null = null

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== origin) return
        const { type, code, error } = event.data ?? {}
        if (type !== 'oauth-code') return
        cleanup()
        if (error) {
          reject(new Error(error))
          return
        }
        if (!code) {
          reject(new Error('No authorization code received.'))
          return
        }
        exchangeCode(platform, code)
          .then((res) => {
            const token = res.access_token
            if (!token) {
              reject(new Error('Backend returned no access token.'))
              return
            }
            resolve(token)
          })
          .catch((err) => reject(err))
      }

      const cleanup = () => {
        window.removeEventListener('message', onMessage)
        if (timer) clearTimeout(timer)
      }

      window.addEventListener('message', onMessage)

      fetchAuthLink(platform)
        .then(({ link }) => {
          const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
          const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2
          popup = window.open(
            link,
            `oauth_${platform}`,
            `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no`,
          )
          if (!popup) {
            cleanup()
            reject(new Error('Popup was blocked. Allow popups to connect.'))
            return
          }
          timer = setTimeout(() => {
            cleanup()
            popup?.close()
            reject(
              new Error('Timed out waiting for authorization. Please retry.'),
            )
          }, 120000)
        })
        .catch((err: unknown) => {
          cleanup()
          reject(
            err instanceof ApiError
              ? err
              : new Error('Could not start the authorization flow.'),
          )
        })
    })
  }

  return { status: 'idle', error: null, connect }
}
