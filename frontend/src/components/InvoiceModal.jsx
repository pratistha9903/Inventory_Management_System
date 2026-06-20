import { Package, Printer, X } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

function formatInvoiceDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null

  const itemCount = invoice.items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePrint = () => {
    document.body.classList.add('printing-invoice')
    const cleanup = () => {
      document.body.classList.remove('printing-invoice')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
  }

  return (
    <div id="invoice-print-root" className="invoice-modal-root">
      <div className="invoice-modal-overlay" onClick={onClose} aria-hidden="true" />

      <div className="invoice-modal-panel">
        <div className="invoice-modal-toolbar">
          <p className="text-sm font-semibold text-slate-600">Invoice Preview</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlePrint} className="btn-accent !py-2">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div id="invoice-document" className="invoice-document">
          <header className="invoice-header">
            <div className="invoice-brand">
              <div className="invoice-logo">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="invoice-company-name">{invoice.company_name}</h1>
                <p className="invoice-company-tagline">{invoice.company_tagline}</p>
              </div>
            </div>
            <div className="invoice-title-block">
              <p className="invoice-title">TAX INVOICE</p>
              <p className="invoice-number">{invoice.invoice_number}</p>
            </div>
          </header>

          <section className="invoice-meta-grid">
            <div className="invoice-meta-box">
              <p className="invoice-meta-label">Bill To</p>
              <p className="invoice-meta-value">{invoice.customer_name}</p>
              <p className="invoice-meta-sub">{invoice.customer_email}</p>
              <p className="invoice-meta-sub">{invoice.customer_phone}</p>
            </div>
            <div className="invoice-meta-box invoice-meta-box-right">
              <div className="invoice-meta-row">
                <span className="invoice-meta-label">Invoice Date</span>
                <span className="invoice-meta-value-sm">{formatInvoiceDate(invoice.issued_at)}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="invoice-meta-label">Order Ref</span>
                <span className="invoice-meta-value-sm font-mono">#{String(invoice.order_id).padStart(5, '0')}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="invoice-meta-label">Items</span>
                <span className="invoice-meta-value-sm">{itemCount}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="invoice-meta-label">Currency</span>
                <span className="invoice-meta-value-sm">INR (₹)</span>
              </div>
            </div>
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={`${item.product_name}-${index}`}>
                  <td className="text-center text-slate-500">{index + 1}</td>
                  <td>
                    <p className="font-semibold text-navy-900">{item.product_name}</p>
                    {item.sku && <p className="text-xs text-slate-500">SKU: {item.sku}</p>}
                  </td>
                  <td className="text-center tabular-nums">{item.quantity}</td>
                  <td className="text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right tabular-nums font-semibold">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="invoice-summary-box">
              <div className="invoice-summary-row">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="invoice-summary-row invoice-summary-total">
                <span>Amount Payable</span>
                <span className="tabular-nums">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          <footer className="invoice-footer">
            <p className="invoice-footer-note">
              Thank you for your business. This is a computer-generated invoice and does not require a signature.
            </p>
            <p className="invoice-footer-brand">{invoice.company_name} · Inventory & Order Management</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
