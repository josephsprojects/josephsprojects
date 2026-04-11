import type { MedSearchResult } from '@/types'

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST'

// Extract brand from "Drug Strength Form [Brand]"
function extractBrand(name: string): string | null {
  const match = name.match(/\[(.+?)\]/)
  return match ? match[1].trim() : null
}

// Extract full generic ingredient string from SBD/SCD name
// e.g. "Amphetamine Aspartate 1.25 MG / Amphetamine Sulfate 1.25 MG ... [Adderall XR]"
// → "Amphetamine Aspartate / Amphetamine Sulfate / Dextroamphetamine Saccharate / Dextroamphetamine Sulfate"
function extractFullGeneric(name: string): string {
  // Remove bracketed brand
  const withoutBrand = name.replace(/\s*\[.+?\]/, '').trim()
  // Split on " / " to get each ingredient component
  const parts = withoutBrand.split(' / ')
  // For each part, strip the strength (numbers + units) and form info
  const ingredients = parts.map(p => {
    // Remove strength: "Amphetamine Aspartate 1.25 MG" → "Amphetamine Aspartate"
    const trimmed = p.replace(/\s+[\d.]+\s*(MG|MCG|MEQ|UNIT|MG\/ML|%)[^/]*/i, '').trim()
    // Remove trailing form words (Extended Release, Oral Tablet, Capsule, etc.)
    return trimmed.replace(/\s+(Extended Release|Oral|Tablet|Capsule|Solution|Injection|Patch|Cream|Gel|Spray|Inhaler|HR|Hour|Delayed|Release|Film|Coated|Sublingual|Chewable|Disintegrating)\b.*/i, '').trim()
  }).filter(Boolean)
  return [...new Set(ingredients)].join(' / ')
}

// Use approximateTerm API — better for partial/short queries
// Limits parallel property fetches to top 8 to avoid timeouts
async function approximateSearch(query: string): Promise<Array<{ rxcui: string; name: string; tty: string }>> {
  try {
    const res = await fetch(
      `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=20`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const candidates: Array<{ rxcui: string; score: string }> = data?.approximateGroup?.candidate ?? []
    if (candidates.length === 0) return []

    // Deduplicate rxcuis, fetch properties for top 8 only
    const seen = new Set<string>()
    const top = candidates.filter(c => { if (seen.has(c.rxcui)) return false; seen.add(c.rxcui); return true }).slice(0, 8)
    const props = await Promise.all(
      top.map(async c => {
        try {
          const r = await fetch(`${RXNORM_BASE}/rxcui/${c.rxcui}/properties.json`, { next: { revalidate: 86400 } })
          if (!r.ok) return null
          const d = await r.json()
          const name = d?.properties?.name as string
          const tty  = d?.properties?.tty  as string
          if (!name) return null
          return { rxcui: c.rxcui, name, tty: tty || '' }
        } catch { return null }
      })
    )
    return props.filter((p): p is { rxcui: string; name: string; tty: string } => !!p)
  } catch { return [] }
}

// For very short queries (2-3 chars), use the Prescribe endpoint which does prefix matching
async function prefixSearch(query: string): Promise<MedSearchResult[]> {
  try {
    const [brandRes, ingRes] = await Promise.all([
      fetch(`${RXNORM_BASE}/Prescribe/drugs.json?name=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } }),
      fetch(`${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } }),
    ])
    const results: MedSearchResult[] = []
    const seenNames = new Set<string>()
    for (const res of [brandRes, ingRes]) {
      if (!res.ok) continue
      const data = await res.json()
      const groups: any[] = data?.drugGroup?.conceptGroup ?? []
      for (const group of groups) {
        for (const item of group?.conceptProperties ?? []) {
          const rawName: string = item.name || ''
          const brand = extractBrand(rawName)
          const generic = extractFullGeneric(rawName)
          const display = brand || generic
          const key = display.toLowerCase()
          if (!display || seenNames.has(key)) continue
          seenNames.add(key)
          results.push({ name: display, brand: brand || undefined, generic: generic || display, rxcui: item.rxcui })
          if (results.length >= 15) return results
        }
      }
    }
    return results
  } catch { return [] }
}

export async function searchMedications(query: string): Promise<MedSearchResult[]> {
  if (!query || query.length < 2) return []

  try {
    const results: MedSearchResult[] = []
    const seenNames = new Set<string>()

    // For short queries (2-3 chars), try prefixSearch + approximateTerm in parallel
    // drugs.json requires near-exact matches so it returns nothing for short partial queries
    if (query.length <= 3) {
      const [prefixResults, approxResults] = await Promise.all([
        prefixSearch(query),
        approximateSearch(query),
      ])
      for (const r of prefixResults) {
        const key = (r.brand || r.name).toLowerCase()
        if (!seenNames.has(key)) { seenNames.add(key); results.push(r) }
      }
      for (const r of approxResults) {
        if (['SBD','SBDF','SBDG'].includes(r.tty)) {
          const brand = extractBrand(r.name)
          const generic = extractFullGeneric(r.name)
          const display = brand || generic
          const key = display.toLowerCase()
          if (display && !seenNames.has(key)) {
            seenNames.add(key)
            results.push({ name: display, brand: brand || undefined, generic: generic || display, rxcui: r.rxcui })
          }
        } else if (r.tty === 'BN' || r.tty === 'IN') {
          const key = r.name.toLowerCase()
          if (!seenNames.has(key)) { seenNames.add(key); results.push({ name: r.name, brand: r.tty === 'BN' ? r.name : undefined, generic: r.name, rxcui: r.rxcui }) }
        }
        if (results.length >= 15) break
      }
      return results.slice(0, 15)
    }

    // Primary: drugs.json — grouped by concept type, best for full name searches
    const drugsRes = await fetch(
      `${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    )

    if (drugsRes.ok) {
      const data = await drugsRes.json()
      const groups: any[] = data?.drugGroup?.conceptGroup ?? []

      // Pass 1: SBD / SBDF / SBDG — Semantic Branded Drugs (highest priority — includes XR, IR, CD, ER, etc.)
      for (const group of groups) {
        if (!['SBD', 'SBDF', 'SBDG'].includes(group.tty)) continue
        for (const item of group?.conceptProperties ?? []) {
          const rawName: string = item.name || ''
          const brand   = extractBrand(rawName)
          const generic = extractFullGeneric(rawName)
          const display = brand || generic
          const key     = display.toLowerCase()
          if (!display || seenNames.has(key)) continue
          seenNames.add(key)
          results.push({ name: display, brand: brand || undefined, generic: generic || display, rxcui: item.rxcui })
        }
      }

      // Pass 2: BN — Brand Name only (e.g. "Adderall", "Ozempic")
      for (const group of groups) {
        if (group.tty !== 'BN') continue
        for (const item of group?.conceptProperties ?? []) {
          const name = (item.name || '').trim()
          const key  = name.toLowerCase()
          if (!name || seenNames.has(key)) continue
          seenNames.add(key)
          results.push({ name, brand: name, generic: item.synonym || name, rxcui: item.rxcui })
        }
      }

      // Pass 3: IN — Ingredient (pure generics, full name like "mixed amphetamine salts")
      for (const group of groups) {
        if (group.tty !== 'IN') continue
        for (const item of group?.conceptProperties ?? []) {
          const name = (item.name || '').trim()
          const key  = name.toLowerCase()
          if (!name || seenNames.has(key)) continue
          seenNames.add(key)
          results.push({ name, generic: name, rxcui: item.rxcui })
        }
      }

      // Pass 4: SCD / SCDF — Semantic Clinical Drug (generic with strength, fallback)
      if (results.length < 6) {
        for (const group of groups) {
          if (!['SCD', 'SCDF'].includes(group.tty)) continue
          for (const item of group?.conceptProperties ?? []) {
            const rawName = item.name || ''
            const generic = extractFullGeneric(rawName)
            const key     = generic.toLowerCase()
            if (!generic || seenNames.has(key)) continue
            seenNames.add(key)
            results.push({ name: generic, generic, rxcui: item.rxcui })
            if (results.length >= 15) break
          }
          if (results.length >= 15) break
        }
      }
    }

    // Secondary: approximateTerm — better for short/partial/misspelled queries
    if (results.length < 5) {
      const approxResults = await approximateSearch(query)
      for (const r of approxResults) {
        const tty = (r as any).tty || ''
        if (['SBD', 'SBDF', 'SBDG'].includes(tty)) {
          const brand   = extractBrand(r.name)
          const generic = extractFullGeneric(r.name)
          const display = brand || generic
          const key     = display.toLowerCase()
          if (display && !seenNames.has(key)) {
            seenNames.add(key)
            results.push({ name: display, brand: brand || undefined, generic: generic || display, rxcui: r.rxcui })
          }
        } else {
          const key = r.name.toLowerCase()
          if (r.name && !seenNames.has(key)) {
            seenNames.add(key)
            results.push({ name: r.name, generic: r.name, rxcui: r.rxcui })
          }
        }
        if (results.length >= 15) break
      }
    }

    // Spelling suggestions fallback
    if (results.length === 0) {
      const spellRes = await fetch(
        `${RXNORM_BASE}/spellingsuggestions.json?name=${encodeURIComponent(query)}`,
        { next: { revalidate: 3600 } }
      )
      if (spellRes.ok) {
        const data = await spellRes.json()
        const suggestions: string[] = data?.suggestionGroup?.suggestionList?.suggestion ?? []
        for (const s of suggestions.slice(0, 5)) {
          const key = s.toLowerCase()
          if (!seenNames.has(key)) {
            seenNames.add(key)
            results.push({ name: s, generic: s })
          }
        }
      }
    }

    return results.slice(0, 15)
  } catch (e) {
    console.error('RxNorm search error:', e)
    return []
  }
}

// Fetch available dosage strengths for a given rxcui
export async function getDosageStrengths(rxcui: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=SBD+SBDF+SCD+SCDF`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const groups: any[] = data?.relatedGroup?.conceptGroup ?? []
    const strengths = new Set<string>()
    for (const g of groups) {
      for (const item of g?.conceptProperties ?? []) {
        const name: string = item.name || ''
        // Extract strength: e.g. "10 MG", "5 MG/ML", "0.1 MG/ACT"
        const match = name.match(/[\d.]+\s*(MG|MCG|MEQ|UNIT|MG\/ML|MG\/ACT|%)/i)
        if (match) strengths.add(match[0].toUpperCase())
      }
    }
    return Array.from(strengths).sort((a, b) => parseFloat(a) - parseFloat(b))
  } catch { return [] }
}

export async function getMedDetails(rxcui: string) {
  try {
    const r = await fetch(`${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=SBD+SCD`, { next: { revalidate: 86400 } })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}
