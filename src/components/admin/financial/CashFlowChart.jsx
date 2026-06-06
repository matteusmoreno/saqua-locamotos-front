import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';

export function CashFlowChart({ data = [] }) {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((month, i) => (
          <div key={month.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-0.5 w-full justify-center h-40">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(month.income / maxValue) * 100}%` }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="w-3 sm:w-4 bg-green-500/80 rounded-t-sm min-h-[2px] relative group"
                title={`Receita: ${formatCurrency(month.income)}`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-darker border border-gray-mid text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  +{formatCurrency(month.income)}
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(month.expenses / maxValue) * 100}%` }}
                transition={{ delay: i * 0.08 + 0.04, duration: 0.6 }}
                className="w-3 sm:w-4 bg-brand-red/70 rounded-t-sm min-h-[2px] relative group"
                title={`Despesa: ${formatCurrency(month.expenses)}`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-darker border border-gray-mid text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  -{formatCurrency(month.expenses)}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] text-gray-500 capitalize">{month.label}</span>
            <span className={`text-[10px] font-bold ${month.net >= 0 ? 'text-green-500' : 'text-brand-red'}`}>
              {month.net >= 0 ? '+' : ''}{formatCurrency(month.net).replace('R$', '').trim()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-500/80" /> Receitas</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-brand-red/70" /> Despesas</span>
      </div>
    </div>
  );
}
