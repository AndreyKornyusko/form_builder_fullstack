import { TextField } from '@mui/material'

import type { EditorField, TextareaConfig } from '~/types/editor'

interface FieldProps {
  field: EditorField
  defaultValue?: string
  error?: string
}

export function TextareaField({ field, defaultValue, error }: FieldProps) {
  const config = field.config as TextareaConfig

  return (
    <TextField
      name={field.id}
      label={config.label}
      placeholder={config.placeholder}
      required={config.required}
      defaultValue={defaultValue ?? ''}
      fullWidth
      multiline
      rows={config.rows ?? 4}
      InputLabelProps={{ shrink: true }}
      inputProps={{ minLength: config.minLength, maxLength: config.maxLength }}
      error={!!error}
      helperText={error ?? ' '}
    />
  )
}
