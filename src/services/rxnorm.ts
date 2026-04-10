import type { MedSearchResult } from '@/types'

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST'

export async function searchMedications(query: string): Promise<MedSearchResult[]> {
  if (!query || query.length < 2) return []

  try {
    const [drugsRes, spellRes] = await Promise.allSettled([
      fetch(`${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } }),
      fetch(`${RXNORM_BASE}/spellingsuggestions.json?name=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } }),
    ])

    const results: MedSearchResult[] = []
    const seen = new Set<string>()

    // Primary: drugs endpoint
    if (drugsRes.status === 'fulfilled' && drugsRes.value.ok) {
      const data = await drugsRes.value.json()
      const groups = data?.drugGroup?.conceptGroup ?? []
      for (const group of groups) {
        for (const item of group?.conceptProperties ?? []) {
          const name = item.name as string
          if (!name || seen.has(name.toLowerCase())) continue
          seen.add(name.toLowerCase())
          results.push({ name, generic: item.synonym || '', rxcui: item.rxcui })
        }
      }
    }

    // Fallback: spelling suggestions for autocomplete  
    if (drugsRes.status === 'rejected' || results.length === 0) {
      if (spellRes.status === 'fulfilled' && spellRes.value.ok) {
        const data = await spellRes.value.json()
        const suggestions = data?.suggestionGroup?.suggestionList?.suggestion ?? []
        for (const suggestion of suggestions.slice(0, 5)) {
          if (!seen.has(suggestion.toLowerCase())) {
            seen.add(suggestion.toLowerCase())
            results.push({ name: suggestion, generic: '' })
          }
        }
      }
    }

    return results.slice(0, 10)
  } catch (e) {
    console.error('RxNorm search error:', e)
    return []
  }
}

/** Get dosage forms and strengths for a specific RxCUI */
export async function getMedDetails(rxcui: string) {
  try {
    const r = await fetch(`${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=SBD+SCD`, {
      next: { revalidate: 86400 }
    })
    if (!r.ok) return null
    const data = await r.json()
    return data
  } catch { return null }
}
