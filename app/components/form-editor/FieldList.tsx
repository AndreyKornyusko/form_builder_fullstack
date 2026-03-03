import { Notes, Numbers, TextFields } from '@mui/icons-material'
import { Box, Button, Divider, List, Typography } from '@mui/material'

import type { EditorField, FieldType } from '~/types/editor'
import { FieldListItem } from './FieldListItem'

interface FieldListProps {
  fields: EditorField[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onAdd: (type: FieldType) => void
  isAddingField: boolean
}

export function FieldList({
  fields,
  selectedId,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAdd,
  isAddingField,
}: FieldListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          FIELDS
        </Typography>
      </Box>

      {fields.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No fields yet. Add one below.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
          {fields.map((field, index) => (
            <FieldListItem
              key={field.id}
              field={field}
              isSelected={field.id === selectedId}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              onSelect={() => onSelect(field.id)}
              onDelete={() => onDelete(field.id)}
              onMoveUp={() => onMoveUp(field.id)}
              onMoveDown={() => onMoveDown(field.id)}
            />
          ))}
        </List>
      )}

      <Divider />

      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<TextFields fontSize="small" />}
          onClick={() => onAdd('text')}
          disabled={isAddingField}
        >
          + Text
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<Numbers fontSize="small" />}
          onClick={() => onAdd('number')}
          disabled={isAddingField}
        >
          + Number
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<Notes fontSize="small" />}
          onClick={() => onAdd('textarea')}
          disabled={isAddingField}
        >
          + Textarea
        </Button>
      </Box>
    </Box>
  )
}
