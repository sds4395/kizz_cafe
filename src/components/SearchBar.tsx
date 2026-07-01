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
            🔍
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
          ✕ ‘{activeLabel}’ 근처 · 전체보기로 돌아가기
        </button>
      )}
    </form>
  )
}
