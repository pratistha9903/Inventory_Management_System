import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import Modal from '../components/Modal'
import PageLoader from '../components/PageLoader'
import PageToolbar from '../components/PageToolbar'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { formatCurrency } from '../utils/currency'

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' }

export default function ProductsPage({ products, loading, onRefresh }) {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [displayProducts, setDisplayProducts] = useState(products)
  const [filterLoading, setFilterLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setFilterLoading(true)
    try {
      const data = await api.getProducts({
        search: search.trim() || undefined,
        low_stock: lowStockOnly || undefined,
      })
      setDisplayProducts(data)
    } catch {
      setDisplayProducts([])
    } finally {
      setFilterLoading(false)
    }
  }, [search, lowStockOnly])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchProducts, search])

  useEffect(() => {
    if (!loading) setDisplayProducts(products)
  }, [products, loading])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.sku.trim()) newErrors.sku = 'SKU is required'
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Price must be greater than 0'
    if (form.quantity_in_stock === '' || Number(form.quantity_in_stock) < 0)
      newErrors.quantity_in_stock = 'Quantity cannot be negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity_in_stock: Number(form.quantity_in_stock),
      }
      if (editing) {
        await api.updateProduct(editing.id, payload)
        addToast('Product updated successfully')
      } else {
        await api.createProduct(payload)
        addToast('Product created successfully')
      }
      setModalOpen(false)
      onRefresh()
      fetchProducts()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.deleteProduct(id)
      addToast('Product deleted')
      onRefresh()
      fetchProducts()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (loading && !displayProducts.length) return <PageLoader />

  return (
    <>
      <PageToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU..."
        filters={
          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${
              lowStockOnly
                ? 'bg-amber-50 text-amber-800 ring-amber-200'
                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock
          </button>
        }
        action={
          <button type="button" onClick={openCreate} className="btn-accent">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        }
      />

      <div className="card overflow-hidden">
        {filterLoading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : displayProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={search || lowStockOnly ? 'No products match your filters' : 'No products yet'}
            description={search || lowStockOnly ? 'Try adjusting search or filters' : 'Add your first product to start managing inventory'}
            action={
              !search && !lowStockOnly && (
                <button type="button" onClick={openCreate} className="btn-accent">
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-navy-900">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-navy-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{product.sku}</code>
                    </td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-slate-700">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={product.quantity_in_stock <= 10 ? 'badge-warning' : 'badge-success'}>
                        {product.quantity_in_stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(product)} className="icon-btn" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(product.id)} className="icon-btn-danger" title="Delete">
                          <Trash2 className="h-4 w-4" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Product Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label-text">SKU / Code</label>
            <input className="input-field font-mono" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Price (₹)</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="label-text">Quantity in Stock</label>
              <input type="number" min="0" className="input-field" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} />
              {errors.quantity_in_stock && <p className="mt-1 text-xs text-red-600">{errors.quantity_in_stock}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-accent">
              {submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
