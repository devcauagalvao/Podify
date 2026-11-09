import { Capacitor } from '@capacitor/core'

const TWA_FLAG = 'podify:twa'

/**
 * true quando o Podify roda como "aplicativo" (app da Play Store via
 * Capacitor, TWA antigo ou PWA instalado) e não como site no navegador.
 * Nesses casos a landing page não deve aparecer: a entrada é o login.
 */
export function isAppContext(): boolean {
  if (Capacitor.isNativePlatform()) return true

  // TWA (versão antiga do app na Play Store): o referrer só vem na 1ª
  // navegação, então guardamos na sessão.
  try {
    if (document.referrer.startsWith('android-app://')) {
      sessionStorage.setItem(TWA_FLAG, '1')
    }
    if (sessionStorage.getItem(TWA_FLAG) === '1') return true
  } catch {
    // storage bloqueado: segue sem a flag
  }

  return window.matchMedia?.('(display-mode: standalone)').matches ?? false
}
