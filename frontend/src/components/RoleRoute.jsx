import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from './PageLoader'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <PageLoader />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export function CustomerRoute({ children }) {
  const { user, loading, isCustomer } = useAuth()
  if (loading) return <PageLoader />
  if (!isCustomer) return <Navigate to="/" replace />
  return children
}
