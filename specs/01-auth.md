# Spec 01 — Authentication

## Status: IMPLEMENTED

## Scope
Session-based auth for admin panel only. Single admin user (no registration).

## Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/auth/login` | GET | Login page |
| `/auth/login` | POST | Submit credentials → create session |
| `/auth/logout` | POST | Destroy session → redirect to `/auth/login` |

## Session
- Storage: `createCookieSessionStorage`
- Cookie name: `__session`
- Cookie options: `httpOnly: true`, `sameSite: "lax"`, `secrets: [SESSION_SECRET]`
- Secure: `true` only in production

## Files to Create
```
app/utils/session.server.ts    — session storage + helpers
app/services/auth.server.ts    — login/logout logic
app/routes/auth.login.tsx      — login page + action
```

## session.server.ts API
```typescript
export const sessionStorage = createCookieSessionStorage({...})
export async function getSession(request: Request)
export async function createUserSession(userId: string, redirectTo: string): Response
export async function destroySession(request: Request): Response
export async function requireUserId(request: Request): Promise<string>
// requireUserId throws redirect to /auth/login if not authenticated
```

## auth.server.ts API
```typescript
export async function login(email: string, password: string): Promise<User | null>
// Uses bcrypt.compare, returns null if invalid
```

## Login Page UI
- MUI Card centered on page
- Email + Password fields
- Submit button "Sign In"
- Error message if login fails: "Invalid email or password"

## Yup Validation Schema
```typescript
const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
})
```
Validate in action before DB call.

## Admin Route Protection Pattern
Every admin route loader must call `requireUserId(request)`.
Create a helper `app/utils/admin-guard.server.ts` that wraps this.

## Acceptance Criteria
- [x] Login with valid credentials → redirect to `/admin`
- [x] Login with invalid credentials → error shown on same page
- [x] Accessing `/admin/*` without session → redirect to `/auth/login`
- [x] Logout destroys session and redirects to `/auth/login`
- [x] Session persists across page refresh

## Implementation Notes

### Files Created
- `app/utils/session.server.ts` — sessionStorage + getSession / createUserSession / destroySession / requireUserId
- `app/services/auth.server.ts` — login() via bcrypt.compare
- `app/utils/admin-guard.server.ts` — re-exports requireUserId (imported by all admin routes)
- `app/routes/auth.login.tsx` — login page + action + Yup validation
- `app/routes/auth.logout.tsx` — POST destroys session, GET redirects to /auth/login

### Notes
- Login page loader redirects to /admin if already authenticated (no double login)
- Field-level errors (email format, password length) returned separately from form error ("Invalid email or password")
- requireUserId throws redirect — catches in loader via try/catch on login page
