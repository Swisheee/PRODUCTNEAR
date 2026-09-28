# 구현 현황 — 0.1.0

이 저장소는 빈 저장소에서 시작한 첫 개발 결과입니다. **작업지시서 전체 완료판이 아닙니다.** 연결 전에도 검토 가능한 화면과 실제 백엔드로 이어지는 핵심 흐름을 먼저 구현했습니다.

## 구현된 기능

- 반응형 한국어 홈, 탐색, 사람/제품/동호회 검색, 제품 상세, 장비 상세, 프로필, 알림, 로그인, 설정.
- 이메일 가입/로그인/로그아웃, Supabase OAuth 제공자 구성, 쿠키 refresh, 초대 목적지 유지, 기본 온보딩.
- 동호회 생성, 공개 가입, 승인 신청/승인, 초대 링크 생성/수락, Web Share API, 피드/장비/멤버/정보 탭.
- 전체 domain schema와 RLS: Product/UserGear/Offer 분리, 비공개 동호회, 장비 공개 범위, private Storage 정책.
- 제품 검색 선택 / 구매 URL 검증 후 수동 확인 / 직접 등록. 정확 정규화명 중복 방지. 장비 경험·장단점·재구매 의향 저장.
- 장비 사진 업로드, 공개 범위 변경, 장비 삭제, 경험 신고.
- 제품 전체 사용자/특정 사용자에게 질문, 답변, DB 트리거 알림, 읽음 처리.
- Commerce interface/registry, generic 원본 URL, 쿠팡·링크프라이스 비활성 scaffold, DirectMerchant tracking adapter.
- 구매처 가격/배송비 표시, `/go` 클릭 저장·리다이렉트, 전환 데이터 구조.
- 운영자 접근 제어, 기본 집계, provider 상태, 감사 로그를 남기는 제품 병합.
- 동호회 가입/장비 등록/질문 생성 이벤트를 트리거로 수집.
- PWA manifest, 정적 오프라인 안내, 로딩/빈 화면/오류 상태, 공통 보안 헤더, 입력 검증, DB 기반 콘텐츠 쓰기 제한.
- 키 없이 실행하는 읽기 전용 데모, 로컬 Supabase 설정, 명시적인 가짜 데모 계정 시드.

## 실제 검증 범위

- Next.js production build, TypeScript, ESLint.
- PostgreSQL(PGlite)의 schema, RLS, 제한된 열 UPDATE 권한, 초대·가입·장비·질문·답변·알림·병합·클릭 및 Storage 정책.
- URL validation, OAuth 복귀 경로, 비연결 commerce fallback unit tests.
- 데스크톱 및 모바일 데모 UI의 Playwright tests.
- Supabase 실서비스/Auth gateway/실제 Storage 업로드/소셜 로그인은 외부 프로젝트가 없어 아직 미검증. 관련 live E2E는 환경이 준비되지 않으면 skip.

## 다음 개발 순서

1. **Supabase 프로젝트 연결과 실서비스 통합 검증.** SQL 적용, 이메일·OAuth 제공자, 사진 업로드, 2인 초대/질문/답변 E2E, 운영 비밀 설정.
2. **커뮤니티와 프로필 완성.** 프로필/동호회 사진, 동호회 수정·탈퇴·운영진 역할 관리, 초대 폐기·QR, 비밀번호 재설정, 계정 삭제, 프로필 답변 탭, 경험 수정.
3. **상품 탐색 고도화.** GTIN/provider ID/모델/alias 후보 매칭, 유사 상품 선택 UX, 전체 DB 검색·페이지네이션, 동호회 브랜드/포지션/기간 필터 및 인기·재구매 정렬. 현재 카탈로그 최대 60개/피드 100개 조회 및 최근순 중심이며 count는 조회 가능한 결과 기준.
4. **실제 commerce integration.** 제공자의 공식 API·계약 확인 후 Coupang/LinkPrice 호출, 허용된 OG resolver, timeout/circuit breaker/cache, DirectMerchant 설정 및 서명 검증 webhook, 전환 idempotency/정산 CSV.
5. **관리자 운영 기능 확대.** Users/Clubs/Brands/Categories/Merchants/Offers CRUD, 신고 처리·콘텐츠 moderation, 운영 로그, 전체 퍼널·CTR·GMV·수수료 집계. 현재는 기본 집계·상태·제품 병합만 UI 구현.
6. **출시 준비.** 관측성/Sentry, 접근성 전체 점검, 익명 click abuse 방어, 보존/탈퇴 정책, orphan 파일 정리, pagination, 실기기 PWA 아이콘·설치 테스트, Vercel preview/production 배포.

## 의도적으로 하지 않은 일

없는 API의 가짜 성공 응답, 데모를 실제 데이터로 표시, 검증되지 않은 판매가격 생성, 수수료 기반 추천 정렬, 무단 스크래핑, 자체 결제, 사용자 수수료 보상은 구현하지 않았습니다.

## 최초 커밋 검증 기록

- `npm run lint`: 통과 (경고 없음)
- `npm run typecheck`: 통과
- `npm test`: 30개 통과
- `npm run build`: Next.js production build 통과
- `npm run test:e2e`: 프로덕션 서버 기준 12개 통과 (desktop 6, mobile 6)
- Supabase live E2E 2개: 환경 미설정으로 명시적 skip
- desktop/mobile 홈 화면 캡처 및 육안 검토
