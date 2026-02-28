import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { registerWithGoogle } from '../services/auth'

export default function LoginPage() {
  const { login, setLoading, setError, loading, error } = useAuth()

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #F0F7FF;
          font-family: 'Inter', sans-serif;
          color: #0F172A;
          min-height: 100vh;
        }

        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          background: rgba(240, 247, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(37,99,235,0.08);
          z-index: 100;
        }
        .nav-logo { font-size: 1rem; font-weight: 700; color: #0F172A; letter-spacing: -0.02em; }
        .nav-logo span { color: #2563EB; }
        .nav-tag { font-size: 0.72rem; font-weight: 400; color: #64748B; letter-spacing: 0.04em; }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: 35%; left: 50%;
          transform: translate(-50%, -50%);
          width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        h1 {
          font-size: clamp(2.8rem, 7vw, 5rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #0F172A;
          margin-bottom: 1.5rem;
          max-width: 700px;
          animation: fadeUp 0.5s ease both;
        }

        .sub {
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-weight: 400;
          color: #64748B;
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 2.75rem;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .sub strong { color: #0F172A; font-weight: 600; }

        .highlight {
          display: inline;
          background: linear-gradient(120deg, #DBEAFE 0%, #BFDBFE 100%);
          border-radius: 4px;
          padding: 1px 5px;
          color: #1D4ED8;
          font-weight: 600;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .google-btn {
          max-width: 320px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 1rem 2.25rem;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 60%, #1D4ED8 100%);
          border: none;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.08),
            0 6px 20px rgba(37,99,235,0.45),
            0 14px 40px rgba(37,99,235,0.25),
            inset 0 1px 0 rgba(255,255,255,0.2);
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .google-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .google-btn:hover::before { left: 160%; }
        .google-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 2px 4px rgba(0,0,0,0.08),
            0 10px 28px rgba(37,99,235,0.55),
            0 20px 48px rgba(37,99,235,0.3),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .google-btn:active { transform: translateY(-1px) scale(1.005); }
        .google-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .google-btn span { position: relative; z-index: 1; }
        .g-icon-wrap {
          background: white;
          border-radius: 50%;
          width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative; z-index: 1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Error banner */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 0.65rem 1rem;
          margin-top: 1rem;
          font-size: 0.82rem;
          color: #DC2626;
          max-width: 400px;
          animation: fadeUp 0.3s ease both;
        }

        .fine-print {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: #94A3B8;
          line-height: 1.7;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .fine-print a { color: #94A3B8; text-decoration: underline; text-underline-offset: 2px; }

        /* Steps */
        .steps-section {
          padding: 5rem 2rem 6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #F0F7FF;
        }
        .steps-label {
          font-size: 0.72rem; font-weight: 600; color: #2563EB;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem;
        }
        .steps-heading {
          font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800;
          letter-spacing: -0.025em; color: #0F172A;
          margin-bottom: 0.75rem; text-align: center;
        }
        .steps-sub { font-size: 0.95rem; color: #64748B; margin-bottom: 3.5rem; text-align: center; }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem; width: 100%; max-width: 960px;
        }
        .step-card {
          background: #FFFFFF;
          border: 1px solid #E0EEFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(15,23,42,0.04), 0 8px 24px rgba(37,99,235,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(15,23,42,0.06), 0 16px 40px rgba(37,99,235,0.12);
        }
        .card-screen {
          width: 100%; aspect-ratio: 16/10;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .screen-1 { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); }
        .screen-2 { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); }
        .screen-3 { background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); }

        .mock-card {
          background: white; border-radius: 12px; padding: 1.2rem 1.5rem;
          width: 75%; box-shadow: 0 4px 24px rgba(37,99,235,0.12);
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
        }
        .mock-logo { font-size: 0.75rem; font-weight: 800; color: #0F172A; }
        .mock-logo span { color: #2563EB; }
        .mock-title { font-size: 0.6rem; font-weight: 700; color: #0F172A; text-align: center; }
        .mock-body { font-size: 0.48rem; color: #94A3B8; text-align: center; line-height: 1.5; }
        .mock-btn {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white; border-radius: 999px; padding: 4px 12px;
          font-size: 0.5rem; font-weight: 600; width: 100%; justify-content: center;
          box-shadow: 0 2px 8px rgba(37,99,235,0.35);
        }
        .mock-g { width: 8px; height: 8px; background: white; border-radius: 50%; flex-shrink: 0; }

        .mock-success {
          background: white; border-radius: 12px; padding: 1.2rem 1.5rem;
          width: 75%; box-shadow: 0 4px 24px rgba(16,185,129,0.12);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        }
        .success-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.75rem;
        }
        .success-title { font-size: 0.65rem; font-weight: 700; color: #0F172A; }
        .success-sub { font-size: 0.48rem; color: #6B7280; text-align: center; }
        .user-chip {
          display: flex; align-items: center; gap: 4px;
          background: #F0FDF4; border: 1px solid #A7F3D0;
          border-radius: 999px; padding: 2px 8px;
        }
        .user-avatar { width: 10px; height: 10px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); border-radius: 50%; }
        .user-name { font-size: 0.45rem; color: #059669; font-weight: 600; }

        .mock-cal { background: white; border-radius: 12px; padding: 0.8rem; width: 82%; box-shadow: 0 4px 24px rgba(109,40,217,0.1); }
        .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .cal-month { font-size: 0.5rem; font-weight: 700; color: #0F172A; }
        .cal-nav { display: flex; gap: 3px; }
        .cal-nav-btn { width: 10px; height: 10px; background: #F1F5F9; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 0.4rem; color: #64748B; }
        .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 3px; }
        .cal-day-label { font-size: 0.38rem; color: #94A3B8; text-align: center; font-weight: 600; }
        .cal-day { font-size: 0.42rem; color: #374151; text-align: center; padding: 1px 0; border-radius: 3px; }
        .cal-day.empty { color: transparent; }
        .cal-day.event { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; font-weight: 700; }
        .cal-day.event-2 { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; font-weight: 700; }
        .cal-events { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
        .cal-event-item { display: flex; align-items: center; gap: 4px; background: #EFF6FF; border-radius: 4px; padding: 2px 5px; border-left: 2px solid #2563EB; }
        .cal-event-item.purple { background: #F5F3FF; border-left-color: #7C3AED; }
        .cal-event-dot { width: 4px; height: 4px; border-radius: 50%; background: #2563EB; flex-shrink: 0; }
        .cal-event-dot.purple { background: #7C3AED; }
        .cal-event-text { font-size: 0.4rem; color: #1D4ED8; font-weight: 500; }
        .cal-event-text.purple { color: #6D28D9; }

        .card-caption { padding: 1.25rem 1.5rem 1.5rem; }
        .step-num { font-size: 0.68rem; font-weight: 700; color: #2563EB; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.35rem; }
        .step-title { font-size: 1rem; font-weight: 700; color: #0F172A; margin-bottom: 0.3rem; letter-spacing: -0.01em; }
        .step-desc { font-size: 0.82rem; color: #64748B; line-height: 1.55; }

        footer {
          height: 48px; display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; color: #CBD5E1; letter-spacing: 0.06em;
          border-top: 1px solid rgba(37,99,235,0.06);
        }
      `}</style>

      <nav>
        <div className="nav-logo">Y<span>.</span>A<span>.</span>R</div>
        <div className="nav-tag">yet another reminder</div>
      </nav>

      <div className="hero">
        <h1>Yet Another Reminder.</h1>

        <p className="sub">
          Never miss a Codeforces contest with your <strong>Yar</strong>.
          Just sign in once —&nbsp;
          <span className="highlight">every upcoming Codeforces contest lands in your Google Calendar</span>
          &nbsp;automatically. No setup needed ever again.
        </p>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          aria-label="Sign in with Google"
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="g-icon-wrap"><GoogleIcon /></div>
          )}
          <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>
        </button>

        {error && (
          <div className="error-banner" role="alert">
            <WarningIcon />
            <span>{error}</span>
          </div>
        )}

        <p className="fine-print">
          We only write to your calendar. Nothing else, ever.<br />
          <a href="#">Terms</a>&nbsp;·&nbsp;<a href="#">Privacy Policy</a>
        </p>
      </div>

      <div className="steps-section">
        <div className="steps-label">How it works</div>
        <h2 className="steps-heading">Three steps. Then never again.</h2>
        <p className="steps-sub">The entire setup takes under 30 seconds.</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="card-screen screen-1">
              <div className="mock-card">
                <div className="mock-logo">Y<span>.</span>A<span>.</span>R</div>
                <div className="mock-title">Yet Another Reminder.</div>
                <div className="mock-body">Sign in once and never miss a contest again.</div>
                <div className="mock-btn"><div className="mock-g" />Continue with Google</div>
              </div>
            </div>
            <div className="card-caption">
              <div className="step-num">Step 01</div>
              <div className="step-title">Sign in with Google</div>
              <div className="step-desc">Click the button, pick your Google account, and grant calendar access. Takes 20 seconds.</div>
            </div>
          </div>

          <div className="step-card">
            <div className="card-screen screen-2">
              <div className="mock-success">
                <div className="success-icon">✓</div>
                <div className="success-title">You're all set!</div>
                <div className="user-chip">
                  <div className="user-avatar" />
                  <div className="user-name">Registered successfully</div>
                </div>
                <div className="success-sub">Upcoming Codeforces contests will now appear in your Google Calendar automatically.</div>
              </div>
            </div>
            <div className="card-caption">
              <div className="step-num">Step 02</div>
              <div className="step-title">You're registered</div>
              <div className="step-desc">Your account is saved. YAR now knows to keep your calendar updated going forward.</div>
            </div>
          </div>

          <div className="step-card">
            <div className="card-screen screen-3">
              <div className="mock-cal">
                <div className="cal-header">
                  <div className="cal-month">March 2025</div>
                  <div className="cal-nav">
                    <div className="cal-nav-btn">‹</div>
                    <div className="cal-nav-btn">›</div>
                  </div>
                </div>
                <div className="cal-days">
                  {["S","M","T","W","T","F","S"].map((d,i) => (
                    <div key={i} className="cal-day-label">{d}</div>
                  ))}
                  {["","","","","","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"].map((d,i) => (
                    <div key={i} className={`cal-day${d==="8"?" event":d==="15"?" event-2":d===""?" empty":""}`}>{d}</div>
                  ))}
                </div>
                <div className="cal-events">
                  <div className="cal-event-item">
                    <div className="cal-event-dot" />
                    <div className="cal-event-text">Codeforces Round 950</div>
                  </div>
                  <div className="cal-event-item purple">
                    <div className="cal-event-dot purple" />
                    <div className="cal-event-text purple">Educational CF Round 163</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-caption">
              <div className="step-num">Step 03</div>
              <div className="step-title">Contests appear in Calendar</div>
              <div className="step-desc">Every upcoming Codeforces contest automatically shows up in your Google Calendar. No action needed.</div>
            </div>
          </div>
        </div>
      </div>

      <footer>yar means friend in hindi · because good tools feel like one</footer>
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
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