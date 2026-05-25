export const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const todayStr = () => new Date().toISOString().split('T')[0];

const firstError = (errors) => Object.values(errors)[0] || 'Data tidak valid';

export const validateLogin = (body) => {
  const errors = {};
  const { username, password } = body || {};

  if (!username?.trim()) errors.username = 'Username wajib diisi';
  else if (username.trim().length < 3) errors.username = 'Username minimal 3 karakter';

  if (!password?.trim()) errors.password = 'Password wajib diisi';
  else if (password.length < 6) errors.password = 'Password minimal 6 karakter';

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validateKamar = (body) => {
  const errors = {};
  const { nomor_kamar, tipe_kamar, harga_bulanan, status, fasilitas } = body || {};

  if (!nomor_kamar?.trim()) errors.nomor_kamar = 'Nomor kamar wajib diisi';
  else if (nomor_kamar.trim().length > 10) errors.nomor_kamar = 'Nomor kamar maksimal 10 karakter';
  else if (!/^[a-zA-Z0-9\s/-]+$/.test(nomor_kamar.trim())) {
    errors.nomor_kamar = 'Nomor kamar hanya boleh huruf, angka, spasi, garis miring, dan strip';
  }

  if (tipe_kamar && tipe_kamar.length > 50) errors.tipe_kamar = 'Tipe kamar maksimal 50 karakter';
  if (fasilitas && fasilitas.length > 255) errors.fasilitas = 'Fasilitas maksimal 255 karakter';

  const harga = Number(harga_bulanan);
  if (harga_bulanan === '' || harga_bulanan === null || harga_bulanan === undefined) {
    errors.harga_bulanan = 'Harga bulanan wajib diisi';
  } else if (Number.isNaN(harga)) errors.harga_bulanan = 'Harga bulanan harus angka';
  else if (harga <= 0) errors.harga_bulanan = 'Harga bulanan harus lebih dari 0';
  else if (harga > 100000000) errors.harga_bulanan = 'Harga bulanan maksimal Rp 100.000.000';

  if (!status) errors.status = 'Status kamar wajib dipilih';
  else if (!['kosong', 'terisi', 'perbaikan'].includes(status)) {
    errors.status = 'Status kamar tidak valid';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validatePenghuni = (body) => {
  const errors = {};
  const {
    nama, nik, no_hp, alamat, tanggal_masuk, tanggal_keluar, status, id_kamar,
  } = body || {};

  const finalStatus = status === 'keluar' ? 'keluar' : status === 'aktif' ? 'aktif' : status;

  if (!nama?.trim()) errors.nama = 'Nama wajib diisi';
  else if (nama.trim().length < 3) errors.nama = 'Nama minimal 3 karakter';
  else if (nama.trim().length > 100) errors.nama = 'Nama maksimal 100 karakter';
  else if (!/^[a-zA-Z\s.'-]+$/.test(nama.trim())) {
    errors.nama = 'Nama hanya boleh huruf, spasi, titik, apostrof, dan strip';
  }

  if (nik?.trim() && !/^\d{16}$/.test(nik.trim())) {
    errors.nik = 'NIK harus tepat 16 digit angka';
  }

  if (!no_hp?.trim()) errors.no_hp = 'Nomor HP wajib diisi';
  else if (!/^\d+$/.test(no_hp.trim())) errors.no_hp = 'Nomor HP hanya boleh angka';
  else if (no_hp.trim().length < 10) errors.no_hp = 'Nomor HP minimal 10 digit';
  else if (no_hp.trim().length > 12) errors.no_hp = 'Nomor HP maksimal 12 digit';

  if (alamat && alamat.length > 255) errors.alamat = 'Alamat maksimal 255 karakter';

  if (!tanggal_masuk) errors.tanggal_masuk = 'Tanggal masuk wajib diisi';
  else if (tanggal_masuk > todayStr()) {
    errors.tanggal_masuk = 'Tanggal masuk tidak boleh lebih dari hari ini';
  }

  if (!finalStatus) errors.status = 'Status wajib dipilih';
  else if (!['aktif', 'keluar'].includes(finalStatus)) {
    errors.status = 'Status penghuni tidak valid';
  }

  if (finalStatus === 'aktif') {
    if (tanggal_keluar) {
      errors.tanggal_keluar = 'Tanggal keluar harus kosong jika penghuni aktif';
    }
    if (!id_kamar) {
      errors.id_kamar = 'Kamar wajib dipilih untuk penghuni aktif';
    }
  }

  if (finalStatus === 'keluar') {
    if (!tanggal_keluar) {
      errors.tanggal_keluar = 'Tanggal keluar wajib diisi jika penghuni keluar';
    } else if (tanggal_masuk && tanggal_keluar < tanggal_masuk) {
      errors.tanggal_keluar = 'Tanggal keluar tidak boleh lebih kecil dari tanggal masuk';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validatePembayaranCreate = (body) => {
  const errors = {};
  const {
    id_penghuni, bulan, tahun, nominal, jumlah_bayar, tanggal_bayar, keterangan,
  } = body || {};
  const maxYear = new Date().getFullYear() + 1;

  if (!id_penghuni) errors.id_penghuni = 'Penghuni wajib dipilih';

  if (!bulan) errors.bulan = 'Bulan wajib diisi';
  else if (!BULAN_LIST.includes(bulan)) errors.bulan = 'Bulan tidak valid';

  const tahunNum = Number(tahun);
  if (!tahun) errors.tahun = 'Tahun wajib diisi';
  else if (Number.isNaN(tahunNum)) errors.tahun = 'Tahun harus angka';
  else if (tahunNum < 2020) errors.tahun = 'Tahun minimal 2020';
  else if (tahunNum > maxYear) errors.tahun = `Tahun maksimal ${maxYear}`;

  const nominalNum = Number(nominal);
  if (!nominal || Number.isNaN(nominalNum) || nominalNum <= 0) {
    errors.nominal = 'Total tagihan tidak valid';
  }

  const bayar = jumlah_bayar === '' || jumlah_bayar === null || jumlah_bayar === undefined
    ? 0
    : Number(jumlah_bayar);

  if (Number.isNaN(bayar) || bayar < 0) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh minus';
  } else if (bayar > nominalNum) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh lebih dari total tagihan';
  }

  if (bayar > 0 && !tanggal_bayar) {
    errors.tanggal_bayar = 'Tanggal bayar wajib diisi jika ada pembayaran';
  }

  if (tanggal_bayar && tanggal_bayar > todayStr()) {
    errors.tanggal_bayar = 'Tanggal bayar tidak boleh lebih dari hari ini';
  }

  if (keterangan && keterangan.length > 255) {
    errors.keterangan = 'Keterangan maksimal 255 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};

export const validateCicilan = (body, sisaTagihan) => {
  const errors = {};
  const { jumlah_bayar, tanggal_bayar, keterangan } = body || {};
  const sisa = Number(sisaTagihan);

  const bayar = Number(jumlah_bayar);
  if (!jumlah_bayar || Number.isNaN(bayar) || bayar <= 0) {
    errors.jumlah_bayar = 'Jumlah bayar harus lebih dari 0';
  } else if (bayar > sisa) {
    errors.jumlah_bayar = 'Jumlah bayar tidak boleh lebih dari sisa tagihan';
  }

  if (!tanggal_bayar) {
    errors.tanggal_bayar = 'Tanggal bayar wajib diisi';
  } else if (tanggal_bayar > todayStr()) {
    errors.tanggal_bayar = 'Tanggal bayar tidak boleh lebih dari hari ini';
  }

  if (keterangan && keterangan.length > 255) {
    errors.keterangan = 'Keterangan maksimal 255 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors, message: firstError(errors) };
};
