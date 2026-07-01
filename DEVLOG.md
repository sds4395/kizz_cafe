# DEVLOG — 개발 일지

두 PC를 오가며 연속성 있게 개발하기 위한 인수인계 노트.
**세션을 마칠 때 맨 위 "현재 상태 / 다음 할 일"을 갱신하고 commit & push. 시작할 땐 `git pull` 후 이 파일부터 읽는다.**

---

## 현재 상태 (2026-07-01 기준)

- 새 PC(Windows) 개발 환경 세팅 **완료**: Node.js v24, GitHub CLI(로그인됨), 저장소 clone, `npm install`, 빌드 통과.
- `.env` 3개 값 모두 입력 완료. Supabase는 새 키 형식(`sb_publishable_...`)을 `VITE_SUPABASE_ANON_KEY`에 넣어 사용 중. `kids_cafes` 테이블 존재·조회 정상.
- `package.json`에 `allowScripts`(esbuild 사전 승인) 추가 — npm 11 install 자동화.
- `CLAUDE.md`, `DEVLOG.md` 신규 작성 (두 PC 교대 작업 체계 도입).

### 추가 폼 개선 완료 (이번 세션)
- **이름 검색 → 자동채움**: 추가 폼을 카카오 장소검색(`searchPlaces`) 기반으로 재설계. 이름 검색 → 후보 선택 시 이름·주소·전화·좌표·지역 자동 입력, 사용자는 설명만 작성. E2E 검증 완료(서울형 키즈카페 강동구 성내1동점 실제 등록).
- **카드 선택 시 상단 스크롤**: `App.onSelect`에서 `window.scrollTo({top:0, behavior:'smooth'})`. 헤드리스 미리보기는 smooth 애니메이션 미지원이지만 실기기 정상.
- **시드 데이터 제거**: `seedCafes.ts` 삭제, `useCafes`가 Supabase 데이터만 사용.
- ⚠️ 시간당 요금은 카카오 로컬 API가 미제공 → 설명란에 수기 입력하도록 안내(placeholder).

### 환경 메모
- 각 PC에서 `.env`는 직접 채워야 함(Git 미추적). 세 값: 카카오 JS 키, `https://sijtdpmslviphzwpowxx.supabase.co`, `sb_publishable_...` 키.
- ⚠️ Node를 새로 설치한 직후엔 실행 중이던 Claude Code/터미널 세션이 PATH를 못 물려받아 `npm`을 못 찾을 수 있음 → **앱/터미널 재시작**하면 해결.

## 다음 할 일 (TODO)

- [ ] Supabase의 `connection test` 등 테스트 행 정리 — 사용자가 대시보드에서 직접 삭제 예정(RLS에 delete 정책 없음, publishable 키로는 삭제 불가)
- [ ] README "7. 앞으로 개선하면 좋은 것" 항목 중 착수할 것 선택
  - 사용자 추가 스팸 방지(간단 인증/신고)
  - 반경 필터·태그 필터 UI
  - 즐겨찾기(로컬 저장) + 상세 페이지
  - 시드 데이터를 실제 확인된 정보로 교체

---

## 작업 로그 (최신이 위로)

### 2026-07-01
- 두 번째 PC 개발 환경 초기 세팅 및 교대-작업 문서(CLAUDE.md/DEVLOG.md) 추가.
- `.env` 3개 값 입력 후 `npm run dev`로 지도·Supabase 연동 실제 동작 확인(에러 0).
- 추가 폼 개선(이름검색 자동채움 / 카드선택 상단스크롤 / 시드제거) 구현·검증·커밋.
