import type { NPIResult } from '@/types'

const NPPES_BASE = 'https://npiregistry.cms.hhs.gov/api'

interface NPISearchParams {
  lastName: string
  firstName?: string
  city?: string
  state?: string
  zip?: string
  type?: 'NPI-1' | 'NPI-2'
  limit?: number
}

function parseNPIResult(p: any, type: string): NPIResult {
  const b = p.basic || {}
  const addrs = p.addresses || []
  const addr = addrs.find((a: any) => a.address_purpose === 'LOCATION') || addrs[0] || {}
  const tax = (p.taxonomies || []).find((t: any) => t.primary) || p.taxonomies?.[0] || {}

  const name = type === 'NPI-1'
    ? [b.last_name, b.first_name, b.credential].filter(Boolean).join(', ')
    : (b.organization_name || b.name || 'Unknown')

  return {
    npi: p.number || '',
    name,
    specialty: tax.desc || '',
    address: addr.address_1 || '',
    city: addr.city || '',
    state: addr.state || '',
    phone: addr.telephone_number || '',
  }
}

export async function searchProviders(params: NPISearchParams): Promise<NPIResult[]> {
  const { lastName, firstName, city, state, zip, type = 'NPI-1', limit = 25 } = params

  if (!lastName || lastName.length < 2) return []

  const buildUrl = (withState: boolean, withZip: boolean) => {
    const u = new URL(`${NPPES_BASE}/`)
    u.searchParams.set('version', '2.1')
    u.searchParams.set('enumeration_type', type)
    u.searchParams.set('limit', String(limit))
    u.searchParams.set('last_name', lastName)
    if (firstName) u.searchParams.set('first_name', firstName)
    if (withZip && zip) u.searchParams.set('postal_code', zip)
    else if (withState && state) u.searchParams.set('state', state.toUpperCase())
    return u.toString()
  }

  const doFetch = async (url: string): Promise<NPIResult[]> => {
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), 10000)
    try {
      const r = await fetch(url, { signal: ctrl.signal, next: { revalidate: 300 } })
      clearTimeout(tid)
      if (!r.ok) throw new Error(`NPPES HTTP ${r.status}`)
      const d = await r.json()
      return (d.results || []).map((p: any) => parseNPIResult(p, type))
    } finally { clearTimeout(tid) }
  }

  // City filter is client-side only (NPPES city param is unreliable)
  const filterByCity = (results: NPIResult[]) => {
    if (!city) return results
    const q = city.toLowerCase().trim()
    const filtered = results.filter(r => r.city.toLowerCase().includes(q))
    return filtered.length > 0 ? filtered : results
  }

  try {
    let results: NPIResult[] = []

    if (zip) {
      results = await doFetch(buildUrl(false, true))
    } else if (state) {
      results = await doFetch(buildUrl(true, false))
    } else {
      results = await doFetch(buildUrl(false, false))
    }

    if (results.length === 0 && (zip || state)) {
      // Fallback: nationwide
      results = await doFetch(buildUrl(false, false))
    }

    return filterByCity(results)
  } catch (e) {
    console.error('NPI search error:', e)
    return []
  }
}

export async function searchPharmacies(params: {
  name?: string
  city?: string
  state?: string
  zip?: string
  limit?: number
}) {
  const { name, city, state, zip, limit = 20 } = params

  const u = new URL(`${NPPES_BASE}/`)
  u.searchParams.set('version', '2.1')
  u.searchParams.set('enumeration_type', 'NPI-2')
  u.searchParams.set('taxonomy_description', 'pharmacy')
  u.searchParams.set('limit', String(limit))

  if (name) u.searchParams.set('organization_name', name + '*')
  if (zip) u.searchParams.set('postal_code', zip)
  else if (state) u.searchParams.set('state', state.toUpperCase())
  else if (city) u.searchParams.set('city', city.toUpperCase())

  try {
    const r = await fetch(u.toString(), { next: { revalidate: 300 } })
    if (!r.ok) return []
    const d = await r.json()
    return (d.results || []).map((p: any) => {
      const b = p.basic || {}
      const addr = (p.addresses || [])[0] || {}
      return {
        npi: p.number || '',
        name: b.organization_name || b.name || '',
        address: addr.address_1 || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.postal_code || '',
        phone: addr.telephone_number || '',
      }
    }).filter((p: any) => p.name)
  } catch (e) {
    console.error('Pharmacy search error:', e)
    return []
  }
}
