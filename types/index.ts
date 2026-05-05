export type UserRole = 'admin' | 'asesor'
export type PropertyType = 'venta' | 'alquiler'
export type PropertyStatus = 'activa' | 'cerrada'

export interface User {
  id: string
  username: string
  full_name: string
  role: UserRole
  pin_hash: string
  created_at: string
  active: boolean
}

export interface Property {
  id: string
  address: string
  bedrooms: number
  type: PropertyType
  description: string
  captador_id: string
  captador?: User
  status: PropertyStatus
  created_at: string
}

export interface PropertyPublication {
  id: string
  property_id: string
  user_id: string
  published_at: string
  user?: User
  property?: Property
}

export interface DashboardProperty extends Property {
  publications: PropertyPublication[]
  all_published: boolean
}

export interface Stats {
  total_properties: number
  active_properties: number
  closed_properties: number
  advisors: AdvisorStat[]
}

export interface AdvisorStat {
  user: User
  published: number
  pending: number
  percentage: number
}
