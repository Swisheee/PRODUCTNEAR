export default function Loading() {
  return (
    <div className="page">
      <p role="status">사람들의 경험을 불러오고 있어요…</p>
      {[1, 2, 3].map((n) => (
        <div className="skeleton" key={n} />
      ))}
    </div>
  );
}
