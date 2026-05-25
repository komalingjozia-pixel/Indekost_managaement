import supabase from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  hasActivePenghuniInKamar,
  isDuplicateKamarNomor,
} from '../utils/kamarHelper.js';
import { validateKamar } from '../utils/validators.js';

const mapDbError = (err) => {
  if (err?.code === '23505') return 'Nomor kamar sudah digunakan';
  if (err?.message?.includes('chk_kamar')) return 'Data kamar tidak memenuhi aturan database';
  return null;
};

export const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kamar')
      .select('*')
      .order('nomor_kamar', { ascending: true });

    if (error) throw error;
    return sendSuccess(res, data);
  } catch (err) {
    console.error('get kamar error:', err);
    return sendError(res, 'Gagal memuat data kamar', 500);
  }
};

export const create = async (req, res) => {
  try {
    const validation = validateKamar(req.body);
    if (!validation.valid) return sendError(res, validation.message);

    const { nomor_kamar, tipe_kamar, harga_bulanan, status, fasilitas } = req.body;

    if (await isDuplicateKamarNomor(nomor_kamar)) {
      return sendError(res, 'Nomor kamar sudah digunakan');
    }

    const { data, error } = await supabase
      .from('kamar')
      .insert({
        nomor_kamar: nomor_kamar.trim(),
        tipe_kamar: tipe_kamar?.trim() || null,
        harga_bulanan: Number(harga_bulanan),
        status: status || 'kosong',
        fasilitas: fasilitas?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      const msg = mapDbError(error);
      if (msg) return sendError(res, msg);
      throw error;
    }

    return sendSuccess(res, data, 'Kamar berhasil ditambahkan', 201);
  } catch (err) {
    console.error('create kamar error:', err);
    return sendError(res, 'Gagal menambahkan kamar', 500);
  }
};

export const update = async (req, res) => {
  try {
    const validation = validateKamar(req.body);
    if (!validation.valid) return sendError(res, validation.message);

    const { id } = req.params;
    const { nomor_kamar, tipe_kamar, harga_bulanan, status, fasilitas } = req.body;

    if (await isDuplicateKamarNomor(nomor_kamar, id)) {
      return sendError(res, 'Nomor kamar sudah digunakan');
    }

    const { data, error } = await supabase
      .from('kamar')
      .update({
        nomor_kamar: nomor_kamar.trim(),
        tipe_kamar: tipe_kamar?.trim() || null,
        harga_bulanan: Number(harga_bulanan),
        status,
        fasilitas: fasilitas?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const msg = mapDbError(error);
      if (msg) return sendError(res, msg);
      throw error;
    }
    if (!data) return sendError(res, 'Kamar tidak ditemukan', 404);

    return sendSuccess(res, data, 'Kamar berhasil diperbarui');
  } catch (err) {
    console.error('update kamar error:', err);
    return sendError(res, 'Gagal memperbarui kamar', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (await hasActivePenghuniInKamar(id)) {
      return sendError(res, 'Kamar masih digunakan oleh penghuni aktif');
    }

    const { data, error } = await supabase
      .from('kamar')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 'Kamar tidak ditemukan', 404);

    return sendSuccess(res, null, 'Kamar berhasil dihapus');
  } catch (err) {
    console.error('delete kamar error:', err);
    return sendError(res, 'Gagal menghapus kamar', 500);
  }
};
