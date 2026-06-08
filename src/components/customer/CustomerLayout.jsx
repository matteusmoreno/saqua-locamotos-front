import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, User, LogOut, Menu, X, ChevronRight, Bike } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/saqua-locamotos-logo.png';

const NAV_ITEMS = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/customer/contratos', icon: FileText, label: 'Meus Contratos' },
  { to: '/customer/moto', icon: Bike, label: 'Minha Moto' },
  { to: '/customer/perfil', icon: User, label: 'Meu Perfil' },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all group ${
          isActive
            ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
            : 'text-gray-400 hover:text-white hover:bg-gray-darker border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? 'text-brand-gold' : 'text-gray-500 group-hover:text-white'} />
          <span className="flex-1">{label}</span>
          {isActive && <ChevronRight size={14} className="text-brand-gold" />}
        </>
      )}
    </NavLink>
  );
}

export function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const Sidebar = ({ onNav }) => (
    <div className="flex flex-col h-full p-4 gap-2">
      <div className="flex items-center gap-3 px-2 py-4 mb-2 border-b border-gray-mid/50">
        <img src={Logo} alt="Saqua Locamotos" className="h-8 object-contain" />
      </div>

      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-darker border border-gray-mid mb-4">
        <div className="w-9 h-9 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-black text-sm shrink-0">
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt={user?.name || 'Cliente'} className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || 'C'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{user?.name || 'Cliente'}</p>
          <p className="text-[10px] text-brand-gold font-semibold uppercase tracking-wider">Locatário</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} onClick={onNav} />
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-400 hover:text-brand-red hover:bg-brand-red/5 border border-transparent hover:border-brand-red/20 transition-all cursor-pointer"
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black-pure text-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-black-rich border-r border-gray-mid sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black-pure/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-black-rich border-r border-gray-mid lg:hidden"
            >
              <Sidebar onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed bottom-5 right-5 z-30 p-3 rounded-full bg-brand-gold text-black-pure shadow-[0_0_18px_rgba(250,204,21,0.35)] hover:bg-brand-gold-hover transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
