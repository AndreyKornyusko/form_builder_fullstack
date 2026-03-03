export type FieldType = 'text' | 'number' | 'textarea'

export type TextConfig = {
  label: string
  placeholder?: string
  required?: boolean
  minLength?: number
  maxLength?: number
}

export type NumberConfig = {
  label: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
}

export type TextareaConfig = {
  label: string
  placeholder?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  rows?: number
}

export type FieldConfig = TextConfig | NumberConfig | TextareaConfig

export type EditorField = {
  id: string
  type: FieldType
  order: number
  config: FieldConfig
}

// Sent from FormEditor to the save action
export type SaveField = {
  id: string
  config: FieldConfig
  order: number
}
