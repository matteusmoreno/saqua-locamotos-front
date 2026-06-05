import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Menu } from 'lucide-react';
// Importamos a sua logo
import Logo from '../../assets/saqua-locamotos-logo.png';

export function Header() {
  const navItems = [
    { name: 'Início', href: '/' },
    { name: 'Motos', href: '#motos' },
    { name: 'Vantagens', href: '#vantagens' },
    { name: 'Contato', href: '#contato' }
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-black-pure/90 backdrop-blur-sm border-b border-gray-mid shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo - Clicável para voltar ao início */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={Logo} 
                alt="Saqua Locamotos" 
                className="h-14 w-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]" 
              />
            </Link>
          </motion.div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item, index) => (
              <motion.a 
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                href={item.href} 
                className="relative px-4 py-2 text-gray-200 hover:text-white transition-colors font-medium group"
              >
                {item.name}
                {/* Linha Amarela no Hover */}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </motion.a>
            ))}
          </nav>

          {/* Área de Ações Desktop (Login) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-4"
          >
            <Link 
              to="/login" 
              className="flex items-center gap-2.5 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
              <LogIn size={19} />
              Área do Cliente
            </Link>
          </motion.div>

          {/* Menu Mobile Button (Vamos manter simples por enquanto) */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-300 hover:text-brand-gold p-2">
              <Menu size={28} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}