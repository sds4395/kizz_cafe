import { useState, type FormEvent } from 'react'
import { geocode } from '../lib/kakao'
import type { NewCafeInput } from '../lib/types'

interface Props {
  onClose: () => void
  onSubmit: (input: NewCafeInput) => Promise<void>
}

/** 사용자가 직접 키즈카페를 추가하는 폼(모달). 주소는 좌표로 자동 변환된다 */
export function AddCafeForm({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('대형')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !address.trim()) {
      setError('이름과 주소는 필수예요.')
      return
    }
    setSubmitting(true)
    try {
      const geo = await geocode(address.trim())
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        region: region.trim() || geo.label,
        lat: geo.lat,
        lng: geo.lng,
        description: description.trim(),
        features: features
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        phone: phone.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '추가에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="키즈카페 추가">
      <div className="modal">
        <div className="modal-head">
          <h2>키즈카페 추가</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <form className="add-form" onSubmit={submit}>
          <label>
            이름 *
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 챔피언 키즈파크 잠실점" />
          </label>
          <label>
            주소 * <span className="hint">(입력 시 좌표 자동 변환)</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 서울 송파구 올림픽로 300" />
          </label>
          <label>
            지역 라벨
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 서울 송파구 (비우면 자동)" />
          </label>
          <label>
            특징 태그 <span className="hint">(쉼표로 구분)</span>
            <input value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="대형, 주차가능, 유아전용존" />
          </label>
          <label>
            전화번호
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-0000-0000" inputMode="tel" />
          </label>
          <label>
            설명
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="규모, 연령대, 이용 팁 등"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? '저장 중…' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
