import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-root">
      <header className="dash-header">
        <div className="brand-sm">Contest<em>sync</em></div>
        <div className="user-chip">
          {user.picture && (
            <img src={user.picture} alt={user.name} className="avatar" referrerPolicy="no-referrer" />
          )}
          <span>{user.name}</span>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        <div className="welcome-banner">
          <h2>Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p className="user-meta">
            <strong>Email:</strong> {user.email} &nbsp;·&nbsp;
            <strong>Handle:</strong> {user.handle ?? '—'} &nbsp;·&nbsp;
            <strong>Joined:</strong> {new Date(user.created_at ?? Date.now()).toLocaleDateString()}
          </p>
        </div>

        <div className="placeholder-grid">
          {['Upcoming Contests', 'Calendar Synced', 'Platforms Connected', 'Past Contests'].map(label => (
            <div key={label} className="placeholder-card">
              <span>{label}</span>
              <div className="placeholder-bar" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}