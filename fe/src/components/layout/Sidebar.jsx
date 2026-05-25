import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiCreditCard,
  FiFileText,
  FiLogOut,
} from 'react-icons/fi';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/kamar', label: 'Kamar', icon: FiGrid },
  { to: '/penghuni', label: 'Penghuni', icon: FiUsers },
  { to: '/pembayaran', label: 'Pembayaran', icon: FiCreditCard },
  { to: '/laporan', label: 'Laporan', icon: FiFileText },
];

function Sidebar({ onNavigate, onLogout }) {
  return (
    <aside className="flex h-full w-60 flex-col bg-[#0F172A] text-slate-200">
      <div className="border-b border-slate-700/80 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Sistem Informasi
        </p>
        <h1 className="mt-1 text-lg font-bold text-white">SIM Kost</h1>
        <p className="mt-0.5 text-xs text-slate-400">Indekos Management</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="text-base" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700/80 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-slate-800"
        >
          <FiLogOut className="text-base" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
