# 써본사람 · SSUBON

**“이 제품을 실제로 써본, 내가 믿을 수 있는 사람에게 물어보고 산다.”**

스포츠 동호회의 관계와 실제 장비 사용 경험을 기반으로 구매 결정을 돕는 모바일 우선 웹 앱입니다. 제품보다 **사용자 → 사용 맥락 → 질문 → 구매처**를 먼저 보여줍니다.

> **현재 버전: 개발 1차 구현.** 실제 Supabase CRUD와 RLS가 연결된 코드입니다. Supabase 미설정 시 명확히 표시된 읽기 전용 데모로 실행됩니다. 배포 완료나 외부 제휴 API 연동 완료를 의미하지 않습니다. 전체 요구사항 대비 범위는 [개발 현황](docs/STATUS.md)을 확인하세요.

## 빠른 실행 — 키 없이 화면 둘러보기

Node.js 22 이상을 권장합니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 엽니다. 환경변수가 비어 있으면 데모 인물·동호회·장비만 표시하며 회원가입·저장은 비활성화됩니다. 제품 아이콘은 이미지 미등록 상태를 나타내는 일러스트이며 실제 제품 사진이 아닙니다. 검증되지 않은 가격·재고·후기는 만들지 않습니다.

## 실제 로컬 Supabase 연결

Docker Desktop(실행 중)과 Supabase CLI가 필요합니다.

```bash
npx supabase start
npx supabase db reset
npx supabase status
```

출력된 API URL과 **anon key**를 `.env.local`에 입력합니다. secret/service-role 키를 anon key 자리에 넣지 마세요.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_OAUTH_PROVIDERS=
```

개발 서버를 재시작한 뒤 이메일 회원가입 → 프로필 → 동호회 생성 → 정보 탭에서 초대 링크를 만들 수 있습니다. 로컬에서는 이메일 확인을 꺼 두었습니다. 운영 프로젝트에서는 이메일 확인을 활성화하고 메일 전송 설정을 완료하세요.

### 로컬 데모 계정

`supabase db reset`은 로컬 DB를 초기화하고 아래 **가짜 데모 계정**을 생성합니다. 운영 DB에서 실행하지 마세요.

| 계정                     | 비밀번호             |
| ------------------------ | -------------------- |
| demo-minsu@example.test  | LocalDemo-Only-2026! |
| demo-jiyoon@example.test | LocalDemo-Only-2026! |
| demo-seung@example.test  | LocalDemo-Only-2026! |

모든 데모 계정·동호회는 데모 표시를 가집니다. 실사용 후기·구매처·가격은 시드로 조작하지 않습니다.

## 원격 Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. `npx supabase login`, `npx supabase link --project-ref <project-ref>` 후 `npx supabase db push`로 마이그레이션만 적용합니다. **운영에는 seed.sql을 적용하지 않습니다.**
3. 프로젝트 URL과 공개 anon key를 환경변수에 입력합니다.
4. Auth URL Configuration에 실제 사이트 URL과 `<site-url>/auth/callback`을 등록합니다.
5. 이메일 회원가입을 설정하고, 필요한 OAuth 제공자를 활성화합니다.
6. 제공자 설정이 완료된 것만 `NEXT_PUBLIC_OAUTH_PROVIDERS=kakao,google,apple`에 나열합니다. 로그인 secret은 Supabase 대시보드에 설정하고 앱에 넣지 않습니다.
7. Storage의 `gear-images` 비공개 버킷은 마이그레이션이 생성합니다. 최대 4MB, JPEG/PNG/WebP만 허용합니다.

OAuth는 Supabase Auth의 실제 리다이렉트 흐름을 사용합니다. 미설정 제공자는 버튼에 `연결 준비 중`이라고 표시합니다. Naver는 Supabase 지원 및 승인된 OAuth 방식 확인 후 별도 구현해야 합니다.

## 환경변수

| 변수                                    | 용도                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL                | Supabase URL. 비어 있으면 데모 모드                  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY           | 브라우저 공개용 anon key                             |
| NEXT_PUBLIC_SITE_URL                    | 인증·초대 링크용 절대 origin                         |
| NEXT_PUBLIC_OAUTH_PROVIDERS             | 활성화한 kakao,google,apple 목록                     |
| SUPABASE_SERVICE_ROLE_KEY               | 향후 운영 작업용. 현재 사용자 CRUD에는 사용하지 않음 |
| COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY | 서버 전용 예약 변수. API adapter는 현재 scaffold     |
| LINKPRICE_API_KEY                       | 서버 전용 예약 변수. API adapter는 현재 scaffold     |
| SENTRY_DSN                              | 후속 모니터링 연결용 예약 변수. SDK 아직 미연결      |

실제 키는 `.env.local` 또는 배포 환경의 비밀 변수로 관리합니다. Git에 커밋하지 않습니다.

## 구조

```text
src/app/                   App Router, auth callback, /go/:offerId, PWA
src/components/screens/    홈·제품·동호회·프로필·관리자 서버 화면
src/components/            폼, 탐색, 반응형 내비게이션
src/lib/actions.ts         검증된 Server Actions와 인증/쓰기 경계
src/lib/data.ts            RLS를 따르는 읽기 쿼리
src/lib/commerce/          Provider interface, registry, adapters
src/lib/supabase/          쿠키 기반 Supabase SSR client
supabase/migrations/       전체 엔티티, 권한, 트랜잭션 함수, Storage
supabase/seed.sql          로컬 전용 스포츠 데모
```

Next.js 16 App Router / React / TypeScript / Tailwind CSS / Lucide / Zod / Supabase SSR를 사용합니다. 첫 버전은 Server Components와 Server Actions를 사용하며 [아키텍처 문서](docs/ARCHITECTURE.md)에 신뢰 경계를 설명했습니다. 원래 작업지시서는 [여기](docs/PRODUCT_BRIEF.ko.md)에 보존했습니다.

### 데이터와 권한

- Product와 UserGear는 별도 엔티티입니다. 정규화된 브랜드+이름의 정확 일치에 unique index를 적용해 동시 등록도 같은 Product로 연결합니다. 불확실한 유사명은 자동 병합하지 않습니다.
- 모든 public table에 RLS가 켜집니다. 비공개 동호회, 가입 대기 상태, 장비 공개 범위, 알림, 사진은 DB에서 검증합니다.
- 사용자 metadata로 운영자 권한을 줄 수 없습니다. 운영자가 SQL에서 `insert into public.staff(user_id) values ('<user-uuid>');`를 실행해야 `/admin`에 접근할 수 있습니다.
- 동호회 생성·초대 수락·제품 병합은 DB 함수로 원자적으로 실행됩니다. 승인 가입은 멤버 탭에서 처리합니다.
- 질문과 답변의 알림은 DB trigger로 저장합니다. 푸시 알림은 후속 작업입니다.
- 이미지 경로는 `<user-id>/<gear-id>/<random-id>.<ext>`이며 private Storage와 60초 signed URL을 사용합니다. 이미 발급한 URL은 권한 변경 뒤 최대 60초 유효할 수 있습니다.
- 실제 DB에 공유되는 분당 제한을 서버 작업과 콘텐츠 INSERT trigger에 적용합니다. 공개 anonymous /go에 대한 IP 기반 제한·봇 차단은 배포 인프라에서 후속 적용해야 합니다.
- URL import는 HTTPS와 공개 호스트 형태를 검증하고 **서버에서 원격 URL을 fetch하지 않습니다**. SSRF를 유발하는 자동 크롤링 기능은 없습니다. 메타데이터를 확인한 것처럼 표시하지 않습니다.
- Service Worker는 정적 오프라인 안내만 저장합니다. 인증 페이지와 개인정보는 캐시하지 않습니다.

## Commerce Provider 추가

`src/lib/commerce/index.ts`의 `CommerceProvider`를 구현하는 adapter를 추가하고 `registry()`에 등록합니다. 페이지나 구매 endpoint를 수정할 필요가 없습니다. `canHandleUrl`은 정확한 hostname 경계로 검사해야 합니다.

현재:

- Generic: URL 검증·도메인 확인·원본 URL 이동. 제품명은 사용자가 직접 확인합니다.
- Coupang / LinkPrice: **NOT_CONFIGURED**, 키가 있어도 **NOT_IMPLEMENTED**. 공식 계약/응답 구조 검증 전에는 성공 상태를 표시하지 않습니다.
- DirectMerchant: 명시적인 계약 도메인·tracking parameter를 코드 구성으로 주입하면 click ID를 붙이는 adapter. 관리자 계약 설정 UI와 webhook은 후속 작업입니다.
- 신규 API adapter는 timeout / circuit breaker / cache / 서명 검증 / 계약 테스트를 추가한 뒤 활성화해야 합니다. 현재 외부 API 호출은 없습니다.

`GET /go/:offerId`는 검증된 Offer를 읽고 click ID를 DB에 기록한 후 이동합니다. 임의 URL 파라미터로 redirect하지 않습니다. 가격은 확인된 값만 입력하며 배송비가 없으면 확인 필요로 표시합니다. 전환 테이블과 parser 인터페이스는 준비되어 있지만 webhook 수신·CSV 정산은 미구현입니다.

## 테스트

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- Vitest + PGlite: 실제 PostgreSQL 엔진에서 SQL 마이그레이션/RLS/함수/트리거를 실행합니다. Auth와 Storage의 기반 테이블은 테스트용으로 최소 재현합니다.
- Playwright: Supabase 미연결 데모의 desktop/mobile UI 흐름을 검증합니다.
- **실제 Supabase 통합 E2E:** 로컬 Supabase를 켜고 `.env.local`을 설정한 뒤 `npm run build` 후 `npm run test:e2e:live`를 실행합니다. 두 사용자 가입 → 비공개 동호회 → 초대 → 같은 제품 등록 → 질문 → 알림 → 답변을 수행합니다. 현재 작업 환경에는 Docker/Supabase가 없어 이 suite는 실행하지 않았습니다. 성공했다고 표시하지 않습니다.
- 소셜 OAuth와 실제 업로드 서비스의 end-to-end 검증은 프로젝트 연결 뒤 수행해야 합니다.

## 배포

1. GitHub 저장소를 Vercel에 연결하고 Next.js preset을 사용합니다.
2. 환경변수를 설정합니다. `NEXT_PUBLIC_SITE_URL`은 실제 HTTPS 도메인으로 설정합니다.
3. Supabase에 마이그레이션 적용 및 Auth callback 허용 URL 설정을 완료합니다.
4. `npm run build` 후 Vercel preview에서 두 계정·권한·업로드·구매 이동을 검증합니다.
5. 운영 전 [남은 작업과 검증 항목](docs/STATUS.md)을 완료합니다.

GitHub Actions가 lint, typecheck, SQL/security tests, build, demo browser tests를 실행하도록 설정되어 있습니다. 운영 배포와 외부 계정 생성은 이 저장소의 최초 개발 커밋에서 수행하지 않았습니다.
