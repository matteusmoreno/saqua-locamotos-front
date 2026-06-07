import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Menu, X, ChevronRight } from 'lucide-react';
import Logo from '../../assets/saqua-locamotos-logo.png';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efeito para detetar o scroll e alterar o fundo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar o menu mobile ao redimensionar a janela para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'O Plano', href: '/#valores' },
    { name: 'Requisitos', href: '/#requisitos' },
    { name: 'Contato', href: '/#contato' }
  ];

  return (
    <>
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'bg-[#050505]/90 backdrop-blur-md border-b border-gray-900 shadow-2xl py-2' 
            : 'bg-gradient-to-b from-[#050505]/80 to-transparent py-4 md:py-6 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center z-50 relative"
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <img 
                  src={Logo} 
                  alt="Saqua Locamotos" 
                  className="h-10 sm:h-12 w-auto drop-shadow-[0_0_15px_rgba(250,204,21,0.1)] transition-transform hover:scale-105" 
                />
              </Link>
            </motion.div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.a 
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  href={item.href} 
                  className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium rounded-lg hover:bg-white/5"
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            {/* Ações Desktop (Área do Cliente) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center"
            >
              <Link 
                to="/login" 
                className="group flex items-center gap-2 bg-brand-gold hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105"
              >
                <LogIn size={18} strokeWidth={2.5} />
                <span>Área do Cliente</span>
              </Link>
            </motion.div>

            {/* Botão Hamburger Mobile */}
            <div className="md:hidden flex items-center z-50 relative">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menu Mobile Fullscreen (AnimatePresence lida com a animação de montagem/desmontagem) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#050505] md:hidden pt-28 px-6 flex flex-col"
          >
            {/* Links Mobile */}
            <nav className="flex flex-col space-y-4 mb-10">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between text-2xl font-black text-white border-b border-gray-900 pb-4"
                >
                  {item.name}
                  <ChevronRight size={24} className="text-gray-600" />
                </motion.a>
              ))}
            </nav>

            {/* CTA Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-auto pb-12"
            >
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full bg-brand-gold text-black px-6 py-4 rounded-2xl font-black text-xl"
              >
                <LogIn size={24} strokeWidth={2.5} />
                Área do Cliente
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}