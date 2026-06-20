export default function Layout({ children, title, subtitle, action }) {
  return (
    <div className="page-shell min-h-screen lg:pl-[18rem]">
      <main className="px-4 py-8 pt-20 lg:px-10 lg:py-10">
        <header className="page-content mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Inventory Pro
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 lg:text-[2rem]">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
        <div className="page-content" style={{ animationDelay: '0.08s' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
