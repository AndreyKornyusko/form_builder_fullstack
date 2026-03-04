import { createContext } from 'react'

export interface EmotionCriticalChunk {
  key: string
  ids: string[]
  css: string
}

export const EmotionStylesContext = createContext<EmotionCriticalChunk[]>([])
