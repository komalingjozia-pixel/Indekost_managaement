import { FASILITAS_OPTIONS, joinFasilitasArray } from '../../constants/fasilitasOptions.js';

function FasilitasSelect({ selected = [], onChange, error }) {
  const toggle = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter((f) => f !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const preview = joinFasilitasArray(selected);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1E293B]">Fasilitas</label>
      <div className="flex flex-wrap gap-2">
        {FASILITAS_OPTIONS.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-[#64748B] hover:border-[#14B8A6] hover:text-[#14B8A6]'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#64748B]">
        {preview
          ? `Fasilitas dipilih: ${preview}`
          : 'Fasilitas dipilih: (belum ada)'}
      </p>
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

export default FasilitasSelect;
