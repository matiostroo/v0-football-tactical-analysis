'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Target, 
  LayoutDashboard, 
  Swords, 
  BarChart3, 
  Users,
  Play,
  Search
} from 'lucide-react'

const navigation = [
  { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Análisis Rival', href: '/dashboard/rival', icon: Swords },
  { name: 'Patrones Tácticos', href: '/dashboard/patterns', icon: BarChart3 },
  { name: 'Estadísticas', href: '/dashboard/stats', icon: Users },
  { name: 'Simulador', href: '/dashboard/simulator', icon: Play },
  { name: 'Buscar Equipos', href: '/dashboard/search', icon: Search },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TacticAI</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors',
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-slate-800 p-4">
                  <p className="text-xs font-medium text-slate-400">Próximo Partido</p>
                  <p className="mt-1 text-sm font-semibold text-white">Final Champions</p>
                  <p className="text-xs text-emerald-400">PSG vs Arsenal</p>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-slate-900 px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TacticAI</span>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 lg:hidden">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only lg:not-sr-only">{item.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
