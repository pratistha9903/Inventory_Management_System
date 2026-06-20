import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Package, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { formatCurrency } from '../utils/currency'
import PageLoader from '../components/PageLoader'
import InvoiceModal from '../components/InvoiceModal'
import EmptyState from '../components/EmptyState'

export default function ShopPage({ products, loading, onRefresh }) {
  const { addToast } = useToast()
  const { isAdmin, isCustomer } = useAuth()
  const [cart, setCart] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [invoice, setInvoice] = useState(null)

  const addToCart = (product) => {
    if (product.quantity_in_stock <= 0) {
      addToast('Out of stock', 'error')
      return
    }
    setCart((prev) => {
      const qty = (prev[product.id]?.quantity || 0) + 1
      if (qty > product.quantity_in_stock) {
        addToast(`Only ${product.quantity_in_stock} in stock`, 'error')
        return prev
      }
      return { ...prev, [product.id]: { product, quantity: qty } }
    })
  }

  const updateQty = (productId, delta) => {
    setCart((prev) => {
      const item = prev[productId]
      if (!item) return prev
      const newQty = item.quantity + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      if (newQty > item.product.quantity_in_stock) return prev
      return { ...prev, [productId]: { ...item, quantity: newQty } }
    })
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setSubmitting(true)
    try {
      const order = await api.placeOrder({
        items: cartItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      })
      setCart({})
      addToast('Order placed successfully!')
      onRefresh()
      try {
        setInvoice(await api.getInvoice(order.id))
      } catch {
        addToast('Order placed — open My Orders to view your invoice', 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  if (isAdmin) {
    return (
      <div className="card p-10 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 font-display text-xl font-bold text-navy-900">Shop is for customer accounts</h2>
        <p className="mt-2 text-sm text-slate-500">
          You are logged in as admin. To place orders, sign up or log in with a customer account.
        </p>
        <Link to="/signup" className="btn-accent mt-6 inline-flex">Create customer account</Link>
      </div>
    )
  }

  const inStock = products.filter((p) => p.quantity_in_stock > 0)

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {inStock.length === 0 ? (
            <div className="card">
              <EmptyState icon={Package} title="No products available" description="Check back later for new stock" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {inStock.map((product) => (
                <div key={product.id} className="card-hover p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted text-lg font-bold text-accent-dark">
                    {product.name.charAt(0)}
                  </div>
                  <h3 className="font-display font-semibold text-navy-900">{product.name}</h3>
                  <p className="mt-1 font-mono text-xs text-slate-500">{product.sku}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-display text-xl font-bold text-navy-900">{formatCurrency(product.price)}</p>
                    <span className="badge-success">{product.quantity_in_stock} left</span>
                  </div>
                  <button type="button" onClick={() => addToCart(product)} className="btn-accent mt-4 w-full">
                    <Plus className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card sticky top-24 h-fit p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-navy-900">Your Cart</h2>
          </div>

          {cartItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Cart is empty — add products to order</p>
          ) : (
            <>
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateQty(product.id, -1)} className="icon-btn !h-8 !w-8">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
                      <button type="button" onClick={() => updateQty(product.id, 1)} className="icon-btn !h-8 !w-8">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold tabular-nums text-navy-900">{formatCurrency(cartTotal)}</span>
                </div>
                <button type="button" disabled={submitting || !isCustomer} onClick={handleCheckout} className="btn-accent mt-4 w-full py-3">
                  {submitting ? 'Placing Order...' : 'Place Order & Get Invoice'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />
    </>
  )
}
