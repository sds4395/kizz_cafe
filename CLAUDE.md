# CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**우리동네 키즈카페 (Kids Cafe Finder)** — 동네(시/도·구·동)를 입력하면 근처 대형 키즈카페를 지도와 목록으로 찾아주는 모바일 웹. 기본 시드 데이터로 시작하고, 사용자가 직접 추가한 카페는 Supabase를 통해 모두에게 공유된다.

- **스택**: Vite 5 + React 18 + TypeScript
- **지도**: 카카오맵 JS SDK (주소 → 좌표 지오코딩, 거리순 정렬)
- **공유 DB**: Supabase (`kids_cafes` 테이블, 공개 읽기/쓰기 RLS)
- **배포**: Vercel

## 명령어

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (http://localhost:5173) |
| `npm run build` | 타입체크(`tsc --noEmit`) + Vite 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | 유닛 테스트 (vitest, 1회 실행) |
| `npm run test:watch` | 테스트 watch 모드 |

> 커밋/PR 전에는 최소한 `npm run build`(타입체크 포함)와 `npm test`를 통과시킬 것.

## 아키텍처

데이터 흐름은 `App.tsx`가 중심이며 두 개의 훅이 상태를 공급한다:

- **`useKakaoLoader`** — 카카오맵 SDK 로드 상태(`loading`/`ready`/`error`)를 관리. `ready`가 되어야 지도·검색이 활성화됨.
- **`useCafes`** — 카페 목록 + 추가 로직. Supabase 키가 있으면 원격 DB, 없으면 시드 데이터만(`backendEnabled=false`)으로 동작. **키 없이도 앱은 뜬다.**

검색하면 `geocode()`(카카오)로 좌표를 얻고, 그 좌표 기준 `distanceKm()`로 목록을 거리순 정렬한다. 검색 전에는 원래 순서.

### 폴더 구조
```
src/
├── App.tsx / main.tsx        진입점 + 상태 오케스트레이션
├── components/               SearchBar, MapView, CafeCard, CafeList, AddCafeForm
├── hooks/                    useKakaoLoader, useCafes
├── lib/                      types, distance(+test), supabase, kakao(지오코딩)
├── data/seedCafes.ts         기본 시드 데이터
└── styles/global.css         디자인 토큰 + 전역 스타일
supabase/schema.sql           DB 스키마 + RLS 정책
```

핵심 타입은 [src/lib/types.ts](src/lib/types.ts) 참고 (`Cafe`, `GeoPoint`, `SearchResult`, `NewCafeInput`).

## 환경변수 (`.env`)

`.env`는 Git에 커밋되지 않는다(비밀 키). 각 PC에서 `.env.example`을 복사해 채운다.

| 변수 | 출처 |
|------|------|
| `VITE_KAKAO_MAP_KEY` | 카카오 개발자 콘솔 → JavaScript 키 (사용 도메인 등록 필요) |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public 키 |

## 컨벤션

- UI 문구·주석은 한국어. 기존 톤(친근한 존댓말)을 따른다.
- 에러는 화면 상단 배너(`banner-error`/`banner-warn`/`banner-info`)로 사용자에게 안내.
- 외부 키가 없을 때도 앱이 깨지지 않고 degrade 되도록 유지(지도/추가 기능만 비활성).

## 두 PC 교대 작업 (중요)

이 저장소는 두 대의 PC에서 번갈아 개발한다. 세션 연속성을 위해:

1. **세션 시작 시**: `git pull` 후 [DEVLOG.md](DEVLOG.md)를 읽고 직전 맥락을 파악한다.
2. **세션 종료 시**: DEVLOG.md의 "현재 상태 / 다음 할 일"을 갱신하고 코드와 함께 commit & push 한다.
3. 실험 중인 코드도 PC를 떠나기 전 커밋한다(`git stash`는 로컬에만 남아 다른 PC로 안 넘어감).
