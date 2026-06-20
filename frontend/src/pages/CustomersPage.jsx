import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Mail, Phone, Users } from 'lucide-react'
import Modal from '../components/Modal'
import PageLoader from '../components/PageLoader'
import PageToolbar from '../components/PageToolbar'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'

const emptyForm = { full_name: '', email: '', phone: '' }

export default function CustomersPage({ customers, loading, onRefresh }) {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [displayCustomers, setDisplayCustomers] = useState(customers)
  const [filterLoading, setFilterLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setFilterLoading(true)
    try {
      const data = await api.getCustomers({ search: search.trim() || undefined })
      setDisplayCustomers(data)
    } catch {
      setDisplayCustomers([])
    } finally {
      setFilterLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchCustomers, search])

  useEffect(() => {
    if (!loading) setDisplayCustomers(customers)
  }, [customers, loading])

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format'
    if (!form.phone.trim() || form.phone.length < 5) newErrors.phone = 'Valid phone number is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.createCustomer({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() })
      addToast('Customer created successfully')
      setModalOpen(false)
      setForm(emptyForm)
      onRefresh()
      fetchCustomers()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return
    try {
      await api.deleteCustomer(id)
      addToast('Customer deleted')
      onRefresh()
      fetchCustomers()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (loading && !displayCustomers.length) return <PageLoader />

  return (
    <>
      <PageToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        action={
          <button type="button" onClick={() => { setForm(emptyForm); setErrors({}); setModalOpen(true) }} className="btn-accent">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        }
      />

      {filterLoading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : displayCustomers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={search ? 'No customers found' : 'No customers yet'}
            description={search ? 'Try a different search' : 'Add customers to start creating orders'}
            action={
              !search && (
                <button type="button" onClick={() => setModalOpen(true)} className="btn-accent">
                  <Plus className="h-4 w-4" /> Add Customer
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {displayCustomers.map((customer) => (
            <div key={customer.id} className="card-hover group relative p-6">
              <button
                type="button"
                onClick={() => handleDelete(customer.id)}
                className="icon-btn-danger absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient text-xl font-bold text-white shadow-glow">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">{customer.full_name}</h3>
              <div className="mt-4 space-y-2.5">
                <p className="flex items-center gap-2.5 text-sm text-slate-500">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </span>
                  <span className="truncate">{customer.email}</span>
                </p>
                <p className="flex items-center gap-2.5 text-sm text-slate-500">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </span>
                  {customer.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
          </div>
          <div>
            <label className="label-text">Email Address</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="label-text">Phone Number</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-accent">
              {submitting ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
