'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Property, PropertyType, User } from '@/types'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Props {
  currentUser: User
  property?: Partial<Property>
  onClose: () => void
  onSaved: () => void
}

export default function PropertyForm({ currentUser, property, onClose, onSaved }: Props) {
  const isEdit = !!property?.id
  const [form, setForm] = useState({
    address: property?.address ?? '',
    bedrooms: property?.bedrooms ?? 1,
    type: (property?.type ?? 'venta') as PropertyType,
    description: property?.description ?? '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!form.address.trim() || !form.description.trim()) {
      toast.error('Completá dirección y descripción')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('properties')
          .update(form)
          .eq('id', property!.id)
        if (error) throw error
        toast.success('Propiedad actualizada')
      } else {
        const { error } = await supabase.from('properties').insert({
          ...form,
          captador_id: currentUser.id,
          status: 'activa',
        })
        if (error) throw error
        toast.success('Propiedad creada')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {isEdit ? 'Editar propiedad' : 'Nueva propiedad'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección *</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Ej: San Martín 1234, Barrio Norte"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dormitorios</label>
              <input
                type="number"
                min={0}
                max={20}
                value={form.bedrooms}
                onChange={e => setForm(p => ({ ...p, bedrooms: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as PropertyType }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción * <span className="text-gray-400 font-normal">(se copiará al publicar)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Escribí la descripción completa de la propiedad tal como se va a publicar en Marketplace..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear propiedad'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
