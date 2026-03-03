import type { Prisma } from '@prisma/client'

import { db } from '~/utils/db.server'
import type { EditorField, FieldConfig, FieldType, SaveField } from '~/types/editor'

const defaultConfigs: Record<FieldType, FieldConfig> = {
  text: { label: 'New Text Field', placeholder: '', required: false },
  number: { label: 'New Number Field', placeholder: '', required: false },
  textarea: { label: 'New Textarea', placeholder: '', required: false, rows: 4 },
}

function toEditorField(f: {
  id: string
  type: string
  order: number
  config: Prisma.JsonValue
}): EditorField {
  return {
    id: f.id,
    type: f.type as FieldType,
    order: f.order,
    config: f.config as unknown as FieldConfig,
  }
}

export async function getFormWithFields(formId: string) {
  return db.form.findUnique({
    where: { id: formId },
    include: { fields: { orderBy: { order: 'asc' } } },
  })
}

export async function addField(formId: string, type: FieldType): Promise<EditorField> {
  const agg = await db.formField.aggregate({
    where: { formId },
    _max: { order: true },
  })
  const order = (agg._max.order ?? -1) + 1
  const field = await db.formField.create({
    data: {
      formId,
      type,
      order,
      config: defaultConfigs[type] as unknown as Prisma.InputJsonValue,
    },
  })
  return toEditorField(field)
}

export async function deleteField(fieldId: string): Promise<void> {
  await db.formField.delete({ where: { id: fieldId } })
}

export async function updateFields(fields: SaveField[]): Promise<void> {
  await db.$transaction(
    fields.map((f) =>
      db.formField.update({
        where: { id: f.id },
        data: {
          order: f.order,
          config: f.config as unknown as Prisma.InputJsonValue,
        },
      })
    )
  )
}
