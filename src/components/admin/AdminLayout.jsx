import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Bike, 
  FileText, 
  Wallet, 
  ShieldCheck,
  LogOut, 
  Menu
} from 'lucide-react';
import { useState } from 'react';
import Logo from '../../assets/saqua-locamotos-logo.png';

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Clientes', path: '/admin/clientes', icon: <Users size={20} /> },
    { name: 'Frota de Motos', path: '/admin/motos', icon: <Bike size={20} /> },
    { name: 'Contratos', path: '/admin/contratos', icon: <FileText size={20} /> },
    { name: 'Financeiro', path: '/admin/financeiro', icon: <Wallet size={20} /> },
    { name: 'Meu Perfil', path: '/admin/perfil', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-black-pure flex text-gray-100 font-sans">
      
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black-pure/80 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black-rich border-r border-gray-mid transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-mid">
          <img src={Logo} alt="Logo" className="h-10 w-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]" />
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-gold text-black-pure font-bold shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                    : 'text-gray-400 hover:bg-gray-darker hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-mid">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-black-rich border-b border-gray-mid flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Painel de Administração</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-brand-gold uppercase tracking-wider">Administrador</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-darker border-2 border-brand-gold flex items-center justify-center text-brand-gold font-bold">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
          {children}
        </main>
      </div>
    </div>
  );
}