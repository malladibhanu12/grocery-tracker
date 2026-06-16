import { supabase } from '../supabaseClient'
import { Gem } from 'lucide-react'

export default function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      background: 'radial-gradient(circle at 50% 30%, #1A1D26 0%, #0D0F14 70%)'
    }}>
      <div style={{
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)'
      }}>
        <Gem size={38} color="#0D0F14" strokeWidth={1.5} />
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 10, color: '#F5F1E8' }}>
        Ledger
      </h1>
      <p style={{ color: '#9A9AA8', marginBottom: 48, lineHeight: 1.6, maxWidth: 280, fontSize: 14 }}>
        A refined way to track every euro you spend at the supermarket.
      </p>

      <button
        onClick={signInWithGoogle}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '17px',
          borderRadius: 14,
          border: '1px solid #2A2E3A',
          background: '#1A1D26',
          color: '#F5F1E8',
          fontSize: 15,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ marginTop: 28, fontSize: 11, color: '#5E5E6E', letterSpacing: 0.5 }}>
        PRIVATE · SECURE · YOURS
      </p>
    </div>
  )
}