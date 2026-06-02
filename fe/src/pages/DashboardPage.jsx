import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiGrid,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import StatCard from '../components/ui/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { formatDate } from '../utils/formatDate.js';
import { formatRupiah } from '../utils/formatRupiah.js';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/summary');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-[#64748B]">Memuat ringkasan...</p>
      </div>
    );
  }

  const statusKamar = data?.status_kamar || {};

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">Ringkasan Indekos</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Pantau data penghuni, kamar, dan pembayaran bulanan — {data?.bulan_berjalan}{' '}
          {data?.tahun_berjalan}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Penghuni" value={data?.total_penghuni ?? 0} icon={FiUsers} accent="blue" />
        <StatCard label="Total Kamar" value={data?.total_kamar ?? 0} icon={FiGrid} accent="slate" />
        <StatCard label="Kamar Terisi" value={data?.kamar_terisi ?? 0} icon={FiGrid} accent="green" />
        <StatCard label="Kamar Kosong" value={data?.kamar_kosong ?? 0} icon={FiGrid} accent="teal" />
        <StatCard label="Pembayaran Lunas" value={data?.pembayaran_lunas ?? 0} icon={FiCheckCircle} accent="green" />
        <StatCard label="Belum Lunas" value={data?.pembayaran_belum_lunas ?? 0} icon={FiAlertCircle} accent="amber" />
        <StatCard
   
          label="Pendapatan Bulan Ini"
          value={formatRupiah(data?.total_pendapatan_bulan_ini || 0)}
          icon={FiDollarSign}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="font-semibold text-[#1E293B]">Status Kamar</h3>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Terisi', value: statusKamar.terisi, color: 'bg-[#16A34A]', pct: statusKamar.total },
              { label: 'Kosong', value: statusKamar.kosong, color: 'bg-[#2563EB]', pct: statusKamar.total },
              { label: 'Perbaikan', value: statusKamar.perbaikan, color: 'bg-[#F59E0B]', pct: statusKamar.total },
            ].map(({ label, value, color, pct }) => {
              const percent = pct ? Math.round(((value || 0) / pct) * 100) : 0;
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[#64748B]">{label}</span>
                    <span className="font-medium text-[#1E293B]">{value || 0}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="font-semibold text-[#1E293B]">Pembayaran Terbaru</h3>
          <div className="mt-4 space-y-3">
            {(data?.pembayaran_terbaru || []).length === 0 ? (
              <p className="text-sm text-[#64748B]">Belum ada pembayaran</p>
            ) : (
              data.pembayaran_terbaru.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1E293B]">
                      {item.penghuni?.nama || '-'}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {item.bulan} {item.tahun}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1E293B]">{formatRupiah(item.nominal)}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="font-semibold text-[#1E293B]">Penghuni Terbaru</h3>
          <div className="mt-4 space-y-3">
            {(data?.penghuni_terbaru || []).length === 0 ? (
              <p className="text-sm text-[#64748B]">Belum ada penghuni</p>
            ) : (
              data.penghuni_terbaru.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1E293B]">{item.nama}</p>
                    <p className="text-xs text-[#64748B]">
                      Kamar {item.kamar?.nomor_kamar || '-'} · {formatDate(item.tanggal_masuk)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
