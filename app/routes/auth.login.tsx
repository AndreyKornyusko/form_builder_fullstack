import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material'
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { data, redirect } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import * as yup from 'yup'

import { login } from '~/services/auth.server'
import { createUserSession, requireUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => [{ title: 'Sign In — Form Builder' }]

const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Required'),
})

// Redirect to /admin if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await requireUserId(request)
    return redirect('/admin')
  } catch {
    return {}
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  try {
    await loginSchema.validate({ email, password }, { abortEarly: false })
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, e) => ({ ...acc, [e.path!]: e.message }),
        {} as Record<string, string>
      )
      return data({ errors, formError: null }, { status: 400 })
    }
  }

  const user = await login(email, password)
  if (!user) {
    return data({ errors: {}, formError: 'Invalid email or password' }, { status: 401 })
  }

  return createUserSession(user.id, '/admin')
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
      }}
    >
      <Card sx={{ width: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Admin Sign In
          </Typography>

          {actionData?.formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionData.formError}
            </Alert>
          )}

          <Form method="post">
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="admin@example.com"
              fullWidth
              autoComplete="email"
              autoFocus
              InputLabelProps={{ shrink: true }}
              error={!!actionData?.errors?.email}
              helperText={actionData?.errors?.email ?? ' '}
              sx={{ mb: 1 }}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              fullWidth
              autoComplete="current-password"
              InputLabelProps={{ shrink: true }}
              error={!!actionData?.errors?.password}
              helperText={actionData?.errors?.password ?? ' '}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </Box>
  )
}

export function ErrorBoundary() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography color="error">An unexpected error occurred</Typography>
    </Box>
  )
}
