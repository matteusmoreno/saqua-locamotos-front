import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, Loader2, FileText, Calendar, Banknote, AlertTriangle, User, Bike
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentService } from '../../services/paymentService';
import { PAYMENT_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { FinancialModalShell } from './financial/FinancialModalShell';
import { TypeOptionGrid } from './financial/TypeOptionGrid';
import {
  FinancialFormField, FinancialSelect, FinancialCurrencyInput,
  FinancialInput, FINANCIAL_INPUT_STYLES
} from './financial/FinancialFormField';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'DEPOSIT', label: 'Caução', hint: 'Valor de garantia', icon: Banknote },
  { value: 'WEEKLY', label: 'Semanal', hint: 'Aluguel recorrente', icon: Calendar },
  { value: 'FULL_PAYMENT', label: 'Integral', hint: 'Pagamento de 15 dias', icon: TrendingUp },
  { value: 'FINE', label: 'Multa', hint: 'Penalidade contratual', icon: AlertTriangle },
];

const EMPTY_FORM = {
  contractId: '',
  type: 'WEEKLY',
  amount: 0,
  dueDate: '',
  description: '',
};

export function CreatePaymentModal({ isOpen, onClose, contracts = [], defaultContractId = '', onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeContracts = useMemo(
    () => contracts.filter(c => c.status === 'ACTIVE'),
    [contracts]
  );

  const selectedContract = useMemo(
    () => activeContracts.find(c => c.contractId === form.contractId),
    [activeContracts, form.contractId]
  );

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY_FORM, contractId: defaultContractId });
    }
  }, [isOpen, defaultContractId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (contractId) => {
    const contract = activeContracts.find(c => c.contractId === contractId);
    setForm(prev => ({
      ...prev,
      contractId,
      amount: prev.amount > 0 ? prev.amount : (
        prev.type === 'DEPOSIT' ? Number(contract?.depositAmount) || 0 :
        prev.type === 'WEEKLY' ? Number(contract?.weeklyAmount) || 0 : prev.amount
      ),
    }));
  };

  const handleTypeChange = (type) => {
    const contract = selectedContract;
    let suggestedAmount = form.amount;

    if (contract) {
      if (type === 'DEPOSIT') suggestedAmount = Number(contract.depositAmount) || 0;
      else if (type === 'WEEKLY') suggestedAmount = Number(contract.weeklyAmount) || 0;
    }

    setForm(prev => ({ ...prev, type, amount: suggestedAmount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PaymentService.createPayment({
        contractId: form.contractId,
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        description: form.description || undefined,
      });
      toast.success('Pagamento criado com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = form.contractId && form.amount > 0 && form.dueDate && !isSubmitting;

  return (
    <>
      <style>{FINANCIAL_INPUT_STYLES}</style>
      <FinancialModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Novo Pagamento"
        subtitle="Lance um recebimento vinculado a um contrato ativo."
        icon={<TrendingUp size={22} />}
        accent="gold"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gray-darker hover:bg-gray-mid border border-gray-mid transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-payment-form"
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-brand-gold hover:bg-brand-gold-hover text-black-pure transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
              Criar Pagamento
            </button>
          </div>
        }
      >
        <form id="create-payment-form" onSubmit={handleSubmit} className="space-y-6">
          <FinancialFormField label="Contrato" required>
            <FinancialSelect
              value={form.contractId}
              onChange={(e) => handleContractChange(e.target.value)}
              placeholder="Selecione um contrato..."
              required
            >
              {activeContracts.map(c => (
                <option key={c.contractId} value={c.contractId}>
                  {c.user?.name} — {c.motorcycle?.plate}
                </option>
              ))}
            </FinancialSelect>
          </FinancialFormField>

          {selectedContract && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-darker border border-gray-mid">
              <div className="flex items-center gap-2 text-sm text-gray-400 flex-1 min-w-0">
                <User size={14} className="shrink-0 text-brand-gold" />
                <span className="truncate text-white font-medium">{selectedContract.user?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                <Bike size={14} className="text-brand-gold" />
                <span>{selectedContract.motorcycle?.plate}</span>
              </div>
            </div>
          )}

          <FinancialFormField label="Tipo de pagamento" required>
            <TypeOptionGrid
              options={PAYMENT_TYPE_OPTIONS}
              value={form.type}
              onChange={handleTypeChange}
            />
          </FinancialFormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FinancialFormField label="Valor" required>
              <FinancialCurrencyInput
                value={form.amount}
                onChange={(val) => handleChange('amount', val)}
              />
            </FinancialFormField>
            <FinancialFormField label="Vencimento" required>
              <FinancialInput
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </FinancialFormField>
          </div>

          <FinancialFormField label="Descrição" hint="Opcional">
            <FinancialInput
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: 2ª parcela semanal de junho"
            />
          </FinancialFormField>

          {form.contractId && form.amount > 0 && form.dueDate && (
            <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">Resumo do lançamento</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tipo</span>
                <span className="text-white font-medium">{PAYMENT_TYPE_LABELS[form.type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor</span>
                <span className="text-brand-gold font-black">{formatCurrency(form.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Vence em</span>
                <span className="text-white font-medium">{formatDate(form.dueDate)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                <FileText size={12} />
                Status inicial: <span className="text-yellow-500 font-semibold">Pendente</span>
              </div>
            </div>
          )}

          {activeContracts.length === 0 && (
            <p className="text-sm text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-xl px-4 py-3">
              Não há contratos ativos. Crie um contrato antes de lançar um pagamento.
            </p>
          )}
        </form>
      </FinancialModalShell>
    </>
  );
}
