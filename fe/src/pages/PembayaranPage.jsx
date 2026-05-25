import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiEdit2,
  FiEye,
  FiPlus,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import Button from '../components/ui/Button.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { formatDate } from '../utils/formatDate.js';
import { formatRupiah } from '../utils/formatRupiah.js';
import {
  formatPenghuniOptionLabel,
  getHargaKamarPenghuni,
  penghuniHasKamar,
} from '../utils/penghuniHelpers.js';
import { computePreviewStatus } from '../utils/pembayaranHelpers.js';
import {
  BULAN_LIST,
  onlyDigits,
  validateCicilanForm,
  validatePembayaranCreateForm,
} from '../utils/validators.js';

const getInitialForm = () => ({
  id_penghuni: '',
  bulan: BULAN_LIST[new Date().getMonth()],
  tahun: String(new Date().getFullYear()),
  nominal: '',
  jumlah_bayar: '',
  tanggal_bayar: '',
  keterangan: '',
});

function PembayaranPage() {
  const [items, setItems] = useState([]);
  const [penghuniList, setPenghuniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bulanFilter, setBulanFilter] = useState('');
  const [tahunFilter, setTahunFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [cicilanModalOpen, setCicilanModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailList, setDetailList] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState(getInitialForm);
  const [cicilanForm, setCicilanForm] = useState({
    jumlah_bayar: '',
    tanggal_bayar: '',
    keterangan: '',
  });
  const [errors, setErrors] = useState({});
  const [cicilanErrors, setCicilanErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedPenghuni = useMemo(
    () => penghuniList.find((p) => p.id === form.id_penghuni),
    [penghuniList, form.id_penghuni]
  );

  const previewStatus = useMemo(
    () => computePreviewStatus(form.nominal, form.jumlah_bayar),
    [form.nominal, form.jumlah_bayar]
  );

  const fetchData = async () => {
    try {
      const [pembayaranRes, penghuniRes] = await Promise.all([
        axiosInstance.get('/pembayaran'),
        axiosInstance.get('/penghuni'),
      ]);
      setItems(pembayaranRes.data.data || []);
      setPenghuniList((penghuniRes.data.data || []).filter((p) => p.status === 'aktif'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        item.nama_penghuni?.toLowerCase().includes(q) ||
        item.nomor_kamar?.toLowerCase().includes(q) ||
        item.keterangan?.toLowerCase().includes(q) ||
        item.info_cicilan?.toLowerCase().includes(q);
      const matchBulan = !bulanFilter || item.bulan === bulanFilter;
      const matchTahun = !tahunFilter || String(item.tahun) === String(tahunFilter);
      const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
      return matchSearch && matchBulan && matchTahun && matchStatus;
    });
  }, [items, search, bulanFilter, tahunFilter, statusFilter]);

  const handlePenghuniChange = (penghuniId) => {
    if (!penghuniId) {
      setForm((prev) => ({ ...prev, id_penghuni: '', nominal: '' }));
      return;
    }

    const penghuni = penghuniList.find((p) => p.id === penghuniId);
    if (!penghuni) return;

    if (!penghuniHasKamar(penghuni)) {
      toast.error('Penghuni belum memiliki kamar. Lengkapi data kamar terlebih dahulu.');
      setForm((prev) => ({ ...prev, id_penghuni: penghuniId, nominal: '' }));
      return;
    }

    const harga = getHargaKamarPenghuni(penghuni);
    if (!harga) {
      toast.error('Harga kamar belum tersedia.');
      setForm((prev) => ({ ...prev, id_penghuni: penghuniId, nominal: '' }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      id_penghuni: penghuniId,
      nominal: String(harga),
      jumlah_bayar: '',
      tanggal_bayar: '',
    }));
  };

  const openCreate = () => {
    if (penghuniList.length === 0) {
      toast.error('Tambahkan penghuni aktif terlebih dahulu');
      return;
    }
    setForm(getInitialForm());
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!penghuniHasKamar(selectedPenghuni)) {
      toast.error('Penghuni belum memiliki kamar. Lengkapi data kamar terlebih dahulu.');
      return;
    }
    if (!getHargaKamarPenghuni(selectedPenghuni)) {
      toast.error('Harga kamar belum tersedia.');
      return;
    }

    const validation = validatePembayaranCreateForm(form);
    setErrors(validation.errors);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post('/pembayaran', {
        id_penghuni: form.id_penghuni,
        bulan: form.bulan,
        tahun: Number(form.tahun),
        jumlah_bayar: form.jumlah_bayar === '' ? 0 : Number(form.jumlah_bayar),
        tanggal_bayar: form.tanggal_bayar || null,
        keterangan: form.keterangan,
      });
      toast.success('Pembayaran berhasil ditambahkan');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pembayaran');
    } finally {
      setSaving(false);
    }
  };

  const openCicilanModal = (item) => {
    setSelectedPayment(item);
    setCicilanForm({
      jumlah_bayar: '',
      tanggal_bayar: new Date().toISOString().split('T')[0],
      keterangan: '',
    });
    setCicilanErrors({});
    setCicilanModalOpen(true);
  };

  const handleCicilanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const validation = validateCicilanForm(
      cicilanForm,
      selectedPayment.sisa_tagihan
    );
    setCicilanErrors(validation.errors);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post(`/pembayaran/${selectedPayment.id}/cicilan`, {
        jumlah_bayar: Number(cicilanForm.jumlah_bayar),
        tanggal_bayar: cicilanForm.tanggal_bayar,
        keterangan: cicilanForm.keterangan,
      });
      toast.success('Cicilan berhasil ditambahkan');
      setCicilanModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan cicilan');
    } finally {
      setSaving(false);
    }
  };

  const openDetailModal = async (item) => {
    setSelectedPayment(item);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await axiosInstance.get(`/pembayaran/${item.id}/detail`);
      setDetailList(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat detail');
      setDetailList([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/pembayaran/${deleteId}`);
      toast.success('Pembayaran berhasil dihapus');
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pembayaran');
    } finally {
      setSaving(false);
    }
  };

  const renderKamarInfoCard = () => {
    if (!form.id_penghuni) return null;

    if (!penghuniHasKamar(selectedPenghuni)) {
      return (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 md:col-span-2">
          <FiAlertCircle className="mt-0.5 shrink-0 text-[#F59E0B]" />
          <p className="text-sm text-amber-900">Penghuni belum memiliki kamar.</p>
        </div>
      );
    }

    const harga = getHargaKamarPenghuni(selectedPenghuni);
    if (!harga) {
      return (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 md:col-span-2">
          <FiAlertCircle className="mt-0.5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-red-900">Harga kamar belum tersedia.</p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Info Kamar</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-[#64748B]">Penghuni:</span> {selectedPenghuni?.nama}</div>
          <div><span className="text-[#64748B]">Kamar:</span> {selectedPenghuni?.kamar?.nomor_kamar}</div>
          <div><span className="text-[#64748B]">Harga:</span> {formatRupiah(harga)}</div>
          <div className="capitalize"><span className="text-[#64748B]">Status:</span> {selectedPenghuni?.kamar?.status}</div>
        </div>
      </div>
    );
  };

  const canSubmitCreate =
    form.id_penghuni &&
    penghuniHasKamar(selectedPenghuni) &&
    getHargaKamarPenghuni(selectedPenghuni);

  const cicilanWillLunas =
    selectedPayment &&
    Number(cicilanForm.jumlah_bayar) === Number(selectedPayment.sisa_tagihan);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pembayaran"
        subtitle="Tagihan bulanan dengan dukungan pembayaran cicilan"
        action={
          <Button onClick={openCreate}>
            <FiPlus />
            Tambah Pembayaran
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Cari penghuni, kamar, cicilan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select value={bulanFilter} onChange={(e) => setBulanFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
          <option value="">Semua Bulan</option>
          {BULAN_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
          <option value="semua">Semua Status</option>
          <option value="belum lunas">Belum Lunas</option>
          <option value="cicil">Cicil</option>
          <option value="lunas">Lunas</option>
        </select>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Filter tahun"
          value={tahunFilter}
          onChange={(e) => setTahunFilter(onlyDigits(e.target.value))}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">Penghuni</th>
                <th className="px-4 py-3 font-medium">Kamar</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Tagihan</th>
                <th className="px-4 py-3 font-medium">Dibayar</th>
                <th className="px-4 py-3 font-medium">Sisa</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cicilan</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="px-4 py-10 text-center text-[#64748B]">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-10 text-center text-[#64748B]">Belum ada data pembayaran</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{item.nama_penghuni}</td>
                    <td className="px-4 py-3">{item.nomor_kamar}</td>
                    <td className="px-4 py-3">{item.bulan} {item.tahun}</td>
                    <td className="px-4 py-3">{formatRupiah(item.nominal)}</td>
                    <td className="px-4 py-3">{formatRupiah(item.total_dibayar)}</td>
                    <td className="px-4 py-3">{formatRupiah(item.sisa_tagihan)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{item.info_cicilan}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Detail" onClick={() => openDetailModal(item)} className="rounded-lg p-2 text-[#64748B] hover:bg-slate-100">
                          <FiEye />
                        </button>
                        {item.status !== 'lunas' && (
                          <button type="button" title="Tambah Cicilan" onClick={() => openCicilanModal(item)} className="rounded-lg p-2 text-[#2563EB] hover:bg-blue-50">
                            <FiEdit2 />
                          </button>
                        )}
                        <button type="button" title="Hapus" onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }} className="rounded-lg p-2 text-[#EF4444] hover:bg-red-50">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Pembayaran"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" form="pembayaran-form" disabled={saving || !canSubmitCreate}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <form id="pembayaran-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="id_penghuni" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Penghuni</label>
            <select
              id="id_penghuni"
              value={form.id_penghuni}
              onChange={(e) => handlePenghuniChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Pilih Penghuni --</option>
              {penghuniList.map((p) => (
                <option key={p.id} value={p.id}>{formatPenghuniOptionLabel(p)}</option>
              ))}
            </select>
            {errors.id_penghuni && <p className="mt-1 text-xs text-[#EF4444]">{errors.id_penghuni}</p>}
          </div>

          {renderKamarInfoCard()}

          <div>
            <label htmlFor="bulan" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Bulan</label>
            <select id="bulan" value={form.bulan} onChange={(e) => setForm({ ...form, bulan: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              {BULAN_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <Input id="tahun" label="Tahun" inputMode="numeric" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: onlyDigits(e.target.value) })} error={errors.tahun} />

          <Input id="nominal" label="Total Tagihan" readOnly value={form.nominal ? formatRupiah(form.nominal) : ''} className="[&_input]:bg-slate-50" />

          <Input
            id="jumlah_bayar"
            label="Jumlah Bayar"
            inputMode="numeric"
            min="0"
            value={form.jumlah_bayar}
            onChange={(e) => setForm({ ...form, jumlah_bayar: onlyDigits(e.target.value) })}
            error={errors.jumlah_bayar}
            placeholder="0 jika belum bayar"
          />

          <Input
            id="tanggal_bayar"
            label="Tanggal Bayar"
            type="date"
            value={form.tanggal_bayar}
            onChange={(e) => setForm({ ...form, tanggal_bayar: e.target.value })}
            error={errors.tanggal_bayar}
            disabled={!form.jumlah_bayar || Number(form.jumlah_bayar) <= 0}
          />

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-[#64748B]">Preview Status</p>
            <p className="mt-1 font-medium text-[#1E293B]">{previewStatus.label}</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="keterangan" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Keterangan</label>
            <textarea id="keterangan" rows={2} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={cicilanModalOpen}
        onClose={() => setCicilanModalOpen(false)}
        title="Tambah Cicilan"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCicilanModalOpen(false)}>Batal</Button>
            <Button type="submit" form="cicilan-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Cicilan'}</Button>
          </div>
        }
      >
        {selectedPayment && (
          <form id="cicilan-form" onSubmit={handleCicilanSubmit} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1">
              <p><span className="text-[#64748B]">Total Tagihan:</span> {formatRupiah(selectedPayment.nominal)}</p>
              <p><span className="text-[#64748B]">Sudah Dibayar:</span> {formatRupiah(selectedPayment.total_dibayar)}</p>
              <p><span className="text-[#64748B]">Sisa Tagihan:</span> {formatRupiah(selectedPayment.sisa_tagihan)}</p>
              <p className="font-medium text-[#2563EB]">
                Cicilan berikutnya: Bayaran ke-{(selectedPayment.jumlah_cicilan || 0) + 1}
              </p>
            </div>
            <Input
              id="cicilan_jumlah"
              label="Jumlah Bayar"
              inputMode="numeric"
              value={cicilanForm.jumlah_bayar}
              onChange={(e) => setCicilanForm({ ...cicilanForm, jumlah_bayar: onlyDigits(e.target.value) })}
              error={cicilanErrors.jumlah_bayar}
            />
            {cicilanWillLunas && (
              <p className="text-xs text-[#16A34A]">Pembayaran akan lunas setelah cicilan ini.</p>
            )}
            <Input
              id="cicilan_tanggal"
              label="Tanggal Bayar"
              type="date"
              value={cicilanForm.tanggal_bayar}
              onChange={(e) => setCicilanForm({ ...cicilanForm, tanggal_bayar: e.target.value })}
              error={cicilanErrors.tanggal_bayar}
            />
            <div>
              <label htmlFor="cicilan_ket" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Keterangan</label>
              <textarea id="cicilan_ket" rows={2} value={cicilanForm.keterangan} onChange={(e) => setCicilanForm({ ...cicilanForm, keterangan: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Pembayaran"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-[#1E293B]">{selectedPayment.nama_penghuni} - {selectedPayment.bulan} {selectedPayment.tahun}</p>
              <p className="mt-1 text-[#64748B]">Tagihan {formatRupiah(selectedPayment.nominal)} | Dibayar {formatRupiah(selectedPayment.total_dibayar)} | Sisa {formatRupiah(selectedPayment.sisa_tagihan)}</p>
            </div>
            {detailLoading ? (
              <p className="text-sm text-[#64748B]">Memuat detail...</p>
            ) : detailList.length === 0 ? (
              <p className="text-sm text-[#64748B]">Belum ada pembayaran masuk.</p>
            ) : (
              <div className="space-y-3">
                {detailList.map((d) => (
                  <div key={d.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <p className="font-medium text-[#1E293B]">Bayaran ke-{d.pembayaran_ke}</p>
                    <p className="text-[#64748B]">{formatRupiah(d.jumlah_bayar)} · {formatDate(d.tanggal_bayar)}</p>
                    {d.keterangan && <p className="mt-1 text-xs">{d.keterangan}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Yakin ingin menghapus pembayaran ini?"
        loading={saving}
      />
    </div>
  );
}

export default PembayaranPage;
