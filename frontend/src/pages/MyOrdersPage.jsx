import { useState } from 'react'
import { FileText, ShoppingCart, XCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { formatCurrency } from '../utils/currency'
import PageLoader from '../components/PageLoader'
import InvoiceModal from '../components/InvoiceModal'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'

export default function MyOrdersPage({ orders, loading, onRefresh }) {
  const { addToast } = useToast()
  const [invoice, setInvoice] = useState(null)
  const [loadingInvoice, setLoadingInvoice] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const viewInvoice = async (orderId) => {
    setLoadingInvoice(orderId)
    try {
      const inv = await api.getInvoice(orderId)
      setInvoice(inv)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoadingInvoice(null)
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return
    setCancelling(orderId)
    try {
      await api.cancelOrder(orderId)
      addToast('Order cancelled')
      onRefresh?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setCancelling(null)
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) return <PageLoader />

  return (
    <>
      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders yet" description="Place your first order from the shop" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="px-6 py-4 font-mono font-semibold text-navy-900">{order.invoice_number}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-slate-500">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 font-bold tabular-nums text-accent-dark">{formatCurrency(order.total_amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelling === order.id}
                            className="btn-secondary !py-2 text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => viewInvoice(order.id)}
                          disabled={loadingInvoice === order.id}
                          className="btn-secondary !py-2"
                        >
                          <FileText className="h-4 w-4" />
                          {loadingInvoice === order.id ? 'Loading...' : 'Invoice'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />
    </>
  )
}
