export const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const todayStr = () => new Date().toISOString().split('T')[0];

const firstError = (errors) => Object.values(errors)[0] || 'Data tidak valid';

export const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

export const validateLoginForm = (form) => {
  const errors = {};

  if (!form.username?.trim()) errors.username = 'Username wajib diisi';
  else if (form.username.trim().length < 3) errors.username = 'Username minimal 3 karakter';

  if (!form.password?.trim()) errors.password = 'Password wajib diisi';
  else if (form.password.length < 6) errors.password = 'Password minimal 6 karakter';

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validateKamarForm = (form) => {
  const errors = {};

  if (!form.nomor_kamar?.trim()) errors.nomor_kamar = 'Nomor kamar wajib diisi';
  else if (form.nomor_kamar.trim().length > 10) errors.nomor_kamar = 'Nomor kamar maksimal 10 karakter';
  else if (!/^[a-zA-Z0-9\s/-]+$/.test(form.nomor_kamar.trim())) {
    errors.nomor_kamar = 'Nomor kamar hanya boleh huruf, angka, spasi, garis miring, dan strip';
  }

  if (form.tipe_kamar && form.tipe_kamar.length > 50) {
    errors.tipe_kamar = 'Tipe kamar maksimal 50 karakter';
  }

  if (form.fasilitas && form.fasilitas.length > 255) {
    errors.fasilitas = 'Fasilitas maksimal 255 karakter';
  }

  const harga = Number(form.harga_bulanan);
  if (!form.harga_bulanan && form.harga_bulanan !== 0) {
    errors.harga_bulanan = 'Harga bulanan wajib diisi';
  } else if (Number.isNaN(harga)) errors.harga_bulanan = 'Harga bulanan harus angka';
  else if (harga <= 0) errors.harga_bulanan = 'Harga bulanan harus lebih dari 0';
  else if (harga > 100000000) errors.harga_bulanan = 'Harga bulanan maksimal Rp 100.000.000';

  if (!form.status) errors.status = 'Status wajib dipilih';
  else if (!['kosong', 'terisi', 'perbaikan'].includes(form.status)) {
    errors.status = 'Status kamar tidak valid';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validatePenghuniForm = (form) => {
  const errors = {};

  if (!form.nama?.trim()) errors.nama = 'Nama wajib diisi';
  else if (form.nama.trim().length < 3) errors.nama = 'Nama minimal 3 karakter';
  else if (form.nama.trim().length > 100) errors.nama = 'Nama maksimal 100 karakter';
  else if (!/^[a-zA-Z\s.'-]+$/.test(form.nama.trim())) {
    errors.nama = 'Nama hanya boleh huruf, spasi, titik, apostrof, dan strip';
  }

  if (form.nik?.trim() && !/^\d{16}$/.test(form.nik.trim())) {
    errors.nik = 'NIK harus tepat 16 digit angka';
  }

  if (!form.no_hp?.trim()) errors.no_hp = 'Nomor HP wajib diisi';
  else if (!/^\d+$/.test(form.no_hp.trim())) errors.no_hp = 'Nomor HP hanya boleh angka';
  else if (form.no_hp.trim().length < 10) errors.no_hp = 'Nomor HP minimal 10 digit';
  else if (form.no_hp.trim().length > 12) errors.no_hp = 'Nomor HP maksimal 12 digit';

  if (form.alamat && form.alamat.length > 255) errors.alamat = 'Alamat maksimal 255 karakter';

  if (!form.tanggal_masuk) errors.tanggal_masuk = 'Tanggal masuk wajib diisi';
  else if (form.tanggal_masuk > todayStr()) {
    errors.tanggal_masuk = 'Tanggal masuk tidak boleh lebih dari hari ini';
  }

  if (!form.status) errors.status = 'Status wajib dipilih';
  else if (!['aktif', 'keluar'].includes(form.status)) errors.status = 'Status tidak valid';

  if (form.tanggal_keluar && form.tanggal_masuk && form.tanggal_keluar < form.tanggal_masuk) {
    errors.tanggal_keluar = 'Tanggal keluar tidak boleh lebih kecil dari tanggal masuk';
  }

  if (form.status === 'aktif' && form.tanggal_keluar) {
    errors.tanggal_keluar = 'Tanggal keluar harus kosong jika penghuni aktif';
  }

  if (form.status === 'aktif' && !form.id_kamar) {
    errors.id_kamar = 'Kamar wajib dipilih untuk penghuni aktif';
  }

  if (form.status === 'keluar' && !form.tanggal_keluar) {
    errors.tanggal_keluar = 'Tanggal keluar wajib diisi jika penghuni keluar';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validatePembayaranCreateForm = (form) => {
  const errors = {};
  const maxYear = new Date().getFullYear() + 1;

  if (!form.id_penghuni) errors.id_penghuni = 'Penghuni wajib dipilih';

  if (!form.bulan) errors.bulan = 'Bulan wajib diisi';
  else if (!BULAN_LIST.includes(form.bulan)) errors.bulan = 'Bulan tidak valid';

  const tahunNum = Number(form.tahun);
  if (!form.tahun) errors.tahun = 'Tahun wajib diisi';
  else if (Number.isNaN(tahunNum)) errors.tahun = 'Tahun harus angka';
  else if (tahunNum < 2020) errors.tahun = 'Tahun minimal 2020';
  else if (tahunNum > maxYear) errors.tahun = `Tahun maksimal ${maxYear}`;

  const nominalNum = Number(form.nominal);
  if (!form.nominal || Number.isNaN(nominalNum) || nominalNum <= 0) {
    errors.nominal = 'Total tagihan tidak valid';
  }

  const bayar = form.jumlah_bayar === '' || form.jumlah_bayar === null || form.jumlah_bayar === undefined
    ? 0
    : Number(form.jumlah_bayar);

  if (Number.isNaN(bayar) || bayar < 0) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh minus';
  } else if (bayar > nominalNum) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh lebih dari total tagihan';
  }

  if (bayar > 0 && !form.tanggal_bayar) {
    errors.tanggal_bayar = 'Tanggal bayar wajib diisi jika ada pembayaran';
  }

  if (form.tanggal_bayar && form.tanggal_bayar > todayStr()) {
    errors.tanggal_bayar = 'Tanggal bayar tidak boleh lebih dari hari ini';
  }

  if (form.keterangan && form.keterangan.length > 255) {
    errors.keterangan = 'Keterangan maksimal 255 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validateCicilanForm = (form, sisaTagihan) => {
  const errors = {};
  const bayar = Number(form.jumlah_bayar);
  const sisa = Number(sisaTagihan);

  if (!form.jumlah_bayar || Number.isNaN(bayar) || bayar <= 0) {
    errors.jumlah_bayar = 'Jumlah bayar harus lebih dari 0';
  } else if (bayar > sisa) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh lebih dari sisa tagihan';
  }

  if (!form.tanggal_bayar) {
    errors.tanggal_bayar = 'Tanggal bayar wajib diisi';
  } else if (form.tanggal_bayar > todayStr()) {
    errors.tanggal_bayar = 'Tanggal bayar tidak boleh lebih dari hari ini';
  }

  if (form.keterangan && form.keterangan.length > 255) {
    errors.keterangan = 'Keterangan maksimal 255 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};
