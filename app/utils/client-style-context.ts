import { createContext, useContext } from 'react'

export interface ClientStyleContextData {
  reset: () => void
}

export const ClientStyleContext = createContext<ClientStyleContextData>({
  reset: () => {},
})

export function useClientStyle() {
  return useContext(ClientStyleContext)
}
