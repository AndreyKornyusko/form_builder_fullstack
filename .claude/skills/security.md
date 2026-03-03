# Security Checklist

## Auth Guard (every admin route)
```typescript
// ✅ First line of EVERY admin loader and action
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request) // throws redirect('/auth/login') if no session
  // ...
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)
  // ...
}
```

## Input Validation
```typescript
// ✅ Always coerce FormData values — never trust raw types
const title = String(formData.get('title') ?? '').trim()

// ✅ Validate with Yup before any DB call
try {
  await schema.validate(data, { abortEarly: false })
} catch (err) {
  if (err instanceof yup.ValidationError) {
    return json({ errors: buildErrors(err) }, { status: 400 })
  }
}

// ❌ Never pass raw formData.get() directly to Prisma
```

## Session Cookie Configuration
```typescript
// ✅ Correct — all security flags set
createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,       // JS cannot read cookie (XSS protection)
    sameSite: 'lax',      // CSRF protection for cross-site requests
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
})
```

## Database (Prisma = safe by default)
- ✅ All queries parameterized — no SQL injection risk
- ✅ Cascade deletes defined in schema — consistent data
- ❌ Never use `db.$queryRaw` with user input
- ❌ Never interpolate user strings into Prisma `where` clauses

## React / XSS
- ✅ React escapes JSX content by default
- ❌ Never use `dangerouslySetInnerHTML` with user content
- ✅ Store form field labels/values as plain text, not HTML

## Environment Variables
```typescript
// ✅ Validate at startup — fails fast if misconfigured
export const SESSION_SECRET = getRequiredEnv('SESSION_SECRET')

// ❌ Never hardcode secrets
const secret = 'my-secret-123'

// ❌ Never commit .env — .gitignore already excludes it
```

## Error Messages
```typescript
// ✅ Log full error server-side, show generic message to user
console.error('DB error:', err)
return json({ error: 'Сталася помилка. Спробуйте пізніше.' }, { status: 500 })

// ❌ Never expose internal error details to the browser
return json({ error: err.message }) // could leak stack traces, DB schema
```

## Public Routes
- No auth needed, but still validate all input
- Return 404 for unpublished forms (not 403) — don't reveal existence
- Rate limiting: out of scope for this project but note for production

## Checklist Before Each Spec
- [ ] All admin loaders have `requireUserId`
- [ ] All admin actions have `requireUserId`
- [ ] All user inputs validated with Yup
- [ ] No raw SQL with user data
- [ ] Error messages are user-friendly (not technical)
- [ ] No secrets in source code
