# Backend Review — Loaders, Actions, Services, Models Checklist

Use this guide when reviewing files in `app/routes/`, `app/services/`, `app/models/`, `app/utils/`.
Severity levels:
- 🔴 **Error** — must fix (security hole, data corruption risk, broken flow)
- 🟡 **Warning** — should fix (bad pattern, silent failure risk)
- 🔵 **Suggestion** — code quality, maintainability

---

## 1. Auth Guards — Non-Negotiable

```typescript
// 🔴 Every admin loader MUST start with requireUserId
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request) // ← FIRST LINE, no exceptions
  // ...
}

// 🔴 Every admin action MUST start with requireUserId
export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request) // ← FIRST LINE, even for "harmless" actions
  // ...
}

// ✅ Public routes (no auth) — explicitly documented as intentional
// app/routes/forms.$id.tsx — public form view, no requireUserId by design
```

**Checklist per file:**
- [ ] Every `loader` in `/admin` routes calls `requireUserId` as first statement
- [ ] Every `action` in `/admin` routes calls `requireUserId` as first statement
- [ ] Public routes are explicitly marked as intentionally unauthenticated

---

## 2. Data Flow — Layer Separation

```
Route (loader/action) → Service (app/services/) → Model (app/models/) → Prisma → DB
```

```typescript
// ✅ Correct — route calls service
export async function loader({ params }: LoaderFunctionArgs) {
  const form = await getFormWithFields(params.id!) // from services/
  return json({ form })
}

// 🔴 Route calls Prisma directly — bypasses service layer
import { db } from '~/utils/db.server'
export async function loader({ params }: LoaderFunctionArgs) {
  const form = await db.form.findUnique({ where: { id: params.id } })
}

// 🔴 Service calls Prisma directly — bypasses model layer
// app/services/forms.server.ts
import { db } from '~/utils/db.server'
export async function getFormWithFields(id: string) {
  return db.form.findUnique(...) // should call app/models/ instead
}

// ✅ Correct service → model flow
import { findFormById } from '~/models/forms.server'
export async function getFormWithFields(id: string) {
  return findFormById(id)
}
```

---

## 3. Input Validation

```typescript
// ✅ Always coerce FormData — never trust raw types
const title = String(formData.get('title') ?? '').trim()
const isPublished = formData.get('published') === 'true' // string → boolean

// ✅ Validate with Yup BEFORE any DB call
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

// 🔴 Never pass raw formData.get() directly to Prisma
await createForm({ title: formData.get('title') }) // could be null or File

// 🔴 Skipping validation for "internal" fields
const order = Number(formData.get('order')) // NaN if missing, causes silent bug
const order = Number(formData.get('order') ?? 0) // ✅ with fallback
```

---

## 4. Error Handling

```typescript
// ✅ Validation errors — return json, not throw
return json({ errors: { title: 'Required' } }, { status: 400 })

// ✅ Missing resources — throw Response (triggers ErrorBoundary)
if (!form) throw new Response('Not Found', { status: 404 })

// ✅ Unexpected errors — log server-side, return generic message
try {
  await deleteForm(id)
} catch (err) {
  console.error('[deleteForm] unexpected error:', err)
  return json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
}

// 🔴 Exposing error internals to client
return json({ error: err.message }) // may leak stack trace, DB schema, file paths

// 🔴 Swallowing errors silently
try { ... } catch { /* nothing */ }

// ✅ Handle Prisma not-found explicitly
import { Prisma } from '@prisma/client'
catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    throw new Response('Not Found', { status: 404 })
  }
  throw err
}
```

---

## 5. Mutations — POST-Redirect-GET Pattern

```typescript
// ✅ After successful mutation, always redirect (prevents double-submit)
export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)
  // ... do mutation ...
  return redirect('/admin') // ← redirect, not json
}

// 🟡 Returning json after mutation — allows browser to re-submit on refresh
export async function action() {
  await createForm(...)
  return json({ success: true }) // 🟡 user refresh = duplicate form
}

// ✅ Exception: mutations that return data (e.g., AI generate, resource routes)
// These are POST-only API endpoints, not HTML form submissions
export async function action() { // app/routes/admin.forms.$id.generate.tsx
  const result = await generateFields(prompt)
  return json({ fields: result }) // ✅ intentional — used by useFetcher, not <Form>
}
```

---

## 6. Server File Convention

```typescript
// ✅ All server-only code in *.server.ts
// app/models/forms.server.ts
// app/services/auth.server.ts
// app/utils/session.server.ts

// 🔴 Server code in shared file — gets bundled into client
// app/utils/forms.ts  ← if this imports Prisma, it will crash in browser

// ✅ Shared code (no server deps) can be in plain .ts
// app/utils/validation.ts — Yup schemas, no Prisma, safe to share
// app/types/editor.ts — type definitions only, safe to share
```

---

## 7. TypeScript Strictness

```typescript
// ✅ Use Prisma-generated types directly
import type { Form, FormField } from '@prisma/client'

// ✅ Type loader return for inference chain
export async function loader() {
  const form = await getFormById(id) // returns Form | null
  if (!form) throw new Response('Not Found', { status: 404 })
  return json({ form }) // TypeScript knows form: Form here
}

// ✅ Never use as any to bypass checks
const id = params.id as string // 🟡 use `params.id!` if certain, or guard first
if (!params.id) throw new Response('Bad Request', { status: 400 })

// ✅ Typed action return union
type ActionData =
  | { errors: Record<string, string> }
  | { error: string }
```

---

## 8. Security

```typescript
// 🔴 Never use $queryRaw with user input — SQL injection
await db.$queryRaw`SELECT * FROM forms WHERE title = ${userInput}`
// ✅ Use Prisma query builder — always parameterized
await db.form.findMany({ where: { title: userInput } })

// 🔴 Never hardcode secrets
const secret = 'my-secret-key-123'

// ✅ Always read from environment
const secret = process.env.SESSION_SECRET
if (!secret) throw new Error('SESSION_SECRET is required')

// 🔴 Timing attacks — don't use === for password comparison
if (password === storedPassword)
// ✅ Use bcrypt.compare (constant-time)
const valid = await bcrypt.compare(password, user.passwordHash)

// 🔴 Mass assignment — don't spread formData directly into Prisma
await db.form.update({ data: Object.fromEntries(formData) })
// ✅ Explicitly pick allowed fields
await db.form.update({ data: { title, isPublished } })
```

---

## 9. Resource Routes vs Page Routes

```typescript
// Page route — has default export (React component)
// app/routes/admin.forms.$id.edit.tsx
export async function loader() { ... }
export async function action() { ... }
export default function EditFormPage() { ... } // ← required
export function ErrorBoundary() { ... }        // ← required

// Resource route — no default export (API endpoint)
// app/routes/admin.forms.$id.generate.tsx
export async function action() { ... }
// No default export — intentional
// No ErrorBoundary needed (not a page)
```

---

## 10. Logging

```typescript
// ✅ Log with context — include relevant IDs
console.error('[forms.server] deleteForm failed for id=%s:', id, err)

// 🟡 No context — hard to debug in production
console.error('Error:', err)

// ✅ Log at appropriate levels
console.info('[auth] user %s logged in', userId)   // informational
console.warn('[forms] form not found, id=%s', id)  // unexpected but handled
console.error('[ai] OpenAI request failed:', err)   // needs attention
```

---

## Review Output Template

```markdown
## Backend Review: <filename>

### 🔴 Errors (must fix)
- Line X: Missing requireUserId in action — unauthenticated mutation possible
- Line X: [issue] — [impact] — [fix]

### 🟡 Warnings (should fix)
- Line X: [issue] — [suggested fix]

### 🔵 Suggestions (optional)
- Line X: [improvement]

### Overall: PASS / NEEDS WORK / BLOCKED
```
