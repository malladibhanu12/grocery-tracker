import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Gem, Plus, X } from 'lucide-react'

export default function Budgets({ user }) {
  const [budgets, setBudgets] = useState([])
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('All Expenses')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: budgetData } = await supabase.from('budgets').select('*').eq('user_id', user.id)
    const { data: itemData } = await supabase.from('items').select('*, receipts(purchase_date)').eq('user_id', user.id)
    setBudgets(budgetData || [])
    setItems(itemData || [])
    setLoading(false)
  }

  const getSpentForBudget = (budget) => {
    const now = new Date()
    return items
      .filter(i => {
        if (!i.receipts) return false
        const date = new Date(i.receipts.purchase_date)
        const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        const categoryMatch = budget.category === 'All Expenses' || i.category === budget.category
        return sameMonth && categoryMatch
      })
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
  }

  const saveBudget = async () => {
    if (!name.trim() || !amount) {
      alert('Please fill in name and amount')
      return
    }
    const { error } = await supabase.from('budgets').insert({
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      category,
      period: 'monthly'
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    setName('')
    setAmount('')
    setCategory('All Expenses')
    setShowForm(false)
    fetchData()
  }

  return (
    <div style={{ padding: '24px 18px 100px', minHeight: '100vh', background: '#0D0F14', color: '#F5F1E8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Budgets</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)', border: 'none', borderRadius: 12,
            width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0D0F14', boxShadow: '0 4px 16px rgba(212,175,55,0.25)'
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {loading && <p style={{ color: '#9A9AA8' }}>Loading...</p>}

      {!loading && budgets.length === 0 && !showForm && (
        <div style={{
          background: '#1A1D26', border: '1px solid #2A2E3A',
          borderRadius: 20, padding: 36, textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px'
          }}>
            <Gem size={26} color="#D4AF37" strokeWidth={1.5} />
          </div>
          <h3 style={{ marginBottom: 10, fontSize: 19 }}>Set Your First Budget</h3>
          <p style={{ color: '#9A9AA8', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Define a monthly limit for groceries or any category, and track your progress.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)', border: 'none', borderRadius: 14,
              padding: '15px 28px', color: '#0D0F14', fontWeight: 700, fontSize: 14,
              letterSpacing: 0.5
            }}
          >
            CREATE BUDGET
          </button>
        </div>
      )}

      {budgets.map(budget => {
        const spent = getSpentForBudget(budget)
        const percent = Math.min(100, (spent / budget.amount) * 100)
        const remaining = budget.amount - spent
        const barColor = percent > 90 ? '#E76F51' : percent > 70 ? '#D4AF37' : '#6FCF97'

        return (
          <div key={budget.id} style={{
            background: '#1A1D26', border: '1px solid #2A2E3A',
            borderRadius: 16, padding: 20, marginBottom: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{budget.name}</span>
              <span style={{ color: '#9A9AA8', fontSize: 13 }}>
                €{spent.toFixed(2)} <span style={{ color: '#5E5E6E' }}>/ €{budget.amount.toFixed(2)}</span>
              </span>
            </div>
            <div style={{ height: 8, background: '#232733', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${percent}%`, background: barColor,
                borderRadius: 6, transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: remaining >= 0 ? '#9A9AA8' : '#E76F51' }}>
              {remaining >= 0
                ? `€${remaining.toFixed(2)} remaining this month`
                : `€${Math.abs(remaining).toFixed(2)} over budget`}
            </div>
          </div>
        )
      })}

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', zIndex: 300
        }}>
          <div style={{
            background: '#1A1D26', borderRadius: '24px 24px 0 0', padding: 28,
            width: '100%', maxWidth: 480, margin: '0 auto', borderTop: '1px solid #2A2E3A'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>New Budget</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9A9AA8' }}>
                <X size={22} />
              </button>
            </div>

            <label style={{ fontSize: 11, color: '#9A9AA8', letterSpacing: 0.5 }}>BUDGET NAME</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Monthly Groceries"
              style={{
                width: '100%', background: '#232733', border: '1px solid #2A2E3A', borderRadius: 10,
                padding: 14, color: 'white', fontSize: 15, margin: '8px 0 18px', outline: 'none'
              }}
            />

            <label style={{ fontSize: 11, color: '#9A9AA8', letterSpacing: 0.5 }}>AMOUNT (EUR)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 300"
              style={{
                width: '100%', background: '#232733', border: '1px solid #2A2E3A', borderRadius: 10,
                padding: 14, color: 'white', fontSize: 15, margin: '8px 0 18px', outline: 'none'
              }}
            />

            <label style={{ fontSize: 11, color: '#9A9AA8', letterSpacing: 0.5 }}>CATEGORY</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', background: '#232733', border: '1px solid #2A2E3A', borderRadius: 10,
                padding: 14, color: 'white', fontSize: 15, margin: '8px 0 24px', outline: 'none'
              }}
            >
              <option value="All Expenses">All Expenses</option>
              <option value="Groceries">Groceries</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Shopping">Shopping</option>
            </select>

            <button
              onClick={saveBudget}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)', border: 'none', borderRadius: 14,
                padding: 17, color: '#0D0F14', fontWeight: 700, fontSize: 15, letterSpacing: 0.5,
                boxShadow: '0 4px 16px rgba(212,175,55,0.25)'
              }}
            >
              CREATE BUDGET
            </button>
          </div>
        </div>
      )}
    </div>
  )
}