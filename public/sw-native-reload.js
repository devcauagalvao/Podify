// Importado pelo service worker gerado (vite.config.ts -> workbox.importScripts).
// O app nativo (Capacitor) roda em https://localhost. Quem atualiza pela Play
// Store ainda tem a página antiga aberta, servida pelo SW antigo. Quando este
// SW novo assume, recarrega essas janelas pra carregarem o JS novo, que remove
// o service worker de vez no app. No site (outro domínio) não faz nada.
self.addEventListener('activate', (event) => {
  if (self.location.hostname !== 'localhost') return
  event.waitUntil(
    // claim() antes: navigate() só funciona em janelas controladas por este SW.
    self.clients.claim().then(() => {
      // Sem return de propósito: navigate() espera o SW terminar de ativar;
      // dentro do waitUntil isso travaria a ativação (deadlock).
      self.clients
        .matchAll({ type: 'window' })
        .then((clients) => clients.forEach((c) => c.navigate(c.url).catch(() => {})))
    }),
  )
})
