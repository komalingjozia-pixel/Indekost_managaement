export const computePreviewStatus = (nominal, jumlahBayar) => {
  const tagihan = Number(nominal) || 0;
  const bayar = jumlahBayar === '' || jumlahBayar === null || jumlahBayar === undefined
    ? 0
    : Number(jumlahBayar);

  if (bayar <= 0) return { label: 'Belum Lunas', key: 'belum lunas' };
  if (bayar >= tagihan) return { label: 'Lunas', key: 'lunas' };
  return { label: 'Cicil', key: 'cicil' };
};

export const getAvailableKamarForPenghuni = (kamarList, { isEdit, currentKamarId }) => {
  if (!kamarList?.length) return [];

  if (isEdit && currentKamarId) {
    return kamarList.filter(
      (k) => k.status === 'kosong' || k.id === currentKamarId
    );
  }

  return kamarList.filter((k) => k.status === 'kosong');
};
