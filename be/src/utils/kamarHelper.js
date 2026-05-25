import supabase from '../config/supabase.js';

export const hasActivePenghuniInKamar = async (kamarId, excludePenghuniId = null) => {
  if (!kamarId) return false;

  let query = supabase
    .from('penghuni')
    .select('id', { count: 'exact', head: true })
    .eq('id_kamar', kamarId)
    .eq('status', 'aktif');

  if (excludePenghuniId) {
    query = query.neq('id', excludePenghuniId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return (count || 0) > 0;
};

export const updateKamarStatus = async (kamarId) => {
  if (!kamarId) return;

  const { data: kamar, error: kamarError } = await supabase
    .from('kamar')
    .select('id, status')
    .eq('id', kamarId)
    .single();

  if (kamarError || !kamar) return;

  const hasActive = await hasActivePenghuniInKamar(kamarId);

  if (hasActive) {
    await supabase.from('kamar').update({ status: 'terisi' }).eq('id', kamarId);
    return;
  }

  if (kamar.status === 'perbaikan') {
    return;
  }

  await supabase.from('kamar').update({ status: 'kosong' }).eq('id', kamarId);
};

export const isDuplicateKamarNomor = async (nomorKamar, excludeId = null) => {
  let query = supabase
    .from('kamar')
    .select('id')
    .eq('nomor_kamar', nomorKamar.trim());

  if (excludeId) query = query.neq('id', excludeId);

  const { data, error } = await query.maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return Boolean(data);
};

export const validateKamarForPenghuni = async (kamarId, penghuniId = null) => {
  const { data: kamar, error } = await supabase
    .from('kamar')
    .select('id, status')
    .eq('id', kamarId)
    .single();

  if (error || !kamar) {
    return { valid: false, message: 'Kamar tidak ditemukan' };
  }

  if (kamar.status === 'perbaikan') {
    return { valid: false, message: 'Kamar ini sedang perbaikan dan tidak tersedia' };
  }

  const isOwnKamar = penghuniId
    ? await (async () => {
        const { data: penghuni } = await supabase
          .from('penghuni')
          .select('id_kamar')
          .eq('id', penghuniId)
          .single();
        return penghuni?.id_kamar === kamarId;
      })()
    : false;

  if (kamar.status !== 'kosong' && !isOwnKamar) {
    return { valid: false, message: 'Kamar ini sudah terisi atau tidak tersedia' };
  }

  const hasOther = await hasActivePenghuniInKamar(kamarId, penghuniId);
  if (hasOther) {
    return { valid: false, message: 'Kamar ini sudah terisi oleh penghuni lain' };
  }

  return { valid: true };
};
