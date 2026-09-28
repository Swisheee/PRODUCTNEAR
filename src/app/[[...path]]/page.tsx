import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Home } from '@/components/screens/home';
import { AddGear, Explore, GearDetail, Heading, ProductDetail } from '@/components/screens/catalog';
import {
  ClubDetail,
  Clubs,
  CreateClub,
  Join,
  Login,
  Notifications,
  Onboarding,
  Profile,
  QuestionDetail,
  Settings,
} from '@/components/screens/community';
import { Admin } from '@/components/screens/admin';
export const dynamic = 'force-dynamic';
type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function Page({ params, searchParams }: Props) {
  const { path = [] } = await params;
  const query = await searchParams;
  const route = path.join('/');
  const q = (name: string) => (typeof query[name] === 'string' ? (query[name] as string) : '');
  if (!route) return <Home />;
  if (route === 'explore' || route === 'search')
    return <Explore search={route === 'search'} query={q('q')} category={q('category')} />;
  if (route === 'gear/new') return <AddGear />;
  if (route === 'clubs') return <Clubs />;
  if (route === 'clubs/new') return <CreateClub />;
  if (path[0] === 'clubs' && path.length === 2)
    return <ClubDetail id={path[1]} tab={q('tab') || 'feed'} />;
  if (path[0] === 'products' && path.length === 2) return <ProductDetail id={path[1]} />;
  if (path[0] === 'products' && path[2] === 'offers' && path.length === 3)
    return <ProductDetail id={path[1]} offersOnly />;
  if (path[0] === 'gears' && path.length === 2) return <GearDetail id={path[1]} />;
  if (path[0] === 'people' && path.length === 2)
    return <Profile id={path[1]} tab={q('tab') || 'gear'} />;
  if (path[0] === 'questions' && path.length === 2) return <QuestionDetail id={path[1]} />;
  if (path[0] === 'join' && path.length === 2) return <Join token={path[1]} />;
  if (route === 'me') return <Profile tab={q('tab') || 'gear'} />;
  if (route === 'login' || route === 'signup')
    return (
      <Login
        signup={route === 'signup'}
        next={q('next') || '/'}
        callbackError={q('error') === 'callback'}
      />
    );
  if (route === 'onboarding') return <Onboarding next={q('next') || '/'} />;
  if (route === 'notifications') return <Notifications />;
  if (route === 'settings') return <Settings />;
  if (route === 'admin' || route === 'admin/providers') return <Admin />;
  if (route === 'setup')
    return (
      <div className="page narrow">
        <Heading
          title="진짜 경험을 연결할 준비"
          description="화면을 둘러본 뒤, Supabase를 연결하면 실제 데이터를 저장할 수 있어요."
        />
        <div className="panel prose">
          <h2>1. Supabase 준비</h2>
          <p>프로젝트를 만들거나 Docker와 Supabase CLI로 로컬 서버를 시작하세요.</p>
          <h2>2. 환경변수 설정</h2>
          <p>
            .env.example을 .env.local로 복사하고 Supabase URL과 공개 anon key를 입력하세요. 비밀
            키는 브라우저에 넣지 않습니다.
          </p>
          <h2>3. 데이터베이스 적용</h2>
          <p>
            supabase/migrations의 SQL을 순서대로 실행하세요. 로컬에서는 npx supabase start 후 npx
            supabase db reset으로 준비할 수 있어요.
          </p>
          <h2>4. 첫 동호회 만들기</h2>
          <p>
            이메일로 가입한 뒤 동호회를 만들고 친구를 초대하세요. 소셜 로그인은 Supabase
            대시보드에서 제공자를 활성화한 뒤 사용할 수 있어요.
          </p>
          <Link href="/login" className="button">
            로그인 화면 보기
          </Link>
        </div>
      </div>
    );
  if (route === 'about')
    return (
      <div className="page narrow">
        <Heading
          eyebrow="WHY SSUBON"
          title="선택의 시작은, 사람."
          description="이 제품을 실제로 써본, 내가 믿을 수 있는 사람에게 물어보고 산다."
        />
        <div className="panel prose">
          <h2>신뢰 관계 → 실제 사용자 → 사용 맥락</h2>
          <p>
            써본사람은 같이 운동하는 사람들의 장비와 경험을 통해 더 믿을 수 있는 구매 결정을
            돕습니다.
          </p>
          <h2>경험이 먼저입니다.</h2>
          <p>
            누가 쓰는지, 어떻게 쓰는지, 다시 살 의향이 있는지 먼저 보여드립니다. 가격과 구매 링크는
            그다음입니다.
          </p>
          <h2>투명한 제휴</h2>
          <p>
            판매처의 제휴 수수료는 경험과 추천 순위에 영향을 주지 않습니다. 수수료를 받을 수 있는
            구매 링크에는 안내를 표시합니다.
          </p>
          <h2>나의 경험은 내가 선택한 범위에만</h2>
          <p>장비를 전체 공개, 동호회만 또는 나만 보기로 등록할 수 있습니다.</p>
        </div>
      </div>
    );
  notFound();
}
