# Frontend Review — Remix + React + MUI Checklist

Use this guide when reviewing any file in `app/routes/` (UI part) or `app/components/`.
Rate each issue by severity:
- 🔴 **Error** — must fix before merge (breaks functionality or security)
- 🟡 **Warning** — should fix (potential bug, bad pattern)
- 🔵 **Suggestion** — code quality, readability, performance

---

## 1. Component Architecture

```
✅ Named exports only — no default component exports
✅ PascalCase file names (FormEditor.tsx, FieldList.tsx)
✅ No Prisma imports, no *.server.ts imports inside components
✅ No DB calls, no session access inside component files
✅ Props fully typed — no implicit `any`, no `as any` casts
✅ Components live in app/components/, not in app/routes/
```

```typescript
// ✅ Correct
export function FieldList({ fields, onDelete }: FieldListProps) { ... }

// 🔴 Wrong — default export
export default function FieldList() { ... }

// 🔴 Wrong — any prop
function Foo({ data }: { data: any }) { ... }
```

---

## 2. Remix Hooks — Correct Usage

### useLoaderData
```typescript
// ✅ Always typed with typeof loader
const { form, fields } = useLoaderData<typeof loader>()

// 🟡 Untyped — loses type safety
const data = useLoaderData()
```

### useActionData
```typescript
// ✅ Type-safe errors with optional chaining
const actionData = useActionData<typeof action>()
const titleError = actionData?.errors?.title

// 🔴 Wrong — crashes if actionData is undefined
const { errors } = useActionData<typeof action>()
```

### useFetcher
```typescript
// ✅ Type the fetcher to get typed data
const fetcher = useFetcher<typeof action>()

// ✅ Optimistic UI — read fetcher.formData for pending state
const isPublished = fetcher.formData
  ? fetcher.formData.get('published') === 'true'
  : form.isPublished

// 🟡 Missing optimistic state — UI lags behind user action
const isPublished = form.isPublished // stale while submitting
```

### useNavigation
```typescript
// ✅ Disable submit button while submitting
const navigation = useNavigation()
const isSubmitting = navigation.state === 'submitting'

// 🔵 Also check navigation.formAction to scope to specific forms
const isThisFormSubmitting =
  navigation.state === 'submitting' &&
  navigation.formAction === `/admin/forms/${id}`
```

### Anti-patterns
```typescript
// 🔴 Never use useEffect for data fetching — use loader
useEffect(() => {
  fetch('/api/forms').then(...)
}, [])

// 🔴 Never call server functions directly from components
import { getFormById } from '~/models/forms.server' // ❌ server code in client
```

---

## 3. TypeScript Strictness

```typescript
// ✅ Discriminated union for conditional types
type FieldConfig =
  | { type: 'text'; placeholder: string; maxLength: number }
  | { type: 'number'; min: number; max: number }
  | { type: 'textarea'; rows: number }

// ✅ Exhaustive check in switch
function renderField(config: FieldConfig) {
  switch (config.type) {
    case 'text': return <TextField ... />
    case 'number': return <NumberField ... />
    case 'textarea': return <TextareaField ... />
    default: {
      const _exhaustive: never = config
      throw new Error('Unknown field type')
    }
  }
}

// 🔴 Casting away type safety
const config = field.config as any
const config = field.config as TextConfig // only ok if narrowed first
```

---

## 4. MUI v5 Patterns

```typescript
// ✅ Use sx prop for one-off styles
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

// 🟡 Avoid inline style={{}} — bypasses theme
<Box style={{ display: 'flex', marginTop: '16px' }}>

// ✅ SSR fix — always add InputLabelProps + placeholder for TextFields
<TextField
  label="Title"
  InputLabelProps={{ shrink: true }}  // prevents label overlap on SSR hydration
  placeholder="Enter title..."
/>

// 🟡 Missing InputLabelProps — causes FOUC/overlap on hydration
<TextField label="Title" value={title} />

// ✅ Use theme spacing units (multiples of 8px)
sx={{ p: 2, mt: 3, gap: 1 }}  // 16px, 24px, 8px

// 🔵 Prefer MUI breakpoints over arbitrary media queries
sx={{ display: { xs: 'none', md: 'flex' } }}
```

---

## 5. SSR Safety

```typescript
// 🔴 Crashes on server — window is not defined
const width = window.innerWidth

// ✅ Guard with typeof check
const width = typeof window !== 'undefined' ? window.innerWidth : 0

// ✅ Or use useEffect (runs only on client)
const [width, setWidth] = useState(0)
useEffect(() => { setWidth(window.innerWidth) }, [])

// 🔴 localStorage on server
localStorage.setItem('key', value)

// ✅ Only inside useEffect or event handler
useEffect(() => { localStorage.setItem('key', value) }, [value])
```

---

## 6. Forms — Remix Form vs useFetcher

```typescript
// ✅ Full page navigation — use <Form> from @remix-run/react
import { Form } from '@remix-run/react'
<Form method="post">...</Form>

// ✅ Inline / partial updates — use useFetcher
const fetcher = useFetcher()
<fetcher.Form method="post" action="/admin/forms/123/publish">

// 🔴 Using native <form> — bypasses Remix, causes page refresh
<form method="post">

// ✅ Pass method="post" for mutations (not GET)
<Form method="post" action="/admin/forms/new">

// 🔵 Use action prop explicitly when submitting to a different route
```

---

## 7. Error Boundaries

```typescript
// ✅ Every route file MUST export ErrorBoundary
export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">{error.status} {error.statusText}</Typography>
        <Typography>{error.data}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Unexpected error</Typography>
    </Box>
  )
}

// 🔴 Missing ErrorBoundary — unhandled errors crash the entire app
```

---

## 8. Accessibility (a11y)

```typescript
// ✅ Form inputs have labels (MUI TextField does this automatically)
<TextField label="Email" name="email" />

// ✅ Icon buttons need aria-label
<IconButton aria-label="Delete field" onClick={onDelete}>
  <DeleteIcon />
</IconButton>

// 🟡 Missing aria-label on icon-only button
<IconButton onClick={onDelete}>
  <DeleteIcon />
</IconButton>

// ✅ Loading states communicate to screen readers
<Button disabled={isSubmitting} aria-busy={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// ✅ Dynamic content changes announced
<Alert role="status" aria-live="polite">Form saved!</Alert>
```

---

## 9. Security

```typescript
// 🔴 Never render user content as HTML
<Typography dangerouslySetInnerHTML={{ __html: field.label }} />

// ✅ Always render as text
<Typography>{field.label}</Typography>

// 🔴 Never construct URLs from user input without validation
const url = `/forms/${formData.get('id')}` // could be ../../admin

// ✅ Use typed params from Remix (already validated by router)
const { id } = useParams()
```

---

## 10. Performance

```typescript
// 🔵 Memoize expensive computations
const sortedFields = useMemo(
  () => [...fields].sort((a, b) => a.order - b.order),
  [fields]
)

// 🔵 Stable callbacks for child components
const handleDelete = useCallback((id: string) => {
  setFields(prev => prev.filter(f => f.id !== id))
}, [])

// 🟡 Creating objects/arrays in render causes unnecessary re-renders
<FieldList
  options={{ foo: 'bar' }} // 🟡 new object on every render
  style={{ color: 'red' }}  // 🟡 same issue
/>
```

---

## Review Output Template

```markdown
## Frontend Review: <filename>

### 🔴 Errors (must fix)
- Line X: [issue] — [why it's a problem] — [suggested fix]

### 🟡 Warnings (should fix)
- Line X: [issue] — [suggested fix]

### 🔵 Suggestions (optional)
- Line X: [improvement]

### Overall: PASS / NEEDS WORK / BLOCKED
```
