import supabase from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  computePaymentFromJumlahBayar,
  mapPembayaranRow,
} from '../utils/pembayaranHelper.js';
import { validateCicilan, validatePembayaranCreate } from '../utils/validators.js';

const mapDbError = (err) => {
  if (err?.code === '23505') {
    return 'Pembayaran untuk periode ini sudah tercatat';
  }
  return null;
};

const isDuplicatePembayaran = async (idPenghuni, bulan, tahun) => {
  const { data, error } = await supabase
    .from('pembayaran')
    .select('id')
    .eq('id_penghuni', idPenghuni)
    .eq('bulan', bulan)
    .eq('tahun', Number(tahun))
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return Boolean(data);
};

const getDetailCountMap = async (pembayaranIds) => {
  if (!pembayaranIds.length) return {};

  const { data, error } = await supabase
    .from('detail_pembayaran')
    .select('id_pembayaran')
    .in('id_pembayaran', pembayaranIds);

  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => {
    map[row.id_pembayaran] = (map[row.id_pembayaran] || 0) + 1;
  });
  return map;
};

const getPenghuniForPayment = async (idPenghuni) => {
  const { data, error } = await supabase
    .from('penghuni')
    .select('id, nama, status, id_kamar, kamar(id, nomor_kamar, harga_bulanan, status)')
    .eq('id', idPenghuni)
    .single();

  if (error || !data) return null;
  return data;
};

export const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pembayaran')
      .select(`
        *,
        penghuni (
          id,
          nama,
          id_kamar,
          kamar (nomor_kamar, harga_bulanan, status)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const ids = (data || []).map((p) => p.id);
    const countMap = await getDetailCountMap(ids);

    const result = (data || []).map((item) =>
      mapPembayaranRow(item, countMap[item.id] || 0)
    );

    return sendSuccess(res, result);
  } catch (err) {
    console.error('get pembayaran error:', err);
    return sendError(res, 'Gagal memuat data pembayaran', 500);
  }
};

export const create = async (req, res) => {
  try {
    const {
      id_penghuni, bulan, tahun, jumlah_bayar, tanggal_bayar, keterangan,
    } = req.body;

    const penghuni = await getPenghuniForPayment(id_penghuni);
    if (!penghuni) return sendError(res, 'Penghuni tidak ditemukan');

    if (!penghuni.id_kamar || !penghuni.kamar) {
      return sendError(res, 'Penghuni belum memiliki kamar. Lengkapi data kamar terlebih dahulu.');
    }

    const harga = Number(penghuni.kamar.harga_bulanan);
    if (!harga || harga <= 0) {
      return sendError(res, 'Harga kamar belum tersedia.');
    }

    const nominal = harga;

    const validation = validatePembayaranCreate({
      id_penghuni,
      bulan,
      tahun,
      nominal,
      jumlah_bayar,
      tanggal_bayar,
      keterangan,
    });
    if (!validation.valid) return sendError(res, validation.message);

    if (await isDuplicatePembayaran(id_penghuni, bulan, tahun)) {
      return sendError(res, 'Pembayaran untuk periode ini sudah tercatat');
    }

    const bayar = jumlah_bayar === '' || jumlah_bayar === null || jumlah_bayar === undefined
      ? 0
      : Number(jumlah_bayar);

    const computed = computePaymentFromJumlahBayar(nominal, bayar);

    const { data: pembayaran, error } = await supabase
      .from('pembayaran')
      .insert({
        id_penghuni,
        bulan,
        tahun: Number(tahun),
        nominal,
        total_dibayar: computed.total_dibayar,
        sisa_tagihan: computed.sisa_tagihan,
        status: computed.status,
        tanggal_bayar: bayar > 0 ? tanggal_bayar : null,
        tanggal_lunas: computed.status === 'lunas' ? tanggal_bayar : null,
        keterangan: keterangan?.trim() || null,
      })
      .select(`
        *,
        penghuni (id, nama, id_kamar, kamar (nomor_kamar, harga_bulanan, status))
      `)
      .single();

    if (error) {
      const msg = mapDbError(error);
      if (msg) return sendError(res, msg);
      throw error;
    }

    if (bayar > 0) {
      const { error: detailError } = await supabase.from('detail_pembayaran').insert({
        id_pembayaran: pembayaran.id,
        pembayaran_ke: 1,
        jumlah_bayar: computed.status === 'lunas' ? nominal : bayar,
        tanggal_bayar,
        keterangan: keterangan?.trim() || null,
      });
      if (detailError) throw detailError;
    }

    return sendSuccess(
      res,
      mapPembayaranRow(pembayaran, bayar > 0 ? 1 : 0),
      'Pembayaran berhasil ditambahkan',
      201
    );
  } catch (err) {
    console.error('create pembayaran error:', err);
    return sendError(res, 'Gagal menambahkan pembayaran', 500);
  }
};

export const getDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pembayaran } = await supabase
      .from('pembayaran')
      .select('id')
      .eq('id', id)
      .single();

    if (!pembayaran) {
      return sendError(res, 'Data pembayaran tidak ditemukan', 404);
    }

    const { data, error } = await supabase
      .from('detail_pembayaran')
      .select('*')
      .eq('id_pembayaran', id)
      .order('pembayaran_ke', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, data || [], 'Detail pembayaran berhasil diambil');
  } catch (err) {
    console.error('get detail pembayaran error:', err);
    return sendError(res, 'Gagal memuat detail pembayaran', 500);
  }
};

export const addCicilan = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah_bayar, tanggal_bayar, keterangan } = req.body;

    const { data: pembayaran, error: payError } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('id', id)
      .single();

    if (payError || !pembayaran) {
      return sendError(res, 'Data pembayaran tidak ditemukan', 404);
    }

    if (pembayaran.status === 'lunas') {
      return sendError(res, 'Pembayaran ini sudah lunas');
    }

    const validation = validateCicilan(
      { jumlah_bayar, tanggal_bayar, keterangan },
      pembayaran.sisa_tagihan
    );
    if (!validation.valid) return sendError(res, validation.message);

    const bayar = Number(jumlah_bayar);

    const { count: detailCount, error: countError } = await supabase
      .from('detail_pembayaran')
      .select('id', { count: 'exact', head: true })
      .eq('id_pembayaran', id);

    if (countError) throw countError;

    const pembayaranKe = (detailCount || 0) + 1;

    const { error: detailError } = await supabase.from('detail_pembayaran').insert({
      id_pembayaran: id,
      pembayaran_ke: pembayaranKe,
      jumlah_bayar: bayar,
      tanggal_bayar,
      keterangan: keterangan?.trim() || null,
    });

    if (detailError) throw detailError;

    const totalDibayarBaru = Number(pembayaran.total_dibayar || 0) + bayar;
    const sisaBaru = Number(pembayaran.nominal) - totalDibayarBaru;
    const statusBaru = sisaBaru <= 0 ? 'lunas' : 'cicil';

    const { data: updated, error: updateError } = await supabase
      .from('pembayaran')
      .update({
        total_dibayar: totalDibayarBaru,
        sisa_tagihan: Math.max(0, sisaBaru),
        status: statusBaru,
        tanggal_bayar: pembayaran.tanggal_bayar || tanggal_bayar,
        tanggal_lunas: statusBaru === 'lunas' ? tanggal_bayar : null,
      })
      .eq('id', id)
      .select(`
        *,
        penghuni (id, nama, id_kamar, kamar (nomor_kamar, harga_bulanan, status))
      `)
      .single();

    if (updateError) throw updateError;

    return sendSuccess(
      res,
      mapPembayaranRow(updated, pembayaranKe),
      'Cicilan berhasil ditambahkan'
    );
  } catch (err) {
    console.error('add cicilan error:', err);
    return sendError(res, 'Gagal menambahkan cicilan', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pembayaran')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 'Pembayaran tidak ditemukan', 404);

    return sendSuccess(res, null, 'Pembayaran berhasil dihapus');
  } catch (err) {
    console.error('delete pembayaran error:', err);
    return sendError(res, 'Gagal menghapus pembayaran', 500);
  }
};
