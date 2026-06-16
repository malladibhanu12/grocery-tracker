import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Home from './components/Home'
import AddReceipt from './components/AddReceipt'
import BottomNav from './components/BottomNav'
import { Plus } from 'lucide-react'
import Insights from './components/Insights'
import Budgets from './components/Budgets'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', background: '#0D0F14' }}>Loading...</div>
  }

  if (!session) return <Login />

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative', background: '#0D0F14' }}>
      {page === 'home' && <Home user={session.user} key={refreshKey} />}
      {page === 'insights' && <Insights user={session.user} key={refreshKey} />}
      {page === 'budgets' && <Budgets user={session.user} key={refreshKey} />}
      {page === 'profile' && (
        <div style={{ padding: 24, color: '#F5F1E8' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Profile</h1>
          <p style={{ color: '#9A9AA8', marginTop: 12 }}>{session.user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ marginTop: 20, padding: '12px 20px', background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 12, color: '#E76F51' }}
          >
            Sign Out
          </button>
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed', bottom: 94, right: 20,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(212,175,55,0.3)', zIndex: 50, maxWidth: 480
        }}
      >
        <Plus size={26} color="#0D0F14" strokeWidth={2.5} />
      </button>

      <BottomNav active={page} onChange={setPage} />

      {showAdd && (
        <AddReceipt
          user={session.user}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            setRefreshKey(k => k + 1)
            setPage('home')
          }}
        />
      )}
    </div>
  )
}

export default App