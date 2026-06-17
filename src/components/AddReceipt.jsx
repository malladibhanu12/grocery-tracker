import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { X, Plus, Trash2, Camera } from 'lucide-react'

export default function AddReceipt({ user, onSaved, onClose }) {
  const [storeName, setStoreName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ product_name: '', price: 0, quantity: 1, category: 'Groceries' }])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleScan = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setScanning(true)

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { imageBase64: base64 }
      })

      if (error) throw error

      const text = data.text || ''
      const lines = text.split('\n').filter(l => l.trim())
      const priceRegex = /(\d+[,.]\d{2})/

      const parsedItems = []
      lines.forEach(line => {
        const match = line.match(priceRegex)
        if (match) {
          const price = parseFloat(match[1].replace(',', '.'))
          const name = line.replace(priceRegex, '').replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, '').trim()
          if (name.length > 1 && price > 0 && price < 500) {
            parsedItems.push({ product_name: name, price, quantity: 1, category: 'Groceries' })
          }
        }
      })

      if (parsedItems.length > 0) {
        setItems(parsedItems)
      }

      const possibleStore = lines.slice(0, 3).find(l => l.length > 3 && !priceRegex.test(l))
      if (possibleStore) setStoreName(possibleStore.trim())

    } catch (err) {
      console.error(err)
      alert('Could not read the receipt. You can still add items manually below.')
    }

    setScanning(false)
  }

  const updateItem = (idx, field, value) => {
    const newItems = [...items]
    newItems[idx][field] = field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value
    setItems(newItems)
  }

  const addItemRow = () => {
    setItems([...items, { product_name: '', price: 0, quantity: 1, category: 'Groceries' }])
  }

  const removeItemRow = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  const handleSave = async () => {
    if (!storeName.trim()) {
      alert('Please enter a store name')
      return
    }
    if (items.length === 0 || items.some(i => !i.product_name.trim())) {
      alert('Please fill in all product names')
      return
    }

    setLoading(true)

    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        store_name: storeName,
        purchase_date: date,
        total_amount: total
      })
      .select()
      .single()

    if (error) {
      alert('Error saving receipt: ' + error.message)
      setLoading(false)
      return
    }

    const itemsToInsert = items.map(item => ({
      receipt_id: receipt.id,
      user_id: user.id,
      product_name: item.product_name,
      category: item.category,
      price: item.price,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase.from('items').insert(itemsToInsert)

    if (itemsError) {
      alert('Error saving items: ' + itemsError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSaved()
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
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F5F1E8' }}>Add Receipt</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9A9AA8' }}>
          <X size={22} />
        </button>
      </div>

      <div style={{ padding: 20 }}>

        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '2px dashed #D4AF37', borderRadius: 16, padding: '18px',
          marginBottom: 16, cursor: 'pointer', color: '#D4AF37', fontWeight: 600
        }}>
          <Camera size={20} />
          {scanning ? 'Reading receipt...' : 'Scan Receipt Photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleScan}
            style={{ display: 'none' }}
          />
        </label>

        {preview && (
          <img src={preview} alt="receipt preview" style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
        )}

        <div style={{ background: '#1A1D26', border: '1px solid #2A2E3A', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#9A9AA8' }}>Store</label>
          <input
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="e.g. Rewe, Aldi, Lidl, Edeka"
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
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#F5F1E8' }}>
            Items {items.length > 0 && `(${items.length})`}
          </div>

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
                placeholder="€"
                style={{
                  width: 70, background: '#232733', border: 'none', borderRadius: 8,
                  padding: '10px 8px', color: '#F5F1E8', fontSize: 14, outline: 'none', textAlign: 'right'
                }}
              />
              <button onClick={() => removeItemRow(idx)} style={{ background: 'none', border: 'none', color: '#E76F51' }}>
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
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 50%, #D4AF37 100%)',
            border: 'none', borderRadius: 16, padding: 18, color: '#0D0F14',
            fontSize: 16, fontWeight: 800
          }}
        >
          {loading ? 'Saving...' : 'Save Receipt'}
        </button>
      </div>
    </div>
  )
}