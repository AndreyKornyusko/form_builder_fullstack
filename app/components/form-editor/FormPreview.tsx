import { Box, Paper, TextField, Typography } from '@mui/material'

import type { EditorField, NumberConfig, TextareaConfig, TextConfig } from '~/types/editor'

interface FormPreviewProps {
  fields: EditorField[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function FormPreview({ fields, selectedId, onSelect }: FormPreviewProps) {
  if (fields.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">Add fields to see the form preview</Typography>
      </Box>
    )
  }

  return (
    <Paper variant="outlined" sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {fields.map((field) => {
          const isSelected = field.id === selectedId
          return (
            <Box
              key={field.id}
              onClick={() => onSelect(field.id)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                outline: '2px solid',
                outlineColor: isSelected ? 'primary.main' : 'transparent',
                outlineOffset: '4px',
                transition: 'outline-color 0.15s',
                '&:hover': {
                  outlineColor: isSelected ? 'primary.main' : 'action.hover',
                },
              }}
            >
              <FieldPreview field={field} />
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

function FieldPreview({ field }: { field: EditorField }) {
  const config = field.config as TextConfig & NumberConfig & TextareaConfig

  return (
    <TextField
      label={config.label || 'Untitled'}
      placeholder={config.placeholder}
      required={config.required}
      fullWidth
      size="small"
      multiline={field.type === 'textarea'}
      rows={field.type === 'textarea' ? (config.rows ?? 4) : undefined}
      type={field.type === 'number' ? 'number' : 'text'}
      inputProps={{
        min: config.min,
        max: config.max,
        minLength: config.minLength,
        maxLength: config.maxLength,
      }}
      InputLabelProps={{ shrink: true }}
      InputProps={{ readOnly: true }}
    />
  )
}
