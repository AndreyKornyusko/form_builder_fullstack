# TypeScript Strict Patterns

## Field Type System (Discriminated Union)
```typescript
// app/types/fields.ts
export type FieldType = 'text' | 'number' | 'textarea'

export interface BaseFieldConfig {
  label: string
  placeholder?: string
  required?: boolean
}

export interface TextFieldConfig extends BaseFieldConfig {
  minLength?: number
  maxLength?: number
}

export interface NumberFieldConfig extends BaseFieldConfig {
  min?: number
  max?: number
  step?: number
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  minLength?: number
  maxLength?: number
  rows?: number
}

// Discriminated union for type-safe switching
export type FieldConfig =
  | ({ type: 'text' } & TextFieldConfig)
  | ({ type: 'number' } & NumberFieldConfig)
  | ({ type: 'textarea' } & TextareaFieldConfig)
```

## Exhaustive Switch (TypeScript will error on missed cases)
```typescript
function renderField(field: FormField) {
  switch (field.type as FieldType) {
    case 'text':
      return <TextField config={field.config as TextFieldConfig} />
    case 'number':
      return <NumberField config={field.config as NumberFieldConfig} />
    case 'textarea':
      return <TextareaField config={field.config as TextareaFieldConfig} />
    default: {
      const _exhaustive: never = field.type as never
      return null
    }
  }
}
```

## Prisma Type Extraction
```typescript
import type { Prisma } from '@prisma/client'

// Derive types from Prisma operations — no manual duplication
export type FormWithFields = Prisma.FormGetPayload<{
  include: { fields: { orderBy: { order: 'asc' } } }
}>

export type FormListItem = Prisma.FormGetPayload<{
  select: {
    id: true
    title: true
    description: true
    isPublished: true
    createdAt: true
    _count: { select: { fields: true; submissions: true } }
  }
}>
```

## Prisma Error Type Guard
```typescript
import { Prisma } from '@prisma/client'

function isPrismaError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError
}

// Usage
try {
  await db.form.delete({ where: { id } })
} catch (err) {
  if (isPrismaError(err) && err.code === 'P2025') {
    throw new Response('Not Found', { status: 404 })
  }
  throw err
}
```

## Prisma JSON Field Typing
```typescript
import type { JsonValue } from '@prisma/client/runtime/library'

// Prisma returns Json columns as unknown — always validate shape
function parseFieldConfig(raw: JsonValue): BaseFieldConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid field config shape')
  }
  // Cast after structural check
  return raw as BaseFieldConfig
}
```

## Component Props Pattern
```typescript
// Always explicit interface, never inline or implicit
interface FieldSettingsSidebarProps {
  field: FormField | null
  onUpdate: (fieldId: string, config: Partial<BaseFieldConfig>) => void
}

export function FieldSettingsSidebar({ field, onUpdate }: FieldSettingsSidebarProps) {
  if (!field) return <EmptyState />
  // TypeScript narrows field to FormField here
}
```

## FormData Helper (avoid repetition)
```typescript
function getFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function getFormNumber(formData: FormData, key: string): number | undefined {
  const val = formData.get(key)
  if (!val) return undefined
  const num = Number(val)
  return isNaN(num) ? undefined : num
}
```

## Rules
- No `any` — use `unknown` and narrow with type guards
- No `!` non-null assertion unless you add a comment explaining why it's safe
- Prefer `type FormX = Prisma.FormGetPayload<{...}>` over manual interfaces
- Export types with `export type { ... }` (not `export { ... }`)
- All async functions must have explicit return type `Promise<T>`
- Use `satisfies` for config objects to get both checking and inference
