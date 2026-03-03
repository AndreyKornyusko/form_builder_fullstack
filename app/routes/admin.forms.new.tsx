import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import * as yup from 'yup'

import { createNewForm } from '~/services/forms.server'
import { requireUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => [{ title: 'Create Form — Form Builder' }]

const formSchema = yup.object({
  title: yup.string().trim().min(1, 'Required').max(100, 'Max 100 characters').required(),
  description: yup.string().trim().max(500, 'Max 500 characters').optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)
  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()
  const rawDescription = String(formData.get('description') ?? '').trim()
  const description = rawDescription || undefined

  try {
    await formSchema.validate({ title, description }, { abortEarly: false })
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce(
        (acc, e) => ({ ...acc, [e.path!]: e.message }),
        {} as Record<string, string>
      )
      return json({ errors }, { status: 400 })
    }
  }

  const form = await createNewForm(title, description)
  return redirect(`/admin/forms/${form.id}/edit`)
}

export default function NewFormPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const errors = actionData?.errors

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card sx={{ width: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Create New Form
          </Typography>

          <Form method="post">
            <Stack spacing={2}>
              <TextField
                name="title"
                label="Title"
                placeholder="e.g. Customer Feedback"
                fullWidth
                required
                autoFocus
                InputLabelProps={{ shrink: true }}
                error={!!errors?.title}
                helperText={errors?.title ?? ' '}
              />
              <TextField
                name="description"
                label="Description"
                placeholder="Optional description of the form"
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
                error={!!errors?.description}
                helperText={errors?.description ?? ' '}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
                <Button
                  component={Link}
                  to="/admin"
                  variant="outlined"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create & Open Editor'}
                </Button>
              </Box>
            </Stack>
          </Form>
        </CardContent>
      </Card>
    </Box>
  )
}
