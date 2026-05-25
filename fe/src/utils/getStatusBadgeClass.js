const badgeMap = {
  kosong: 'bg-blue-50 text-[#2563EB] ring-1 ring-blue-100',
  terisi: 'bg-green-50 text-[#16A34A] ring-1 ring-green-100',
  perbaikan: 'bg-amber-50 text-[#F59E0B] ring-1 ring-amber-100',
  aktif: 'bg-green-50 text-[#16A34A] ring-1 ring-green-100',
  keluar: 'bg-slate-100 text-[#64748B] ring-1 ring-slate-200',
  lunas: 'bg-green-50 text-[#16A34A] ring-1 ring-green-100',
  cicil: 'bg-blue-50 text-[#2563EB] ring-1 ring-blue-100',
  'belum lunas': 'bg-amber-50 text-[#F59E0B] ring-1 ring-amber-100',
};

export const getStatusBadgeClass = (status) =>
  badgeMap[status] || 'bg-slate-100 text-[#64748B] ring-1 ring-slate-200';
