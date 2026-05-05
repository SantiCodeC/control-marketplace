import { createClient } from '@/lib/supabase/client'
import { User } from '@/types'

// Simple PIN hash (SHA-256 via Web Crypto)
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'control_marketplace_salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function loginWithPin(username: string, pin: string): Promise<User | null> {
  const supabase = createClient()
  const pinHash = await hashPin(pin)

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase().trim())
    .eq('pin_hash', pinHash)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data as User
}

export function saveSession(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cm_user', JSON.stringify(user))
  }
}

export function getSession(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cm_user')
    if (stored) {
      try {
        return JSON.parse(stored) as User
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cm_user')
  }
}
