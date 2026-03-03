# Spec 00 — Architecture Decisions

## Status: APPROVED

## System Overview
Form Builder is a full-stack web app with two zones:
- **Admin zone** `/admin/*` — protected by session auth, form CRUD + editor
- **Public zone** `/` — unauthenticated, form list + submission

## Architecture Pattern
**Remix full-stack** — loaders/actions handle server logic, components handle UI.
No separate API server. REST-like behavior via Remix resource routes where needed.

## Data Flow
```
Browser → Remix Route (loader/action) → Service → Model (Prisma) → PostgreSQL
```

For AI agent:
```
Browser → Remix Action → AI Service → OpenAI API → parse response → return fields
```

## Key Decisions

### Why Vite over Webpack
Vite is officially recommended for new Remix projects. Faster HMR, simpler config.

### Why Prisma over Mongoose
Requirements specify PostgreSQL. Prisma is the correct ORM for relational DB.
Mongoose is for MongoDB — not used in this project.

### Session Auth
- `createCookieSessionStorage` from Remix
- Session cookie: `httpOnly`, `secure` in production, `sameSite: lax`
- Only one admin user (seeded). No registration flow needed for this task.

### Form Data Model
```
Form {
  id, title, description, isPublished, createdAt, updatedAt
  fields: FormField[]
}

FormField {
  id, formId, type, order, config (JSON)
}

FormSubmission {
  id, formId, data (JSON), submittedAt
}
```
Config JSON stores type-specific options (label, placeholder, required, min/max, etc.)

### Field Types & Config Schema
```typescript
type FieldType = 'text' | 'number' | 'textarea'

interface BaseFieldConfig {
  label: string
  placeholder?: string
  required?: boolean
}

interface TextFieldConfig extends BaseFieldConfig {
  minLength?: number
  maxLength?: number
}

interface NumberFieldConfig extends BaseFieldConfig {
  min?: number
  max?: number
  step?: number
}

interface TextareaFieldConfig extends BaseFieldConfig {
  minLength?: number
  maxLength?: number
  rows?: number
}
```

## Out of Scope
- User registration / multi-user admin
- Form analytics / submission history UI
- File upload fields
- Conditional logic between fields
- Form versioning
