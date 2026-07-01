import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** 한국시(Asia/Seoul) 기준 오늘 날짜 YYYY-MM-DD */
function todaySeoul(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

/**
 * 오늘(한국시)의 방문자수를 반환한다.
 * - 세션당 1회만 카운트(bump_visit RPC) → 새로고침으로 뻥튀기 방지.
 * - 이미 카운트한 세션이면 현재값만 조회.
 * - 날짜별로 daily_visits 테이블에 누적되며, 00시(KST)에 자연히 새 날짜로 리셋된다.
 */
export function useVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const sb = supabase
    if (!sb) return
    let active = true

    const run = async () => {
      const key = `visit-counted-${todaySeoul()}`
      try {
        if (sessionStorage.getItem(key)) {
          const { data } = await sb
            .from('daily_visits')
            .select('count')
            .eq('visit_date', todaySeoul())
            .maybeSingle()
          if (active) setCount((data?.count as number) ?? 0)
        } else {
          const { data, error } = await sb.rpc('bump_visit')
          if (!error) {
            sessionStorage.setItem(key, '1')
            if (active) setCount(typeof data === 'number' ? data : 0)
          }
        }
      } catch {
        /* 방문자수는 부가 기능이라 실패해도 조용히 무시 */
      }
    }
    run()
    return () => {
      active = false
    }
  }, [])

  return count
}
