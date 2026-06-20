import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart, Menu, X, LogOut, ShoppingBag, Receipt,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const adminNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'All Orders' },
]

const customerNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  { to: '/my-orders', icon: Receipt, label: 'My Orders' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const navItems = isAdmin ? adminNav : customerNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navContent = (
    <>
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-accent/30 blur-md" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-white">Inventory Pro</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/60">
              {isAdmin ? 'Admin Panel' : 'Customer Portal'}
            </p>
          </div>
        </div>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Navigation</p>
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute inset-0 rounded-xl bg-accent/15 ring-1 ring-accent/25 shadow-inner-soft" />}
                <span className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-accent-gradient text-white shadow-glow' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
        {user && (
          <div className="rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-sm font-bold text-white">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                <p className="truncate text-xs capitalize text-teal-400/80">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        <button type="button" onClick={handleLogout} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 group-hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </span>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <button type="button" className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-card backdrop-blur lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
        {mobileOpen ? <X className="h-5 w-5 text-navy-900" /> : <Menu className="h-5 w-5 text-navy-900" />}
      </button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[18rem] flex-col border-r border-white/5 bg-navy-900 p-5 shadow-sidebar transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        {navContent}
      </aside>
    </>
  )
}
