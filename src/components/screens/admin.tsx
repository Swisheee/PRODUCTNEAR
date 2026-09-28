import { notFound } from 'next/navigation';
import { configured } from '@/lib/env';
import * as data from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { registry } from '@/lib/commerce';
import { ActionForm } from '../action-form';
import { Heading } from './catalog';
export async function Admin() {
  if (!configured || !(await data.staff())) notFound();
  const db = await createClient();
  const tables = [
    'profiles',
    'clubs',
    'user_gears',
    'questions',
    'click_events',
    'conversions',
  ] as const;
  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await db.from(table).select('*', { count: 'exact', head: true });
      if (error) throw new Error('집계를 불러오지 못했어요.');
      return count || 0;
    }),
  );
  const products = await data.products();
  const options = products.map((p) => ({ value: p.id, label: `${p.brand} ${p.name}` }));
  return (
    <div className="page">
      <Heading
        eyebrow="ADMINISTRATION"
        title="서비스 운영"
        description="권한이 확인된 관리자만 접근할 수 있어요."
      />
      <div className="metric-grid">
        {['가입자', '동호회', '등록 장비', '질문', '외부 이동', '전환 기록'].map((label, i) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{counts[i]}</strong>
          </div>
        ))}
      </div>
      <section className="section">
        <h2>Commerce Providers</h2>
        <div className="panel">
          {registry()
            .list()
            .map((p) => (
              <div className="provider-row" key={p.id}>
                <strong>{p.name}</strong>
                <code>{p.status}</code>
              </div>
            ))}
          <p className="muted">
            키 존재 여부만으로 연결 성공을 표시하지 않습니다. API 계약 검증·연동 구현 전에는 원본
            URL을 사용합니다.
          </p>
        </div>
      </section>
      <section className="section panel">
        <h2>중복 제품 병합</h2>
        <p>
          원본 제품의 장비·판매처·질문·이벤트를 기준 제품으로 이동합니다. 병합 기록을 감사 로그에
          남기며 되돌리기는 지원하지 않아요.
        </p>
        <ActionForm
          kind="merge"
          fields={[
            { name: 'source', label: '병합할 원본 제품', type: 'select', options, required: true },
            { name: 'target', label: '유지할 기준 제품', type: 'select', options, required: true },
          ]}
          submit="기준 제품으로 병합"
        />
      </section>
    </div>
  );
}
