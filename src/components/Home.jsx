import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Package } from 'lucide-react'
import ReceiptDetail from './ReceiptDetail'

export default function Home({ user }) {
  const [receipts, setReceipts] = useState([])
  const [monthTotal, setMonthTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*, items(*)')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false })

    if (error) {
      console.error('Error fetching receipts:', error)
      setLoading(false)
      return
    }

    setReceipts(data || [])

    const now = new Date()
    const total = (data || [])
      .filter(r => {
        const d = new Date(r.purchase_date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((sum, r) => sum + (r.total_amount || 0), 0)
    setMonthTotal(total)
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-DE', { weekday: 'long', day: 'numeric', month: 'short' })
  }

  const grouped = {}
  receipts.forEach(r => {
    const date = r.purchase_date
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(r)
  })

  const handleUpdated = () => {
    setSelectedReceipt(null)
    fetchReceipts()
  }

  return (
    <div style={{ padding: '24px 18px 100px', minHeight: '100vh', background: '#0D0F14', color: '#F5F1E8' }}>
      <div style={{ marginBottom: 4, color: '#9A9AA8', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
        This Month
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 24 }}>
        €{monthTotal.toFixed(2)}
      </h1>

      <div style={{
        height: 1,
        background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)',
        opacity: 0.4,
        marginBottom: 28
      }} />

      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#9A9AA8', letterSpacing: 0.5 }}>
        RECENT ACTIVITY
      </h2>

      {loading && <p style={{ color: '#9A9AA8' }}>Loading...</p>}

      {!loading && receipts.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9A9AA8', marginTop: 80 }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No receipts yet</p>
          <p style={{ fontSize: 13 }}>Your purchases will appear here once you add one</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, dateReceipts]) => (
        <div key={date} style={{ marginBottom: 22 }}>
          <div style={{ color: '#5E5E6E', fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>
            {formatDate(date).toUpperCase()}
          </div>

          {dateReceipts.map(receipt => {
            const total = receipt.items.reduce((s, i) => s + (i.price * i.quantity), 0)

            return (
              <div
                key={receipt.id}
                onClick={() => setSelectedReceipt(receipt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#1A1D26', borderRadius: 14, padding: 16, marginBottom: 8,
                  border: '1px solid #2A2E3A', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'rgba(212,175,55,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: '1px solid rgba(212,175,55,0.2)'
                }}>
                  <Package size={20} color="#D4AF37" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{receipt.store_name}</div>
                  <div style={{ color: '#5E5E6E', fontSize: 12, marginTop: 2 }}>
                    {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  €{(receipt.total_amount || total).toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {selectedReceipt && (
        <ReceiptDetail
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}