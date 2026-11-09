import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

if (Capacitor.isNativePlatform()) {
  // O app nativo já traz os arquivos no APK; service worker aqui só serve
  // versão velha do cache depois de atualizar pela Play Store. Remove
  // qualquer SW/caches deixados por versões anteriores.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const hadController = !!navigator.serviceWorker.controller
      Promise.all(regs.map((r) => r.unregister()))
        .then(() => ('caches' in window ? caches.keys() : Promise.resolve([] as string[])))
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => {
          // Se a página atual veio do cache do SW, recarrega já limpa.
          if (hadController) window.location.replace('/')
        })
        .catch(() => {})
    })
  }
} else {
  registerSW({ immediate: true })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
