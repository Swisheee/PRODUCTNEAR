import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, MessageCircle, Users, Check, LockKeyhole } from 'lucide-react';
import * as data from '@/lib/data';
import { configured } from '@/lib/env';
import { GearForm } from '../gear-form';
import { ActionForm } from '../action-form';
import { ClubCard, Empty, GearCard, PersonCard, ProductArt, ProductCard } from '../cards';
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
export function NeedLogin({ next = '/' }: { next?: string }) {
  return (
    <Empty
      title="로그인하고 경험을 나눠보세요."
      description="내 동호회와 장비 이야기가 여기서 시작돼요."
      href={`/login?next=${encodeURIComponent(next)}`}
      label="로그인하기"
    />
  );
}
export function DemoWriteNotice() {
  return (
    <div className="notice">
      <LockKeyhole size={18} />
      <div>
        <strong>지금은 읽기 전용 데모예요.</strong>
        <p>
          실제 등록·가입은 Supabase 연결 후 사용할 수 있어요. <Link href="/setup">설정 안내 ↗</Link>
        </p>
      </div>
    </div>
  );
}
export async function Explore({
  query = '',
  category = '',
  search = false,
}: {
  query?: string;
  category?: string;
  search?: boolean;
}) {
  const [allProducts, gears, clubs, people] = await Promise.all([
    data.products(),
    data.gears(),
    search ? data.clubs() : Promise.resolve([]),
    search ? data.people(query) : Promise.resolve([]),
  ]);
  const filtered = allProducts.filter(
    (p) =>
      (p.brand + ' ' + p.name + ' ' + p.category).toLowerCase().includes(query.toLowerCase()) &&
      (!category || p.category === category),
  );
  return (
    <div className="page">
      <Heading
        eyebrow="DISCOVER THROUGH PEOPLE"
        title={search ? '어떤 경험이 궁금하세요?' : '함께 쓰는 장비 탐색'}
        description="가격표보다 먼저, 직접 써본 사람을 만나보세요."
      />
      <form className="search-bar" action={search ? '/search' : '/explore'}>
        <input
          name="q"
          defaultValue={query}
          placeholder="제품, 브랜드, 사람, 동호회 검색"
          aria-label="검색어"
        />
        <button className="button">검색</button>
      </form>
      <div className="chips">
        <Link
          className={!category ? 'selected' : ''}
          href={`/explore?q=${encodeURIComponent(query)}`}
        >
          전체
        </Link>
        {['농구화', '러닝 워치', '피클볼 패들'].map((c) => (
          <Link
            key={c}
            className={category === c ? 'selected' : ''}
            href={`/explore?category=${encodeURIComponent(c)}&q=${encodeURIComponent(query)}`}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          장비 <span>{filtered.length}</span>
        </h2>
        <span className="muted">최근 등록순</span>
      </div>
      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            count={gears.filter((g) => g.product_id === p.id).length}
          />
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="아직 찾는 장비가 없어요."
          description="다른 브랜드나 모델명으로 검색해보세요."
          href="/gear/new"
          label="내 장비 등록하기"
        />
      )}
      {search && (
        <>
          <section className="section">
            <h2>사람</h2>
            <div className="person-grid">
              {people.map((p) => (
                <PersonCard profile={p} key={p.id} />
              ))}
            </div>
            {!people.length && <p className="muted">일치하는 사람이 없어요.</p>}
          </section>
          <section className="section">
            <h2>동호회</h2>
            <div className="club-grid">
              {clubs
                .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
                .map((c) => (
                  <ClubCard key={c.id} club={c} />
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
export async function ProductDetail({
  id,
  offersOnly = false,
}: {
  id: string;
  offersOnly?: boolean;
}) {
  const [p, gears, questions, offers, user] = await Promise.all([
    data.product(id),
    data.gears({ product_id: id }),
    data.questions(id),
    data.offers(id),
    data.session(),
  ]);
  if (!p) notFound();
  return (
    <div className="page">
      <Link className="back-link" href="/explore">
        ← 장비 탐색
      </Link>
      <div className="product-hero">
        <ProductArt product={p} large />
        <div>
          <span className="eyebrow">
            {p.brand} · {p.category}
          </span>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <span className="pill">
            <Users size={14} /> 볼 수 있는 사용 경험 {gears.length}개
          </span>
          <div className="product-actions">
            <a className="button" href="#owners">
              써본 사람 만나기 <ArrowRight size={16} />
            </a>
            <a className="button secondary" href="#offers">
              구매처 확인
            </a>
          </div>
        </div>
      </div>
      {!offersOnly && (
        <>
          <section id="owners" className="section">
            <div className="section-heading">
              <div>
                <h2>
                  이 제품을 쓰는 사람 <span>{new Set(gears.map((g) => g.user_id)).size}</span>
                </h2>
                <p>같은 장비, 다른 사용 맥락. 내 상황과 가까운 사람을 찾아보세요.</p>
              </div>
            </div>
            <div className="person-grid">
              {gears.map((g) => (
                <PersonCard
                  key={g.id}
                  profile={g.profiles}
                  subtitle={`${g.clubs?.name || '개인 장비'} · ${g.usage_frequency || '사용 중'}`}
                />
              ))}
            </div>
            {!gears.length && (
              <Empty
                title="첫 번째 사용 경험을 기다리고 있어요."
                href="/gear/new"
                label="이 장비 등록하기"
              />
            )}
          </section>
          <section className="section">
            <h2>실사용자의 경험</h2>
            <div className="feed">
              {gears.map((g) => (
                <GearCard key={g.id} gear={g} />
              ))}
            </div>
          </section>
          <section className="section panel" id="ask">
            <h2>
              <MessageCircle size={21} /> 궁금한 점이 있나요?
            </h2>
            <p className="muted">써본 사람에게 사용감과 나에게 맞는지 물어보세요.</p>
            {!configured ? (
              <DemoWriteNotice />
            ) : !user ? (
              <NeedLogin next={`/products/${id}#ask`} />
            ) : (
              <ActionForm
                kind="question"
                hidden={{ product_id: id, club_id: '' }}
                fields={[
                  {
                    name: 'target_user_id',
                    label: '누구에게 물어볼까요?',
                    type: 'select',
                    options: [
                      { value: '', label: '이 제품을 쓰는 사람 모두' },
                      ...Array.from(
                        new Map(
                          gears.map((g) => [
                            g.user_id,
                            { value: g.user_id, label: g.profiles.nickname },
                          ]),
                        ).values(),
                      ),
                    ],
                  },
                  {
                    name: 'question',
                    label: '질문',
                    type: 'textarea',
                    required: true,
                    placeholder: '예: 발볼이 넓은 편인데 정사이즈가 괜찮을까요?',
                  },
                ]}
                submit="써본 사람에게 질문하기"
              />
            )}
            <div className="question-list">
              {questions.map((q) => (
                <Link key={q.id} href={`/questions/${q.id}`}>
                  <span>Q</span>
                  <strong>{q.question}</strong>
                  <small>{q.profiles.nickname}</small>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      <section className="section" id="offers">
        <div className="section-heading">
          <div>
            <h2>구매 가능한 곳</h2>
            <p>경험을 충분히 확인했다면, 원하는 판매처를 선택하세요.</p>
          </div>
          <span className="muted">상품가 + 알려진 배송비순</span>
        </div>
        {!offers.length ? (
          <Empty
            title="아직 확인된 구매처가 없어요."
            description="확인되지 않은 가격이나 재고를 표시하지 않습니다."
          />
        ) : (
          <div className="offers">
            {offers.map((o) => (
              <div key={o.id} className="offer">
                <div>
                  <h3>{o.merchants.name}</h3>
                  <p>
                    {o.shipping_fee === null
                      ? '배송비 확인 필요'
                      : `배송비 ${o.shipping_fee.toLocaleString()}원`}{' '}
                    ·{' '}
                    {o.availability === 'in_stock'
                      ? '재고 있음'
                      : o.availability === 'out_of_stock'
                        ? '품절'
                        : '재고 확인 필요'}
                  </p>
                  <small>
                    최종 확인:{' '}
                    {o.last_checked_at
                      ? new Date(o.last_checked_at).toLocaleDateString('ko-KR')
                      : '미확인'}
                  </small>
                </div>
                <strong>
                  {o.price === null ? '가격 확인 필요' : `${o.price.toLocaleString()}원`}
                </strong>
                <a href={`/go/${o.id}`} className="button secondary" rel="nofollow sponsored">
                  구매처로 이동 <ArrowUpRight size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
        {offers.some((o) => o.merchants.affiliate_enabled) && (
          <p className="notice-text">
            이 링크를 통한 구매 시 써본사람이 일정 수수료를 받을 수 있습니다. 구매 가격에는 영향을
            주지 않습니다.
          </p>
        )}
      </section>
    </div>
  );
}
export async function AddGear() {
  const [products, clubs, user] = await Promise.all([
    data.products(),
    data.clubs(),
    data.session(),
  ]);
  if (configured && !user) return <NeedLogin next="/gear/new" />;
  const memberships = user ? await data.myMemberships(user.id) : [];
  return (
    <div className="page narrow">
      <Heading
        eyebrow="MY GEAR, OUR EXPERIENCE"
        title="어떤 장비를 쓰고 있나요?"
        description="내가 써본 경험이 누군가의 좋은 선택이 돼요."
      />
      {!configured && <DemoWriteNotice />}
      <GearForm
        products={products}
        clubs={user ? clubs.filter((c) => memberships.some((m) => m.club_id === c.id)) : clubs}
        disabled={!configured}
      />
    </div>
  );
}
export async function GearDetail({ id }: { id: string }) {
  const [gears, images, user] = await Promise.all([
    data.gears({ id }),
    data.images(id),
    data.session(),
  ]);
  const g = gears[0];
  if (!g) notFound();
  return (
    <div className="page narrow">
      <Link href={`/products/${g.product_id}`} className="back-link">
        ← 제품의 모든 경험 보기
      </Link>
      <Heading title={`${g.profiles.nickname}님의 장비`} description={g.clubs?.name} />
      <PersonCard profile={g.profiles} />
      <ProductArt product={g.products} large />
      <h2>
        {g.products.brand} {g.products.name}
      </h2>
      <dl className="details">
        {[
          ['사용 빈도', g.usage_frequency],
          ['사용 시작', g.usage_start_date],
          ['사용 맥락', g.usage_context],
          ['사이즈', g.size],
          ['색상', g.color],
          ['좋았던 점', g.pros],
          ['아쉬웠던 점', g.cons],
          ['추천 대상', g.recommend_for],
          [
            '다시 살 의향',
            g.buy_again === null
              ? '아직 결정하지 않았어요'
              : g.buy_again
                ? '다시 살래요'
                : '다른 제품을 고려할래요',
          ],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v || '아직 작성하지 않았어요.'}</dd>
          </div>
        ))}
      </dl>
      <div className="panel">
        <h3>직접 써본 이야기</h3>
        <p className="preserve-lines">{g.review_text || '아직 작성한 경험이 없어요.'}</p>
      </div>
      {images.map((url) => (
        <Image
          unoptimized
          width={1200}
          height={900}
          key={url}
          src={url}
          alt={`${g.profiles.nickname}님의 장비 사진`}
          className="gear-image"
        />
      ))}
      <Link className="button" href={`/products/${g.product_id}#ask`}>
        <MessageCircle size={17} /> 이 장비에 대해 물어보기
      </Link>
      {user?.id === g.user_id && (
        <section className="section panel">
          <h2>내 장비 관리</h2>
          <ActionForm
            kind="upload"
            hidden={{ gear_id: id }}
            fields={[
              {
                name: 'image',
                label: '실제 장비 사진',
                type: 'file',
                required: true,
                hint: 'JPG · PNG · WebP, 최대 4MB',
              },
            ]}
            submit="사진 올리기"
          />
          <ActionForm
            kind="gear_visibility"
            hidden={{ gear_id: id }}
            fields={[
              {
                name: 'visibility',
                label: '공개 범위',
                type: 'select',
                value: g.visibility,
                options: [
                  { value: 'public', label: '전체 공개' },
                  ...(g.club_id ? [{ value: 'club', label: '동호회만' }] : []),
                  { value: 'private', label: '나만 보기' },
                ],
              },
            ]}
            submit="공개 범위 저장"
          />
          <details>
            <summary>장비 삭제</summary>
            <p>등록한 경험과 사진 연결이 삭제됩니다. 되돌릴 수 없어요.</p>
            <ActionForm kind="gear_delete" hidden={{ gear_id: id }} submit="이 장비 영구 삭제" />
          </details>
        </section>
      )}
      {user && user.id !== g.user_id && (
        <details className="section">
          <summary>이 경험 신고하기</summary>
          <ActionForm
            kind="report"
            hidden={{ gear_id: id }}
            fields={[{ name: 'reason', label: '신고 사유', type: 'textarea', required: true }]}
            submit="신고 접수"
          />
        </details>
      )}
      <p className="muted">
        <Check size={14} /> 실제 사용 기간과 상황을 기준으로 경험을 읽어보세요.
      </p>
    </div>
  );
}
