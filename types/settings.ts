export interface AISettings {
  temperature: number
  top_p: number
  top_k: number
  frequency_penalty: number
  presence_penalty: number
  typing_speed: number
}

export const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
  typing_speed: 50
} 