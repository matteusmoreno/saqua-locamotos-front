import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentService } from '../../services/paymentService';
import { PAYMENT_TYPE_LABELS } from '../../utils/financialLabels';

export function CreatePaymentModal({ isOpen, onClose, contracts = [], defaultContractId = '', onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    contractId: defaultContractId,
    type: 'WEEKLY',
    amount: '',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({ ...prev, contractId: defaultContractId }));
    }
  }, [isOpen, defaultContractId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PaymentService.createPayment({
        contractId: form.contractId,
        type: form.type,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        description: form.description || undefined,
      });
      toast.success('Pagamento criado com sucesso!');
      setForm({ contractId: defaultContractId, type: 'WEEKLY', amount: '', dueDate: '', description: '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black-pure/80 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-black-rich border border-gray-mid rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 pb-0 flex items-start justify-between sticky top-0 bg-black-rich z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              <Plus size={24} />
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Novo Pagamento</h3>
              <p className="text-gray-400 text-sm">Criar um lançamento de recebimento vinculado a um contrato.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-300">Contrato *</label>
              <select
                value={form.contractId}
                onChange={(e) => handleChange('contractId', e.target.value)}
                className="input-dark cursor-pointer"
                required
              >
                <option value="">Selecione um contrato...</option>
                {activeContracts.map(c => (
                  <option key={c.contractId} value={c.contractId}>
                    {c.user?.name} — {c.motorcycle?.plate}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-300">Tipo *</label>
                <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="input-dark cursor-pointer" required>
                  {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-300">Valor (R$) *</label>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} className="input-dark" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-300">Data de Vencimento *</label>
              <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} className="input-dark" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-300">Descrição</label>
              <input type="text" value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="input-dark" placeholder="Opcional" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gray-darker hover:bg-gray-mid border border-gray-mid transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-brand-gold hover:bg-brand-gold-hover text-black-pure transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Criar
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
