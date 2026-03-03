import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { FormEditor } from '~/components/form-editor/FormEditor'
import { addField, deleteField, getFormWithFields, updateFields } from '~/models/fields.server'
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

  return json({ form: { id: form.id, title: form.title }, fields })
}

type ActionBody =
  | { intent: 'addField'; type: FieldType }
  | { intent: 'deleteField'; fieldId: string }
  | { intent: 'save'; fields: SaveField[] }

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request)
  const formId = params.id!
  const body = (await request.json()) as ActionBody

  switch (body.intent) {
    case 'addField': {
      const field = await addField(formId, body.type)
      return json({ field })
    }
    case 'deleteField': {
      await deleteField(body.fieldId)
      return json({ ok: true })
    }
    case 'save': {
      await updateFields(body.fields)
      return json({ ok: true })
    }
    default:
      return json({ error: 'Unknown intent' }, { status: 400 })
  }
}

export default function EditFormPage() {
  const { form, fields } = useLoaderData<typeof loader>()
  return <FormEditor formId={form.id} formTitle={form.title} initialFields={fields} />
}

export function ErrorBoundary() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Form not found</h2>
    </div>
  )
}
