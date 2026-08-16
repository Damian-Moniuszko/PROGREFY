import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export function getGoogleAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'openid',
      'email',
      'profile',
    ],
    prompt: 'select_account',
  })
}


export async function getGoogleUser(code: string) {
  const { tokens } =
    await oauth2Client.getToken(code)

  oauth2Client.setCredentials(tokens)

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  })

  const { data } =
    await oauth2.userinfo.get()

  if (!data.email) {
    throw new Error(
      'Google account does not have an email',
    )
  }

  return {
    email: data.email,
    firstName: data.given_name ?? '',
    lastName: data.family_name ?? '',
    avatarUrl: data.picture ?? null,
    googleId: data.id!,
  }
}