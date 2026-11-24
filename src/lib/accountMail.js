import { createToken } from '@/lib/tokens'
import { sendResetEmail, sendVerifyEmail } from '@/lib/notify'
import { SITE } from '@/lib/site'

export async function issueVerification(user) {
  const raw = await createToken(user._id, 'verify')
  return sendVerifyEmail(user, `${SITE.url}/auth/verify-email?token=${raw}`)
}
export async function issueReset(user) {
  const raw = await createToken(user._id, 'reset')
  return sendResetEmail(user, `${SITE.url}/auth/reset-password?token=${raw}`)
}
