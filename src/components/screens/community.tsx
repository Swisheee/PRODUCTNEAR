import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Users, LockKeyhole, MapPin } from 'lucide-react';
import * as data from '@/lib/data';
import { configured, oauthProviders } from '@/lib/env';
import { safeNext, sports } from '@/lib/validation';
import { ActionForm } from '../action-form';
import { Avatar, ClubCard, Empty, GearCard, PersonCard } from '../cards';
import { DemoWriteNotice, Heading, NeedLogin } from './catalog';
export async function Clubs() {
  const clubs = await data.clubs();
  return (
    <div className="page">
      <Heading
        eyebrow="BETTER TOGETHER"
        title="같이 뛰고, 경험을 나누고."
        description="내가 아는 사람들이 있는 동호회에서 시작해보세요."
      />
      <div className="section-heading">
        <h2>
          함께할 동호회 <span>{clubs.length}</span>
        </h2>
        <Link href="/clubs/new" className="button">
          <Plus size={17} />
          동호회 만들기
        </Link>
      </div>
      <div className="club-grid">
        {clubs.map((c) => (
          <ClubCard key={c.id} club={c} />
        ))}
      </div>
      {!clubs.length && (
        <Empty title="아직 등록된 동호회가 없어요." href="/clubs/new" label="첫 동호회 만들기" />
      )}
    </div>
  );
}
export async function CreateClub() {
  const user = await data.session();
  if (configured && !user) return <NeedLogin next="/clubs/new" />;
  return (
    <div className="page narrow">
      <Heading
        title="우리 동호회 만들기"
        description="함께 운동하는 사람들과 장비 이야기를 시작하세요."
      />
      {!configured && <DemoWriteNotice />}
      <ActionForm
        kind="club"
        disabled={!configured}
        fields={[
          {
            name: 'name',
            label: '동호회 이름',
            required: true,
            placeholder: '예: KAIST Basketball',
          },
          {
            name: 'sport',
            label: '활동 종목',
            type: 'select',
            options: sports.map((s) => ({ value: s, label: s })),
          },
          { name: 'region', label: '활동 지역', placeholder: '예: 대전 유성구' },
          { name: 'description', label: '동호회 소개', type: 'textarea' },
          {
            name: 'visibility',
            label: '공개 범위',
            type: 'select',
            options: [
              { value: 'public', label: '공개 동호회' },
              { value: 'private', label: '비공개 동호회' },
            ],
          },
          {
            name: 'join_policy',
            label: '가입 방식',
            type: 'select',
            options: [
              { value: 'open', label: '누구나 가입' },
              { value: 'approval', label: '운영진 승인 필요' },
              { value: 'invite', label: '초대 전용' },
            ],
            hint: '비공개 동호회는 승인 또는 초대 전용으로 설정해주세요.',
          },
        ]}
        submit="동호회 만들기"
      />
    </div>
  );
}
export async function ClubDetail({ id, tab = 'feed' }: { id: string; tab?: string }) {
  const [club, gears, members, user] = await Promise.all([
    data.club(id),
    data.gears({ club_id: id }),
    data.members(id),
    data.session(),
  ]);
  if (!club) notFound();
  const mine = members.find((m) => m.user_id === user?.id);
  const manages = mine?.role === 'owner' || mine?.role === 'admin';
  return (
    <div className="page">
      <div className="club-cover">
        <span>{club.sport === '농구' ? '🏀' : club.sport === '러닝' ? '🏃' : '🎾'}</span>
        <div>
          <span className="eyebrow">{club.is_demo ? '데모 동호회' : 'OUR CLUB'}</span>
          <h1>{club.name}</h1>
          <p>
            <Users size={16} />
            {members.filter((m) => m.status === 'active').length}명 <span>·</span> {club.sport}{' '}
            <span>·</span>
            <MapPin size={15} />
            {club.region || '지역 미등록'}
          </p>
        </div>
        <div className="club-join">
          {mine ? (
            <span className="pill">
              {mine.status === 'pending' ? '가입 승인 대기 중' : '함께하는 동호회 ✓'}
            </span>
          ) : configured && user ? (
            <ActionForm
              kind="join"
              hidden={{ club_id: id }}
              submit={club.join_policy === 'approval' ? '가입 신청하기' : '동호회 가입하기'}
              disabled={club.join_policy === 'invite'}
            />
          ) : (
            <Link className="button" href={`/login?next=/clubs/${id}`}>
              로그인하고 함께하기
            </Link>
          )}
        </div>
      </div>
      <div className="tabs">
        {[
          ['feed', '피드'],
          ['gear', '장비'],
          ['members', '멤버'],
          ['info', '정보'],
        ].map(([key, label]) => (
          <Link className={tab === key ? 'active' : ''} href={`/clubs/${id}?tab=${key}`} key={key}>
            {label}
          </Link>
        ))}
      </div>
      {(tab === 'feed' || tab === 'gear') && (
        <>
          <div className="section-heading">
            <div>
              <h2>{tab === 'gear' ? '우리 동호회 장비' : '함께 나누는 장비 이야기'}</h2>
              <p>최근 등록순 · 공개 범위에 따라 볼 수 있는 경험만 표시돼요.</p>
            </div>
            <Link href="/gear/new">
              장비 등록 <Plus size={16} />
            </Link>
          </div>
          <div className="feed">
            {gears.map((g) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
          {!gears.length && (
            <Empty
              title="아직 등록된 장비가 없어요."
              description="첫 번째 장비를 등록해보세요."
              href="/gear/new"
              label="내 장비 등록하기"
            />
          )}
        </>
      )}
      {tab === 'members' && (
        <>
          <h2>함께하는 사람들</h2>
          <div className="person-grid">
            {members
              .filter((m) => m.status === 'active')
              .map((m) => (
                <PersonCard
                  key={m.user_id}
                  profile={m.profiles}
                  subtitle={
                    m.role === 'owner'
                      ? '동호회 운영자'
                      : m.role === 'admin'
                        ? '운영진'
                        : club.sport
                  }
                />
              ))}
          </div>
          {manages &&
            members
              .filter((m) => m.status === 'pending')
              .map((m) => (
                <div className="panel" key={m.user_id}>
                  <PersonCard profile={m.profiles} />
                  <ActionForm
                    kind="approve"
                    hidden={{ club_id: id, user_id: m.user_id }}
                    submit="가입 승인"
                  />
                </div>
              ))}
        </>
      )}
      {tab === 'info' && (
        <>
          <div className="panel">
            <h2>우리 동호회 소개</h2>
            <p className="preserve-lines">{club.description || '소개가 아직 없어요.'}</p>
            <p className="muted">
              <LockKeyhole size={14} />
              {club.visibility === 'private' ? '비공개 동호회' : '공개 동호회'} ·{' '}
              {club.join_policy === 'open'
                ? '누구나 가입'
                : club.join_policy === 'approval'
                  ? '승인 후 가입'
                  : '초대로 가입'}
            </p>
          </div>
          {manages && (
            <section className="section panel">
              <h2>친구 초대하기</h2>
              <p className="muted">
                초대 링크는 7일 뒤 만료됩니다. 링크를 받은 사람은 승인 없이 가입할 수 있어요.
              </p>
              <ActionForm kind="invite" hidden={{ club_id: id }} submit="초대 링크 만들기" />
            </section>
          )}
        </>
      )}
    </div>
  );
}
export async function Join({ token }: { token: string }) {
  const user = await data.session();
  return (
    <div className="page narrow">
      <Heading
        title="함께 뛰는 사람들의 초대"
        description="동호회에 가입하고 친구들이 쓰는 장비를 만나보세요."
      />
      {!configured ? (
        <DemoWriteNotice />
      ) : !user ? (
        <NeedLogin next={`/join/${token}`} />
      ) : (
        <div className="panel">
          <p>
            초대를 수락하면 이 링크의 동호회에 가입됩니다. 비공개 멤버 정보는 가입한 뒤 볼 수
            있어요.
          </p>
          <ActionForm kind="accept_invite" hidden={{ token }} submit="초대 수락하고 가입하기" />
        </div>
      )}
    </div>
  );
}
export async function Login({
  signup = false,
  next = '/',
  callbackError = false,
}: {
  signup?: boolean;
  next?: string;
  callbackError?: boolean;
}) {
  return (
    <div className="page auth-page">
      <span className="auth-symbol">써</span>
      <Heading
        title={signup ? '경험을 나누는 사이가 돼요.' : '다시 만나서 반가워요.'}
        description="내가 믿을 수 있는 사람에게 물어보고 선택하세요."
      />
      {!configured && <DemoWriteNotice />}
      {callbackError && (
        <p role="alert" className="form-error">
          인증 링크가 만료되었거나 인증을 완료하지 못했어요. 다시 로그인해주세요.
        </p>
      )}
      <ActionForm
        kind={signup ? 'signup' : 'signin'}
        hidden={{ next: safeNext(next) }}
        disabled={!configured}
        fields={[
          {
            name: 'email',
            label: '이메일',
            type: 'email',
            required: true,
            placeholder: 'you@example.com',
          },
          {
            name: 'password',
            label: '비밀번호',
            type: 'password',
            required: true,
            hint: '8자 이상 입력해주세요.',
          },
        ]}
        submit={signup ? '이메일로 가입하기' : '이메일로 로그인'}
      />
      <div className="auth-divider">또는 소셜 계정으로</div>
      <div className="oauth-list">
        {(['kakao', 'apple', 'google'] as const).map((p) => (
          <ActionForm
            key={p}
            compact
            kind="oauth"
            hidden={{ provider: p, next: safeNext(next) }}
            disabled={!configured || !oauthProviders.includes(p)}
            submit={`${{ kakao: '카카오', apple: 'Apple', google: 'Google' }[p]}로 계속하기${oauthProviders.includes(p) ? '' : ' · 연결 준비 중'}`}
          />
        ))}
      </div>
      <p className="auth-switch">
        {signup ? '이미 계정이 있나요?' : '아직 계정이 없나요?'}{' '}
        <Link href={`/${signup ? 'login' : 'signup'}?next=${encodeURIComponent(safeNext(next))}`}>
          {signup ? '로그인' : '회원가입'}
        </Link>
      </p>
    </div>
  );
}
export async function Onboarding({ next = '/' }: { next?: string }) {
  const user = await data.session();
  if (!user) return <NeedLogin next="/onboarding" />;
  const p = await data.profile(user.id);
  return (
    <div className="page narrow">
      <Heading
        title="어떤 사람인지 알려주세요."
        description="친구들이 알아볼 수 있는 닉네임과 주로 즐기는 운동이면 충분해요."
      />
      <ActionForm
        kind="profile"
        hidden={{ next: safeNext(next) }}
        fields={[
          { name: 'nickname', label: '닉네임', required: true, value: p?.nickname },
          {
            name: 'main_sport',
            label: '주 활동 종목',
            type: 'select',
            value: p?.main_sport || '농구',
            options: sports.map((s) => ({ value: s, label: s })),
          },
          { name: 'region', label: '활동 지역 · 선택', value: p?.region || '' },
          {
            name: 'experience_level',
            label: '경력 · 선택',
            value: p?.experience_level || '',
            placeholder: '예: 농구를 시작한 지 2년',
          },
        ]}
        submit="프로필 저장하기"
      />
    </div>
  );
}
export async function Profile({ id, tab = 'gear' }: { id?: string; tab?: string }) {
  const user = await data.session();
  const pid = id || user?.id;
  if (!pid) return <NeedLogin next="/me" />;
  const [p, gears, clubs] = await Promise.all([
    data.profile(pid),
    data.gears({ user_id: pid }),
    data.clubs(),
  ]);
  if (!p) notFound();
  return (
    <div className="page">
      <div className="profile-header">
        <Avatar profile={p} size="big" />
        <div>
          <span className="eyebrow">{p.is_demo ? 'DEMO MEMBER' : 'MY GEAR SHELF'}</span>
          <h1>{p.nickname}</h1>
          <p>
            {p.main_sport || '종목 미등록'} · {p.region || '지역 미등록'} · 공개된 장비{' '}
            {gears.length}개
          </p>
        </div>
        {pid === user?.id && (
          <Link className="button secondary" href="/settings">
            프로필·설정
          </Link>
        )}
      </div>
      <div className="tabs">
        <Link className={tab === 'gear' ? 'active' : ''} href={`?tab=gear`}>
          장비
        </Link>
        <Link className={tab === 'experience' ? 'active' : ''} href={`?tab=experience`}>
          경험
        </Link>
      </div>
      <div className="feed">
        {gears
          .filter((g) => tab !== 'experience' || Boolean(g.review_text))
          .map((g) => (
            <GearCard key={g.id} gear={g} />
          ))}
      </div>
      {!gears.length && (
        <Empty title="아직 등록된 장비가 없어요." href="/gear/new" label="첫 장비 등록하기" />
      )}
      <section className="section">
        <h2>장비 이야기를 나누는 동호회</h2>
        <div className="club-grid">
          {clubs
            .filter((c) => gears.some((g) => g.club_id === c.id))
            .map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
        </div>
        <p className="muted">공개된 장비에 연결된 동호회만 표시합니다.</p>
      </section>
    </div>
  );
}
export async function QuestionDetail({ id }: { id: string }) {
  const [q, answers, user] = await Promise.all([
    data.question(id),
    data.answers(id),
    data.session(),
  ]);
  if (!q) notFound();
  return (
    <div className="page narrow">
      <Link className="back-link" href={`/products/${q.product_id}`}>
        ← 제품으로 돌아가기
      </Link>
      <Heading eyebrow="ASK SOMEONE WHO KNOWS" title="써본 사람에게 물어보기" />
      <div className="panel">
        <PersonCard profile={q.profiles} />
        <h2 className="preserve-lines">{q.question}</h2>
        <p className="muted">{new Date(q.created_at).toLocaleDateString('ko-KR')}</p>
      </div>
      <section className="section">
        <h2>답변 {answers.length}</h2>
        {answers.map((a) => (
          <div className="panel" key={a.id}>
            <PersonCard profile={a.profiles} />
            <p className="preserve-lines">{a.answer}</p>
          </div>
        ))}
        {!answers.length && (
          <p className="muted">아직 답변이 없어요. 직접 사용한 경험을 기다리고 있어요.</p>
        )}
      </section>
      {user ? (
        <ActionForm
          kind="answer"
          hidden={{ question_id: id }}
          fields={[
            { name: 'answer', label: '내 경험으로 답변하기', type: 'textarea', required: true },
          ]}
          submit="답변 남기기"
        />
      ) : (
        <NeedLogin next={`/questions/${id}`} />
      )}
    </div>
  );
}
export async function Notifications() {
  const user = await data.session();
  if (!user) return <NeedLogin next="/notifications" />;
  const notices = await data.notices();
  return (
    <div className="page narrow">
      <Heading title="내게 온 이야기" description="장비 질문과 답변 소식을 확인하세요." />
      {notices.length ? (
        <>
          <ActionForm kind="read" compact submit="모두 읽음 표시" />
          {notices.map((n) => (
            <Link
              className={`notification ${n.read_at ? 'read' : ''}`}
              key={n.id}
              href={safeNext(n.href)}
            >
              <span className="status-dot" />
              <div>
                <strong>{n.message}</strong>
                <small>{new Date(n.created_at).toLocaleString('ko-KR')}</small>
              </div>
            </Link>
          ))}
        </>
      ) : (
        <Empty
          title="아직 새로운 알림이 없어요."
          description="질문이나 답변이 도착하면 알려드릴게요."
        />
      )}
    </div>
  );
}
export async function Settings() {
  const user = await data.session();
  return (
    <div className="page narrow">
      <Heading title="프로필과 설정" />
      {user ? (
        <>
          <div className="panel">
            <h2>계정</h2>
            <p>{user.email}</p>
            <Link className="button secondary" href="/onboarding">
              프로필 수정
            </Link>
          </div>
          <section className="section">
            <ActionForm kind="logout" submit="로그아웃" />
          </section>
        </>
      ) : (
        <NeedLogin next="/settings" />
      )}
      <div className="panel">
        <h2>데이터 공개 범위</h2>
        <p>
          장비마다 전체 공개, 동호회만, 나만 보기를 선택할 수 있어요. 비공개 동호회의 멤버 목록은
          가입한 사람만 확인할 수 있어요.
        </p>
      </div>
    </div>
  );
}
