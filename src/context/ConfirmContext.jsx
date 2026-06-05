import { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

// Cria o contexto
const ConfirmContext = createContext({});

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDanger: false, // Se for true, o botão fica vermelho. Se false, fica amarelo (Gold).
    onConfirm: null,
    onCancel: null
  });

  // Função global que os componentes vão chamar
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        ...options,
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(true); // Retorna true se o utilizador clicou em confirmar
        },
        onCancel: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(false); // Retorna false se o utilizador cancelou
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {/* O Modal visual que reage ao estado acima */}
      <ConfirmModalUI {...modalState} />
    </ConfirmContext.Provider>
  );
}

// Hook personalizado para usar em qualquer página
export const useConfirm = () => useContext(ConfirmContext);

// Componente Visual do Modal (Privado para este ficheiro)
function ConfirmModalUI({ isOpen, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop / Fundo escuro */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onCancel}
          className="absolute inset-0 bg-black-pure/80 backdrop-blur-md"
        />
        
        {/* Caixa do Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-black-rich border border-gray-mid rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header com Ícone */}
          <div className="p-6 pb-0 flex items-start justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isDanger ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'}`}>
              <AlertTriangle size={24} />
            </div>
            <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 pt-4">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {message}
            </p>
          </div>

          {/* Ações (Botões) */}
          <div className="p-6 pt-0 flex gap-3 mt-2">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gray-darker hover:bg-gray-mid border border-gray-mid transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 ${
                isDanger 
                  ? 'bg-brand-red hover:bg-brand-red-hover text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : 'bg-brand-gold hover:bg-brand-gold-hover text-black-pure shadow-[0_0_15px_rgba(250,204,21,0.3)]'
              }`}
            >
              {isDanger ? <AlertTriangle size={18} /> : <Check size={18} />}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}