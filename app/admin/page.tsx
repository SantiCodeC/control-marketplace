'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import { User, UserRole } from '@/types'
import { hashPin } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Settings, Plus, Pencil, Trash2, RefreshCw, X, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

interface UserForm {
  full_name: string
  username: string
  pin: string
  role: UserRole
}

const emptyForm: UserForm = { full_name: '', username: '', pin: '', role: 'asesor' }

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name')
    if (!error) setUsers((data ?? []) as User[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (!user) return null
  if (user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Acceso solo para administradores</p>
        </div>
      </AppLayout>
    )
  }

  const openCreate = () => {
    setEditUser(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ full_name: u.full_name, username: u.username, pin: '', role: u.role })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.username.trim()) {
      toast.error('Completá nombre y usuario')
      return
    }
    if (!editUser && !form.pin.trim()) {
      toast.error('El PIN es obligatorio para nuevos asesores')
      return
    }
    if (form.pin && (form.pin.length < 4 || form.pin.length > 8)) {
      toast.error('El PIN debe tener entre 4 y 8 caracteres')
      return
    }
    setSaving(true)
    try {
      const payload: Partial<User> = {
        full_name: form.full_name.trim(),
        username: form.username.toLowerCase().trim(),
        role: form.role,
      }
      if (form.pin) {
        payload.pin_hash = await hashPin(form.pin)
      }
      if (editUser) {
        const { error } = await supabase.from('users').update(payload).eq('id', editUser.id)
        if (error) throw error
        toast.success('Asesor actualizado')
      } else {
        const { error } = await supabase.from('users').insert({ ...payload, active: true })
        if (error) {
          if (error.code === '23505') {
            toast.error('Ese nombre de usuario ya existe')
            return
          }
          throw error
        }
        toast.success('Asesor creado')
      }
      setShowForm(false)
      fetchUsers()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u: User) => {
    const action = u.active ? 'desactivar' : 'activar'
    if (!confirm(`¿${action} a ${u.full_name}?`)) return
    const { error } = await supabase.from('users').update({ active: !u.active }).eq('id', u.id)
    if (error) toast.error('Error')
    else { toast.success(`Usuario ${u.active ? 'desactivado' : 'activado'}`); fetchUsers() }
  }

  const handleDelete = async (u: User) => {
    if (!confirm(`¿Eliminar a ${u.full_name}? Se borrarán TODAS sus publicaciones.`)) return
    const { error } = await supabase.from('users').delete().eq('id', u.id)
    if (error) toast.error('Error al eliminar')
    else { toast.success('Usuario eliminado'); fetchUsers() }
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Administración</h1>
              <p className="text-xs text-gray-500">{users.length} usuarios</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className={clsx(
                'bg-white rounded-xl border border-gray-200 p-4',
                !u.active && 'opacity-60'
              )}>
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  )}>
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{u.full_name}</span>
                      <span className={clsx(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      )}>
                        {u.role}
                      </span>
                      {!u.active && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium"
                    >
                      {u.active ? '⏸' : '▶'}
                    </button>
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                {editUser ? 'Editar asesor' : 'Nuevo asesor'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ej: María García"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="Ej: maria_garcia"
                  autoCapitalize="none"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PIN {editUser && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type="text"
                  value={form.pin}
                  onChange={e => setForm(p => ({ ...p, pin: e.target.value }))}
                  placeholder="4-8 dígitos"
                  maxLength={8}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"
                >
                  <option value="asesor">Asesor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : editUser ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
