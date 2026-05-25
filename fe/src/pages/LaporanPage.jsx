import { useEffect, useState } from 'react';
import { FiDownload, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import Button from '../components/ui/Button.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { exportLaporanPdf } from '../utils/exportLaporanPdf.js';
import { formatDate } from '../utils/formatDate.js';
import { formatRupiah } from '../utils/formatRupiah.js';
import { BULAN_LIST, onlyDigits } from '../utils/validators.js';

function LaporanPage() {
  const [laporan, setLaporan] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    bulan: BULAN_LIST[new Date().getMonth()],
    tahun: new Date().getFullYear(),
  });
  const [appliedFilter, setAppliedFilter] = useState({
    bulan: BULAN_LIST[new Date().getMonth()],
    tahun: new Date().getFullYear(),
  });

  const fetchLaporan = async (filterValues = filter) => {
    setLoading(true);
    try {
      const params = {};
      if (filterValues.bulan) params.bulan = filterValues.bulan;
      if (filterValues.tahun) params.tahun = filterValues.tahun;

      const { data } = await axiosInstance.get('/laporan', { params });
      setLaporan(data.data.laporan || []);
      setSummary(data.data.summary);
      setAppliedFilter({ ...filterValues });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLaporan(filter);
  };

  const handleExportPdf = () => {
    if (!laporan.length) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    exportLaporanPdf({
      data: laporan,
      bulan: appliedFilter.bulan,
      tahun: appliedFilter.tahun,
      summary,
      adminName: admin.nama_admin || 'Administrator',
    });
    toast.success('Laporan PDF berhasil diunduh');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Pembayaran"
        subtitle="Rekap otomatis dari data pembayaran, penghuni, dan kamar"
        action={
          <Button
            variant="teal"
            onClick={handleExportPdf}
            disabled={loading || laporan.length === 0}
          >
            <FiDownload />
            Export PDF
          </Button>
        }
      />

      <form
        onSubmit={handleFilter}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="bulan" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Bulan</label>
          <select
            id="bulan"
            value={filter.bulan}
            onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          >
            {BULAN_LIST.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="tahun" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Tahun</label>
          <input
            id="tahun"
            inputMode="numeric"
            min="0"
            value={filter.tahun}
            onChange={(e) => setFilter({ ...filter, tahun: onlyDigits(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button type="submit" disabled={loading}>
          <FiFilter />
          Terapkan Filter
        </Button>
      </form>

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total Tagihan" value={formatRupiah(summary.total_tagihan)} accent="slate" />
          <StatCard label="Pendapatan Masuk" value={formatRupiah(summary.total_pendapatan)} accent="blue" />
          <StatCard label="Total Sisa Tagihan" value={formatRupiah(summary.total_sisa_tagihan)} accent="amber" />
          <StatCard label="Lunas" value={summary.pembayaran_lunas} accent="green" />
          <StatCard label="Cicil" value={summary.pembayaran_cicil} accent="blue" />
          <StatCard label="Belum Lunas" value={summary.pembayaran_belum_lunas} accent="amber" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Penghuni</th>
                <th className="px-4 py-3 font-medium">Kamar</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Tagihan</th>
                <th className="px-4 py-3 font-medium">Dibayar</th>
                <th className="px-4 py-3 font-medium">Sisa</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cicilan</th>
                <th className="px-4 py-3 font-medium">Tgl Lunas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-10 text-center text-[#64748B]">
                    Memuat laporan...
                  </td>
                </tr>
              ) : laporan.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-10 text-center text-[#64748B]">
                    Tidak ada data laporan untuk periode ini
                  </td>
                </tr>
              ) : (
                laporan.map((item, index) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{item.nama_penghuni}</td>
                    <td className="px-4 py-3">{item.nomor_kamar}</td>
                    <td className="px-4 py-3">{item.bulan} {item.tahun}</td>
                    <td className="px-4 py-3">{formatRupiah(item.nominal)}</td>
                    <td className="px-4 py-3">{formatRupiah(item.total_dibayar)}</td>
                    <td className="px-4 py-3">{formatRupiah(item.sisa_tagihan)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-xs">{item.info_cicilan}</td>
                    <td className="px-4 py-3">{item.tanggal_lunas ? formatDate(item.tanggal_lunas) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LaporanPage;
