'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>잠시 불러오지 못했어요.</h1>
      <p>인터넷 연결과 Supabase 설정을 확인해주세요.</p>
      <button className="button" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
