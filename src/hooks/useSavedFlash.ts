import { useRef, useState } from 'react'

const FLASH_DURATION_MS = 1500
const CLOSE_DELAY_MS = 900

export function useSavedFlash() {
  const [justSaved, setJustSaved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  function flash() {
    setJustSaved(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setJustSaved(false), FLASH_DURATION_MS)
  }

  /** Mostra a confirmação e só então executa `after` (fechar modal, navegar, etc). */
  function flashThen(after: () => void) {
    setJustSaved(true)
    setTimeout(after, CLOSE_DELAY_MS)
  }

  return { justSaved, flash, flashThen }
}
