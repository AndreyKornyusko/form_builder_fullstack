# Spec 06 — Database Schema

## Status: READY TO IMPLEMENT

## Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Form {
  id          String       @id @default(cuid())
  title       String
  description String?
  isPublished Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  fields      FormField[]
  submissions FormSubmission[]
}

model FormField {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  type      String   // 'text' | 'number' | 'textarea'
  order     Int
  config    Json     // type-specific options
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([formId])
}

model FormSubmission {
  id          String   @id @default(cuid())
  formId      String
  form        Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  data        Json     // { fieldId: value }
  submittedAt DateTime @default(now())

  @@index([formId])
}
```

## Seed Data
- 1 admin user: `admin@example.com` / `admin123`
- 1 sample published form with 2–3 fields

## Acceptance Criteria
- [ ] `yarn db:push` runs without errors
- [ ] `yarn db:seed` creates admin user + sample form
- [ ] All relations cascade delete correctly
- [ ] Prisma client generates without TypeScript errors
