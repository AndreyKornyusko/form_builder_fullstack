import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { data } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { NumberField } from '~/components/form-fields/NumberField'
import { TextField } from '~/components/form-fields/TextField'
import { TextareaField } from '~/components/form-fields/TextareaField'
import { createSubmission } from '~/models/form-submissions.server'
import { getPublishedFormWithFields } from '~/models/forms.server'
import type { EditorField, FieldConfig, FieldType } from '~/types/editor'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.form.title ?? 'Form'} — Form Builder` },
]

// Shape passed to client — no Prisma types, dates serialise cleanly
type PublicFormField = EditorField

type LoaderData = {
  form: {
    id: string
    title: string
    description: string | null
    fields: PublicFormField[]
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const form = await getPublishedFormWithFields(params.id!)
  if (!form) throw new Response('Not Found', { status: 404 })

  return {
    form: {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields.map((f) => ({
        id: f.id,
        type: f.type as FieldType,
        order: f.order,
        config: f.config as unknown as FieldConfig,
      })),
    },
  }
}

type ActionData =
  | { success: true; errors: Record<string, never>; values: Record<string, never> }
  | { success: false; errors: Record<string, string>; values: Record<string, string> }

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await getPublishedFormWithFields(params.id!)
  if (!form) throw new Response('Not Found', { status: 404 })

  const formData = await request.formData()

  // Collect submitted values keyed by field ID
  const values: Record<string, string> = {}
  for (const field of form.fields) {
    values[field.id] = String(formData.get(field.id) ?? '').trim()
  }

  // Server-side validation: check required fields
  const errors: Record<string, string> = {}
  for (const field of form.fields) {
    const config = field.config as unknown as FieldConfig
    const isRequired = (config as { required?: boolean }).required
    if (isRequired && !values[field.id]) {
      errors[field.id] = 'This field is required'
    }
  }

  if (Object.keys(errors).length > 0) {
    return data({ success: false, errors, values }, { status: 400 })
  }

  await createSubmission(form.id, values)
  return { success: true as const, errors: {}, values: {} }
}

export default function FormFillPage() {
  const { form } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  if (actionData?.success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 480, width: '100%' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Form submitted successfully! Thank you.
          </Alert>
          <Button component={Link} to="/" variant="outlined" fullWidth>
            Back to Forms
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 6, px: 3 }}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {form.title}
          </Typography>

          {form.description && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {form.description}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          {/* Server-first: no useState — values come from defaultValue on error repopulation */}
          <Form method="post">
            <Stack spacing={1}>
              {form.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  defaultValue={actionData?.values?.[field.id]}
                  error={actionData?.errors?.[field.id]}
                />
              ))}

              <Box sx={{ pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              </Box>
            </Stack>
          </Form>
        </CardContent>
      </Card>
    </Box>
  )
}

// Pure render — no hooks, no state. Picks the right field component by type.
function FieldRenderer({
  field,
  defaultValue,
  error,
}: {
  field: PublicFormField
  defaultValue?: string
  error?: string
}) {
  if (field.type === 'text') {
    return <TextField field={field} defaultValue={defaultValue} error={error} />
  }
  if (field.type === 'number') {
    return <NumberField field={field} defaultValue={defaultValue} error={error} />
  }
  if (field.type === 'textarea') {
    return <TextareaField field={field} defaultValue={defaultValue} error={error} />
  }
  return null
}

export function ErrorBoundary() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Form not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          This form doesn&apos;t exist or is not available.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to Forms
        </Button>
      </Box>
    </Box>
  )
}
