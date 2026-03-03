import { AutoAwesome, Close, Notes, Numbers, TextFields } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useFetcher } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'

import type { FieldSuggestion } from '~/services/ai-agent.server'
import type { EditorField, FieldType } from '~/types/editor'

const typeIcons: Record<FieldType, React.ReactNode> = {
  text: <TextFields fontSize="small" />,
  number: <Numbers fontSize="small" />,
  textarea: <Notes fontSize="small" />,
}

type GenerateResult = { fields: FieldSuggestion[] } | { error: string }
type AddResult = { fields: EditorField[] }

interface AiChatPanelProps {
  formId: string
  open: boolean
  onClose: () => void
  onAddFields: (fields: EditorField[]) => void
}

export function AiChatPanel({ formId, open, onClose, onAddFields }: AiChatPanelProps) {
  const [description, setDescription] = useState('')
  const generateFetcher = useFetcher<GenerateResult>()
  const addFetcher = useFetcher<AddResult>()
  const wasAdding = useRef(false)

  const isGenerating = generateFetcher.state === 'submitting'
  const isAdding = addFetcher.state === 'submitting'

  const suggestions =
    generateFetcher.data && 'fields' in generateFetcher.data
      ? generateFetcher.data.fields
      : []
  const generateError =
    generateFetcher.data && 'error' in generateFetcher.data
      ? generateFetcher.data.error
      : null

  // When addFieldsBatch completes, pass real fields to editor and close
  useEffect(() => {
    if (addFetcher.state === 'submitting') {
      wasAdding.current = true
    }
    if (addFetcher.state === 'idle' && wasAdding.current) {
      wasAdding.current = false
      const fields = addFetcher.data?.fields
      if (fields) {
        onAddFields(fields)
        onClose()
      }
    }
  }, [addFetcher.state, addFetcher.data, onAddFields, onClose])

  function handleGenerate() {
    if (!description.trim()) return
    generateFetcher.submit(
      { description } as unknown as Record<string, string>,
      {
        method: 'post',
        encType: 'application/json',
        action: `/admin/forms/${formId}/generate`,
      }
    )
  }

  function handleAddAll() {
    const items = suggestions.map((s) => ({ type: s.type, config: s.config }))
    addFetcher.submit(
      { intent: 'addFieldsBatch', fields: items } as unknown as Record<string, string>,
      {
        method: 'post',
        encType: 'application/json',
        action: `/admin/forms/${formId}/edit`,
      }
    )
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 380 } }}
    >
      <Toolbar
        variant="dense"
        sx={{ borderBottom: 1, borderColor: 'divider', gap: 1, minHeight: 56 }}
      >
        <AutoAwesome fontSize="small" color="secondary" />
        <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
          AI Field Generator
        </Typography>
        <IconButton size="small" onClick={onClose} edge="end">
          <Close fontSize="small" />
        </IconButton>
      </Toolbar>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}>
        <TextField
          label="Describe the form you want to create"
          placeholder="e.g. A contact form with name, email, phone number and a message field"
          multiline
          rows={4}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </Button>

        {generateError && (
          <Alert severity="error">{generateError}</Alert>
        )}

        {suggestions.length > 0 && (
          <>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              {suggestions.length} field{suggestions.length !== 1 ? 's' : ''} generated
            </Typography>

            <List disablePadding dense>
              {suggestions.map((s, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {typeIcons[s.type]}
                  </ListItemIcon>
                  <ListItemText
                    primary={(s.config as { label: string }).label}
                    secondary={s.type}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="contained"
              fullWidth
              onClick={handleAddAll}
              disabled={isAdding}
              startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isAdding ? 'Adding…' : 'Add All Fields'}
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  )
}
