import type { FormSubmission } from '@prisma/client'

import { db } from '~/utils/db.server'

export type { FormSubmission }

export async function createSubmission(
  formId: string,
  data: Record<string, string>
): Promise<FormSubmission> {
  return db.formSubmission.create({
    data: { formId, data },
  })
}
