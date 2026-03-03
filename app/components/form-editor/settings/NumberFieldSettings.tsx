import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'

import type { NumberConfig } from '~/types/editor'

interface NumberFieldSettingsProps {
  config: NumberConfig
  onChange: (patch: Partial<NumberConfig>) => void
}

export function NumberFieldSettings({ config, onChange }: NumberFieldSettingsProps) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Label"
        value={config.label}
        onChange={(e) => onChange({ label: e.target.value })}
        fullWidth
        required
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Placeholder"
        value={config.placeholder ?? ''}
        onChange={(e) => onChange({ placeholder: e.target.value })}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={config.required ?? false}
            onChange={(e) => onChange({ required: e.target.checked })}
            size="small"
          />
        }
        label="Required"
      />
      <TextField
        label="Min"
        type="number"
        value={config.min ?? ''}
        onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : undefined })}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Max"
        type="number"
        value={config.max ?? ''}
        onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : undefined })}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Step"
        type="number"
        value={config.step ?? ''}
        onChange={(e) => onChange({ step: e.target.value ? Number(e.target.value) : undefined })}
        fullWidth
        size="small"
        inputProps={{ min: 0 }}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  )
}
