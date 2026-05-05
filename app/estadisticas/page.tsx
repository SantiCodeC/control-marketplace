'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import { User, Property, PropertyPublication } from '@/types'
import toast from 'react-hot-toast'
import { BarChart3, TrendingUp, CheckCircle2, Clock, Archive } from 'lucide-react'
import clsx from 'clsx'

interface AdvisorStat {
  user: User
  published: number
  pending: number
  percentage: number
}

export default function EstadisticasPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [totalProps, setTotalProps] = useState(0)
  const [activeProps, setActiveProps] = useState(0)
  const [closedProps, setClosedProps] = useState(0)
  const [advisorStats, setAdvisorStats] = useState<AdvisorStat[]>([])
  const [globalPercent, setGlobalPercent] = useState(0)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: props } = await supabase.from('properties').select('id,status')
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('active', true)
        .eq('role', 'asesor')
        .order('full_name')
      const { data: pubs } = await supabase.from('property_publications').select('*')

      const allProps = (props ?? []) as Pick<Property, 'id' | 'status'>[]
      const advisors = (users ?? []) as User[]
      const allPubs = (pubs ?? []) as PropertyPublication[]

      const active = allProps.filter(p => p.status === 'activa')
      const closed = allProps.filter(p => p.status === 'cerrada')

      setTotalProps(allProps.length)
      setActiveProps(active.length)
      setClosedProps(closed.length)

      // Stats per advisor (only active properties)
      const stats: AdvisorStat[] = advisors.map(u => {
        const published = active.filter(p =>
          allPubs.some(pub => pub.property_id === p.id && pub.user_id === u.id)
        ).length
        const pending = active.length - published
        const percentage = active.length > 0 ? Math.round((published / active.length) * 100) : 0
        return { user: u, published, pending, percentage }
      })
      stats.sort((a, b) => b.percentage - a.percentage)
      setAdvisorStats(stats)

      // Global: out of all (advisor × active prop) combinations
      const totalCombinations = advisors.length * active.length
      const totalPublished = active.reduce((acc, p) => {
        return acc + advisors.filter(u =>
          allPubs.some(pub => pub.property_id === p.id && pub.user_id === u.id)
        ).length
      }, 0)
      setGlobalPercent(totalCombinations > 0 ? Math.round((totalPublished / totalCombinations) * 100) : 0)
    } catch {
      toast.error('Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!user) return null

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Estadísticas</h1>
            <p className="text-xs text-gray-500">Resumen general del sistema</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                bg="bg-blue-50"
                label="Total propiedades"
                value={totalProps}
              />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                bg="bg-green-50"
                label="Activas"
                value={activeProps}
              />
              <StatCard
                icon={<Archive className="w-5 h-5 text-gray-600" />}
                bg="bg-gray-50"
                label="Cerradas"
                value={closedProps}
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                bg="bg-amber-50"
                label="Completado global"
                value={`${globalPercent}%`}
                highlight={globalPercent === 100}
              />
            </div>

            {/* Global progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progreso general</span>
                <span className="text-sm font-bold text-green-600">{globalPercent}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${globalPercent}%` }}
                />
              </div>
            </div>

            {/* Advisor ranking */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Ranking de asesores</h2>
                <p className="text-xs text-gray-400">(solo propiedades activas)</p>
              </div>
              <div className="divide-y divide-gray-50">
                {advisorStats.map((stat, i) => (
                  <div key={stat.user.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-400'
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {stat.user.full_name}
                          </span>
                          <span className="text-xs font-bold text-green-600 ml-2">
                            {stat.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-green-600">{stat.published} publicadas</span>
                          <span className="text-xs text-gray-400">{stat.pending} pendientes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {advisorStats.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No hay asesores activos
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function StatCard({
  icon, bg, label, value, highlight
}: {
  icon: React.ReactNode
  bg: string
  label: string
  value: number | string
  highlight?: boolean
}) {
  return (
    <div className={clsx(
      'bg-white rounded-xl border p-4',
      highlight ? 'border-green-300' : 'border-gray-200'
    )}>
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-2', bg)}>
        {icon}
      </div>
      <div className={clsx('text-2xl font-bold', highlight ? 'text-green-600' : 'text-gray-900')}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
