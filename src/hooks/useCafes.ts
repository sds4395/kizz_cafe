import { useCallback, useEffect, useState } from 'react'
import { seedCafes } from '../data/seedCafes'
import { supabase, CAFES_TABLE, isSupabaseConfigured } from '../lib/supabase'
import type { Cafe, NewCafeInput } from '../lib/types'

interface CafesState {
  cafes: Cafe[]
  loading: boolean
  error: string | null
  addCafe: (input: NewCafeInput) => Promise<void>
  backendEnabled: boolean
}

function rowToCafe(row: Record<string, unknown>): Cafe {
  return {
    id: String(row.id),
    name: String(row.name),
    region: String(row.region ?? ''),
    address: String(row.address ?? ''),
    lat: Number(row.lat),
    lng: Number(row.lng),
    description: String(row.description ?? ''),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    phone: row.phone ? String(row.phone) : undefined,
    source: 'user',
    createdAt: row.created_at ? String(row.created_at) : undefined,
  }
}

/** 시드 + 사용자 추가(Supabase) 키즈카페 목록을 병합해 제공한다 */
export function useCafes(): CafesState {
  const [userCafes, setUserCafes] = useState<Cafe[]>([])
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase
      .from(CAFES_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) {
          setError('공유 키즈카페 목록을 불러오지 못했어요.')
        } else if (data) {
          setUserCafes(data.map(rowToCafe))
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const addCafe = useCallback(async (input: NewCafeInput) => {
    if (!supabase) {
      throw new Error('공유 백엔드(Supabase)가 설정되지 않아 추가할 수 없어요.')
    }
    const { data, error: err } = await supabase
      .from(CAFES_TABLE)
      .insert({
        name: input.name,
        region: input.region,
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        description: input.description,
        features: input.features,
        phone: input.phone ?? null,
      })
      .select()
      .single()

    if (err) throw new Error(err.message)
    if (data) setUserCafes((prev) => [rowToCafe(data), ...prev])
  }, [])

  return {
    cafes: [...seedCafes, ...userCafes],
    loading,
    error,
    addCafe,
    backendEnabled: isSupabaseConfigured,
  }
}
