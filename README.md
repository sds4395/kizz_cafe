# 🎈 우리동네 키즈카페 (Kids Cafe Finder)

원하는 동네(시/도, 구, 동 등)를 입력하면 **근처 대형 키즈카페**를 지도와 목록으로 찾아주는 모바일 웹입니다.
기본 데이터(시드)로 시작하고, 사용자가 알고 있는 키즈카페를 **직접 추가**하면 모두에게 공유됩니다.

- **지도**: 카카오맵 (주소 → 좌표 자동 변환, 거리순 정렬)
- **공유 DB**: Supabase (모든 사용자가 추가/조회)
- **배포**: Vercel (URL 공유)

> ⚠️ 기본 시드 데이터의 좌표/전화번호는 **대략적인 샘플 값**입니다. 실제 정보와 다를 수 있으니
> 사용자 추가 기능으로 보강하세요. (네이버 지도 실시간 크롤링은 이용약관 위반이라 포함하지 않았습니다.)

---

## 1. 로컬 실행

```bash
npm install
cp .env.example .env      # 그리고 아래 키 값을 채웁니다
npm run dev               # http://localhost:5173
```

### 환경변수 (`.env`)

| 변수 | 설명 |
|------|------|
| `VITE_KAKAO_MAP_KEY` | 카카오 개발자 → 내 애플리케이션 → 앱 키 → **JavaScript 키** |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` 키 |

> 키가 없어도 앱은 실행되며 시드 데이터/지도만 동작합니다. **추가 기능은 Supabase 키가 있어야** 켜집니다.

---

## 2. 카카오맵 설정

1. https://developers.kakao.com → 로그인 → **애플리케이션 추가**
2. **앱 키 → JavaScript 키**를 복사해 `VITE_KAKAO_MAP_KEY` 에 입력
3. **플랫폼 → Web → 사이트 도메인 등록** (JS 키는 등록된 도메인에서만 동작)
   - 로컬: `http://localhost:5173`
   - 배포 후: `https://<your-app>.vercel.app` (Vercel 도메인 확정 후 반드시 추가)
4. **카카오맵 / 로컬(검색) API 사용 설정**을 활성화 (주소·키워드 검색에 필요)

---

## 3. Supabase 설정 (공유 백엔드)

1. https://supabase.com → 새 프로젝트 생성
2. **SQL Editor** 에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 붙여넣고 실행
   - `kids_cafes` 테이블 + RLS 정책(공개 읽기/입력) 생성
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 `.env` 에 입력

테이블 스키마:

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid | 자동 생성 |
| `name` | text | 이름(필수) |
| `region` | text | 지역 라벨 |
| `address` | text | 주소(필수) |
| `lat`, `lng` | double | 좌표 |
| `description` | text | 설명 |
| `features` | text[] | 특징 태그 |
| `phone` | text | 선택 |
| `created_at` | timestamptz | 자동 |

---

## 4. Vercel 배포 (URL 공유)

### 방법 A — GitHub 연동 (권장)

```bash
git init && git add -A && git commit -m "feat: kids cafe finder"
# GitHub에 새 저장소를 만든 뒤
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

1. https://vercel.com → **Add New → Project → GitHub 저장소 선택**
2. Framework: **Vite** 자동 인식 (Build: `npm run build`, Output: `dist`)
3. **Environment Variables** 에 위 3개 키(`VITE_KAKAO_MAP_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) 추가
4. **Deploy** → 발급된 `https://<app>.vercel.app` 이 공유 URL
5. ⚠️ 발급된 도메인을 **카카오 개발자 콘솔의 Web 플랫폼 사이트 도메인**에 추가 (안 하면 지도가 안 뜹니다)

### 방법 B — CLI

```bash
npm i -g vercel
vercel            # 최초 배포 (환경변수 입력)
vercel --prod     # 프로덕션 배포
```

---

## 5. 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | 유닛 테스트(vitest) |

---

## 6. 폴더 구조

```
src/
├── components/     SearchBar, MapView, CafeCard, CafeList, AddCafeForm
├── hooks/          useKakaoLoader, useCafes
├── lib/            types, distance(+test), supabase, kakao(지오코딩)
├── data/           seedCafes (기본 데이터)
├── styles/         global.css (디자인 토큰)
└── App.tsx / main.tsx
supabase/schema.sql  DB 스키마 + RLS
```

## 7. 앞으로 개선하면 좋은 것

- 사용자 추가 시 스팸 방지(간단 인증/신고 기능)
- 반경 필터·필터 태그(주차/영유아전용 등) UI
- 즐겨찾기(로컬 저장)와 상세 페이지
- 시드 데이터를 실제 확인된 정보로 교체
