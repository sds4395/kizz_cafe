# DEVLOG — 개발 일지

두 PC를 오가며 연속성 있게 개발하기 위한 인수인계 노트.
**세션을 마칠 때 맨 위 "현재 상태 / 다음 할 일"을 갱신하고 commit & push. 시작할 땐 `git pull` 후 이 파일부터 읽는다.**

---

## 현재 상태 (2026-07-01 기준)

- 새 PC(Windows)에 개발 환경 세팅 완료: Node.js v24, GitHub CLI, 저장소 clone, `npm install`, 프로덕션 빌드 통과 확인.
- `package.json`에 `allowScripts`(esbuild 사전 승인) 추가됨 — npm 11에서 install 시 esbuild 스크립트 자동 승인용.
- `CLAUDE.md`, `DEVLOG.md` 신규 작성 (두 PC 교대 작업 체계 도입).
- ⚠️ 이 PC의 `.env`는 아직 미완성 — 카카오/Supabase 키 입력 필요(입력 시 지도·공유 DB 활성화).

## 다음 할 일 (TODO)

- [ ] `.env`에 실제 API 키 3개 입력 (VITE_KAKAO_MAP_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] README "7. 앞으로 개선하면 좋은 것" 항목 중 착수할 것 선택
  - 사용자 추가 스팸 방지(간단 인증/신고)
  - 반경 필터·태그 필터 UI
  - 즐겨찾기(로컬 저장) + 상세 페이지
  - 시드 데이터를 실제 확인된 정보로 교체

---

## 작업 로그 (최신이 위로)

### 2026-07-01
- 두 번째 PC 개발 환경 초기 세팅 및 교대-작업 문서(CLAUDE.md/DEVLOG.md) 추가.
