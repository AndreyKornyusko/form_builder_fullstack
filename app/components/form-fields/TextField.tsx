import { TextField as MuiTextField } from '@mui/material'

import type { EditorField, TextConfig } from '~/types/editor'

interface FieldProps {
  field: EditorField
  defaultValue?: string
  error?: string
}

export function TextField({ field, defaultValue, error }: FieldProps) {
  const config = field.config as TextConfig

  return (
    <MuiTextField
      name={field.id}
      label={config.label}
      placeholder={config.placeholder}
      required={config.required}
      defaultValue={defaultValue ?? ''}
      type="text"
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ minLength: config.minLength, maxLength: config.maxLength }}
      error={!!error}
      helperText={error ?? ' '}
    />
  )
}
