import { IndianRupee, Package, Users, ShoppingCart, AlertTriangle, ArrowUpRight, Sparkles, FileText, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import PageLoader from '../components/PageLoader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { ORDER_STATUS_LABELS } from '../utils/orderStatuses'

const statConfig = [
  { key: 'total_products', label: 'Total Products', icon: Package, href: '/products', iconBg: 'bg-navy-900', iconText: 'text-white', format: (v) => v },
  { key: 'total_customers', label: 'Total Customers', icon: Users, href: '/customers', iconBg: 'bg-accent-muted', iconText: 'text-accent-dark', format: (v) => v },
  { key: 'total_orders', label: 'Total Orders', icon: ShoppingCart, href: '/orders', iconBg: 'bg-blue-50', iconText: 'text-blue-600', format: (v) => v },
  { key: 'total_revenue', label: 'Total Revenue', icon: IndianRupee, href: '/orders', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', format: (v) => formatCurrency(v) },
]

const statusConfig = [
  { key: 'pending', label: ORDER_STATUS_LABELS.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'processing', label: ORDER_STATUS_LABELS.processing, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'delivered', label: ORDER_STATUS_LABELS.delivered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'cancelled', label: ORDER_STATUS_LABELS.cancelled, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
]

function StatCard({ icon: Icon, label, value, href, iconBg, iconText }) {
  return (
    <Link to={href} className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={`stat-icon ${iconBg} ${iconText}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-accent-muted group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-navy-900">{value}</p>
    </Link>
  )
}

export default function DashboardPage({ stats, loading }) {
  const { user } = useAuth()

  if (loading) return <PageLoader />
  if (!stats) return null

  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const values = {
    total_products: stats.total_products,
    total_customers: stats.total_customers,
    total_orders: stats.total_orders,
    total_revenue: stats.total_revenue,
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-8 shadow-elevated lg:p-10">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {greeting}, {firstName}
            </div>
            <h2 className="font-display text-2xl font-bold text-white lg:text-3xl">Admin control center</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
              Monitor products, customers, orders, revenue, and inventory alerts in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20">
              + Add Product
            </Link>
            <Link to="/orders" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
              Create Order
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((cfg) => (
          <StatCard
            key={cfg.key}
            icon={cfg.icon}
            label={cfg.label}
            value={cfg.format ? cfg.format(values[cfg.key]) : values[cfg.key]}
            href={cfg.href}
            iconBg={cfg.iconBg}
            iconText={cfg.iconText}
          />
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-navy-900">Order Status Overview</h2>
          <p className="text-sm text-slate-500">Real business workflow — Pending → Processing → Delivered</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          {statusConfig.map(({ key, label, icon: Icon, color, bg }) => (
            <Link
              key={key}
              to={`/orders?status=${key}`}
              className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-accent/30 hover:shadow-soft"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="font-display text-2xl font-bold tabular-nums text-navy-900">
                  {stats.order_status_counts?.[key] ?? 0}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-900">Low Stock Alert</h2>
            <p className="text-sm text-slate-500">Products that need restocking soon</p>
          </div>
          {stats.low_stock_products.length > 0 && (
            <span className="badge-warning">{stats.low_stock_products.length} items</span>
          )}
        </div>

        {stats.low_stock_products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted ring-1 ring-accent/20">
              <Package className="h-7 w-7 text-accent" />
            </div>
            <p className="font-display font-semibold text-navy-900">All products are well stocked</p>
            <p className="mt-1 text-sm text-slate-500">You&apos;re in great shape — no action needed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="px-6 py-4 font-semibold text-navy-900">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4 font-medium tabular-nums text-slate-700">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={product.quantity_in_stock === 0 ? 'badge-danger' : 'badge-warning'}>
                        {product.quantity_in_stock} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 px-6 py-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy-900">Recent Orders</h2>
              <p className="text-sm text-slate-500">Latest activity across the store</p>
            </div>
            <Link to="/orders" className="text-sm font-semibold text-accent">View all</Link>
          </div>
          {stats.recent_orders?.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No orders yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recent_orders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-mono text-sm font-semibold text-navy-900">{order.invoice_number}</p>
                      <p className="text-xs text-slate-500">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold tabular-nums text-accent-dark">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
