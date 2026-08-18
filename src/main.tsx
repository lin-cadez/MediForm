import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateSW(true)
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return

    const activateWaitingWorker = () => {
      if (registration.waiting) {
        void updateSW(true)
      }
    }

    const checkForUpdates = async () => {
      if (!navigator.onLine) return

      try {
        await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        })
      } catch {
        return
      }

      await registration.update()
      activateWaitingWorker()
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
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
        void checkForUpdates()
      }
    }

    void checkForUpdates()
    window.addEventListener('online', () => void checkForUpdates())
    window.addEventListener('focus', () => void checkForUpdates())
    window.addEventListener('pageshow', () => void checkForUpdates())
    document.addEventListener('visibilitychange', checkWhenVisible)
    window.setInterval(() => void checkForUpdates(), 5 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
