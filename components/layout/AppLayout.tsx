'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutGrid,
  Clock,
  Archive,
  BarChart3,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Inicio' },
  { href: '/pendientes', icon: Clock, label: 'Pendientes' },
  { href: '/cerradas', icon: Archive, label: 'Cerradas' },
  { href: '/estadisticas', icon: BarChart3, label: 'Stats' },
  { href: '/admin', icon: Settings, label: 'Admin' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  // Filter admin nav
  const visibleNav = user.role === 'admin'
    ? navItems
    : navItems.filter(i => i.href !== '/admin')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Control Marketplace</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">{user.full_name}</span>
                {user.role === 'admin' && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:block">Salir</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-stretch max-w-5xl mx-auto">
          {visibleNav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                  active
                    ? 'text-green-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className={clsx('w-5 h-5', active && 'text-green-600')} />
                <span className={clsx('text-xs font-medium', active ? 'text-green-600' : 'text-gray-400')}>
                  {label}
                </span>
                {active && (
                  <div className="absolute bottom-0 h-0.5 w-8 bg-green-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
