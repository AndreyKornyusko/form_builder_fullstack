import {
  createForm,
  deleteForm,
  getForms,
  togglePublish,
} from '~/models/forms.server'
import type { Form, FormListItem } from '~/models/forms.server'

export type { Form, FormListItem }

export async function listForms(): Promise<FormListItem[]> {
  return getForms()
}

export async function createNewForm(title: string, description?: string): Promise<Form> {
  return createForm({ title, description })
}

export async function removeForm(id: string): Promise<void> {
  return deleteForm(id)
}

export async function publishForm(id: string): Promise<Form> {
  return togglePublish(id)
}
