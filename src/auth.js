// Secret admin route + password hash come from .env.local (never hard-code them).
export const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH
const PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH

const SESSION_KEY = 'admin-auth'

async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function login(password) {
  const ok = Boolean(PASSWORD_HASH) && (await sha256(password)) === PASSWORD_HASH
  if (ok) sessionStorage.setItem(SESSION_KEY, PASSWORD_HASH)
  return ok
}

export function isLoggedIn() {
  try {
    return Boolean(PASSWORD_HASH) && sessionStorage.getItem(SESSION_KEY) === PASSWORD_HASH
  } catch {
    return false
  }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
