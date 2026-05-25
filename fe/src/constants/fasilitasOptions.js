export const FASILITAS_OPTIONS = [
  'Kasur',
  'Lemari',
  'Meja',
  'Kursi',
  'Kipas Angin',
  'AC',
  'Kamar Mandi Dalam',
  'WiFi',
  'Listrik',
  'Air',
  'Dapur Bersama',
  'Parkiran',
];

export const parseFasilitasString = (value) => {
  if (!value?.trim()) return [];
  return [...new Set(value.split(',').map((s) => s.trim()).filter(Boolean))];
};

export const joinFasilitasArray = (arr) => {
  const unique = [...new Set((arr || []).filter(Boolean))];
  return unique.join(', ');
};
