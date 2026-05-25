import { FiMenu } from 'react-icons/fi';

function Header({ onMenuClick, adminName }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2 text-[#1E293B] transition hover:bg-slate-50 lg:hidden"
            aria-label="Buka menu"
          >
            <FiMenu className="text-lg" />
          </button>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Panel Administrator</p>
            <p className="text-sm font-semibold text-[#1E293B]">SIM Kost Indekos</p>
          </div>
        </div>
        {adminName && (
          <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-[#1E293B] ring-1 ring-slate-200">
            {adminName}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
