import argon2 from 'argon2'
import { PrismaClient, UserRole } from '../generated/prisma/client'

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

export async function registerUser(
  prisma: PrismaClient,
  data: RegisterData,
) {
  const email = data.email.trim().toLowerCase()

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS')
  }

  const passwordHash = await argon2.hash(data.password)

  const profileData =
    data.role === UserRole.CLIENT
      ? {
          clientProfile: {
            create: {},
          },
        }
      : {
          trainerProfile: {
            create: {},
          },
        }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: data.role,
      ...profileData,
    },

    include: {
      clientProfile: true,
      trainerProfile: true,
    },
  })

  return user
}

export async function loginUser(
  prisma: PrismaClient,
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  })

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const passwordValid = await argon2.verify(
    user.passwordHash,
    password,
  )

  if (!passwordValid) {
    throw new Error('INVALID_CREDENTIALS')
  }

  return user
}