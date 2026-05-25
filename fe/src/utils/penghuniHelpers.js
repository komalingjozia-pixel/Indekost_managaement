import { formatRupiah } from './formatRupiah.js';

export const formatPenghuniOptionLabel = (penghuni) => {
  if (!penghuni) return '';
  const nama = penghuni.nama || '-';

  if (!penghuni.id_kamar || !penghuni.kamar) {
    return `${nama} - Belum memiliki kamar`;
  }

  const nomor = penghuni.kamar.nomor_kamar || '-';
  const harga = Number(penghuni.kamar.harga_bulanan);
  if (!harga || harga <= 0) {
    return `${nama} - Kamar ${nomor} - Harga belum diatur`;
  }

  return `${nama} - Kamar ${nomor} - ${formatRupiah(harga)}`;
};

export const getHargaKamarPenghuni = (penghuni) => {
  const harga = Number(penghuni?.kamar?.harga_bulanan);
  if (!harga || harga <= 0) return null;
  return harga;
};

export const penghuniHasKamar = (penghuni) =>
  Boolean(penghuni?.id_kamar && penghuni?.kamar?.nomor_kamar);
