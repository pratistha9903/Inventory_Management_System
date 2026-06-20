import { Package, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
  { icon: Package, text: 'Real-time stock tracking' },
  { icon: TrendingUp, text: 'Smart order analytics' },
  { icon: Shield, text: 'Secure business data' },
  { icon: Zap, text: 'Fast order processing' },
]

export default function AuthBrandPanel({ title, subtitle }) {
  return (
    <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
      <div className="absolute inset-0 bg-grid-pattern bg-grid" />
      <div className="absolute -right-24 -top-24 h-96 w-96 animate-pulse-soft rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-teal-400/10 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-display text-xl font-bold text-white">Inventory Pro</span>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-300/70">BUSINESS SUITE</p>
        </div>
      </div>

      <div className="relative max-w-lg">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-teal-200 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-light opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-light" />
          </span>
          Trusted by modern businesses
        </div>
        <h2 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-[2.75rem]">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-400">{subtitle}</p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {features.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                <Icon className="h-4 w-4 text-accent-light" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-slate-500">© 2026 Inventory Pro · Built for modern businesses</p>
    </div>
  )
}
