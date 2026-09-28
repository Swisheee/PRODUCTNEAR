# 프로젝트명: 써본사람

실제로 사용해본 사람의 경험과 관계를 기반으로 구매 결정을 돕는 커뮤니티형 쇼핑 서비스를 만들어라.

단순 리뷰 플랫폼이나 가격비교 서비스가 아니다.

서비스의 핵심은 다음 한 문장이다.

**“이 제품을 실제로 써본, 내가 믿을 수 있는 사람에게 물어보고 산다.”**

초기 시장은 스포츠 동호회다.

예:
- 농구 동호회
- 러닝 크루
- 테니스 동호회
- 피클볼 동호회
- 자전거 동호회
- 등산 동호회

사용자는 자신이 속한 동호회에 가입하고 자신이 실제로 사용하는 장비를 등록한다.

다른 회원은 동호회원들이 실제 사용하는 장비를 탐색하고, 제품 사용자를 확인하고, 경험을 읽거나 질문한 뒤, 여러 구매처 중 하나를 선택해 구매할 수 있다.

장기적으로는 스포츠뿐 아니라 카메라, IT기기, 자동차용품, 육아, 뷰티, 패션 등 “경험이 구매결정에 중요한 모든 카테고리”로 확장할 수 있도록 설계한다.


# 1. 가장 중요한 제품 원칙

써본사람의 우선순위는 아래와 같다.

신뢰 관계
→ 실제 사용자
→ 사용 맥락
→ 질문
→ 제품 선택
→ 구매

쇼핑몰이나 상품가격을 먼저 보여주는 서비스가 되어서는 안 된다.

제품 페이지에서도 먼저 보여줘야 하는 것은:

“누가 이걸 쓰고 있는가?”

이다.

그 다음에:

“어떻게 쓰고 있는가?”
“다시 살 의향이 있는가?”
“누구에게 추천하는가?”
“어디에서 살 수 있는가?”

순서로 보여준다.

제휴수수료가 높은 상품이 추천 순위에 영향을 주어서는 안 된다.

스폰서/광고 상품이 있다면 명확하게 ‘광고’ 또는 ‘Sponsored’ 표시를 한다.


# 2. 개발 목표

완성된 모바일 우선 서비스를 구현하라.

단순 UI 프로토타입으로 끝내지 말고 아래 항목이 실제 작동해야 한다.

- 회원가입
- 로그인
- 로그아웃
- 프로필
- 동호회 생성
- 동호회 가입
- 초대 링크
- 장비 등록
- 상품 DB
- 장비 사용자 연결
- 후기 작성
- 제품 질문
- 댓글/답변
- 상품 검색
- 여러 구매처 표시
- 구매처 링크 이동
- Affiliate link 생성
- 클릭 추적
- 향후 구매전환 추적용 구조
- 알림
- 관리자 기능
- 데이터베이스
- 파일/이미지 업로드
- 권한 관리

외부 쇼핑 API credential이 없어도 전체 앱이 정상적으로 실행돼야 한다.

API key가 없는 Commerce Provider는 Mock/Disabled 상태로 동작하게 하고 절대로 존재하지 않는 API 응답을 만들어 성공한 것처럼 표시하지 않는다.


# 3. 권장 기술 스택

빠른 검증과 확장성을 위해 우선 Mobile-first Web App + PWA로 구축한다.

Frontend:
- Next.js 최신 stable
- App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- TanStack Query
- Zod

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security
- Edge Functions 또는 Next.js Server Actions/API Routes

Deployment:
- Vercel
- Supabase

Analytics:
- 자체 events table
- 추후 PostHog 연결 가능한 구조

Error monitoring:
- Sentry 연결 가능한 구조

PWA:
- 홈화면 설치 가능
- 모바일 우선 UX
- 향후 Expo React Native 앱이 동일 backend/API를 사용할 수 있도록 backend와 frontend를 분리한다.


# 4. Authentication

한국 사용자를 기준으로 로그인 UX를 만들어라.

우선 지원:

- 카카오 로그인
- Apple 로그인
- Google 로그인
- 이메일 로그인

추후 Naver OAuth도 추가 가능한 provider architecture로 구성한다.

첫 가입 후 onboarding에서:

프로필 사진
닉네임
이름 또는 표시 이름
관심 스포츠
활동 지역(선택)
주 활동 종목
경력 수준(선택)

을 입력한다.

개인정보를 과도하게 요구하지 않는다.


# 5. Information Architecture

하단 네비게이션은 모바일 기준으로 구성한다.

홈
탐색
+
동호회
마이

가운데 + 버튼은 장비 등록을 의미한다.


# 6. 홈 화면

홈의 목적은 “내가 아는 사람들이 실제로 무엇을 쓰는지” 보여주는 것이다.

구성:

상단:
써본사람 로고
알림
검색

그 아래:

내 동호회

예:
KAIST Basketball
ONE Pickleball

그 다음:

“내 주변 사람들이 요즘 쓰는 장비”

예:

김민수
KAIST Basketball

Nike Kobe 9 Protro Elite Low

4개월 사용
주 2~3회

“접지는 정말 좋은데 발볼 넓으면 반업 추천”

[장비 보기]

다음:

“동호회에서 많이 쓰는 장비”

예:

Kobe 9 Protro
12명이 사용 중

WOW 11
8명이 사용 중

LeBron 21
6명이 사용 중


# 7. 동호회

Club 데이터 모델을 별도 엔티티로 만든다.

동호회 생성 시:

동호회 이름
종목
지역
소개
커버 이미지
프로필 이미지
공개/비공개
가입 방식

가입 방식:

누구나 가입
승인 필요
초대 전용

동호회 생성자는 Owner가 된다.

역할:

Owner
Admin
Member

초대 기능:

고유 invite URL 생성

예:

ssubon.app/join/A8XZ91

QR 코드 생성 가능

카카오톡 등에 공유 가능한 Web Share API 지원.


# 8. 동호회 홈

동호회 페이지 상단:

동호회 이름
멤버 수
활동 종목
가입 여부

Tabs:

피드
장비
멤버
정보

장비 탭에서:

동호회원이 사용하는 모든 장비를 볼 수 있다.

정렬:

많이 사용하는 순
최근 등록
다시 살 의향 높은 순

필터:

브랜드
카테고리
포지션
성별 필요 시
사용기간
장비 속성


# 9. Product와 User Gear를 반드시 분리한다

가장 중요한 데이터 모델이다.

Product는 제품 자체다.

예:

Nike Kobe 9 Protro Elite Low

UserGear는 특정 사람이 소유하거나 사용하는 Product다.

예:

김민수
Kobe 9 Protro
285mm
2026년 3월 구매
주 3회 농구
6개월 사용


하나의 Product에 여러 UserGear가 연결된다.

Product:

id
brand
name
model_name
category
subcategory
description
primary_image
release_year
product_metadata JSONB
created_at
updated_at

UserGear:

id
user_id
product_id
club_id nullable
nickname nullable
size
color
purchase_date
usage_start_date
usage_frequency
usage_context
review_text
pros
cons
buy_again boolean
recommend_for
purchase_price nullable
purchase_url nullable
image_urls
visibility
created_at
updated_at


# 10. 장비 등록 UX

장비 등록은 매우 빠르게 끝나야 한다.

등록 방법 3개를 제공한다.

A. 제품 검색

브랜드 또는 모델 검색.

기존 Product가 있으면 선택.

B. 구매 링크 붙여넣기

예:

쿠팡 URL
브랜드몰 URL
11번가 URL
G마켓 URL
무신사 URL
기타 쇼핑몰 URL

URL을 backend의 CommerceResolver로 보내고 제품 정보를 확인한다.

API 사용이 가능한 provider라면 공식 API를 이용한다.

API가 없다면 URL의 허용된 metadata/Open Graph 정보만 활용하거나 사용자가 제품명을 직접 확인하도록 한다.

웹사이트 약관을 위반하는 무단 scraping을 기본 기능으로 구현하지 않는다.

C. 직접 등록

브랜드
제품명
사진
카테고리

입력.


# 11. Product Deduplication

같은 제품이 여러 개 만들어지지 않도록 Product Matching Layer를 만든다.

예:

Nike Kobe 9 Elite
Kobe IX Protro Elite
나이키 코비9 프로트로

등을 동일 제품 후보로 판단할 수 있게 한다.

처리 순서:

정확한 provider product ID
GTIN/EAN/UPC
브랜드 + 모델
normalized product name

순으로 매칭한다.

확실하지 않으면 자동 merge하지 않고 사용자에게 기존 상품 후보를 보여준다.

관리자가 중복 Product를 Merge할 수 있는 기능도 만든다.


# 12. 상품 상세 페이지

상품 페이지의 가장 중요한 부분은 구매 버튼이 아니다.

첫 영역:

제품 이미지
브랜드
제품명
카테고리

그 아래 크게:

“이 제품을 쓰는 사람 17명”

실제 사용자 프로필을 가로 카드로 보여준다.

예:

민수
KAIST Basketball
4개월 사용
PG

승희
KAIST Basketball
2주 사용
PG

[사용자 모두 보기]

그 아래:

실사용자 경험

★★★★★ 같은 단일 평점에 지나치게 의존하지 않는다.

대신:

다시 산다
다시 안 산다

그리고:

장점
단점
추천 대상
사용기간
사용빈도

등을 보여준다.

다음:

“궁금한 점이 있나요?”

[써본 사람에게 물어보기]

다음에야:

“구매 가능한 곳”

을 보여준다.


# 13. 질문 기능

ProductQuestion:

id
product_id
author_id
target_user_id nullable
club_id nullable
question
created_at

ProductAnswer:

id
question_id
author_id
answer
created_at

질문 방식:

특정 사용자에게 질문
제품 사용자 전체에게 질문

예:

“발볼 넓은 편인데 정사이즈 괜찮나요?”

제품 사용자에게 알림을 보낸다.

답변이 달리면 질문 작성자에게 알림.


# 14. Commerce Architecture

중요:

특정 쇼핑몰 하나에 종속되지 않는 Commerce Provider Architecture를 만들어라.

공통 인터페이스 예:

interface CommerceProvider {
  id: string
  name: string

  canHandleUrl(url: string): boolean

  resolveProductUrl?(url: string): Promise<ResolvedProduct>

  searchProducts?(query: string): Promise<ProviderProduct[]>

  getOffers?(product: Product): Promise<Offer[]>

  createAffiliateLink?(url: string, context: AffiliateContext): Promise<string>

  verifyWebhook?(request: Request): Promise<boolean>

  parseConversionWebhook?(request: Request): Promise<Conversion[]>
}

Provider Registry:

CommerceProviderRegistry

를 만들고 모든 provider를 여기에 등록한다.


# 15. 최초 Commerce Provider

다음 adapter들을 구현하거나 구현 가능한 scaffold를 만든다.

1. GenericUrlProvider

모든 일반 쇼핑 URL 지원.

기능:

URL 저장
도메인 인식
OG metadata 처리
일반 outbound link 생성

Affiliate가 없어도 작동한다.


2. CoupangProvider

쿠팡 URL 감지.

Coupang Partners credential이 설정된 경우 affiliate 기능 사용.

credential이 없으면 원본 URL 사용.

affiliate 기능은 환경변수 뒤에서 처리한다.

Client에 API secret을 절대 노출하지 않는다.


3. LinkPriceProvider

LinkPrice DeepLink API adapter를 만든다.

지원 merchant URL일 경우 affiliate deep link로 변환.

지원하지 않을 경우 원본 링크를 유지한다.


4. DirectMerchantProvider

써본사람과 직접 CPS 계약을 맺은 쇼핑몰을 위한 provider.

merchant별:

merchant_id
commission_rate
tracking_type
affiliate_parameter
postback_secret
coupon_code

등을 저장한다.


5. Future Providers

향후 아래 provider를 쉽게 추가할 수 있도록 구조만 준비한다.

11stProvider
GmarketProvider
AuctionProvider
MusinsaProvider
NikeProvider
AdidasProvider
NaverStoreProvider
AmazonProvider
AliExpressProvider

중요:

실제로 공식 API나 허가된 제휴 인터페이스가 존재하지 않는 서비스에 가짜 API integration을 만들지 않는다.

해당 provider에 공식 API가 없거나 credential이 없다면 GenericUrlProvider 또는 affiliate network를 이용한다.


# 16. Offer 모델

Product와 판매처를 분리한다.

Merchant:

id
name
domain
logo
provider
affiliate_enabled
status

Offer:

id
product_id
merchant_id
external_product_id
product_url
affiliate_url nullable
price nullable
original_price nullable
shipping_fee nullable
currency
availability
last_checked_at

하나의 Product가 여러 Offer를 가진다.

예:

Kobe 9

쿠팡
239,000원

Nike
249,000원

ABC 농구몰
229,000원


# 17. 구매처 UX

제품 페이지 하단:

구매 가능한 곳

각 카드:

쇼핑몰
가격
배송비
재고상태
최종 확인 시간

[구매하러 가기]

Affiliate 여부 때문에 특정 판매처를 부당하게 위로 올리지 않는다.

기본 정렬:

가격
배송
재고
사용자가 선택한 정렬 기준

등 객관적인 기준을 사용한다.


# 18. Outbound Click Tracking

사용자가 구매 버튼을 누르면 판매처 URL로 바로 보내지 말고 내부 redirect endpoint를 거친다.

예:

GET /go/:offerId

서버 처리:

clickId 생성
user id
product id
offer id
merchant id
club id
referrer
timestamp

를 기록한다.

그 후 affiliate URL 또는 원본 URL로 redirect한다.

ClickEvent:

id
click_id
user_id nullable
product_id
offer_id
merchant_id
club_id nullable
source
created_at


# 19. Conversion Tracking

구매전환을 받을 수 있는 merchant의 경우:

Webhook
Postback
Affiliate Network API
정산 CSV

등을 지원할 수 있는 구조로 만든다.

Conversion:

id
click_id nullable
user_id nullable
merchant_id
product_id nullable
order_reference
revenue
commission
currency
status
occurred_at
confirmed_at

status:

pending
approved
cancelled
refunded

구매 상세 개인정보는 불필요하게 저장하지 않는다.


# 20. Affiliate Disclosure

구매 링크에서 써본사람이 수수료를 받을 수 있는 경우 명확히 표시한다.

예:

“이 링크를 통한 구매 시 써본사람이 일정 수수료를 받을 수 있습니다. 구매 가격에는 영향을 주지 않습니다.”

광고/협찬이 있다면 별도 표시한다.

사용자 후기는 affiliate commission과 무관하게 유지한다.


# 21. 검색

글로벌 검색에서:

제품
사람
동호회

검색 가능.

예:

“Kobe 9”

결과:

PRODUCTS
Nike Kobe 9 Protro

PEOPLE USING IT
12명

CLUBS USING IT
KAIST Basketball 5명
OO Basketball 4명

가격검색 서비스처럼 검색 결과를 구성하지 않는다.


# 22. 탐색

Explore 화면:

내 주변에서 많이 쓰는 장비
내 동호회 인기 장비
이번 달 많이 등록된 장비
카테고리별 장비
실사용자가 많은 제품

등을 보여준다.


# 23. 프로필

사용자 프로필:

프로필 사진
닉네임
가입 동호회
활동 종목
장비 개수

Tabs:

장비
경험
답변

내 장비 Shelf를 시각적으로 보여준다.

예:

농구화 4
농구공 2
보호대 2


# 24. 신뢰 시스템

초기부터 복잡한 평판 점수를 만들지 않는다.

대신 객관적인 signal을 저장한다.

예:

얼마나 오래 사용했는지
실제 동호회 멤버인지
장비 등록 기간
답변 수
받은 감사 수
프로필 완성도

향후 Trust Score를 만들 수 있도록 데이터만 쌓는다.

사용자가 돈을 받고 추천하는 구조는 MVP에서는 구현하지 않는다.


# 25. 동호회 기반 Privacy

Private Club의 경우:

비회원은 멤버 목록 접근 불가.

장비 공개 범위:

전체 공개
동호회만
나만

선택 가능.

RLS를 이용하여 backend 수준에서 접근을 차단한다.

Frontend hiding만으로 처리하지 않는다.


# 26. Database

최소한 다음 tables를 설계한다.

profiles
clubs
club_members
club_invites

categories
brands
products
product_aliases
user_gears
gear_images

questions
answers
reactions

merchants
offers
affiliate_links
commerce_provider_configs

click_events
conversions

notifications

favorites
reports

audit_logs

적절한 foreign key, indexes, created_at, updated_at을 설정한다.


# 27. 관리자 페이지

/admin

관리자는 다음을 관리할 수 있다.

Users
Clubs
Products
Product duplicates
Brands
Categories
Merchants
Offers
Commerce Providers
Affiliate status
Click analytics
Conversion analytics
Reports
Content moderation

Product merge:

Product A
+
Product B

→ 하나의 canonical product로 병합할 수 있어야 한다.

기존 UserGear와 Offer도 새로운 Product로 이동한다.


# 28. Commerce Provider 관리자

관리자에서 Provider 상태를 볼 수 있게 한다.

예:

Coupang
CONNECTED

LinkPrice
CONNECTED

11st
NOT CONFIGURED

Musinsa
GENERIC URL ONLY

Direct Merchant A
CONNECTED

secret key 자체는 화면에 표시하지 않는다.


# 29. Analytics

MVP에서 가장 중요한 funnel을 기록한다.

Club joined
→ Gear registered
→ Product viewed
→ User profile viewed
→ Question asked
→ Purchase option viewed
→ Outbound click
→ Conversion

Dashboard에서 다음 지표를 보여준다.

가입자
활성 사용자
동호회 수
동호회별 활성률

장비 등록률
1인당 등록 장비 수

Product view
Gear owner view
Question rate

Purchase option CTR
Outbound CTR

구매 전환율
GMV
Affiliate commission

특히 다음 두 지표는 크게 보여준다.

Product View → Ask Owner

Product View → Purchase Click


# 30. MVP 시드 데이터

실제 서비스를 바로 테스트할 수 있도록 스포츠 중심 seed data를 넣는다.

Clubs:

KAIST Basketball
ONE Pickleball
Daejeon Running Crew

Products 예:

Nike Kobe 9 Protro Elite Low
Nike Hyperdunk 2017 Low
ANTA KAI 1
WOW 11
Selkirk pickleball paddle
Joola pickleball paddle
Garmin running watch

가짜 유저임을 명확히 알 수 있는 demo account도 생성한다.


# 31. Design Direction

브랜드 이름:

써본사람

영문 temporary naming:

SSUBON
또는
TriedBy

단, 화면에서는 한국어 “써본사람”을 우선 사용한다.

브랜드 성격:

친근함
신뢰
사람 중심
깔끔함
현대적
과장 없음

당근처럼 친근하지만 그대로 따라 하지 않는다.

토스처럼 이해하기 쉽지만 금융서비스처럼 차갑지 않게 한다.

쇼핑앱처럼 가격과 배너가 화면을 가득 채우지 않게 한다.

큰 여백
명확한 typography
사람 얼굴과 실제 장비 사진 중심.

색상을 과도하게 사용하지 않는다.

카드 모서리는 적당히 부드럽게.

제품 카드보다 사람 카드가 더 중요한 UI를 만든다.


# 32. 핵심 화면

반드시 실제 구현한다.

01 Splash
02 Login
03 Signup / onboarding
04 Home
05 Create Club
06 Join Club
07 Club Home
08 Club Gear
09 Club Members
10 Add Gear
11 Product Search
12 Product URL Import
13 Product Detail
14 Gear Owner Detail
15 Ask Question
16 Question Detail
17 Search
18 Explore
19 Purchase Offers
20 User Profile
21 My Gear
22 Notifications
23 Settings
24 Admin Dashboard
25 Commerce Provider Admin


# 33. Empty / Loading / Error State

모든 화면에 다음 상태를 만든다.

loading
empty
error
offline

예:

동호회에 아직 장비가 없다면:

“아직 등록된 장비가 없어요.
첫 번째 장비를 등록해보세요.”

[내 장비 등록하기]


# 34. 외부 API 실패

Commerce API가 실패해도 제품 페이지 전체가 깨지지 않게 한다.

예:

가격정보 조회 실패

→

“현재 가격을 불러올 수 없습니다.”

로 보여주고 기존 merchant URL은 사용할 수 있게 한다.

외부 API 하나의 장애가 전체 서비스 장애로 이어지지 않게 timeout/circuit-breaker/caching 구조를 적용한다.


# 35. Security

API secret은 서버에서만 사용.

.env.example을 생성한다.

예:

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

KAKAO_CLIENT_ID=
GOOGLE_CLIENT_ID=
APPLE_CLIENT_ID=

COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=

LINKPRICE_API_KEY=

절대 repository에 실제 secret을 넣지 않는다.

Rate limiting을 적용한다.

URL 입력에는 SSRF 방어를 적용한다.

외부 URL validation을 구현한다.

사용자 입력은 validate/sanitize한다.


# 36. 테스트

최소한 다음 E2E scenario를 테스트한다.

Scenario 1

User A 회원가입
→ 동호회 생성
→ 초대링크 생성

User B
→ 링크 접속
→ 회원가입
→ 동호회 가입

Scenario 2

User A
→ Kobe 9 등록

User B
→ 동호회 장비 탭
→ Kobe 9 발견
→ User A 사용 후기 확인

Scenario 3

User B
→ User A에게 질문

User A
→ 알림
→ 답변

User B
→ 답변 알림

Scenario 4

제품
→ 구매 가능한 곳
→ merchant 선택
→ /go endpoint
→ click 기록
→ merchant redirect

Scenario 5

Affiliate API credential 없음
→ 서비스 오류 없음
→ original URL fallback

Scenario 6

동일한 Kobe 9을 두 사용자가 등록
→ 동일 Product
→ UserGear만 2개 생성


# 37. 개발 순서

Phase 1

Database/Auth
Club
Invite
Profile

Phase 2

Product
UserGear
Gear registration
Product detail

Phase 3

Question/Answer
Notification

Phase 4

Commerce Provider layer
Generic URL
Coupang
LinkPrice
Offer
Outbound Tracking

Phase 5

Analytics/Admin
Product merge
Merchant management

Phase 6

PWA
Performance
SEO
Security
Deployment


# 38. 절대 하지 말 것

처음부터 자체 결제시스템을 만들지 않는다.

써본사람 안에서 상품 결제를 완료시키지 않는다.

MVP에서는 외부 판매처로 구매자를 연결한다.

없는 쇼핑몰 API를 가정하지 않는다.

약관을 위반하는 scraping을 기본 데이터 수집 방식으로 사용하지 않는다.

Affiliate commission에 따라 추천 순위를 조작하지 않는다.

사용자에게 수수료를 지급하는 추천인 시스템을 MVP에 넣지 않는다.

가짜 리뷰를 만들지 않는다.

Mock data를 실제 데이터처럼 표시하지 않는다.


# 39. 가장 중요한 MVP 성공 경험

사용자가 가입한 뒤 3분 이내에 아래 경험이 가능해야 한다.

친구가 보낸 동호회 링크 클릭

→ 가입

→ 친구들이 실제로 사용하는 장비 구경

→ 관심 장비 클릭

→ “내가 아는 누가 이걸 쓰는지” 확인

→ 사용자의 실제 경험 확인

→ 궁금한 점 질문

또는

→ 구매처 선택

→ 쇼핑몰 이동


# 40. 최종 개발 요구

단순히 코드를 설명하지 말고 실제 프로젝트 파일을 구현하라.

먼저 전체 architecture와 database migration을 만든 뒤 기능별로 구현한다.

코드는 production-ready 기준으로 작성하되 MVP에서 불필요한 over-engineering은 피한다.

각 기능을 mock UI만 만드는 방식으로 처리하지 않는다.

실제 DB CRUD를 연결한다.

Auth를 실제 구현한다.

RLS policy를 실제 작성한다.

이미지 업로드를 실제 연결한다.

Commerce Provider는 interface와 registry를 실제 구현한다.

credential이 제공된 provider는 실제 API integration이 가능하도록 한다.

credential이 없는 provider는 명확하게 NOT CONFIGURED 상태를 보여준다.

README에 다음을 포함한다.

- 서비스 개요
- architecture
- local setup
- environment variables
- Supabase setup
- database migration
- Commerce Provider 추가 방법
- deployment 방법
- 테스트 방법

그리고 새로운 쇼핑몰을 추가할 때는 기존 서비스를 수정하는 대신 새로운 CommerceProvider adapter 하나를 추가하는 것만으로 연결할 수 있게 만들어라.

가장 중요한 판단 기준은:

**“이 기능이 쇼핑몰을 보여주는 데 도움이 되는가?”가 아니라
“실제로 써본 사람을 통해 더 신뢰할 수 있는 구매결정을 만드는가?”이다.**
