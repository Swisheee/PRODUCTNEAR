import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Plus, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import * as data from '@/lib/data';
import { configured } from '@/lib/env';
import { ClubCard, GearCard, ProductCard, Empty } from '../cards';
export async function Home() {
  const [clubs, allGears, products, user] = await Promise.all([
    data.clubs(),
    data.gears(),
    data.products(),
    data.session(),
  ]);
  const memberships = user ? await data.myMemberships(user.id) : [];
  const myClubs = user
    ? clubs.filter((c) => memberships.some((m) => m.club_id === c.id))
    : clubs.slice(0, 2);
  const gears = user
    ? allGears.filter((g) => g.club_id && memberships.some((m) => m.club_id === g.club_id))
    : allGears;
  return (
    <div className="home-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">가까운 사람, 더 믿을 수 있는 경험</span>
          <h1>
            써본 사람에게 물어보세요<span>.</span>
          </h1>
          <p>함께 뛰는 사람들이 직접 쓰고, 솔직하게 나누는 장비 이야기.</p>
        </div>
        <span className="date-tag">OUR EVERYDAY GEAR ↗</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            함께 뛰는 사이, 믿고 묻는 사이
          </span>
          <h2>
            다음 장비를 고를 땐,
            <br />
            아는 사람의 경험부터.
          </h2>
          <p>
            광고 속 추천보다 궁금했던 그 한마디.
            <br />
            우리 동호회 사람들의 장비를 만나보세요.
          </p>
          <Link href="/clubs" className="button light">
            우리 동호회 찾아보기 <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="court-line" />
          <div className="court-circle" />
          <div className="floating-tag tag-top">“같이 뛰는 민수도 쓰고 있어요”</div>
          <div className="basketball">
            <i />
            <b />
            <span />
          </div>
          <div className="floating-tag tag-bottom">
            <span className="mini-avatar">써</span> 좋은 선택은, 좋은 경험에서.
          </div>
          <span className="hero-art-note">PLAY TOGETHER. CHOOSE BETTER.</span>
        </div>
      </section>
      <div className="home-columns">
        <div>
          <section className="section">
            <div className="section-heading">
              <h2>
                {user ? '내 동호회' : '함께하는 동호회'}{' '}
                <span>{myClubs.length.toString().padStart(2, '0')}</span>
              </h2>
              <Link href="/clubs">
                모두 보기 <ArrowRight size={15} />
              </Link>
            </div>
            <div className="club-grid">
              {myClubs.map((c) => (
                <ClubCard club={c} key={c.id} />
              ))}
              <Link className="add-club" href="/clubs/new">
                <Plus size={21} />
                <span>새로운 동호회</span>
              </Link>
            </div>
          </section>
          <section className="section">
            <div className="section-heading">
              <div>
                <h2>{user ? '내 동호회 사람들이 쓰는 장비' : '사람들이 요즘 쓰는 장비'}</h2>
                <p>제품보다 먼저, 이걸 쓰는 사람의 이야기를 만나보세요.</p>
              </div>
              <span className="live-label">
                <span />
                경험 피드
              </span>
            </div>
            <div className="feed">
              {gears.map((g) => (
                <GearCard key={g.id} gear={g} />
              ))}
              {!gears.length && (
                <Empty
                  title="아직 나눠진 장비 이야기가 없어요."
                  description="내 장비를 등록하고 첫 번째 경험을 들려주세요."
                  href="/gear/new"
                  label="내 장비 등록하기"
                />
              )}
            </div>
          </section>
        </div>
        <aside className="home-right">
          <section className="prompt-card">
            <span className="round-icon">
              <MessageCircle size={24} />
            </span>
            <span className="tiny-label">작은 질문, 더 나은 선택</span>
            <h3>
              “발볼이 넓은 편인데,
              <br />
              정사이즈 괜찮을까요?”
            </h3>
            <p>
              스펙에서 찾지 못한 답,
              <br />
              직접 써본 사람은 알고 있을 거예요.
            </p>
            <Link href="/explore">
              써본 사람 찾기 <ArrowUpRight size={17} />
            </Link>
          </section>
          <section className="principle-card">
            <ShieldCheck size={23} />
            <h3>
              경험이 먼저,
              <br />
              구매는 그다음.
            </h3>
            <p>제휴 수수료는 추천 순위에 영향을 주지 않아요. 광고와 협찬은 명확하게 표시해요.</p>
          </section>
          <Link href="/gear/new" className="small-cta">
            <Plus size={20} />
            <div>
              <strong>내 장비도 나눠볼까요?</strong>
              <p>누군가에겐 꼭 필요한 경험이에요.</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>
              <Sparkles size={19} /> 경험으로 발견하는 장비
            </h2>
            <p>내게 맞는 장비, 실제 사용자에게 물어보세요.</p>
          </div>
          <Link href="/explore">
            더 둘러보기 <ArrowRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              count={allGears.filter((g) => g.product_id === p.id).length}
            />
          ))}
        </div>
      </section>
      {!configured && (
        <p className="demo-footnote">
          이 화면은 동작을 살펴보기 위한 데모입니다. 실제 후기·인기 순위·거래 정보가 아닙니다.
        </p>
      )}
    </div>
  );
}
