import { useEffect, useState } from 'react'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

interface Item {
  jobTitle?: string
  company?: string
  startDate?: string
  endDate?: string
  responsibilities?: string[]
  // ... other fields
}

const FetchAndDisplayKey: React.FC<{ keyPath: string; label?: string }> = ({ keyPath, label }) => {
  const [items, setItems] = useState<Item[] | null>(null)
  const [originalItems, setOriginalItems] = useState<Item[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const auth = getAuth()
  const firestore = getFirestore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid
        if (!uid) {
          setError('User not authenticated')
          setLoading(false)
          return
        }
        const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          setError('Document does not exist')
          setLoading(false)
          return
        }
        const data = docSnap.data()
        const jsonString: string = data.groqResponse
        const jsonObject = JSON.parse(jsonString)
        const nestedItems = getNestedValue(jsonObject, keyPath)
        if (Array.isArray(nestedItems)) {
          setItems(nestedItems)
          setOriginalItems(nestedItems)
        } else {
          setError('Expected an array for this key')
        }
      } catch (err) {
        setError('Error fetching data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [keyPath])

  // Utility to get nested value
  const getNestedValue = (obj: any, path: string) =>
    path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)

  // Utility to set nested value
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const newObj = { ...obj }
    let current = newObj
    for (const k of keys) {
      current[k] = { ...current[k] }
      current = current[k]
    }
    current[lastKey] = value
    return newObj
  }

  const handleEditAll = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    setItems(originalItems)
    setEditMode(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('Not authenticated')
      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) throw new Error('Document does not exist')
      const data = docSnap.data()
      const jsonString: string = data.groqResponse
      const jsonObject = JSON.parse(jsonString)
      const updatedObject = setNestedValue(jsonObject, keyPath, items)
      await updateDoc(docRef, {
        groqResponse: JSON.stringify(updatedObject),
      })
      setOriginalItems(items)
      setEditMode(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!items) return null

  return (
    <div>
      {label && <h3>{label}</h3>}
      {!editMode ? (
        <div>
          <button onClick={handleEditAll}>Edit All</button>
          {items.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '0.5rem' }}>
              {Object.entries(item).map(([k, v]) => (
                <div key={k}>
                  <strong>{k}:</strong> {Array.isArray(v) ? JSON.stringify(v) : String(v)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {items.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '0.5rem' }}>
              {Object.entries(item).map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.5rem' }}>
                  <strong>{k}:</strong>
                  {Array.isArray(v) ? (
                    <ul>
                      {v.map((sub, i) => (
                        <li key={i}>{JSON.stringify(sub)}</li>
                      ))}
                    </ul>
                  ) : typeof v === 'object' && v !== null ? (
                    <pre>{JSON.stringify(v, null, 2)}</pre>
                  ) : (
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[idx] = { ...newItems[idx], [k]: e.target.value }
                        setItems(newItems)
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleSave} disabled={saving}>Save All</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  )
}

export default FetchAndDisplayKey