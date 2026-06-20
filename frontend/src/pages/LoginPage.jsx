import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Email is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      addToast('Welcome back!')
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
        title="Run your business smarter"
        subtitle="A professional workspace to manage products, customers, orders, and inventory — all in one place."
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
              <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-text">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="auth-input pl-11" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} className="auth-input pl-11 pr-11" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>}
              </div>

              <button type="submit" disabled={submitting} className="btn-accent w-full py-3.5 text-base">
                {submitting ? 'Signing in...' : 'Sign in to Dashboard'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-bold text-accent hover:text-accent-dark">Create free account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
