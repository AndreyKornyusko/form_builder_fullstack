# Testing — Vitest + Testing Library Patterns

## Setup (not yet installed — run this first)

```bash
yarn add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'happy-dom',   // lighter than jsdom, no browser API gaps
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**/*.ts', 'app/**/*.tsx'],
      exclude: ['app/routes/**', 'app/entry.*', 'app/root.tsx'],
    },
  },
})
```

### `test/setup.ts`
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Prisma globally — never hit real DB in tests
vi.mock('~/utils/db.server', () => ({
  db: {
    form: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(),
            update: vi.fn(), delete: vi.fn() },
    formField: { createMany: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
    formSubmission: { create: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}))
```

### `package.json` scripts to add
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## File Organization

```
app/
  models/
    forms.server.ts
    forms.server.test.ts     ← unit tests next to source
  services/
    auth.server.ts
    auth.server.test.ts
  utils/
    validation.ts
    validation.test.ts
  components/
    form-editor/
      FormEditor.tsx
      FormEditor.test.tsx    ← component tests next to component
test/
  setup.ts                   ← global test setup
  helpers/
    request.ts               ← createRequest helper for loader/action tests
    render.tsx               ← custom render with MUI ThemeProvider
```

---

## 1. Unit Tests — Models (Prisma layer)

```typescript
// app/models/forms.server.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '~/utils/db.server'
import { getFormById, createForm, deleteForm } from './forms.server'

// Prisma is mocked globally in test/setup.ts
const mockDb = vi.mocked(db)

beforeEach(() => vi.clearAllMocks())

describe('getFormById', () => {
  it('returns form when found', async () => {
    // Arrange
    const mockForm = { id: '1', title: 'My Form', isPublished: false, createdAt: new Date() }
    mockDb.form.findUnique.mockResolvedValue(mockForm)

    // Act
    const result = await getFormById('1')

    // Assert
    expect(result).toEqual(mockForm)
    expect(mockDb.form.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { fields: { orderBy: { order: 'asc' } } },
    })
  })

  it('returns null when not found', async () => {
    mockDb.form.findUnique.mockResolvedValue(null)
    const result = await getFormById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createForm', () => {
  it('creates form with generated id', async () => {
    const mockForm = { id: 'cuid1', title: 'New Form', userId: 'user1' }
    mockDb.form.create.mockResolvedValue(mockForm as any)

    const result = await createForm({ title: 'New Form', userId: 'user1' })

    expect(result).toEqual(mockForm)
    expect(mockDb.form.create).toHaveBeenCalledWith({
      data: { title: 'New Form', userId: 'user1' },
    })
  })
})
```

---

## 2. Unit Tests — Services (business logic)

```typescript
// app/services/auth.server.test.ts
import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { db } from '~/utils/db.server'
import { verifyLogin } from './auth.server'

vi.mock('bcryptjs')
const mockDb = vi.mocked(db)
const mockBcrypt = vi.mocked(bcrypt)

describe('verifyLogin', () => {
  it('returns user for valid credentials', async () => {
    const user = { id: '1', email: 'admin@example.com', passwordHash: 'hashed' }
    mockDb.user.findUnique.mockResolvedValue(user as any)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const result = await verifyLogin('admin@example.com', 'admin123')

    expect(result).toEqual(user)
    expect(mockBcrypt.compare).toHaveBeenCalledWith('admin123', 'hashed')
  })

  it('returns null for wrong password', async () => {
    mockDb.user.findUnique.mockResolvedValue({ passwordHash: 'hashed' } as any)
    mockBcrypt.compare.mockResolvedValue(false as never)

    const result = await verifyLogin('admin@example.com', 'wrong')

    expect(result).toBeNull()
  })

  it('returns null when user not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null)

    const result = await verifyLogin('nobody@example.com', 'pass')

    expect(result).toBeNull()
  })
})
```

---

## 3. Unit Tests — Validation (Yup schemas)

```typescript
// app/utils/validation.test.ts
import { describe, it, expect } from 'vitest'
import { loginSchema, formSchema, fieldSchema } from './validation'

describe('loginSchema', () => {
  it('passes for valid credentials', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'secret123' })
    ).resolves.toBeDefined()
  })

  it('fails for invalid email', async () => {
    await expect(
      loginSchema.validate({ email: 'not-an-email', password: 'secret123' })
    ).rejects.toThrow('email must be a valid email')
  })

  it('fails for short password', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: '123' })
    ).rejects.toThrow()
  })
})

describe('formSchema', () => {
  it('fails for empty title', async () => {
    await expect(
      formSchema.validate({ title: '' })
    ).rejects.toThrow('Title is required')
  })

  it('passes for valid title', async () => {
    await expect(
      formSchema.validate({ title: 'Customer Survey' })
    ).resolves.toBeDefined()
  })
})
```

---

## 4. Loader / Action Tests — Remix Routes

```typescript
// test/helpers/request.ts
export function createRequest(
  url: string,
  options?: RequestInit
): Request {
  return new Request(`http://localhost${url}`, options)
}

export function createFormRequest(
  url: string,
  body: Record<string, string>
): Request {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
}
```

```typescript
// Testing a loader
import { describe, it, expect, vi } from 'vitest'
import { json } from '@remix-run/node'
import { loader } from '~/routes/admin._index'
import { createRequest } from 'test/helpers/request'
import { getFormsByUser } from '~/services/forms.server'

vi.mock('~/services/forms.server')
vi.mock('~/utils/session.server', () => ({
  requireUserId: vi.fn().mockResolvedValue('user-1'),
}))

describe('admin._index loader', () => {
  it('returns list of forms for authenticated user', async () => {
    const mockForms = [{ id: '1', title: 'Form A', isPublished: true }]
    vi.mocked(getFormsByUser).mockResolvedValue(mockForms as any)

    const response = await loader({
      request: createRequest('/admin'),
      params: {},
      context: {},
    })

    const data = await response.json()
    expect(data.forms).toEqual(mockForms)
  })
})
```

```typescript
// Testing an action — validation error case
import { createFormRequest } from 'test/helpers/request'
import { action } from '~/routes/admin.forms.new'

describe('admin.forms.new action', () => {
  it('returns validation error for empty title', async () => {
    const response = await action({
      request: createFormRequest('/admin/forms/new', { title: '' }),
      params: {},
      context: {},
    })

    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.errors.title).toBeTruthy()
  })

  it('redirects after successful creation', async () => {
    vi.mocked(createForm).mockResolvedValue({ id: 'new-id' } as any)

    const response = await action({
      request: createFormRequest('/admin/forms/new', { title: 'New Form' }),
      params: {},
      context: {},
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/admin')
  })
})
```

---

## 5. Component Tests — React Testing Library

```typescript
// test/helpers/render.tsx
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '~/utils/theme'
import type { ReactElement } from 'react'

export function render(ui: ReactElement) {
  return rtlRender(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  )
}
export * from '@testing-library/react'
```

```typescript
// app/components/form-editor/FieldList.test.tsx
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from 'test/helpers/render'
import { FieldList } from './FieldList'

const mockFields = [
  { id: '1', label: 'Name', type: 'text' as const, order: 0 },
  { id: '2', label: 'Age', type: 'number' as const, order: 1 },
]

describe('FieldList', () => {
  it('renders all fields', () => {
    render(<FieldList fields={mockFields} onDelete={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<FieldList fields={mockFields} onDelete={onDelete} onSelect={vi.fn()} />)

    await user.click(screen.getAllByRole('button', { name: /delete/i })[0])

    expect(onDelete).toHaveBeenCalledWith('1')
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect when field clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FieldList fields={mockFields} onDelete={vi.fn()} onSelect={onSelect} />)

    await user.click(screen.getByText('Name'))

    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('shows empty state when no fields', () => {
    render(<FieldList fields={[]} onDelete={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText(/no fields/i)).toBeInTheDocument()
  })
})
```

---

## 6. Test Naming Conventions

```
describe('<ComponentName>')        — for components
describe('<functionName>')         — for functions/services
  it('returns X when Y')           — happy path
  it('returns null when not found') — edge cases
  it('throws when invalid')        — error cases
  it('calls onX when Y happens')   — event/callback tests
```

---

## 7. What to Test (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | Yup validation schemas | Pure functions, high value, zero setup |
| 2 | Service layer (auth, forms) | Business logic, most bugs live here |
| 3 | Model functions (Prisma queries) | Verify query structure and error handling |
| 4 | Remix actions (validation + redirect) | Most critical user flows |
| 5 | Components (user interactions) | High value for complex UI |
| 6 | Remix loaders | Usually thin wrappers, lower priority |

---

## 8. What NOT to Test

```
❌ Remix framework internals (routing, session mechanics)
❌ Prisma query builder correctness (Prisma tests itself)
❌ MUI component rendering details (MUI tests itself)
❌ TypeScript type errors (tsc covers this)
❌ Trivial getters/setters with no logic
```

---

## 9. Mocking Patterns

```typescript
// Mock a whole module
vi.mock('~/services/forms.server')

// Mock a specific function with implementation
vi.mock('~/utils/session.server', () => ({
  requireUserId: vi.fn().mockResolvedValue('user-123'),
  createUserSession: vi.fn(),
  destroySession: vi.fn(),
}))

// Override mock per test
it('redirects when not authenticated', async () => {
  vi.mocked(requireUserId).mockRejectedValueOnce(
    new Response(null, { status: 302, headers: { Location: '/auth/login' } })
  )
  // ... test unauthorized access
})

// Restore all mocks after each test
afterEach(() => vi.clearAllMocks())
// or globally: clearMocks: true in vitest.config.ts
```
