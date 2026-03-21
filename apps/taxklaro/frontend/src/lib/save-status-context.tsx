import { createContext, useContext, useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
const SaveStatusContext = createContext<{
  status: SaveStatus
  setStatus: (s: SaveStatus) => void
}>({ status: 'idle', setStatus: () => {} })

export function SaveStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  return <SaveStatusContext.Provider value={{ status, setStatus }}>{children}</SaveStatusContext.Provider>
}

export function useSaveStatus() { return useContext(SaveStatusContext) }
