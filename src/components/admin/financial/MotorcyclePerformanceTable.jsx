import { formatCurrency } from '../../../utils/formatCurrency';

export function MotorcyclePerformanceTable({ data = [] }) {
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 text-sm">Nenhuma moto cadastrada.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-gray-mid text-gray-400 text-left">
            <th className="px-6 py-3 font-semibold">Moto</th>
            <th className="px-6 py-3 font-semibold">Receita</th>
            <th className="px-6 py-3 font-semibold">Despesas</th>
            <th className="px-6 py-3 font-semibold">Saldo</th>
            <th className="px-6 py-3 font-semibold">A Receber</th>
            <th className="px-6 py-3 font-semibold">Margem</th>
            <th className="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(m => (
            <tr key={m.motorcycleId} className="border-t border-gray-mid/50 hover:bg-gray-darker/50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-white font-medium">{m.label}</p>
                <p className="text-gray-500 text-xs">{m.plate}</p>
              </td>
              <td className="px-6 py-4 text-green-500 font-medium">{formatCurrency(m.paidEarnings)}</td>
              <td className="px-6 py-4 text-brand-red font-medium">{formatCurrency(m.paidExpenses)}</td>
              <td className={`px-6 py-4 font-black ${m.total >= 0 ? 'text-brand-gold' : 'text-brand-red'}`}>
                {formatCurrency(m.total)}
              </td>
              <td className="px-6 py-4 text-yellow-500">{formatCurrency(m.pendingEarnings)}</td>
              <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  m.netMargin >= 50 ? 'bg-green-500/10 text-green-500' :
                  m.netMargin >= 20 ? 'bg-brand-gold/10 text-brand-gold' :
                  'bg-brand-red/10 text-brand-red'
                }`}>
                  {m.netMargin}%
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                  !m.active ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                  m.available ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                  'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                }`}>
                  {!m.active ? 'Inativa' : m.available ? 'Disponível' : 'Em uso'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
