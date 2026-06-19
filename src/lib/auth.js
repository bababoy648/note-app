const MAX_FAIL = 3
const LOCK_MS = 5 * 60 * 1000

const failState = { count: 0, lockedUntil: 0 }

export function verifyPrivacyPassword(settings, input) {
  if (!settings.privacyPassword) return true
  if (Date.now() < failState.lockedUntil) return false
  if (input === settings.privacyPassword) {
    failState.count = 0
    return true
  }
  failState.count += 1
  if (failState.count >= MAX_FAIL) failState.lockedUntil = Date.now() + LOCK_MS
  return false
}

export function isPrivacyLocked() {
  return Date.now() < failState.lockedUntil
}

export function privacyLockMinutesLeft() {
  if (!isPrivacyLocked()) return 0
  return Math.ceil((failState.lockedUntil - Date.now()) / 60000)
}
