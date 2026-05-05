'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import PropertyRow from '@/components/ui/PropertyRow'
import { DashboardProperty, User } from '@/types'
import toast from 'react-hot-toast'
import { Archive } from 'lucide-react'

export default function CerradasPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: props } = await supabase
        .from('properties')
        .select('*, captador:users!captador_id(id,full_name,username,role,active,created_at)')
        .eq('status', 'cerrada')
        .order('created_at', { ascending: false })

      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('active', true)
        .eq('role', 'asesor')
        .order('full_name')

      const { data: pubs } = await supabase
        .from('property_publications')
        .select('*')

      const advisors = (users ?? []) as User[]
      setAllUsers(advisors)

      const enriched: DashboardProperty[] = (props ?? []).map(p => {
        const publications = (pubs ?? []).filter(pub => pub.property_id === p.id)
        const all_published = advisors.length > 0 && advisors.every(u =>
          publications.some(pub => pub.user_id === u.id)
        )
        return { ...p, publications, all_published }
      })
      setProperties(enriched)
    } catch {
      toast.error('Error cargando propiedades cerradas')
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
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Archive className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Propiedades cerradas</h1>
            <p className="text-xs text-gray-500">{properties.length} propiedades archivadas</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📁</div>
            <p className="font-medium text-gray-600">Sin propiedades cerradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <PropertyRow
                key={p.id}
                property={p}
                currentUser={user}
                allUsers={allUsers}
                onUpdate={fetchData}
                isAdmin={user.role === 'admin'}
                onDelete={user.role === 'admin' ? async (prop) => {
                  if (!confirm(`¿Eliminar "${prop.address}"?`)) return
                  const { error } = await supabase.from('properties').delete().eq('id', prop.id)
                  if (error) toast.error('Error')
                  else { toast.success('Eliminada'); fetchData() }
                } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
