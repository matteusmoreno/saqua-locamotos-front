import { useState, useEffect, useMemo } from 'react';
import {
  TrendingDown, Loader2, Wrench, Zap, FileText, Shield, MoreHorizontal, Bike
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ExpenseService } from '../../services/expenseService';
import { EXPENSE_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { FinancialModalShell } from './financial/FinancialModalShell';
import { TypeOptionGrid } from './financial/TypeOptionGrid';
import {
  FinancialFormField, FinancialSelect, FinancialCurrencyInput,
  FinancialInput, FINANCIAL_INPUT_STYLES
} from './financial/FinancialFormField';

const EXPENSE_TYPE_OPTIONS = [
  { value: 'MAINTENANCE', label: 'Manutenção', hint: 'Revisões e reparos', icon: Wrench },
  { value: 'UTILITIES', label: 'Utilidades', hint: 'Combustível, lavagem', icon: Zap },
  { value: 'TAXES', label: 'Impostos', hint: 'IPVA, licenciamento', icon: FileText },
  { value: 'INSURANCE', label: 'Seguro', hint: 'Apólice e cobertura', icon: Shield },
  { value: 'OTHER', label: 'Outros', hint: 'Demais custos', icon: MoreHorizontal },
];

const EMPTY_FORM = {
  motorcycleId: '',
  type: 'MAINTENANCE',
  amount: 0,
  dueDate: '',
  description: '',
};

export function CreateExpenseModal({ isOpen, onClose, motorcycles = [], defaultMotorcycleId = '', onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const selectedMotorcycle = useMemo(
    () => motorcycles.find(m => m.motorcycleId === form.motorcycleId),
    [motorcycles, form.motorcycleId]
  );

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY_FORM, motorcycleId: defaultMotorcycleId });
    }
  }, [isOpen, defaultMotorcycleId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ExpenseService.createExpense({
        motorcycleId: form.motorcycleId,
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        description: form.description || undefined,
      });
      toast.success('Despesa criada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = form.motorcycleId && form.amount > 0 && form.dueDate && !isSubmitting;

  return (
    <>
      <style>{FINANCIAL_INPUT_STYLES}</style>
      <FinancialModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Nova Despesa"
        subtitle="Registre um custo operacional vinculado a uma moto da frota."
        icon={<TrendingDown size={22} />}
        accent="red"
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
              form="create-expense-form"
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-brand-gold hover:bg-brand-gold-hover text-black-pure transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <TrendingDown size={18} />}
              Criar Despesa
            </button>
          </div>
        }
      >
        <form id="create-expense-form" onSubmit={handleSubmit} className="space-y-6">
          <FinancialFormField label="Moto" required>
            <FinancialSelect
              value={form.motorcycleId}
              onChange={(e) => handleChange('motorcycleId', e.target.value)}
              placeholder="Selecione uma moto..."
              required
            >
              {motorcycles.map(m => (
                <option key={m.motorcycleId} value={m.motorcycleId}>
                  {m.brand} {m.model} — {m.plate}
                </option>
              ))}
            </FinancialSelect>
          </FinancialFormField>

          {selectedMotorcycle && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-darker border border-gray-mid">
              <div className="flex items-center gap-2 text-sm">
                <Bike size={14} className="text-brand-red" />
                <span className="text-white font-medium">{selectedMotorcycle.brand} {selectedMotorcycle.model}</span>
                <span className="text-gray-500">· {selectedMotorcycle.plate}</span>
              </div>
              {selectedMotorcycle.financial?.total !== undefined && (
                <span className={`text-xs font-bold ${Number(selectedMotorcycle.financial.total) >= 0 ? 'text-brand-gold' : 'text-brand-red'}`}>
                  Saldo: {formatCurrency(selectedMotorcycle.financial.total)}
                </span>
              )}
            </div>
          )}

          <FinancialFormField label="Categoria" required>
            <TypeOptionGrid
              options={EXPENSE_TYPE_OPTIONS}
              value={form.type}
              onChange={(type) => handleChange('type', type)}
              columns={3}
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
              placeholder="Ex: Troca de óleo e filtro"
            />
          </FinancialFormField>

          {form.motorcycleId && form.amount > 0 && form.dueDate && (
            <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-red">Resumo do lançamento</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Categoria</span>
                <span className="text-white font-medium">{EXPENSE_TYPE_LABELS[form.type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor</span>
                <span className="text-brand-red font-black">{formatCurrency(form.amount)}</span>
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

          {motorcycles.length === 0 && (
            <p className="text-sm text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-xl px-4 py-3">
              Não há motos cadastradas na frota.
            </p>
          )}
        </form>
      </FinancialModalShell>
    </>
  );
}
