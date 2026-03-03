import { Box, Typography } from '@mui/material'

import type { EditorField, FieldConfig, NumberConfig, TextareaConfig, TextConfig } from '~/types/editor'
import { NumberFieldSettings } from './settings/NumberFieldSettings'
import { TextareaFieldSettings } from './settings/TextareaFieldSettings'
import { TextFieldSettings } from './settings/TextFieldSettings'

interface FieldSettingsSidebarProps {
  field: EditorField | null
  onChange: (id: string, patch: Partial<FieldConfig>) => void
}

export function FieldSettingsSidebar({ field, onChange }: FieldSettingsSidebarProps) {
  return (
    <Box>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          FIELD SETTINGS
        </Typography>
      </Box>

      {!field ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select a field to configure
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {field.type === 'text' && (
            <TextFieldSettings
              config={field.config as TextConfig}
              onChange={(patch) => onChange(field.id, patch)}
            />
          )}
          {field.type === 'number' && (
            <NumberFieldSettings
              config={field.config as NumberConfig}
              onChange={(patch) => onChange(field.id, patch)}
            />
          )}
          {field.type === 'textarea' && (
            <TextareaFieldSettings
              config={field.config as TextareaConfig}
              onChange={(patch) => onChange(field.id, patch)}
            />
          )}
        </Box>
      )}
    </Box>
  )
}
