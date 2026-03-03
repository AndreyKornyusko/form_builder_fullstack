import type { Form, FormField } from '@prisma/client'

import { db } from '~/utils/db.server'

export type { Form, FormField }

export type PublicForm = {
  id: string
  title: string
  description: string | null
  _count: { fields: number }
}

export type FormWithFields = Form & { fields: FormField[] }

export type FormListItem = {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  createdAt: Date
  _count: { fields: number; submissions: number }
}

export async function getForms(): Promise<FormListItem[]> {
  return db.form.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      createdAt: true,
      _count: { select: { fields: true, submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFormById(id: string): Promise<Form | null> {
  return db.form.findUnique({ where: { id } })
}

export async function createForm(data: { title: string; description?: string }): Promise<Form> {
  return db.form.create({ data })
}

export async function updateForm(
  id: string,
  data: { title?: string; description?: string }
): Promise<Form> {
  return db.form.update({ where: { id }, data })
}

export async function deleteForm(id: string): Promise<void> {
  await db.form.delete({ where: { id } })
}

export async function togglePublish(id: string): Promise<Form> {
  const form = await db.form.findUniqueOrThrow({ where: { id } })
  return db.form.update({ where: { id }, data: { isPublished: !form.isPublished } })
}

export async function getPublishedForms(): Promise<PublicForm[]> {
  return db.form.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      _count: { select: { fields: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublishedFormWithFields(id: string): Promise<FormWithFields | null> {
  return db.form.findFirst({
    where: { id, isPublished: true },
    include: { fields: { orderBy: { order: 'asc' } } },
  })
}
