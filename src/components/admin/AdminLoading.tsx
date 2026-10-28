// Khung chờ khi chuyển tab quản trị: hiện ngay trong lúc server tải dữ liệu
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-ice" aria-busy="true" aria-label="Đang tải">
      <div className="h-[104px] bg-navy" />
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-white ring-1 ring-slate-200" />)}
        </div>
        <div className="mt-6 h-64 rounded-xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
