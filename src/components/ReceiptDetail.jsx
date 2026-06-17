import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { X, Trash2, Plus, Save } from 'lucide-react'

export default function ReceiptDetail({ receipt, onClose, onUpdated }) {
  const [storeName, setStoreName] = useState(receipt.store_name)
  const [date, setDate] = useState(receipt.purchase_date)
  const [items, setItems] = useState(receipt.items.map(i => ({ ...i })))
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateItem = (idx, field, value) => {
    const newItems = [...items]
    newItems[idx][field] = field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value
    setItems(newItems)
  }

  const addItemRow = () => {
    setItems([...items, { product_name: '', price: 0, quantity: 1, category: 'Groceries', isNew: true }])
  }

  const removeItem = async (idx) => {
    const item = items[idx]
    if (item.id) {
      await supabase.from('items').delete().eq('id', item.id)
    }
    setItems(items.filter((_, i) => i !== idx))
  }

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  const handleSaveChanges = async () => {
    if (!storeName.trim()) {
      alert('Store name cannot be empty')
      return
    }
    setLoading(true)

    await supabase
      .from('receipts')
      .update({ store_name: storeName, purchase_date: date, total_amount: total })
      .eq('id', receipt.id)

    for (const item of items) {
      if (item.id) {
        await supabase
          .from('items')
          .update({
            product_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          })
          .eq('id', item.id)
      } else {
        await supabase.from('items').insert({
          receipt_id: receipt.id,
          user_id: receipt.user_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'Groceries'
        })
      }
    }

    setLoading(false)
    onUpdated()
  }

  const handleDeleteReceipt = async () => {
    setLoading(true)
    await supabase.from('receipts').delete().eq('id', receipt.id)
    setLoading(false)
    onUpdated()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0D0F14',
      zIndex: 200, overflowY: 'auto', maxWidth: 480, margin: '0 auto'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, borderBottom: '1px solid #2A2E3A'
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F5F1E8' }}>Edit Receipt</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9A9AA8' }}>
          <X size={22} />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#9A9AA8' }}>Store</label>
          <input
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            style={{
              width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #2A2E3A',
              color: '#F5F1E8', fontSize: 16, padding: '8px 0', marginTop: 4, marginBottom: 16, outline: 'none'
            }}
          />
          <label style={{ fontSize: 12, color: '#9A9AA8' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', background: 'none', border: 'none', color: '#F5F1E8',
              fontSize: 14, padding: '8px 0', outline: 'none'
            }}
          />
        </div>

        <div style={{ background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#F5F1E8' }}>Items</div>

          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <input
                value={item.product_name}
                onChange={e => updateItem(idx, 'product_name', e.target.value)}
                placeholder="Product name"
                style={{
                  flex: 2, background: '#232733', border: 'none', borderRadius: 8,
                  padding: '10px 12px', color: '#F5F1E8', fontSize: 14, outline: 'none'
                }}
              />
              <input
                type="number"
                value={item.quantity}
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                style={{
                  width: 50, background: '#232733', border: 'none', borderRadius: 8,
                  padding: '10px 8px', color: '#F5F1E8', fontSize: 14, outline: 'none', textAlign: 'center'
                }}
              />
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={e => updateItem(idx, 'price', e.target.value)}
                style={{
                  width: 70, background: '#232733', border: 'none', borderRadius: 8,
                  padding: '10px 8px', color: '#F5F1E8', fontSize: 14, outline: 'none', textAlign: 'right'
                }}
              />
              <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#E76F51' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={addItemRow}
            style={{
              width: '100%', padding: 12, marginTop: 4, background: '#232733',
              border: '1px dashed #2A2E3A', borderRadius: 10, color: '#D4AF37',
              fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Plus size={16} /> Add item
          </button>
        </div>

        <div style={{
          background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
        }}>
          <span style={{ fontWeight: 700, color: '#F5F1E8' }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#D4AF37' }}>€{total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={loading}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)',
            border: 'none', borderRadius: 16, padding: 18, color: '#0D0F14',
            fontSize: 16, fontWeight: 800, marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              width: '100%', background: 'transparent', border: '1px solid #E76F51',
              borderRadius: 16, padding: 16, color: '#E76F51', fontWeight: 700, fontSize: 15
            }}
          >
            Delete Receipt
          </button>
        ) : (
          <div style={{ background: '#1A1D26', border: '1px solid #E76F51', borderRadius: 16, padding: 16 }}>
            <p style={{ color: '#F5F1E8', fontSize: 14, marginBottom: 14, textAlign: 'center' }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: 14, background: '#232733', border: 'none', borderRadius: 12, color: '#9A9AA8', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReceipt}
                disabled={loading}
                style={{ flex: 1, padding: 14, background: '#E76F51', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700 }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}