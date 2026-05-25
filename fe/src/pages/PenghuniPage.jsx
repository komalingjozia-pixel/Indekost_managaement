import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import Button from '../components/ui/Button.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { formatDate } from '../utils/formatDate.js';
import { getAvailableKamarForPenghuni } from '../utils/pembayaranHelpers.js';
import { onlyDigits, validatePenghuniForm } from '../utils/validators.js';

const initialForm = {
  nama: '',
  nik: '',
  no_hp: '',
  alamat: '',
  tanggal_masuk: '',
  tanggal_keluar: '',
  id_kamar: '',
  status: 'aktif',
};

function PenghuniPage() {
  const [items, setItems] = useState([]);
  const [kamarList, setKamarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [penghuniRes, kamarRes] = await Promise.all([
        axiosInstance.get('/penghuni'),
        axiosInstance.get('/kamar'),
      ]);
      setItems(penghuniRes.data.data || []);
      setKamarList(kamarRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat penghuni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableKamar = useMemo(
    () =>
      getAvailableKamarForPenghuni(kamarList, {
        isEdit: Boolean(editId),
        currentKamarId: form.id_kamar,
      }),
    [kamarList, editId, form.id_kamar]
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        item.nama?.toLowerCase().includes(q) ||
        item.nik?.includes(q) ||
        item.no_hp?.includes(q) ||
        item.kamar?.nomor_kamar?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const handleStatusChange = (status) => {
    if (status === 'aktif') {
      setForm((prev) => ({
        ...prev,
        status: 'aktif',
        tanggal_keluar: '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        status: 'keluar',
        id_kamar: '',
      }));
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      nama: item.nama,
      nik: item.nik || '',
      no_hp: item.no_hp || '',
      alamat: item.alamat || '',
      tanggal_masuk: item.tanggal_masuk || '',
      tanggal_keluar: item.tanggal_keluar || '',
      id_kamar: item.id_kamar || '',
      status: item.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePenghuniForm(form);
    setErrors(validation.errors);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nama: form.nama,
        nik: form.nik || null,
        no_hp: form.no_hp,
        alamat: form.alamat,
        tanggal_masuk: form.tanggal_masuk,
        status: form.status,
        id_kamar: form.status === 'aktif' ? form.id_kamar : null,
        tanggal_keluar: form.status === 'keluar' ? form.tanggal_keluar : null,
      };

      if (editId) {
        await axiosInstance.put(`/penghuni/${editId}`, payload);
        toast.success('Penghuni berhasil diperbarui');
      } else {
        await axiosInstance.post('/penghuni', payload);
        toast.success('Penghuni berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan penghuni');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/penghuni/${deleteId}`);
      toast.success('Penghuni berhasil dihapus');
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus penghuni');
    } finally {
      setSaving(false);
    }
  };

  const modalFooter = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
      <Button type="submit" form="penghuni-form" disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Penghuni"
        subtitle="Kelola identitas penghuni dan penempatan kamar"
        action={
          <Button onClick={openCreate}>
            <FiPlus />
            Tambah Penghuni
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Cari nama, NIK, HP, kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
        >
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="keluar">Keluar</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">NIK</th>
                <th className="px-4 py-3 font-medium">No HP</th>
                <th className="px-4 py-3 font-medium">Kamar</th>
                <th className="px-4 py-3 font-medium">Tgl Masuk</th>
                <th className="px-4 py-3 font-medium">Tgl Keluar</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-[#64748B]">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-[#64748B]">Belum ada data penghuni</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{item.nama}</td>
                    <td className="px-4 py-3">{item.nik || '-'}</td>
                    <td className="px-4 py-3">{item.no_hp || '-'}</td>
                    <td className="px-4 py-3">{item.kamar?.nomor_kamar || '-'}</td>
                    <td className="px-4 py-3">{formatDate(item.tanggal_masuk)}</td>
                    <td className="px-4 py-3">{formatDate(item.tanggal_keluar)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-[#2563EB] hover:bg-blue-50"><FiEdit2 /></button>
                        <button type="button" onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }} className="rounded-lg p-2 text-[#EF4444] hover:bg-red-50"><FiTrash2 /></button>
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
        title={editId ? 'Edit Penghuni' : 'Tambah Penghuni'}
        size="lg"
        footer={modalFooter}
      >
        <form id="penghuni-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input id="nama" label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} error={errors.nama} />
          <Input id="nik" label="NIK (opsional)" inputMode="numeric" maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: onlyDigits(e.target.value) })} error={errors.nik} />
          <Input id="no_hp" label="No. HP" inputMode="numeric" maxLength={12} value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: onlyDigits(e.target.value) })} error={errors.no_hp} />
          <div className="md:col-span-2">
            <label htmlFor="alamat" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Alamat</label>
            <textarea id="alamat" rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            >
              <option value="aktif">Aktif</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
          <Input
            id="tanggal_masuk"
            label="Tanggal Masuk"
            type="date"
            value={form.tanggal_masuk}
            onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })}
            error={errors.tanggal_masuk}
          />
          <Input
            id="tanggal_keluar"
            label="Tanggal Keluar"
            type="date"
            value={form.tanggal_keluar}
            onChange={(e) => setForm({ ...form, tanggal_keluar: e.target.value })}
            error={errors.tanggal_keluar}
            disabled={form.status === 'aktif'}
          />
          <div className="md:col-span-2">
            <label htmlFor="id_kamar" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Kamar</label>
            <select
              id="id_kamar"
              value={form.id_kamar}
              disabled={form.status === 'keluar'}
              onChange={(e) => setForm({ ...form, id_kamar: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            >
              <option value="">-- Pilih Kamar --</option>
              {availableKamar.map((k) => (
                <option key={k.id} value={k.id}>
                  Kamar {k.nomor_kamar} ({k.status})
                </option>
              ))}
            </select>
            {errors.id_kamar && <p className="mt-1 text-xs text-[#EF4444]">{errors.id_kamar}</p>}
            {form.status === 'keluar' ? (
              <p className="mt-1 text-xs text-[#64748B]">Penghuni keluar tidak wajib memilih kamar.</p>
            ) : (
              <p className="mt-1 text-xs text-[#64748B]">Hanya kamar kosong yang dapat dipilih.</p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Yakin ingin menghapus penghuni ini? Jika sudah ada pembayaran, gunakan ubah status menjadi keluar."
        loading={saving}
      />
    </div>
  );
}

export default PenghuniPage;
