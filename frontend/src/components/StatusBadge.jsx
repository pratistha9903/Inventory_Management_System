import { ORDER_STATUS_LABELS } from '../utils/orderStatuses'

const styles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export default function StatusBadge({ status }) {
  const key = status || 'pending'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[key] || styles.pending}`}>
      {ORDER_STATUS_LABELS[key] || key}
    </span>
  )
}
