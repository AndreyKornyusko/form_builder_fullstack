# MUI v5 Best Practices

## Layout Patterns

### Centered Card (login, create form)
```tsx
<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
  <Card sx={{ width: 400, p: 3 }}>
    <CardContent>{/* content */}</CardContent>
  </Card>
</Box>
```

### 3-Column Editor Layout
```tsx
<Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
  <Box sx={{ width: 260, borderRight: 1, borderColor: 'divider', overflow: 'auto', flexShrink: 0 }}>
    <FieldList />
  </Box>
  <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
    <FormPreview />
  </Box>
  <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', overflow: 'auto', flexShrink: 0 }}>
    <FieldSettingsSidebar />
  </Box>
</Box>
```

## Form Fields

### Field with validation error
```tsx
<TextField
  name="title"
  label="Назва"
  fullWidth
  required
  error={!!errors?.title}
  helperText={errors?.title ?? ' '} // space prevents layout shift
  defaultValue={form?.title}
/>
```

### Controlled field (editor preview — read-only look)
```tsx
<TextField
  label={config.label}
  placeholder={config.placeholder}
  required={config.required}
  multiline={type === 'textarea'}
  rows={type === 'textarea' ? (config.rows ?? 4) : undefined}
  type={type === 'number' ? 'number' : 'text'}
  inputProps={{ min: config.min, max: config.max, minLength: config.minLength, maxLength: config.maxLength }}
  fullWidth
  size="small"
  // In preview mode — disable interaction
  InputProps={{ readOnly: true }}
/>
```

## Status Chip
```tsx
<Chip
  label={form.isPublished ? 'Опубліковано' : 'Чернетка'}
  color={form.isPublished ? 'success' : 'default'}
  size="small"
/>
```

## Save Feedback (Snackbar)
```tsx
const [open, setOpen] = useState(false)
const navigation = useNavigation()
const wasSubmitting = useRef(false)

useEffect(() => {
  if (navigation.state === 'idle' && wasSubmitting.current) setOpen(true)
  wasSubmitting.current = navigation.state === 'submitting'
}, [navigation.state])

<Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
  <Alert severity="success" onClose={() => setOpen(false)}>Збережено</Alert>
</Snackbar>
```

## Delete Confirmation
```tsx
<Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
  <DialogTitle>Видалити форму?</DialogTitle>
  <DialogContent><DialogContentText>Цю дію не можна скасувати.</DialogContentText></DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteId(null)}>Скасувати</Button>
    <fetcher.Form method="post" action={`/admin/forms/${deleteId}`}>
      <input type="hidden" name="_method" value="DELETE" />
      <Button type="submit" color="error" variant="contained">Видалити</Button>
    </fetcher.Form>
  </DialogActions>
</Dialog>
```

## Imports
```typescript
// ✅ Always from top-level
import { Button, TextField, Box, Stack, Card, Chip } from '@mui/material'
import { Add, Delete, Edit, Publish } from '@mui/icons-material'
```

## Rules
- `sx` prop for one-off styles, never inline `style={{}}`
- `Box` instead of `div` for layout
- `Stack` for linear lists with gaps
- `fullWidth` on all form inputs
- `size="small"` on editor fields (set in theme globally)
- All text in Ukrainian
- `variant="outlined"` on Cards (theme default)
