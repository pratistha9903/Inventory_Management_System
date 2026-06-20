import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, User, Mail, Lock, Shield, ShoppingBag } from 'lucide-react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    description: 'Browse products, place orders, and download invoices',
    icon: ShoppingBag,
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Manage inventory, customers, orders, and analytics',
    icon: Shield,
  },
]

export default function SignupPage() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    role: 'customer',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Full name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email format'
    if (form.role === 'customer' && (!form.phone.trim() || form.phone.trim().length < 5)) {
      next.phone = 'Valid phone number is required for customer accounts'
    }
    if (!form.password || form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match'
    if (!form.role) next.role = 'Select an account type'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register(
        form.full_name.trim(),
        form.email.trim(),
        form.password,
        form.role === 'customer' ? form.phone.trim() : undefined,
        form.role,
      )
      addToast(`Welcome! Your ${form.role} account is ready.`)
      navigate('/')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AuthBrandPanel
        title="Start in minutes, scale with ease"
        subtitle="Choose your role — customer to shop and order, or admin to manage the full business."
      />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[52%] lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-navy-900">Inventory Pro</span>
          </div>

          <div className="auth-card">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Create account</h1>
              <p className="mt-2 text-sm text-slate-500">Select your role and set up your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Account type</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {ROLES.map(({ id, label, description, icon: Icon }) => {
                    const selected = form.role === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setForm({ ...form, role: id })}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? 'border-accent bg-accent-muted/40 ring-2 ring-accent/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${selected ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-navy-900">{label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                      </button>
                    )
                  })}
                </div>
                {errors.role && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.role}</p>}
              </div>

              <div>
                <label className="label-text">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="auth-input pl-11" placeholder="John Doe" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                {errors.full_name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.full_name}</p>}
              </div>

              <div>
                <label className="label-text">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="auth-input pl-11" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>

              {form.role === 'customer' && (
                <div>
                  <label className="label-text">Phone number</label>
                  <input
                    className="auth-input"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone}</p>}
                </div>
              )}

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} className="auth-input pl-11 pr-11" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="label-text">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" className="auth-input pl-11" placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.confirm}</p>}
              </div>

              <button type="submit" disabled={submitting} className="btn-accent !mt-6 w-full py-3.5 text-base">
                {submitting ? 'Creating account...' : `Create ${form.role} account`}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-accent hover:text-accent-dark">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
