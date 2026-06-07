import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExpenseService } from '../../services/expenseService';
import { PAYMENT_METHOD_LABELS } from '../../utils/financialLabels';
import { formatCurrency } from '../../utils/formatCurrency';

export function RegisterExpenseModal({ isOpen, onClose, expense, onSuccess }) {
  const [method, setMethod] = useState('PIX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NOVO: Efeito para fechar o modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expense) return;

    setIsSubmitting(true);
    try {
      await ExpenseService.registerExpense({
        expenseId: expense.expenseId,
        method,
      });
      toast.success('Despesa registrada como paga!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black-pure/80 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-black-rich border border-gray-mid rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 pb-0 flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              <CheckCircle size={24} />
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Registrar Despesa</h3>
              <p className="text-gray-400 text-sm">
                Confirmar pagamento de <span className="text-brand-red font-bold">{formatCurrency(expense.amount)}</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-300">Método de Pagamento *</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-dark cursor-pointer" required>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gray-darker hover:bg-gray-mid border border-gray-mid transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-brand-gold hover:bg-brand-gold-hover text-black-pure transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                Confirmar
              </button>
            </div>
          </form>

          <style>{`
            .input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; }
            .input-dark:focus { outline: none; border-color: #FACC15; }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}