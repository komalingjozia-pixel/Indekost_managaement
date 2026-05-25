import supabase from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  updateKamarStatus,
  validateKamarForPenghuni,
} from '../utils/kamarHelper.js';
import { validatePenghuni } from '../utils/validators.js';

const buildPenghuniPayload = (body) => {
  const status = body.status === 'keluar' ? 'keluar' : 'aktif';

  return {
    nama: body.nama.trim(),
    nik: body.nik?.trim() || null,
    no_hp: body.no_hp.trim(),
    alamat: body.alamat?.trim() || null,
    tanggal_masuk: body.tanggal_masuk,
    tanggal_keluar: status === 'keluar' ? body.tanggal_keluar : null,
    id_kamar: status === 'aktif' ? body.id_kamar : null,
    status,
  };
};

export const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('penghuni')
      .select('*, kamar(id, nomor_kamar, tipe_kamar, harga_bulanan, status)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sendSuccess(res, data);
  } catch (err) {
    console.error('get penghuni error:', err);
    return sendError(res, 'Gagal memuat data penghuni', 500);
  }
};

export const create = async (req, res) => {
  try {
    const validation = validatePenghuni(req.body);
    if (!validation.valid) return sendError(res, validation.message);

    const payload = buildPenghuniPayload(req.body);

    if (payload.status === 'aktif') {
      const kamarCheck = await validateKamarForPenghuni(payload.id_kamar);
      if (!kamarCheck.valid) return sendError(res, kamarCheck.message);
    }

    const { data, error } = await supabase
      .from('penghuni')
      .insert(payload)
      .select('*, kamar(id, nomor_kamar, tipe_kamar, harga_bulanan, status)')
      .single();

    if (error) throw error;

    if (payload.status === 'aktif' && payload.id_kamar) {
      await updateKamarStatus(payload.id_kamar);
    }

    return sendSuccess(res, data, 'Penghuni berhasil ditambahkan', 201);
  } catch (err) {
    console.error('create penghuni error:', err);
    return sendError(res, 'Gagal menambahkan penghuni', 500);
  }
};

export const update = async (req, res) => {
  try {
    const validation = validatePenghuni(req.body);
    if (!validation.valid) return sendError(res, validation.message);

    const { id } = req.params;
    const payload = buildPenghuniPayload(req.body);

    const { data: existing } = await supabase
      .from('penghuni')
      .select('id_kamar, status')
      .eq('id', id)
      .single();

    if (!existing) return sendError(res, 'Penghuni tidak ditemukan', 404);

    const oldKamarId = existing.id_kamar;

    if (payload.status === 'aktif') {
      const kamarCheck = await validateKamarForPenghuni(payload.id_kamar, id);
      if (!kamarCheck.valid) return sendError(res, kamarCheck.message);
    }

    const { data, error } = await supabase
      .from('penghuni')
      .update(payload)
      .eq('id', id)
      .select('*, kamar(id, nomor_kamar, tipe_kamar, harga_bulanan, status)')
      .single();

    if (error) throw error;

    if (oldKamarId && oldKamarId !== payload.id_kamar) {
      await updateKamarStatus(oldKamarId);
    }

    if (payload.status === 'aktif' && payload.id_kamar) {
      await updateKamarStatus(payload.id_kamar);
    } else if (payload.status === 'keluar' && oldKamarId) {
      await updateKamarStatus(oldKamarId);
    }

    return sendSuccess(res, data, 'Penghuni berhasil diperbarui');
  } catch (err) {
    console.error('update penghuni error:', err);
    return sendError(res, 'Gagal memperbarui penghuni', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { count: paymentCount, error: payError } = await supabase
      .from('pembayaran')
      .select('id', { count: 'exact', head: true })
      .eq('id_penghuni', id);

    if (payError) throw payError;

    if ((paymentCount || 0) > 0) {
      return sendError(
        res,
        'Penghuni sudah memiliki riwayat pembayaran. Ubah status menjadi keluar.'
      );
    }

    const { data: existing } = await supabase
      .from('penghuni')
      .select('id_kamar')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('penghuni')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 'Penghuni tidak ditemukan', 404);

    if (existing?.id_kamar) {
      await updateKamarStatus(existing.id_kamar);
    }

    return sendSuccess(res, null, 'Penghuni berhasil dihapus');
  } catch (err) {
    console.error('delete penghuni error:', err);
    return sendError(res, 'Gagal menghapus penghuni', 500);
  }
};
