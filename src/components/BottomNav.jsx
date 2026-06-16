import { Home as HomeIcon, PieChart, Gem, User } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'budgets', label: 'Budgets', icon: Gem },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: 480,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-around',
      background: '#1A1D26',
      borderTop: '1px solid #2A2E3A',
      padding: '12px 0 26px',
      zIndex: 100
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              color: isActive ? '#D4AF37' : '#5E5E6E'
            }}
          >
            <Icon size={21} strokeWidth={isActive ? 2 : 1.5} />
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}