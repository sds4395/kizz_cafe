import { useEffect, useState } from 'react'
import { loadKakaoSdk } from '../lib/kakao'

type Status = 'loading' | 'ready' | 'error'

/** 카카오맵 SDK 로딩 상태를 관리하는 훅 */
export function useKakaoLoader() {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadKakaoSdk()
      .then(() => {
        if (active) setStatus('ready')
      })
      .catch((e: Error) => {
        if (!active) return
        setError(e.message)
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  return { status, error }
}
