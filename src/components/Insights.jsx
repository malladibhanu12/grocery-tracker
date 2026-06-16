import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#D4AF37', '#C9A876', '#8B7355', '#6E6E80', '#A88B5E', '#5E5E6E']

export default function Insights({ user }) {
  const [items, setItems] = useState([])
  const [view, setView] = useState('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*, receipts(purchase_date, store_name)')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    setItems(data || [])
    setLoading(false)
  }

  const now = new Date()
  const filtered = items.filter(item => {
    if (!item.receipts) return false
    const date = new Date(item.receipts.purchase_date)
    if (view === 'daily') return date.toDateString() === now.toDateString()
    if (view === 'monthly') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    if (view === 'yearly') return date.getFullYear() === now.getFullYear()
    return true
  })

  const totalSpent = filtered.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  const categoryTotals = {}
  filtered.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.price * item.quantity
  })
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))

  const productTotals = {}
  filtered.forEach(item => {
    productTotals[item.product_name] = (productTotals[item.product_name] || 0) + item.price * item.quantity
  })
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, value: Number(value.toFixed(2)) }))

  return (
    <div style={{ padding: '24px 18px 100px', minHeight: '100vh', background: '#0D0F14', color: '#F5F1E8' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Insights</h1>

      <div style={{ display: 'flex', background: '#1A1D26', borderRadius: 12, padding: 4, marginBottom: 20, border: '1px solid #2A2E3A' }}>
        {['daily', 'monthly', 'yearly'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1, padding: 11, borderRadius: 9, border: 'none',
              background: view === v ? 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)' : 'transparent',
              color: view === v ? '#0D0F14' : '#9A9AA8',
              fontWeight: 700, fontSize: 13, textTransform: 'capitalize'
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <div style={{
        background: '#1A1D26', border: '1px solid #2A2E3A',
        borderRadius: 18, padding: 28, marginBottom: 20, textAlign: 'center'
      }}>
        <div style={{ color: '#9A9AA8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Total Spent
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#D4AF37' }}>
          €{totalSpent.toFixed(2)}
        </div>
      </div>

      {loading && <p style={{ color: '#9A9AA8', textAlign: 'center' }}>Loading...</p>}

      {!loading && pieData.length > 0 && (
        <div style={{ background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14, color: '#9A9AA8', letterSpacing: 0.5 }}>BY CATEGORY</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fill: '#F5F1E8', fontSize: 11 }}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="#1A1D26" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#232733', border: '1px solid #2A2E3A', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && topProducts.length > 0 && (
        <div style={{ background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14, color: '#9A9AA8', letterSpacing: 0.5 }}>TOP PRODUCTS</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" stroke="#5E5E6E" fontSize={11} />
              <YAxis dataKey="name" type="category" width={90} stroke="#5E5E6E" fontSize={11} />
              <Tooltip contentStyle={{ background: '#232733', border: '1px solid #2A2E3A', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#D4AF37" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9A9AA8', marginTop: 40 }}>
          No data for this period yet
        </div>
      )}
    </div>
  )
}