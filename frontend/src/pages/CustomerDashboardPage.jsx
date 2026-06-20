import { Link } from 'react-router-dom'
import { ShoppingBag, Receipt, ArrowUpRight, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import PageLoader from '../components/PageLoader'
import StatusBadge from '../components/StatusBadge'
import { ORDER_STATUS_LABELS } from '../utils/orderStatuses'

const statusConfig = [
  { key: 'pending', label: ORDER_STATUS_LABELS.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'processing', label: ORDER_STATUS_LABELS.processing, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'delivered', label: ORDER_STATUS_LABELS.delivered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'cancelled', label: ORDER_STATUS_LABELS.cancelled, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
]

export default function CustomerDashboardPage({ stats, loading }) {
  if (loading) return <PageLoader />
  if (!stats) return null

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-8 shadow-elevated">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Welcome to your store</h2>
            <p className="mt-2 text-sm text-slate-300">Browse products, place orders, and track delivery status.</p>
          </div>
          <Link to="/shop" className="btn-accent shrink-0">
            <ShoppingBag className="h-4 w-4" /> Shop Now
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-500">My Orders</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-navy-900">{stats.my_orders_count}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-500">Total Spent</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-accent-dark">{formatCurrency(stats.my_total_spent)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-navy-900">Order Status</h2>
          <p className="text-sm text-slate-500">Track where your orders are in the pipeline</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          {statusConfig.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="font-display text-2xl font-bold tabular-nums text-navy-900">
                  {stats.order_status_counts?.[key] ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-900">Recent Orders</h2>
            <p className="text-sm text-slate-500">Your latest purchases</p>
          </div>
          <Link to="/my-orders" className="text-sm font-semibold text-accent hover:text-accent-dark">View all</Link>
        </div>
        {stats.recent_orders.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No orders yet — start shopping!</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recent_orders.map((order) => (
              <Link
                key={order.id}
                to="/my-orders"
                className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-mono text-sm font-semibold text-navy-900">{order.invoice_number}</p>
                    <p className="text-xs text-slate-500">{order.items.length} item(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-bold tabular-nums text-accent-dark">{formatCurrency(order.total_amount)}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
