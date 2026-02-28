import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import calendarPreview from '../assets/image.png'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const firstName = user.name.split(' ')[0]

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
          background: rgba(240, 247, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(37,99,235,0.08);
          z-index: 100;
        }
        .nav-logo { font-size: 1rem; font-weight: 700; color: #0F172A; letter-spacing: -0.02em; }
        .nav-logo span { color: #2563EB; }
        .user-chip { display: flex; align-items: center; gap: 10px; }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%;
          object-fit: cover; border: 2px solid #BFDBFE;
        }
        .avatar-fallback {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.75rem; font-weight: 700;
          border: 2px solid #BFDBFE; flex-shrink: 0;
        }
        .user-name { font-size: 0.85rem; font-weight: 500; color: #0F172A; }
        .logout-btn {
          font-size: 0.78rem; font-weight: 500;
          padding: 4px 12px; border-radius: 6px;
          border: 1px solid #E2E8F0; background: white;
          color: #64748B; cursor: pointer;
          transition: all 0.15s ease;
        }
        .logout-btn:hover { border-color: #CBD5E1; color: #0F172A; background: #F8FAFC; }

        .page {
          padding: 80px 2rem 4rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Welcome */
        .welcome {
          padding: 2.5rem 0 2rem;
          animation: fadeUp 0.5s ease both;
        }
        .welcome-eyebrow {
          font-size: 0.72rem; font-weight: 600; color: #2563EB;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;
        }
        .welcome h1 {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800; letter-spacing: -0.03em; color: #0F172A; margin-bottom: 0.5rem;
        }
        .welcome-sub {
          font-size: 0.88rem; color: #64748B;
          display: flex; gap: 1rem; flex-wrap: wrap;
        }
        .welcome-sub strong { color: #0F172A; font-weight: 500; }

        /* Status banner */
        .status-banner {
          background: white;
          border: 1px solid #E0EEFF;
          border-radius: 16px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(15,23,42,0.04), 0 8px 24px rgba(37,99,235,0.06);
          animation: fadeUp 0.5s 0.1s ease both;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .status-emoji { font-size: 2rem; flex-shrink: 0; }
        .status-banner-text h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 5px;
        }
        .status-banner-text p {
          font-size: 0.85rem;
          color: #64748B;
          line-height: 1.6;
        }
        .status-banner-text p strong { color: #2563EB; font-weight: 600; }

        /* Calendar card */
        .cal-card {
          background: white;
          border: 1px solid #E0EEFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(15,23,42,0.04), 0 8px 24px rgba(37,99,235,0.06);
          margin-bottom: 1.5rem;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .cal-card-header {
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #EFF6FF;
        }
        .cal-card-title {
          font-size: 0.95rem; font-weight: 700; color: #0F172A; letter-spacing: -0.01em;
        }
        .cal-card-sub { font-size: 0.78rem; color: #64748B; margin-top: 3px; }

        .cal-image-wrap {
          width: 100%;
          overflow: hidden;
          background: #F8FAFC;
        }
        .cal-image-wrap img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Event list */
        .event-list { padding: 1rem 1.75rem 1.5rem; display: flex; flex-direction: column; gap: 8px; }
        .event-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          background: #F8FAFC; border: 1px solid #E2E8F0;
          transition: background 0.15s;
        }
        .event-row:hover { background: #EFF6FF; border-color: #BFDBFE; }
        .event-color { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .event-name { font-size: 0.85rem; font-weight: 600; color: #0F172A; flex: 1; }
        .event-date { font-size: 0.75rem; color: #64748B; }
        .event-duration {
          font-size: 0.7rem; background: #EFF6FF; color: #2563EB;
          border-radius: 999px; padding: 2px 8px; font-weight: 500;
        }

        /* Danger zone */
        .danger-zone {
          background: white;
          border: 1px solid #FEE2E2;
          border-radius: 16px;
          padding: 1.5rem 2rem;
          animation: fadeUp 0.5s 0.3s ease both;
          margin-bottom: 3rem;
        }
        .danger-title {
          font-size: 0.72rem; font-weight: 600; color: #EF4444;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem;
        }
        .danger-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
          padding: 1rem 0; border-bottom: 1px solid #FEF2F2;
        }
        .danger-row:last-child { border-bottom: none; padding-bottom: 0; }
        .danger-row:first-of-type { padding-top: 0; }
        .danger-info { flex: 1; }
        .danger-row-title { font-size: 0.88rem; font-weight: 600; color: #0F172A; margin-bottom: 3px; }
        .danger-row-sub { font-size: 0.78rem; color: #64748B; line-height: 1.5; }

        .btn-pause {
          font-size: 0.8rem; font-weight: 600;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          transition: all 0.15s ease; white-space: nowrap;
          border: 1px solid #FED7AA; background: #FFF7ED; color: #C2410C;
        }
        .btn-pause:hover { background: #FFEDD5; border-color: #FDBA74; }

        .btn-delete {
          font-size: 0.8rem; font-weight: 600;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          transition: all 0.15s ease; white-space: nowrap;
          border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626;
        }
        .btn-delete:hover { background: #FEE2E2; border-color: #FCA5A5; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.5);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease both;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal {
          background: white; border-radius: 16px; padding: 2rem;
          max-width: 420px; width: 100%;
          box-shadow: 0 20px 60px rgba(15,23,42,0.2);
          animation: fadeUp 0.3s ease both;
        }
        .modal-icon {
          width: 44px; height: 44px; background: #FEF2F2;
          border-radius: 12px; display: flex; align-items: center;
          justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;
        }
        .modal h3 { font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem; }
        .modal p { font-size: 0.85rem; color: #64748B; line-height: 1.6; margin-bottom: 1.5rem; }
        .modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-cancel {
          font-size: 0.85rem; font-weight: 500; padding: 8px 18px;
          border-radius: 8px; border: 1px solid #E2E8F0;
          background: white; color: #64748B; cursor: pointer;
        }
        .btn-cancel:hover { background: #F8FAFC; }
        .btn-confirm-delete {
          font-size: 0.85rem; font-weight: 600; padding: 8px 18px;
          border-radius: 8px; border: none;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white; cursor: pointer;
          box-shadow: 0 2px 8px rgba(239,68,68,0.3);
        }
        .btn-confirm-delete:hover { box-shadow: 0 4px 16px rgba(239,68,68,0.4); }

        footer {
          height: 48px; display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; color: #CBD5E1; letter-spacing: 0.06em;
          border-top: 1px solid rgba(37,99,235,0.06);
        }
      `}</style>

      <nav>
        <div className="nav-logo">Y<span>.</span>A<span>.</span>R</div>
        <div className="user-chip">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="avatar-fallback">{firstName[0]}</div>
          )}
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div className="page">

        {/* Welcome */}
        <div className="welcome">
          <div className="welcome-eyebrow">Dashboard</div>
          <h1>Hey, {firstName} 👋</h1>
          <div className="welcome-sub">
            <span><strong>Email:</strong> {user.email}</span>
            <span><strong>Joined:</strong> {new Date(user.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Status banner */}
        <div className="status-banner">
          <div className="status-emoji">✅</div>
          <div className="status-banner-text">
            <h2>You're all set!</h2>
            <p>
              New contests will show up in a separate Google Calender group called "YAR ...". 
              Expect new contests to show up <strong>every day or two</strong> — just like this.
            </p>
          </div>
        </div>

        {/* Calendar preview */}
        <div className="cal-card">
          <div className="cal-card-header">
            <div className="cal-card-title">What it looks like in your Calendar</div>
            <div className="cal-card-sub">Contests are added automatically — no action needed from you</div>
          </div>
          <div className="cal-image-wrap">
            <img src={calendarPreview} alt="Google Calendar with Codeforces contests" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="danger-zone">
          <div className="danger-title">Manage YAR</div>

          <div className="danger-row">
            <div className="danger-info">
              <div className="danger-row-title">Don't want to see contests for a while?</div>
              <div className="danger-row-sub">
                Disable the YAR calendar from the Google Calender. This makes sure you can get it back up again at no time later. 
              </div>
            </div>
          </div>

          <div className="danger-row">
            <div className="danger-info">
              <div className="danger-row-title">Really want to leave?</div>
              <div className="danger-row-sub">
                Delete your account and remove YAR completely. All future syncing stops. Past calendar events are not removed.
              </div>
            </div>
            <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              Disable account
            </button>
          </div>
        </div>

      </div>

      <footer>yar means friend in hindi · because good tools feel like one</footer>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Delete your account?</h3>
            <p>
              This will permanently remove your account from YAR and stop all future calendar syncing.
              Past events already in your calendar won't be touched.
              <br /><br />
              <strong>This cannot be undone.</strong>
            </p>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={() => { logout(); setShowDeleteConfirm(false) }}>
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}