import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { registerWithGoogle } from '../services/auth'

export default function LoginPage() {
  const { login, setLoading, setError, loading, error } = useAuth()

  /**
   * @react-oauth/google provides a credential (id_token) via onSuccess
   * We use the popup flow (useGoogleLogin) with token_response to get
   * the raw credential JWT which we forward to our backend.
   *
   * NOTE: Using GoogleLogin component (one-tap button) is simpler if you
   * don't need the access_token — see commented alternative below.
   */
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent',
    onSuccess: async (codeResponse) => {
      setLoading(true)
      setError(null)
      try {
        const { user } = await registerWithGoogle(codeResponse.code)
        login(user)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google login failed', err)
      setError('Google sign-in was cancelled or failed. Please try again.')
    },
  })

  return (
    <div className="login-root">
      {/* Blueprint grid background */}
      <div className="blueprint-bg" aria-hidden="true">
        <div className="grid-lines" />
      </div>

      <div className="login-card">
        {/* Logo / brand mark */}
        <div className="brand">
          <svg className="logo-icon" viewBox="0 0 48 48" fill="none">
            <polyline points="14,12 4,24 14,36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="34,12 44,24 34,36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="28" y1="8" x2="20" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="brand-name">Contest<em>sync</em></span>
        </div>

        <div className="card-body">
          <h1 className="headline">Code. Compete.<br /><span>Never Miss a Contest.</span></h1>
          <p className="subline">
            Register once with Google and every contest from<br />
            Codeforces, LeetCode &amp; more lands in your Calendar automatically.
          </p>

          <div className="divider">
            <span>Authenticate with</span>
          </div>

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Sign in with Google"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <GoogleIcon />
            )}
            <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>
          </button>

          {error && (
            <div className="error-banner" role="alert">
              <WarningIcon />
              <span>{error}</span>
            </div>
          )}

          <p className="terms">
            By signing in you agree to our{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>

        {/* Corner accents */}
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />
      </div>

      <footer className="page-footer">
        ContestSync · Never miss a coding contest · {new Date().getFullYear()}
      </footer>
    </div>
  )
}

/* ── Inline SVG icons ──────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}