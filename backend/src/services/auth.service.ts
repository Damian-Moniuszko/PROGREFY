import argon2 from 'argon2'
import { createHash, randomBytes } from 'node:crypto'
import { PrismaClient, UserRole } from '../generated/prisma/client'

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function createVerificationToken() {
  const token = randomBytes(32).toString('hex')

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }
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
  const verification = createVerificationToken()

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
      emailVerified: false,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
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

  return {
    user,
    verificationToken: verification.token,
  }
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

  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED')
  }

  return user
}

export async function verifyEmail(
  prisma: PrismaClient,
  token: string,
) {
  const tokenHash = hashToken(token)

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationTokenHash: tokenHash,
    },
  })

  if (!user) {
    throw new Error('INVALID_VERIFICATION_TOKEN')
  }

  if (
    user.emailVerificationExpiresAt &&
    user.emailVerificationExpiresAt.getTime() < Date.now()
  ) {
    throw new Error('VERIFICATION_TOKEN_EXPIRED')
  }

  if (user.emailVerified) {
    return user
  }

  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
    },
  })
}

export async function createNewVerificationToken(
  prisma: PrismaClient,
  email: string,
) {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  if (user.emailVerified) {
    throw new Error('EMAIL_ALREADY_VERIFIED')
  }

  const verification = createVerificationToken()

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
    },
  })

  return {
    user,
    verificationToken: verification.token,
  }
}
