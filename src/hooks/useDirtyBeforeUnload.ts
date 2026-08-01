import { useEffect, useRef } from 'react'

export function useDirtyBeforeUnload() {
  const dirtyRef = useRef(false)

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  function markDirty() {
    dirtyRef.current = true
  }

  function markClean() {
    dirtyRef.current = false
  }

  function confirmDiscard(message = 'Você tem alterações não salvas. Deseja realmente sair sem salvar?') {
    if (!dirtyRef.current) return true
    return window.confirm(message)
  }

  return { dirtyRef, markDirty, markClean, confirmDiscard }
}
