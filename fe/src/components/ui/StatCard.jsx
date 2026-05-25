function StatCard({ label, value, icon: Icon, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-[#2563EB]',
    teal: 'bg-teal-50 text-[#14B8A6]',
    green: 'bg-green-50 text-[#16A34A]',
    amber: 'bg-amber-50 text-[#F59E0B]',
    red: 'bg-red-50 text-[#EF4444]',
    slate: 'bg-slate-100 text-[#64748B]',
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-[#1E293B]">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${accents[accent] || accents.blue}`}>
            <Icon className="text-lg" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
