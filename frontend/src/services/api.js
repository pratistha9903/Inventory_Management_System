const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'inventory_pro_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  const qs = new URLSearchParams()
  entries.forEach(([k, v]) => qs.set(k, String(v)))
  return `?${qs.toString()}`
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    let message = 'Request failed'
    if (typeof data.detail === 'string') message = data.detail
    else if (Array.isArray(data.detail)) message = data.detail.map((e) => e.msg || e.message).join(', ')
    throw new Error(message)
  }
  return data
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  getAdminDashboard: () => request('/dashboard/admin'),
  getCustomerDashboard: () => request('/dashboard/customer'),

  getProducts: (params) => request(`/products${buildQuery(params)}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  getCustomers: (params) => request(`/customers${buildQuery(params)}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  getOrders: (params) => request(`/orders${buildQuery(params)}`),
  getOrder: (id) => request(`/orders/${id}`),
  getInvoice: (id) => request(`/orders/${id}/invoice`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  placeOrder: (data) => request('/orders/place', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
}
