import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { FormEditor } from '~/components/form-editor/FormEditor'
import { addField, addFieldsBatch, deleteField, getFormWithFields, updateFields } from '~/models/fields.server'
import type { EditorField, FieldConfig, FieldType, SaveField } from '~/types/editor'
import { requireUserId } from '~/utils/session.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Edit ${data?.form?.title ?? 'Form'} — Form Builder` },
]

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request)
  const form = await getFormWithFields(params.id!)
  if (!form) throw new Response('Not Found', { status: 404 })

  const fields: EditorField[] = form.fields.map((f) => ({
    id: f.id,
    type: f.type as FieldType,
    order: f.order,
    config: f.config as unknown as FieldConfig,
  }))

  return {
    form: { id: form.id, title: form.title },
    fields,
    hasAiKey: !!process.env.OPENAI_API_KEY,
  }
}

type ActionBody =
  | { intent: 'addField'; type: FieldType }
  | { intent: 'deleteField'; fieldId: string }
  | { intent: 'save'; fields: SaveField[] }
  | { intent: 'addFieldsBatch'; fields: Array<{ type: FieldType; config: FieldConfig }> }

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)
  const formId = params.id!
  const body = (await request.json()) as ActionBody

  switch (body.intent) {
    case 'addField': {
      const field = await addField(formId, body.type)
      return { field }
    }
    case 'deleteField': {
      await deleteField(body.fieldId)
      return { ok: true }
    }
    case 'save': {
      await updateFields(body.fields)
      return { ok: true }
    }
    case 'addFieldsBatch': {
      const fields = await addFieldsBatch(formId, body.fields)
      return { fields }
    }
    default:
      return { error: 'Unknown intent' }
  }
}

export default function EditFormPage() {
  const { form, fields, hasAiKey } = useLoaderData<typeof loader>()
  return (
    <FormEditor
      formId={form.id}
      formTitle={form.title}
      initialFields={fields}
      hasAiKey={hasAiKey}
    />
  )
}

export function ErrorBoundary() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Form not found</h2>
    </div>
  )
}
