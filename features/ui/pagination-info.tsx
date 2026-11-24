export function PaginationInfo({
  total,
  start,
  end,
}: {
  total: number;
  start: number;
  end: number;
}) {
  return (
    <div className="flex items-center justify-center text-sm text-gray-500 space-x-1">
      <span className="text-slate-600 font-bold">{total}</span>
      <span>件中</span>
      <span className="text-slate-600 font-bold">
        {start}~{end}
      </span>
      <span>件表示中</span>
    </div>
  );
}
