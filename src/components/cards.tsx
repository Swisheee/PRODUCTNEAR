import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Footprints,
  Watch,
  CircleDot,
  Mountain,
  Users,
  ThumbsUp,
} from 'lucide-react';
import type { Gear, Product, Club, Profile } from '@/lib/types';
export function Avatar({ profile, size = '' }: { profile: Profile; size?: string }) {
  return (
    <span className={`avatar ${size}`} aria-hidden="true">
      {profile.nickname.slice(0, 1)}
    </span>
  );
}
export function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  const Icon = product.category.includes('워치')
    ? Watch
    : product.category.includes('패들')
      ? CircleDot
      : product.category.includes('등산')
        ? Mountain
        : Footprints;
  return (
    <div
      className={`product-art ${large ? 'large' : ''} ${product.category.includes('워치') ? 'peach' : product.category.includes('패들') ? 'lavender' : ''}`}
    >
      <span className="art-orbit" />
      <Icon size={large ? 112 : 64} strokeWidth={1.1} />
      <span className="art-label">{product.category}</span>
    </div>
  );
}
export function PersonCard({ profile, subtitle }: { profile: Profile; subtitle?: string }) {
  return (
    <Link href={`/people/${profile.id}`} className="person-card">
      <Avatar profile={profile} />
      <div>
        <strong>{profile.nickname}</strong>
        <p>{subtitle || profile.main_sport || '새로운 멤버'}</p>
      </div>
      <ArrowUpRight size={16} />
    </Link>
  );
}
export function GearCard({ gear }: { gear: Gear }) {
  return (
    <article className="gear-card">
      <div className="gear-person">
        <Link href={`/people/${gear.user_id}`}>
          <Avatar profile={gear.profiles} />
          <div>
            <strong>{gear.profiles.nickname}</strong>
            <span>{gear.clubs?.name || '장비 이야기'}</span>
          </div>
        </Link>
        <span className="pill">{gear.products.category}</span>
      </div>
      <Link href={`/gears/${gear.id}`} className="gear-product">
        <ProductArt product={gear.products} />
        <div>
          <small>{gear.products.brand}</small>
          <h3>{gear.products.name}</h3>
          <span className="usage">{gear.usage_frequency || '사용 빈도 미등록'}</span>
        </div>
        <ArrowUpRight size={19} />
      </Link>
      <Link href={`/gears/${gear.id}`} className="gear-quote">
        “{gear.review_text || '이 장비의 사용 경험을 물어보세요.'}”
      </Link>
      <div className="gear-footer">
        <span>{gear.usage_context || '사용 맥락을 나눠주세요'}</span>
        {gear.buy_again === true && (
          <span>
            <ThumbsUp size={13} />
            다시 살래요
          </span>
        )}
        <Link href={`/gears/${gear.id}`}>
          경험 보기 <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
export function ProductCard({ product, count }: { product: Product; count?: number }) {
  return (
    <Link className="product-card" href={`/products/${product.id}`}>
      <ProductArt product={product} />
      <small>{product.brand}</small>
      <h3>{product.name}</h3>
      <p>
        {count !== undefined ? `${count}명의 공개된 사용 경험` : '써본 사람의 경험을 확인해보세요'}{' '}
        <ArrowUpRight size={15} />
      </p>
    </Link>
  );
}
export function ClubCard({ club, count }: { club: Club; count?: number }) {
  return (
    <Link href={`/clubs/${club.id}`} className="club-card">
      <span
        className={`club-icon ${club.sport === '러닝' ? 'orange' : club.sport === '피클볼' ? 'purple' : ''}`}
      >
        {club.sport === '농구' ? '🏀' : club.sport === '러닝' ? '🏃' : '🎾'}
      </span>
      <div>
        <strong>{club.name}</strong>
        <p>
          {club.sport} · {club.region || '지역 미등록'}
          {club.is_demo ? ' · 데모' : ''}
        </p>
        {count !== undefined && (
          <small>
            <Users size={12} /> {count}명
          </small>
        )}
      </div>
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function Empty({
  title = '아직 등록된 내용이 없어요.',
  description,
  href,
  label,
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <CircleDot size={28} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {href && (
        <Link href={href} className="button secondary">
          {label || '시작하기'} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
