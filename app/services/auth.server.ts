import bcrypt from 'bcryptjs'

import { db } from '~/utils/db.server'

import type { User } from '@prisma/client'

export async function login(email: string, password: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return user
}
