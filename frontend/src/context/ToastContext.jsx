import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }

  const styles = {
    success: 'border-emerald-200/80 bg-white text-emerald-800 shadow-[0_8px_30px_rgb(16_185_129/0.12)]',
    error: 'border-red-200/80 bg-white text-red-700 shadow-[0_8px_30px_rgb(239_68_68/0.12)]',
    info: 'border-slate-200 bg-white text-slate-700 shadow-elevated',
  }

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-accent',
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info
          return (
            <div
              key={toast.id}
              className={`flex min-w-[280px] items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium animate-fade-up ${styles[toast.type]}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${iconColors[toast.type]}`} />
              {toast.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
