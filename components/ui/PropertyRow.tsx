'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { DashboardProperty, User } from '@/types'
import { CheckCircle2, Circle, Copy, CheckCheck, Home, BedDouble, Tag } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  property: DashboardProperty
  currentUser: User
  allUsers: User[]
  onUpdate: () => void
  isAdmin: boolean
  onEdit?: (property: DashboardProperty) => void
  onClose?: (property: DashboardProperty) => void
  onDelete?: (property: DashboardProperty) => void
}

export default function PropertyRow({
  property,
  currentUser,
  allUsers,
  onUpdate,
  isAdmin,
  onEdit,
  onClose,
  onDelete,
}: Props) {
  const [loadingPublish, setLoadingPublish] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const supabase = createClient()

  const myPublication = property.publications.find(p => p.user_id === currentUser.id)
  const isPublishedByMe = !!myPublication

  const handlePublish = async () => {
    if (isPublishedByMe) return
    setLoadingPublish(true)
    try {
      // Copy description to clipboard
      await navigator.clipboard.writeText(property.description)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // Save to DB
      const { error } = await supabase.from('property_publications').insert({
        property_id: property.id,
        user_id: currentUser.id,
      })
      if (error) throw error

      toast.success('¡Descripción copiada y publicación registrada!')
      onUpdate()
    } catch {
      toast.error('Error al registrar publicación')
    } finally {
      setLoadingPublish(false)
    }
  }

  const publishedUsers = allUsers.filter(u =>
    property.publications.some(p => p.user_id === u.id)
  )
  const publishedCount = publishedUsers.length
  const totalAdvisors = allUsers.length

  return (
    <div className={clsx(
      'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
      property.all_published ? 'border-green-200' : 'border-gray-200',
      property.status === 'cerrada' && 'opacity-70'
    )}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm">
                <Home className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
              {property.all_published && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  SUBIDA
                </span>
              )}
              {property.status === 'cerrada' && (
                <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  CERRADA
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                {property.bedrooms} dorm.
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {property.type === 'venta' ? 'Venta' : 'Alquiler'}
              </span>
              <span className="text-gray-400">
                {property.captador?.full_name ?? 'Desconocido'}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-gray-700">
              {publishedCount}/{totalAdvisors}
            </div>
            <div className="text-xs text-gray-400">publicaron</div>
            <div className="w-14 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${totalAdvisors ? (publishedCount / totalAdvisors) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">Descripción</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* MY publish button */}
          {property.status === 'activa' && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Mi publicación</p>
              {isPublishedByMe ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-green-700">Ya la publiqué ✓</span>
                </div>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={loadingPublish}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {loadingPublish ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : copied ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {loadingPublish ? 'Guardando...' : copied ? '¡Copiado!' : 'Copiar y marcar como publicada'}
                </button>
              )}
            </div>
          )}

          {/* Who published */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Estado por asesor</p>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.map(u => {
                const pub = property.publications.find(p => p.user_id === u.id)
                return (
                  <div
                    key={u.id}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
                      pub ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                    )}
                  >
                    {pub ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    )}
                    <span className="truncate">{u.full_name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex gap-2 pt-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(property)}
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Editar
                </button>
              )}
              {onClose && property.status === 'activa' && (
                <button
                  onClick={() => onClose(property)}
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(property)}
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
