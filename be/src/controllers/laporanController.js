import supabase from '../config/supabase.js';
import { getCicilanInfoLabel } from '../utils/pembayaranHelper.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getLaporan = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    let query = supabase
      .from('pembayaran')
      .select(`
        id,
        bulan,
        tahun,
        nominal,
        total_dibayar,
        sisa_tagihan,
        status,
        tanggal_bayar,
        tanggal_lunas,
        keterangan,
        penghuni (
          id,
          nama,
          kamar (nomor_kamar)
        )
      `)
      .order('tahun', { ascending: false })
      .order('created_at', { ascending: false });

    if (bulan) query = query.eq('bulan', bulan);
    if (tahun) query = query.eq('tahun', Number(tahun));

    const { data, error } = await query;
    if (error) throw error;

    const ids = (data || []).map((p) => p.id);
    let countMap = {};

    if (ids.length) {
      const { data: details } = await supabase
        .from('detail_pembayaran')
        .select('id_pembayaran')
        .in('id_pembayaran', ids);

      (details || []).forEach((row) => {
        countMap[row.id_pembayaran] = (countMap[row.id_pembayaran] || 0) + 1;
      });
    }

    const laporan = (data || []).map((item) => {
      const jumlahCicilan = countMap[item.id] || 0;
      return {
        id: item.id,
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
        keterangan: item.keterangan || '-',
        jumlah_cicilan: jumlahCicilan,
        info_cicilan: getCicilanInfoLabel(item.status, jumlahCicilan),
      };
    });

    const totalTagihan = laporan.reduce((sum, row) => sum + Number(row.nominal || 0), 0);
    const totalPendapatanMasuk = laporan.reduce(
      (sum, row) => sum + Number(row.total_dibayar || 0),
      0
    );
    const totalSisaTagihan = laporan.reduce(
      (sum, row) => sum + Number(row.sisa_tagihan || 0),
      0
    );

    return sendSuccess(
      res,
      {
        summary: {
          total_tagihan: totalTagihan,
          total_pendapatan: totalPendapatanMasuk,
          total_sisa_tagihan: totalSisaTagihan,
          total_transaksi: laporan.length,
          pembayaran_lunas: laporan.filter((r) => r.status === 'lunas').length,
          pembayaran_cicil: laporan.filter((r) => r.status === 'cicil').length,
          pembayaran_belum_lunas: laporan.filter((r) => r.status === 'belum lunas').length,
        },
        laporan,
      },
      'Laporan berhasil diambil'
    );
  } catch (err) {
    console.error('laporan error:', err);
    return sendError(res, 'Gagal memuat laporan', 500);
  }
};
