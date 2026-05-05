'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import PropertyRow from '@/components/ui/PropertyRow'
import PropertyForm from '@/components/ui/PropertyForm'
import { DashboardProperty, User } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Search, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProperty, setEditProperty] = useState<DashboardProperty | undefined>()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch active properties with captador info
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*, captador:users!captador_id(id,full_name,username,role,active,created_at)')
        .eq('status', 'activa')
        .order('created_at', { ascending: false })

      if (propsError) throw propsError

      // Fetch all active advisors
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('active', true)
        .eq('role', 'asesor')
        .order('full_name')

      if (usersError) throw usersError

      // Fetch all publications
      const { data: pubs, error: pubsError } = await supabase
        .from('property_publications')
        .select('*')

      if (pubsError) throw pubsError

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
      toast.error('Error cargando propiedades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (property: DashboardProperty) => {
    if (!confirm(`¿Eliminar "${property.address}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('properties').delete().eq('id', property.id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Propiedad eliminada')
      fetchData()
    }
  }

  const handleClose = async (property: DashboardProperty) => {
    if (!confirm(`¿Marcar "${property.address}" como cerrada?`)) return
    const { error } = await supabase.from('properties').update({ status: 'cerrada' }).eq('id', property.id)
    if (error) {
      toast.error('Error')
    } else {
      toast.success('Propiedad cerrada')
      fetchData()
    }
  }

  if (!user) return null

  const filtered = properties.filter(p =>
    !search ||
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.captador?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Propiedades activas</h1>
            <p className="text-xs text-gray-500">{properties.length} propiedades</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditProperty(undefined); setShowForm(true) }}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por dirección o captador..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        {/* Properties list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏠</div>
            <p className="font-medium">{search ? 'Sin resultados' : 'No hay propiedades activas'}</p>
            <p className="text-sm mt-1">
              {!search && 'Agregá la primera propiedad con el botón "Nueva"'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <PropertyRow
                key={p.id}
                property={p}
                currentUser={user}
                allUsers={allUsers}
                onUpdate={fetchData}
                isAdmin={user.role === 'admin'}
                onEdit={user.role === 'admin' ? (prop) => { setEditProperty(prop); setShowForm(true) } : undefined}
                onClose={user.role === 'admin' ? handleClose : undefined}
                onDelete={user.role === 'admin' ? handleDelete : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property form modal */}
      {showForm && (
        <PropertyForm
          currentUser={user}
          property={editProperty}
          onClose={() => { setShowForm(false); setEditProperty(undefined) }}
          onSaved={fetchData}
        />
      )}
    </AppLayout>
  )
}
