const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Exchange a Google credential JWT for a backend session.
 * The backend decodes the JWT, upserts the user in MongoDB,
 * and returns the stored user document + an app token.
 *
 * @param {string} googleCredential  - raw JWT from Google's One Tap / button
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function registerWithGoogle(googleCredential) {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: googleCredential }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Server error ${res.status}`)
  }

  return res.json()   // { user: {...}, token: "..." }
}
