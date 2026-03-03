import { TextField } from '@mui/material'

import type { EditorField, NumberConfig } from '~/types/editor'

interface FieldProps {
  field: EditorField
  defaultValue?: string
  error?: string
}

export function NumberField({ field, defaultValue, error }: FieldProps) {
  const config = field.config as NumberConfig

  return (
    <TextField
      name={field.id}
      label={config.label}
      placeholder={config.placeholder}
      required={config.required}
      defaultValue={defaultValue ?? ''}
      type="number"
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ min: config.min, max: config.max, step: config.step }}
      error={!!error}
      helperText={error ?? ' '}
    />
  )
}
