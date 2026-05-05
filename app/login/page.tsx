'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loginWithPin, saveSession } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { Building2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const handleLogin = async () => {
    if (!username.trim() || !pin.trim()) {
      toast.error('Completá usuario y PIN')
      return
    }
    setLoading(true)
    try {
      const user = await loginWithPin(username, pin)
      if (!user) {
        toast.error('Usuario o PIN incorrecto')
        return
      }
      saveSession(user)
      setUser(user)
      toast.success(`¡Bienvenido, ${user.full_name}!`)
      router.push('/dashboard')
    } catch {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Control Marketplace</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresá con tu usuario y PIN</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="tu_usuario"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-gray-50 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••"
                maxLength={8}
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-gray-50 text-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Control Marketplace — Sistema interno
        </p>
      </div>
    </div>
  )
}
