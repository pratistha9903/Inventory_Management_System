import { useCallback, useEffect, useState } from 'react'

import { Plus, Trash2, Eye, X, ShoppingCart, FileText } from 'lucide-react'

import { useSearchParams } from 'react-router-dom'

import Modal from '../components/Modal'

import PageLoader from '../components/PageLoader'

import EmptyState from '../components/EmptyState'

import InvoiceModal from '../components/InvoiceModal'

import StatusBadge from '../components/StatusBadge'

import { useToast } from '../context/ToastContext'

import { api } from '../services/api'

import { formatCurrency } from '../utils/currency'

import { ADMIN_NEXT_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUSES } from '../utils/orderStatuses'



export default function OrdersPage({ orders, customers, products, loading, onRefresh }) {

  const { addToast } = useToast()

  const [searchParams] = useSearchParams()

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')

  const [displayOrders, setDisplayOrders] = useState(orders)

  const [filterLoading, setFilterLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)

  const [detailOrder, setDetailOrder] = useState(null)

  const [customerId, setCustomerId] = useState('')

  const [items, setItems] = useState([{ product_id: '', quantity: '' }])

  const [errors, setErrors] = useState({})

  const [submitting, setSubmitting] = useState(false)

  const [invoice, setInvoice] = useState(null)

  const [updatingStatus, setUpdatingStatus] = useState(null)



  const fetchOrders = useCallback(async () => {

    setFilterLoading(true)

    try {

      const data = await api.getOrders({ status: statusFilter || undefined })

      setDisplayOrders(data)

    } catch {

      setDisplayOrders([])

    } finally {

      setFilterLoading(false)

    }

  }, [statusFilter])



  useEffect(() => {

    setStatusFilter(searchParams.get('status') || '')

  }, [searchParams])



  useEffect(() => {

    fetchOrders()

  }, [fetchOrders])



  useEffect(() => {

    if (!loading) setDisplayOrders(orders)

  }, [orders, loading])



  const resetForm = () => {

    setCustomerId('')

    setItems([{ product_id: '', quantity: '' }])

    setErrors({})

  }



  const addItem = () => setItems([...items, { product_id: '', quantity: '' }])

  const removeItem = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)) }

  const updateItem = (index, field, value) => {

    const updated = [...items]

    updated[index][field] = value

    setItems(updated)

  }



  const validate = () => {

    const newErrors = {}

    if (!customerId) newErrors.customer = 'Select a customer'

    items.forEach((item, i) => {

      if (!item.product_id) newErrors[`product_${i}`] = 'Select a product'

      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`qty_${i}`] = 'Valid quantity required'

    })

    const productIds = items.map((i) => i.product_id).filter(Boolean)

    if (new Set(productIds).size !== productIds.length) newErrors.duplicate = 'Duplicate products not allowed'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)

    try {

      await api.createOrder({

        customer_id: Number(customerId),

        items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),

      })

      addToast('Order created successfully')

      setCreateOpen(false)

      resetForm()

      onRefresh()

      fetchOrders()

    } catch (err) {

      addToast(err.message, 'error')

    } finally {

      setSubmitting(false)

    }

  }



  const handleCancel = async (id) => {

    if (!window.confirm('Cancel this order? Stock will be restored.')) return

    try {

      await api.cancelOrder(id)

      addToast('Order cancelled')

      onRefresh()

      fetchOrders()

    } catch (err) {

      addToast(err.message, 'error')

    }

  }



  const handleStatusChange = async (orderId, newStatus) => {

    setUpdatingStatus(orderId)

    try {

      await api.updateOrderStatus(orderId, newStatus)

      addToast(`Order marked as ${ORDER_STATUS_LABELS[newStatus]}`)

      onRefresh()

      fetchOrders()

    } catch (err) {

      addToast(err.message, 'error')

    } finally {

      setUpdatingStatus(null)

    }

  }



  const formatDate = (dateStr) =>

    new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })



  if (loading && !displayOrders.length) return <PageLoader />



  return (

    <>

      <div className="toolbar !mb-6">

        <div className="flex flex-wrap items-center gap-3">

          <p className="text-sm text-slate-500">

            <span className="font-semibold text-navy-900">{displayOrders.length}</span> orders

          </p>

          <select

            className="select-field !w-auto !py-2"

            value={statusFilter}

            onChange={(e) => setStatusFilter(e.target.value)}

          >

            <option value="">All statuses</option>

            {ORDER_STATUSES.map((s) => (

              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>

            ))}

          </select>

        </div>

        <button type="button" onClick={() => { resetForm(); setCreateOpen(true) }} className="btn-accent">

          <Plus className="h-4 w-4" /> Create Order

        </button>

      </div>



      <div className="card overflow-hidden">

        {filterLoading ? (

          <div className="flex justify-center py-16"><div className="spinner" /></div>

        ) : displayOrders.length === 0 ? (

          <EmptyState

            icon={ShoppingCart}

            title={statusFilter ? 'No orders with this status' : 'No orders yet'}

            description={statusFilter ? 'Try a different status filter' : 'Create your first order by selecting a customer and products'}

            action={

              !statusFilter && (

                <button type="button" onClick={() => { resetForm(); setCreateOpen(true) }} className="btn-accent">

                  <Plus className="h-4 w-4" /> Create Order

                </button>

              )

            }

          />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead>

                <tr className="table-head">

                  <th className="px-6 py-4">Invoice</th>

                  <th className="px-6 py-4">Customer</th>

                  <th className="px-6 py-4">Status</th>

                  <th className="px-6 py-4">Items</th>

                  <th className="px-6 py-4">Total</th>

                  <th className="px-6 py-4">Date</th>

                  <th className="px-6 py-4 text-right">Actions</th>

                </tr>

              </thead>

              <tbody>

                {displayOrders.map((order) => {

                  const nextStatuses = ADMIN_NEXT_STATUSES[order.status] || []

                  return (

                    <tr key={order.id} className="table-row">

                      <td className="px-6 py-4 font-mono font-semibold text-navy-900">{order.invoice_number}</td>

                      <td className="px-6 py-4 font-medium text-navy-900">{order.customer_name}</td>

                      <td className="px-6 py-4">

                        <div className="flex flex-col gap-2">

                          <StatusBadge status={order.status} />

                          {nextStatuses.length > 0 && (

                            <select

                              className="select-field !py-1.5 !text-xs"

                              value=""

                              disabled={updatingStatus === order.id}

                              onChange={(e) => {

                                if (e.target.value) handleStatusChange(order.id, e.target.value)

                              }}

                            >

                              <option value="">Update status...</option>

                              {nextStatuses.map((s) => (

                                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>

                              ))}

                            </select>

                          )}

                        </div>

                      </td>

                      <td className="px-6 py-4 text-slate-500">{order.items.length} item(s)</td>

                      <td className="px-6 py-4 font-bold tabular-nums text-accent-dark">{formatCurrency(order.total_amount)}</td>

                      <td className="px-6 py-4 text-slate-500">{formatDate(order.created_at)}</td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button type="button" onClick={async () => { try { setInvoice(await api.getInvoice(order.id)) } catch (e) { addToast(e.message, 'error') } }} className="btn-secondary !px-3 !py-2" title="Invoice">

                            <FileText className="h-4 w-4" />

                          </button>

                          <button type="button" onClick={() => setDetailOrder(order)} className="icon-btn" title="View">

                            <Eye className="h-4 w-4" />

                          </button>

                          {order.status !== 'delivered' && order.status !== 'cancelled' && (

                            <button type="button" onClick={() => handleCancel(order.id)} className="icon-btn-danger" title="Cancel">

                              <Trash2 className="h-4 w-4" />

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>



      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Order">

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>

            <label className="label-text">Customer</label>

            <select className="select-field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>

              <option value="">Select customer...</option>

              {customers.map((c) => (

                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>

              ))}

            </select>

            {errors.customer && <p className="mt-1 text-xs text-red-600">{errors.customer}</p>}

          </div>

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="label-text !mb-0">Order Items</label>

              <button type="button" onClick={addItem} className="text-xs font-bold text-accent hover:text-accent-dark">+ Add item</button>

            </div>

            {errors.duplicate && <p className="mb-2 text-xs text-red-600">{errors.duplicate}</p>}

            <div className="space-y-3">

              {items.map((item, index) => (

                <div key={index} className="flex gap-2 rounded-xl bg-slate-50 p-3">

                  <div className="flex-1">

                    <select className="select-field !bg-white" value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)}>

                      <option value="">Select product...</option>

                      {products.map((p) => (

                        <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)} (stock: {p.quantity_in_stock})</option>

                      ))}

                    </select>

                    {errors[`product_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`product_${index}`]}</p>}

                  </div>

                  <div className="w-24">

                    <input type="number" min="1" placeholder="Qty" className="input-field" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />

                    {errors[`qty_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`qty_${index}`]}</p>}

                  </div>

                  {items.length > 1 && (

                    <button type="button" onClick={() => removeItem(index)} className="icon-btn-danger self-start"><X className="h-4 w-4" /></button>

                  )}

                </div>

              ))}

            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">

            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>

            <button type="submit" disabled={submitting} className="btn-accent">{submitting ? 'Creating...' : 'Place Order'}</button>

          </div>

        </form>

      </Modal>



      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order #${detailOrder?.id}`}>

        {detailOrder && (

          <div className="space-y-4">

            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-accent-muted/30 p-4 ring-1 ring-slate-200/80">

              <div className="flex items-center justify-between">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer</p>

                <StatusBadge status={detailOrder.status} />

              </div>

              <p className="mt-1 font-semibold text-navy-900">{detailOrder.customer_name}</p>

              <p className="mt-2 text-sm text-slate-500">{formatDate(detailOrder.created_at)}</p>

            </div>

            <div>

              <p className="label-text">Items</p>

              <div className="space-y-2">

                {detailOrder.items.map((item) => (

                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">

                    <div>

                      <p className="font-semibold text-navy-900">{item.product_name}</p>

                      <p className="text-xs text-slate-500">{item.quantity} × {formatCurrency(item.unit_price)}</p>

                    </div>

                    <p className="font-bold tabular-nums text-accent-dark">{formatCurrency(item.quantity * Number(item.unit_price))}</p>

                  </div>

                ))}

              </div>

            </div>

            <div className="flex items-center justify-between rounded-xl bg-navy-900 px-5 py-4 text-white">

              <span className="font-display font-semibold">Order Total</span>

              <span className="font-display text-2xl font-bold tabular-nums">{formatCurrency(detailOrder.total_amount)}</span>

            </div>

          </div>

        )}

      </Modal>

      <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />

    </>

  )

}


