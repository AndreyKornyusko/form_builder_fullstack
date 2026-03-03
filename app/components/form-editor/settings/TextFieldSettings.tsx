import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'

import type { TextConfig } from '~/types/editor'

interface TextFieldSettingsProps {
  config: TextConfig
  onChange: (patch: Partial<TextConfig>) => void
}

export function TextFieldSettings({ config, onChange }: TextFieldSettingsProps) {
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
        label="Min Length"
        type="number"
        value={config.minLength ?? ''}
        onChange={(e) =>
          onChange({ minLength: e.target.value ? Number(e.target.value) : undefined })
        }
        fullWidth
        size="small"
        inputProps={{ min: 0 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Max Length"
        type="number"
        value={config.maxLength ?? ''}
        onChange={(e) =>
          onChange({ maxLength: e.target.value ? Number(e.target.value) : undefined })
        }
        fullWidth
        size="small"
        inputProps={{ min: 0 }}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  )
}
