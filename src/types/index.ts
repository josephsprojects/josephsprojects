export type Role = 'platform_owner' | 'workspace_owner' | 'manager' | 'patient' | 'provider'
export type MedStatus = 'active' | 'on_hold' | 'discontinued' | 'archived'
export type RRStatus = 'pending' | 'submitted' | 'at_prescriber' | 'at_pharmacy' | 'ready' | 'picked_up' | 'denied'

export interface AuthUser {
  id: string
  supabase_id: string
  email: string
  name: string
  role: Role
  initials?: string
  color?: string
}

export interface Workspace {
  id: string
  name: string
  type: string
  description?: string
  status: string
  created_at: string
}

export interface Patient {
  id: string
  workspace_id: string
  name: string
  dob?: string
  relationship?: string
  allergies: string
  emergency_name?: string
  emergency_phone?: string
  notes?: string
  initials?: string
  color: string
  status: string
}

export interface Provider {
  id: string
  npi?: string
  name: string
  specialty?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

export interface Pharmacy {
  id: string
  npi?: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

export interface Medication {
  id: string
  workspace_id: string
  patient_id: string
  provider_id?: string
  pharmacy_id?: string
  name: string
  generic?: string
  dosage?: string
  actual_dose?: string
  form: string
  frequency?: string
  instructions?: string
  purpose?: string
  status: MedStatus
  quantity: number
  days_supply: number
  refills: number
  last_fill?: string
  notes?: string
}

export interface RefillRequest {
  id: string
  workspace_id: string
  patient_id: string
  medication_id?: string
  status: RRStatus
  method: string
  notes?: string
  created_at: string
}

export interface Notification {
  id: string
  workspace_id: string
  type: string
  title: string
  message: string
  status: 'read' | 'unread'
  color: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_name?: string
  action: string
  entity_type: string
  entity_name?: string
  field?: string
  from_value?: string
  to_value?: string
  created_at: string
}

// ── Search result types ────────────────────────────────────────────────────────
export interface NPIResult {
  npi: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  phone: string
}

export interface PharmacyResult {
  npi?: string
  name: string
  address: string
  city: string
  state: string
  phone: string
}

export interface MedSearchResult {
  name: string       // Display name (brand preferred, else generic)
  brand?: string     // Brand name if available
  generic: string    // Generic/ingredient name
  rxcui?: string
  strengths?: string[]
  forms?: string[]
}

// ── API response wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
