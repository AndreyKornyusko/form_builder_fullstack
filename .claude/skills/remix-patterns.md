# Remix Patterns — Best Practices

## Loader (READ data)
```typescript
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request) // throws redirect if not authed

  const form = await getFormById(params.id!)
  if (!form) throw new Response('Not Found', { status: 404 })

  return json({ form })
}

// Component gets fully typed data
export default function EditForm() {
  const { form } = useLoaderData<typeof loader>()
}
```

## Action (WRITE data)
```typescript
export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)

  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()

  try {
    await formSchema.validate({ title }, { abortEarly: false })
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, e) => ({ ...acc, [e.path!]: e.message }),
        {} as Record<string, string>
      )
      return json({ errors }, { status: 400 })
    }
  }

  await updateForm(params.id!, { title })
  return redirect('/admin')
}
```

## Handling Action Errors in Component
```typescript
export default function EditForm() {
  const actionData = useActionData<typeof action>()

  return (
    <TextField
      name="title"
      error={!!actionData?.errors?.title}
      helperText={actionData?.errors?.title}
    />
  )
}
```

## Pending / Submitting State
```typescript
function SaveButton() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Button type="submit" disabled={isSubmitting} variant="contained">
      {isSubmitting ? 'Збереження...' : 'Зберегти'}
    </Button>
  )
}
```

## Optimistic UI with useFetcher
```typescript
// For inline updates without full page reload
function PublishToggle({ form }: { form: Form }) {
  const fetcher = useFetcher()
  const isPublished = fetcher.formData
    ? fetcher.formData.get('published') === 'true'
    : form.isPublished

  return (
    <fetcher.Form method="post" action={`/admin/forms/${form.id}/publish`}>
      <input type="hidden" name="published" value={String(!isPublished)} />
      <Switch checked={isPublished} onChange={e => e.currentTarget.form?.submit()} />
    </fetcher.Form>
  )
}
```

## Resource Routes (JSON API)
```typescript
// app/routes/admin.forms.$id.generate.tsx — POST only, no UI
export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)
  const body = await request.json()
  const result = await someService(body)
  return json({ result })
}
// No default export needed for resource routes
```

## Error Boundary (required on every route)
```typescript
export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">{error.status} {error.statusText}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Сталася неочікувана помилка</Typography>
    </Box>
  )
}
```

## Rules
- `loader` → READ only, never mutate state
- `action` → WRITE only, always return redirect or json
- Validation errors → `return json({ errors })` (not throw)
- Missing resources → `throw new Response('Not Found', { status: 404 })`
- Auth failures → handled by `requireUserId` (throws redirect automatically)
- Never use `useEffect` for data fetching — use loader
