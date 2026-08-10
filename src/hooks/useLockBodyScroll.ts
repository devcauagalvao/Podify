import { useEffect } from 'react'

/** Trava o scroll da página por trás enquanto um drawer/menu overlay está
 * aberto (senão o conteúdo por trás rola junto no touch/scroll do celular).
 * Usa position:fixed pra travar de verdade no iOS e restaura a posição de
 * rolagem exata ao fechar. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.overflow = 'hidden'
    return () => {
      style.position = ''
      style.top = ''
      style.left = ''
      style.right = ''
      style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
