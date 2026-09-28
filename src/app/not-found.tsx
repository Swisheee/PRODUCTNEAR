import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="empty">
      <h1>이 페이지를 볼 수 없어요.</h1>
      <p>주소가 바뀌었거나, 동호회 가입이 필요한 페이지일 수 있어요.</p>
      <Link className="button" href="/">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
