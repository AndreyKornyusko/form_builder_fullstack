# Prisma Best Practices

## Always Use the Singleton Client
```typescript
// ✅ Import from the singleton
import { db } from '~/utils/db.server'

// ❌ Never create a new PrismaClient in a route/service/model
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient() // exhausts connection pool in dev
```

## Query Patterns

### Select only what you need (avoid over-fetching)
```typescript
// ✅ List view — lean query
const forms = await db.form.findMany({
  select: {
    id: true,
    title: true,
    isPublished: true,
    createdAt: true,
    _count: { select: { fields: true, submissions: true } },
  },
  orderBy: { createdAt: 'desc' },
})

// ✅ Detail view — include relations
const form = await db.form.findUnique({
  where: { id },
  include: {
    fields: { orderBy: { order: 'asc' } },
  },
})
```

### Always check existence before assuming
```typescript
const form = await db.form.findUnique({ where: { id } })
if (!form) throw new Response('Not Found', { status: 404 })
// TypeScript now knows form is not null
```

## Transactions (atomic multi-step operations)
```typescript
// Replace all fields atomically — no partial state
async function replaceFormFields(formId: string, fields: FieldInput[]) {
  return db.$transaction([
    db.formField.deleteMany({ where: { formId } }),
    db.formField.createMany({
      data: fields.map((f, i) => ({
        formId,
        type: f.type,
        order: i,
        config: f.config,
      })),
    }),
  ])
}
```

## Error Handling
```typescript
import { Prisma } from '@prisma/client'

async function safeDelete(id: string) {
  try {
    await db.form.delete({ where: { id } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2025': // Record not found
          return // treat as success (idempotent delete)
        case 'P2003': // Foreign key constraint
          throw new Response('Cannot delete: has dependencies', { status: 409 })
        default:
          throw err
      }
    }
    throw err
  }
}
```

## Common Error Codes
| Code | Meaning |
|------|---------|
| P2002 | Unique constraint violation (duplicate email, etc.) |
| P2025 | Record not found |
| P2003 | Foreign key constraint failed |
| P2014 | Relation violation |

## JSON Field Access (FormField.config)
```typescript
// Prisma returns Json as unknown — always cast after shape check
const config = field.config as Record<string, unknown>
const label = typeof config.label === 'string' ? config.label : ''
```

## Cascade Delete
Relations with `onDelete: Cascade` are handled by the DB automatically.
**Never** manually delete children before parent when cascade is configured.

```prisma
// schema.prisma — cascade is already set up
form Form @relation(fields: [formId], references: [id], onDelete: Cascade)
```

## Layer Responsibilities
```
Route/Action   → calls services only
Service        → calls models only, contains business logic
Model          → calls db only, returns typed data
```

Never call `db.*` directly from a route file.
Never put business logic in model files.
