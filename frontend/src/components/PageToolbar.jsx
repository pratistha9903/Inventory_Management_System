import { Search } from 'lucide-react'

export default function PageToolbar({ search, onSearchChange, searchPlaceholder, action, filters }) {
  return (
    <div className="toolbar">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="search-box max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder || 'Search...'}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {filters}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
