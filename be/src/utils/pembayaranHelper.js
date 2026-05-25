export const computePaymentFromJumlahBayar = (nominal, jumlahBayar) => {
  const nominalNum = Number(nominal);
  const bayar = Number(jumlahBayar) || 0;

  if (bayar <= 0) {
    return {
      status: 'belum lunas',
      total_dibayar: 0,
      sisa_tagihan: nominalNum,
    };
  }

  if (bayar >= nominalNum) {
    return {
      status: 'lunas',
      total_dibayar: nominalNum,
      sisa_tagihan: 0,
    };
  }

  return {
    status: 'cicil',
    total_dibayar: bayar,
    sisa_tagihan: nominalNum - bayar,
  };
};

export const getCicilanInfoLabel = (status, jumlahCicilan = 0) => {
  const count = Number(jumlahCicilan) || 0;

  if (status === 'belum lunas' && count === 0) {
    return 'Belum ada pembayaran';
  }
  if (status === 'cicil' && count > 0) {
    return `Bayaran ke-${count}`;
  }
  if (status === 'lunas' && count === 1) {
    return 'Lunas 1x bayar';
  }
  if (status === 'lunas' && count > 1) {
    return `Lunas dalam ${count}x cicilan`;
  }
  return '-';
};

export const mapPembayaranRow = (item, jumlahCicilan = 0) => ({
  id: item.id,
  id_penghuni: item.id_penghuni,
  nama_penghuni: item.penghuni?.nama || '-',
  nomor_kamar: item.penghuni?.kamar?.nomor_kamar || '-',
  bulan: item.bulan,
  tahun: item.tahun,
  nominal: item.nominal,
  total_dibayar: item.total_dibayar ?? 0,
  sisa_tagihan: item.sisa_tagihan ?? item.nominal,
  status: item.status,
  tanggal_bayar: item.tanggal_bayar,
  tanggal_lunas: item.tanggal_lunas,
  keterangan: item.keterangan,
  jumlah_cicilan: jumlahCicilan,
  info_cicilan: getCicilanInfoLabel(item.status, jumlahCicilan),
});
