import {
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Notes,
  Numbers,
  TextFields,
} from '@mui/icons-material'
import { Box, IconButton, ListItem, ListItemButton, ListItemText, Tooltip } from '@mui/material'

import type { EditorField } from '~/types/editor'

const typeIcons = {
  text: <TextFields fontSize="small" />,
  number: <Numbers fontSize="small" />,
  textarea: <Notes fontSize="small" />,
}

interface FieldListItemProps {
  field: EditorField
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function FieldListItem({
  field,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}: FieldListItemProps) {
  const label = (field.config as { label: string }).label || 'Untitled'

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Move up">
            <span>
              <IconButton size="small" onClick={onMoveUp} disabled={isFirst} tabIndex={-1}>
                <KeyboardArrowUp fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton size="small" onClick={onMoveDown} disabled={isLast} tabIndex={-1}>
                <KeyboardArrowDown fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete field">
            <IconButton size="small" color="error" onClick={onDelete} tabIndex={-1}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemButton
        selected={isSelected}
        onClick={onSelect}
        sx={{ pr: '112px !important' }}
      >
        <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          {typeIcons[field.type]}
        </Box>
        <ListItemText
          primary={label}
          secondary={field.type}
          primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400, noWrap: true }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </ListItemButton>
    </ListItem>
  )
}
