import { useState, type FormEvent } from 'react'

interface Props {
  onSearch: (query: string) => void
  onClear: () => void
  searching: boolean
  activeLabel: string | null
  disabled: boolean
}

/** 주소 입력 → 검색, 그리고 현재 검색 초기화(전체보기) */
export function SearchBar({ onSearch, onClear, searching, activeLabel, disabled }: Props) {
  const [value, setValue] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (q) onSearch(q)
  }

  return (
    <form className="search-bar" onSubmit={submit}>
      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden>
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none">
              <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8" />
              <line x1="13.1" y1="13.1" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="search-input"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="동네 입력 (예: 서울 송파구 잠실동)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            aria-label="주소 검색"
          />
        </div>
        <button className="search-btn" type="submit" disabled={disabled || searching}>
          {searching ? '찾는 중…' : '검색'}
        </button>
      </div>
      {activeLabel && (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            setValue('')
            onClear()
          }}
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true" style={{ marginRight: 4 }}>
            <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          ‘{activeLabel}’ 근처 · 전체보기로 돌아가기
        </button>
      )}
    </form>
  )
}
