import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

const frontendUrl =
  process.env.FRONTEND_URL || 'http://localhost:5173'

const fromEmail =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string,
) {
  const verificationUrl =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`

  // Development fallback: if Resend is not configured yet,
  // keep registration usable and print the link to the terminal.
  if (!resend) {
    console.warn(
      '[PROGREFY] RESEND_API_KEY is missing. Verification link:',
      verificationUrl,
    )

    return {
      sent: false,
      verificationUrl,
    }
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Potwierdź swój adres e-mail — PROGREFY',
    html: `
      <!doctype html>
      <html lang="pl">
        <body style="margin:0;padding:40px 20px;background:#080808;color:#fff;font-family:Arial,sans-serif">
          <div style="max-width:560px;margin:0 auto;padding:32px;border:1px solid #252525;border-radius:16px;background:#111">
            <div style="font-size:22px;font-weight:700;margin-bottom:30px">PROGREFY</div>

            <div style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#5cc18d;margin-bottom:12px">
              POTWIERDZENIE E-MAILA
            </div>

            <h1 style="font-size:30px;line-height:1.1;margin:0 0 14px">
              Cześć ${escapeHtml(firstName)}!
            </h1>

            <p style="color:#aaa;line-height:1.6">
              Dziękujemy za utworzenie konta w PROGREFY.
              Potwierdź swój adres e-mail, aby aktywować konto.
            </p>

            <p style="margin:28px 0">
              <a
                href="${verificationUrl}"
                style="display:inline-block;padding:13px 20px;border-radius:9px;background:#1f6b48;color:#fff;text-decoration:none;font-weight:700"
              >
                Potwierdź adres e-mail
              </a>
            </p>

            <p style="color:#666;font-size:12px;line-height:1.5">
              Link jest ważny przez 24 godziny.
            </p>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error('[PROGREFY] Resend error:', error)
    throw new Error('EMAIL_SEND_FAILED')
  }

  return {
    sent: true,
    id: data?.id ?? null,
    verificationUrl,
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
