import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

let didReloadForServiceWorkerUpdate = false

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (didReloadForServiceWorkerUpdate) return
    didReloadForServiceWorkerUpdate = true
    console.info('[PWA] New service worker is controlling the app. Reloading.')
    window.location.reload()
  })
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('[PWA] New version is ready. Activating and reloading.')
    void updateSW(true)
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) {
      console.info('[PWA] Service worker registration is not available yet.')
      return
    }

    console.info('[PWA] Service worker registered:', swUrl)

    const activateWaitingWorker = () => {
      if (registration.waiting) {
        console.info('[PWA] Waiting service worker found. Activating new version.')
        void updateSW(true)
      } else {
        console.info('[PWA] No waiting service worker to activate.')
      }
    }

    const checkForUpdates = async (reason: string) => {
      if (!navigator.onLine) {
        console.info(`[PWA] Update check skipped (${reason}): offline.`)
        return
      }

      console.info(`[PWA] Checking for app update (${reason}).`)

      try {
        await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        })
        console.info('[PWA] Fetched service worker with no-store cache policy.')
      } catch (error) {
        console.warn('[PWA] Service worker update check failed before registration.update().', error)
        return
      }

      await registration.update()
      console.info('[PWA] registration.update() finished.')
      activateWaitingWorker()
    }

    registration.addEventListener('updatefound', () => {
      console.info('[PWA] updatefound event fired.')
      const newWorker = registration.installing
      if (!newWorker) {
        console.info('[PWA] updatefound fired, but no installing worker is available.')
        return
      }

      newWorker.addEventListener('statechange', () => {
        console.info('[PWA] Installing service worker state:', newWorker.state)
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          activateWaitingWorker()
        }
      })
    })

    if (navigator.serviceWorker.controller) {
      activateWaitingWorker()
    }

    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates('visible')
      }
    }

    void checkForUpdates('startup')
    window.addEventListener('online', () => void checkForUpdates('online'))
    window.addEventListener('focus', () => void checkForUpdates('focus'))
    window.addEventListener('pageshow', () => void checkForUpdates('pageshow'))
    document.addEventListener('visibilitychange', checkWhenVisible)
    window.setInterval(() => void checkForUpdates('interval'), 5 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
