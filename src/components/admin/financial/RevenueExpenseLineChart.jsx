import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';

function buildPath(points) {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export function RevenueExpenseLineChart({ data = [] }) {
  if (!data.length) {
    return <div className="text-sm text-gray-500">Sem dados para o período selecionado.</div>;
  }

  const width = 100;
  const height = 40;
  const padding = 4;

  const minValue = Math.min(...data.flatMap(item => [item.income, item.expenses, item.net]), 0);
  const maxValue = Math.max(...data.flatMap(item => [item.income, item.expenses, item.net]), 0, 1);
  const range = Math.max(maxValue - minValue, 1);

  const projectX = (index) => padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
  const projectY = (value) => height - padding - ((value - minValue) / range) * (height - padding * 2);

  const incomePoints = data.map((item, index) => ({ x: projectX(index), y: projectY(item.income), label: item.label, value: item.income }));
  const expensePoints = data.map((item, index) => ({ x: projectX(index), y: projectY(item.expenses), label: item.label, value: item.expenses }));
  const netPoints = data.map((item, index) => ({ x: projectX(index), y: projectY(item.net), label: item.label, value: item.net }));

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const yAxisValues = [maxValue, maxValue - range * 0.33, maxValue - range * 0.66, minValue];
  const zeroY = projectY(0);
  const incomeLast = incomePoints[incomePoints.length - 1];
  const expenseLast = expensePoints[expensePoints.length - 1];
  const netLast = netPoints[netPoints.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[auto_1fr] gap-3 items-stretch">
        <div className="h-52 flex flex-col justify-between py-1 text-[10px] text-gray-500">
          {yAxisValues.map((value, idx) => (
            <span key={`${value}-${idx}`}>{formatCurrency(value).replace('R$', '').trim()}</span>
          ))}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-gray-600/60" strokeWidth="0.45" />

          {zeroY >= padding && zeroY <= height - padding && (
            <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} className="stroke-gray-600/80" strokeWidth="0.35" strokeDasharray="2 2" />
          )}

          {[0.33, 0.66].map((mark) => {
            const y = height - padding - mark * (height - padding * 2);
            return (
              <line
                key={mark}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                className="stroke-gray-700/40"
                strokeWidth="0.3"
                strokeDasharray="2 2"
              />
            );
          })}

          <motion.path
            d={buildPath(incomePoints)}
            className="fill-none stroke-green-500"
            strokeWidth="0.75"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.path
            d={buildPath(expensePoints)}
            className="fill-none stroke-brand-red"
            strokeWidth="0.75"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.08 }}
          />
          <motion.path
            d={buildPath(netPoints)}
            className="fill-none stroke-brand-gold"
            strokeWidth="0.75"
            strokeDasharray="1.8 1.2"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.14 }}
          />

          {incomePoints.map(point => (
            <g key={`income-${point.label}-${point.x}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="0.9"
                className="fill-green-500"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.35 }}
              />
              <title>{`${point.label} · Receita: ${formatCurrency(point.value)}`}</title>
            </g>
          ))}

          {expensePoints.map(point => (
            <g key={`expense-${point.label}-${point.x}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="0.9"
                className="fill-brand-red"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.42 }}
              />
              <title>{`${point.label} · Despesa: ${formatCurrency(point.value)}`}</title>
            </g>
          ))}

          {netPoints.map(point => (
            <g key={`net-${point.label}-${point.x}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="0.9"
                className={point.value >= 0 ? 'fill-brand-gold' : 'fill-yellow-600'}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.5 }}
              />
              <title>{`${point.label} · Resultado: ${formatCurrency(point.value)}`}</title>
            </g>
          ))}

          {incomePoints.map((point, index) => {
            const item = data[index];
            return (
              <g key={`tick-${point.label}-${point.x}`}>
                <line x1={point.x} y1={height - padding} x2={point.x} y2={height - padding + 0.8} className="stroke-gray-600/70" strokeWidth="0.25" />
                <text x={point.x} y={height - 0.45} textAnchor="middle" className="fill-gray-500 text-[2.5px] uppercase">
                  {item.label}{data.length <= 6 ? `/${String(item.year).slice(-2)}` : ''}
                </text>
                <title>{`${item.label} · Receita ${formatCurrency(item.income)} · Despesa ${formatCurrency(item.expenses)} · Saldo ${formatCurrency(item.net)}`}</title>
              </g>
            );
          })}

          <text x={incomeLast.x + 1.3} y={incomeLast.y + 0.6} className="fill-green-500 text-[2.5px] font-bold">
            {formatCurrency(incomeLast.value).replace('R$', '').trim()}
          </text>
          <text x={expenseLast.x + 1.3} y={expenseLast.y + 0.6} className="fill-brand-red text-[2.5px] font-bold">
            {formatCurrency(expenseLast.value).replace('R$', '').trim()}
          </text>
          <text x={netLast.x + 1.3} y={netLast.y + 0.6} className={`text-[2.5px] font-bold ${netLast.value >= 0 ? 'fill-brand-gold' : 'fill-yellow-600'}`}>
            {formatCurrency(netLast.value).replace('R$', '').trim()}
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Receitas</span>
        <span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-red" /> Despesas</span>
        <span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-gold" /> Resultado</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Total de receitas</p>
          <p className="text-green-500 font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Total de despesas</p>
          <p className="text-brand-red font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Resultado acumulado</p>
          <p className={`font-bold ${totalNet >= 0 ? 'text-green-500' : 'text-brand-red'}`}>{formatCurrency(totalNet)}</p>
        </div>
      </div>
    </div>
  );
}
