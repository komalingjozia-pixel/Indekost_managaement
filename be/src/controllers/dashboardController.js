import supabase from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const bulanIni = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ][now.getMonth()];
    const tahunIni = now.getFullYear();

    const [
      { count: totalPenghuni },
      { count: totalKamar },
      { count: kamarKosong },
      { count: kamarTerisi },
      { count: kamarPerbaikan },
      { count: pembayaranLunas },
      { count: pembayaranBelumLunas },
      { data: pembayaranBulanIni },
      { data: pembayaranTerbaru },
      { data: penghuniTerbaru },
    ] = await Promise.all([
      supabase.from('penghuni').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
      supabase.from('kamar').select('*', { count: 'exact', head: true }),
      supabase.from('kamar').select('*', { count: 'exact', head: true }).eq('status', 'kosong'),
      supabase.from('kamar').select('*', { count: 'exact', head: true }).eq('status', 'terisi'),
      supabase.from('kamar').select('*', { count: 'exact', head: true }).eq('status', 'perbaikan'),
      supabase.from('pembayaran').select('*', { count: 'exact', head: true }).eq('status', 'lunas'),
      supabase.from('pembayaran').select('*', { count: 'exact', head: true }).in('status', ['belum lunas', 'cicil']),
      supabase
        .from('pembayaran')
        .select('total_dibayar')
        .eq('bulan', bulanIni)
        .eq('tahun', tahunIni),
      supabase
        .from('pembayaran')
        .select('id, bulan, tahun, nominal, status, tanggal_bayar, penghuni(nama, kamar(nomor_kamar))')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('penghuni')
        .select('id, nama, status, tanggal_masuk, kamar(nomor_kamar)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const totalPendapatanBulanIni = (pembayaranBulanIni || []).reduce(
      (sum, item) => sum + Number(item.total_dibayar || 0),
      0
    );

    const totalKamarNum = totalKamar || 0;

    return sendSuccess(res, {
      total_penghuni: totalPenghuni || 0,
      total_kamar: totalKamarNum,
      kamar_kosong: kamarKosong || 0,
      kamar_terisi: kamarTerisi || 0,
      kamar_perbaikan: kamarPerbaikan || 0,
      pembayaran_lunas: pembayaranLunas || 0,
      pembayaran_belum_lunas: pembayaranBelumLunas || 0,
      total_pendapatan_bulan_ini: totalPendapatanBulanIni,
      bulan_berjalan: bulanIni,
      tahun_berjalan: tahunIni,
      status_kamar: {
        kosong: kamarKosong || 0,
        terisi: kamarTerisi || 0,
        perbaikan: kamarPerbaikan || 0,
        total: totalKamarNum,
      },
      pembayaran_terbaru: pembayaranTerbaru || [],
      penghuni_terbaru: penghuniTerbaru || [],
    });
  } catch (err) {
    console.error('dashboard summary error:', err);
    return sendError(res, 'Gagal memuat ringkasan dashboard', 500);
  }
};
