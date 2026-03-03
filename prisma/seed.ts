import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters due to foreign keys)
  await prisma.formSubmission.deleteMany()
  await prisma.formField.deleteMany()
  await prisma.form.deleteMany()
  await prisma.user.deleteMany()

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  })
  console.log('  ✅ Admin user: admin@example.com / admin123')

  // Sample published form
  await prisma.form.create({
    data: {
      title: 'Customer Feedback',
      description: 'Please share your experience with our service',
      isPublished: true,
      fields: {
        create: [
          {
            type: 'text',
            order: 0,
            config: {
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true,
              minLength: 2,
              maxLength: 50,
            },
          },
          {
            type: 'number',
            order: 1,
            config: {
              label: 'Rating (1–10)',
              required: true,
              min: 1,
              max: 10,
              step: 1,
            },
          },
          {
            type: 'textarea',
            order: 2,
            config: {
              label: 'Comments',
              placeholder: 'Write your feedback here...',
              required: false,
              rows: 4,
              maxLength: 1000,
            },
          },
        ],
      },
    },
  })
  console.log('  ✅ Sample form: "Customer Feedback" (published, 3 fields)')

  console.log('\n✨ Database seeded successfully!')
}

seed()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
