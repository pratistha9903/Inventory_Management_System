export const ORDER_STATUSES = ['pending', 'processing', 'delivered', 'cancelled']

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ADMIN_NEXT_STATUSES = {
  pending: ['processing', 'cancelled'],
  processing: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}
