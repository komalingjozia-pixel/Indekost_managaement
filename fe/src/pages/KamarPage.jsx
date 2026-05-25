import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import { joinFasilitasArray, parseFasilitasString } from '../constants/fasilitasOptions.js';
import Button from '../components/ui/Button.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import FasilitasSelect from '../components/ui/FasilitasSelect.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { formatRupiah } from '../utils/formatRupiah.js';
import { onlyDigits, validateKamarForm } from '../utils/validators.js';

const initialForm = {
  nomor_kamar: '',
  tipe_kamar: '',
  harga_bulanan: '',
  status: 'kosong',
};

function KamarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fasilitasSelected, setFasilitasSelected] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get('/kamar');
      setItems(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data kamar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.nomor_kamar?.toLowerCase().includes(search.toLowerCase()) ||
        item.tipe_kamar?.toLowerCase().includes(search.toLowerCase()) ||
        item.fasilitas?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setFasilitasSelected([]);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      nomor_kamar: item.nomor_kamar,
      tipe_kamar: item.tipe_kamar || '',
      harga_bulanan: String(item.harga_bulanan),
      status: item.status,
    });
    setFasilitasSelected(parseFasilitasString(item.fasilitas));
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fasilitasStr = joinFasilitasArray(fasilitasSelected);
    const payloadForm = { ...form, fasilitas: fasilitasStr };

    const validation = validateKamarForm(payloadForm);
    setErrors(validation.errors);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...payloadForm,
        harga_bulanan: Number(form.harga_bulanan),
        fasilitas: fasilitasStr || null,
      };
      if (editId) {
        await axiosInstance.put(`/kamar/${editId}`, payload);
        toast.success('Kamar berhasil diperbarui');
      } else {
        await axiosInstance.post('/kamar', payload);
        toast.success('Kamar berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kamar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/kamar/${deleteId}`);
      toast.success('Kamar berhasil dihapus');
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kamar');
    } finally {
      setSaving(false);
    }
  };

  const modalFooter = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
        Batal
      </Button>
      <Button type="submit" form="kamar-form" disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kamar"
        subtitle="Kelola kamar indekos sebagai data awal sebelum penghuni ditambahkan"
        action={
          <Button onClick={openCreate}>
            <FiPlus />
            Tambah Kamar
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Cari nomor kamar, tipe, fasilitas..."
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
          <option value="kosong">Kosong</option>
          <option value="terisi">Terisi</option>
          <option value="perbaikan">Perbaikan</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor Kamar</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Harga Bulanan</th>
                <th className="px-4 py-3 font-medium">Fasilitas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-[#64748B]">Memuat data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-[#64748B]">Belum ada data kamar</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{item.nomor_kamar}</td>
                    <td className="px-4 py-3">{item.tipe_kamar || '-'}</td>
                    <td className="px-4 py-3">{formatRupiah(item.harga_bulanan)}</td>
                    <td className="max-w-[200px] truncate px-4 py-3">{item.fasilitas || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-[#2563EB] hover:bg-blue-50">
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }}
                          className="rounded-lg p-2 text-[#EF4444] hover:bg-red-50"
                        >
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
        title={editId ? 'Edit Kamar' : 'Tambah Kamar'}
        size="lg"
        footer={modalFooter}
      >
        <form id="kamar-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="nomor_kamar"
            label="Nomor Kamar"
            value={form.nomor_kamar}
            onChange={(e) => setForm({ ...form, nomor_kamar: e.target.value })}
            error={errors.nomor_kamar}
          />
          <Input
            id="tipe_kamar"
            label="Tipe Kamar"
            value={form.tipe_kamar}
            onChange={(e) => setForm({ ...form, tipe_kamar: e.target.value })}
            error={errors.tipe_kamar}
          />
          <Input
            id="harga_bulanan"
            label="Harga Bulanan"
            inputMode="numeric"
            min="0"
            value={form.harga_bulanan}
            onChange={(e) => setForm({ ...form, harga_bulanan: onlyDigits(e.target.value) })}
            error={errors.harga_bulanan}
          />
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#1E293B]">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            >
              <option value="kosong">Kosong</option>
              <option value="terisi">Terisi</option>
              <option value="perbaikan">Perbaikan</option>
            </select>
            {errors.status && <p className="mt-1 text-xs text-[#EF4444]">{errors.status}</p>}
          </div>
          <div className="md:col-span-2">
            <FasilitasSelect
              selected={fasilitasSelected}
              onChange={setFasilitasSelected}
              error={errors.fasilitas}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Yakin ingin menghapus kamar ini?"
        loading={saving}
      />
    </div>
  );
}

export default KamarPage;
