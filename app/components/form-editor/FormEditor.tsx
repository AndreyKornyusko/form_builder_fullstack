import { ArrowBack, Save } from '@mui/icons-material'
import { Alert, Box, Button, IconButton, Snackbar, Toolbar, Typography } from '@mui/material'
import { Link, useFetcher } from '@remix-run/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AiChatButton } from '~/components/ai-chat/AiChatButton'
import { AiChatPanel } from '~/components/ai-chat/AiChatPanel'
import type { EditorField, FieldConfig, FieldType, SaveField } from '~/types/editor'
import { FieldList } from './FieldList'
import { FieldSettingsSidebar } from './FieldSettingsSidebar'
import { FormPreview } from './FormPreview'

interface FormEditorProps {
  formId: string
  formTitle: string
  initialFields: EditorField[]
  hasAiKey: boolean
}

export function FormEditor({ formId, formTitle, initialFields, hasAiKey }: FormEditorProps) {
  const [fields, setFields] = useState<EditorField[]>(initialFields)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [snackOpen, setSnackOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  const addFetcher = useFetcher<{ field: EditorField }>()
  const deleteFetcher = useFetcher()
  const saveFetcher = useFetcher()
  const wasSaving = useRef(false)
  const lastAddedId = useRef<string | undefined>(undefined)

  // When a new field is added, append it to local state and select it
  useEffect(() => {
    const newField = addFetcher.data?.field
    if (newField && lastAddedId.current !== newField.id) {
      lastAddedId.current = newField.id
      setFields((prev) => [...prev, newField])
      setSelectedId(newField.id)
    }
  }, [addFetcher.data])

  // Show snackbar after save completes
  useEffect(() => {
    if (saveFetcher.state === 'submitting') {
      wasSaving.current = true
    }
    if (saveFetcher.state === 'idle' && wasSaving.current) {
      wasSaving.current = false
      setSnackOpen(true)
    }
  }, [saveFetcher.state])

  function handleAddField(type: FieldType) {
    addFetcher.submit(
      { intent: 'addField', type },
      { method: 'post', encType: 'application/json', action: `/admin/forms/${formId}/edit` }
    )
  }

  function handleDeleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedId === id) setSelectedId(null)
    deleteFetcher.submit(
      { intent: 'deleteField', fieldId: id },
      { method: 'post', encType: 'application/json', action: `/admin/forms/${formId}/edit` }
    )
  }

  function handleMoveUp(id: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next.map((f, i) => ({ ...f, order: i }))
    })
  }

  function handleMoveDown(id: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next.map((f, i) => ({ ...f, order: i }))
    })
  }

  function handleConfigChange(id: string, patch: Partial<FieldConfig>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, config: { ...f.config, ...patch } } : f))
    )
  }

  function handleSave() {
    const payload: SaveField[] = fields.map((f) => ({ id: f.id, config: f.config, order: f.order }))
    // Cast needed: Remix types expect Record<string,string> but encType:json accepts any object
    saveFetcher.submit(
      { intent: 'save', fields: payload } as unknown as Record<string, string>,
      { method: 'post', encType: 'application/json', action: `/admin/forms/${formId}/edit` }
    )
  }

  // Called by AiChatPanel after fields are created in DB — appends and selects the first new one
  const handleAiAddFields = useCallback((newFields: EditorField[]) => {
    setFields((prev) => [...prev, ...newFields])
    if (newFields.length > 0) setSelectedId(newFields[0].id)
  }, [])

  const selectedField = fields.find((f) => f.id === selectedId) ?? null

  return (
    // Height = viewport minus the admin AppBar (64px)
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Editor sub-header toolbar */}
      <Toolbar
        variant="dense"
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', gap: 1, minHeight: 56 }}
      >
        <IconButton component={Link} to="/admin" edge="start" size="small" sx={{ mr: 0.5 }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }} noWrap>
          {formTitle}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Save fontSize="small" />}
          onClick={handleSave}
          disabled={saveFetcher.state === 'submitting'}
        >
          {saveFetcher.state === 'submitting' ? 'Saving…' : 'Save'}
        </Button>
      </Toolbar>

      {/* 3-column body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Field List */}
        <Box
          sx={{
            width: 260,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
            flexShrink: 0,
            bgcolor: 'background.paper',
          }}
        >
          <FieldList
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDeleteField}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onAdd={handleAddField}
            isAddingField={addFetcher.state === 'submitting'}
          />
        </Box>

        {/* Center: Form Preview */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
          <FormPreview fields={fields} selectedId={selectedId} onSelect={setSelectedId} />
        </Box>

        {/* Right: Settings Sidebar */}
        <Box
          sx={{
            width: 300,
            borderLeft: 1,
            borderColor: 'divider',
            overflow: 'auto',
            flexShrink: 0,
            bgcolor: 'background.paper',
          }}
        >
          <FieldSettingsSidebar field={selectedField} onChange={handleConfigChange} />
        </Box>
      </Box>

      {/* AI FAB — only shown when OPENAI_API_KEY is configured */}
      {hasAiKey && (
        <>
          <AiChatButton onClick={() => setAiPanelOpen(true)} />
          <AiChatPanel
            formId={formId}
            open={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
            onAddFields={handleAiAddFields}
          />
        </>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Saved successfully
        </Alert>
      </Snackbar>
    </Box>
  )
}
