import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/RoleRoute'
import DashboardPage from './pages/DashboardPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import ProductsPage from './pages/ProductsPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import ShopPage from './pages/ShopPage'
import MyOrdersPage from './pages/MyOrdersPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { api } from './services/api'

const adminMeta = {
  '/': { title: 'Admin Dashboard', subtitle: 'Complete overview of products, customers, orders, and revenue' },
  '/products': { title: 'Products', subtitle: 'Manage inventory catalog and stock levels' },
  '/customers': { title: 'Customers', subtitle: 'View and manage all registered customers' },
  '/orders': { title: 'All Orders', subtitle: 'Monitor every order placed in the system' },
}

const customerMeta = {
  '/': { title: 'My Dashboard', subtitle: 'Your orders and account overview' },
  '/shop': { title: 'Shop', subtitle: 'Browse products and place your order' },
  '/my-orders': { title: 'My Orders', subtitle: 'View orders and download invoices' },
}

function AppShell() {
  const location = useLocation()
  const { isAdmin } = useAuth()
  const meta = (isAdmin ? adminMeta : customerMeta)[location.pathname] || (isAdmin ? adminMeta['/'] : customerMeta['/'])

  const [adminStats, setAdminStats] = useState(null)
  const [customerStats, setCustomerStats] = useState(null)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState({ dashboard: true, products: true, customers: true, orders: true })

  const loadDashboard = useCallback(async () => {
    try {
      if (isAdmin) setAdminStats(await api.getAdminDashboard())
      else setCustomerStats(await api.getCustomerDashboard())
    } catch {
      setAdminStats(null)
      setCustomerStats(null)
    } finally {
      setLoading((l) => ({ ...l, dashboard: false }))
    }
  }, [isAdmin])

  const loadProducts = useCallback(async () => {
    try { setProducts(await api.getProducts()) } catch { setProducts([]) }
    finally { setLoading((l) => ({ ...l, products: false })) }
  }, [])

  const loadCustomers = useCallback(async () => {
    if (!isAdmin) { setLoading((l) => ({ ...l, customers: false })); return }
    try { setCustomers(await api.getCustomers()) } catch { setCustomers([]) }
    finally { setLoading((l) => ({ ...l, customers: false })) }
  }, [isAdmin])

  const loadOrders = useCallback(async () => {
    try { setOrders(await api.getOrders()) } catch { setOrders([]) }
    finally { setLoading((l) => ({ ...l, orders: false })) }
  }, [])

  useEffect(() => {
    setLoading({ dashboard: true, products: true, customers: true, orders: true })
    loadDashboard()
    loadProducts()
    loadCustomers()
    loadOrders()
  }, [loadDashboard, loadProducts, loadCustomers, loadOrders])

  const refreshProducts = () => { loadProducts(); loadDashboard() }
  const refreshCustomers = () => { loadCustomers(); loadDashboard() }
  const refreshOrders = () => { loadOrders(); loadProducts(); loadDashboard() }

  return (
    <>
      <Sidebar />
      <Layout title={meta.title} subtitle={meta.subtitle}>
        <Routes>
          <Route
            path="/"
            element={
              isAdmin ? (
                <DashboardPage stats={adminStats} loading={loading.dashboard} />
              ) : (
                <CustomerDashboardPage stats={customerStats} loading={loading.dashboard} />
              )
            }
          />
          <Route path="/shop" element={<ShopPage products={products} loading={loading.products} onRefresh={refreshOrders} />} />
          <Route path="/my-orders" element={<MyOrdersPage orders={orders} loading={loading.orders} onRefresh={refreshOrders} />} />
          <Route path="/products" element={<AdminRoute><ProductsPage products={products} loading={loading.products} onRefresh={refreshProducts} /></AdminRoute>} />
          <Route path="/customers" element={<AdminRoute><CustomersPage customers={customers} loading={loading.customers} onRefresh={refreshCustomers} /></AdminRoute>} />
          <Route path="/orders" element={<AdminRoute><OrdersPage orders={orders} customers={customers} products={products} loading={loading.orders} onRefresh={refreshOrders} /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  )
}

function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="spinner" /></div>
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
      <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}
