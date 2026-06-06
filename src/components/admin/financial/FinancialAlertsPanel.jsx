import { Link } from 'react-router-dom';
import { AlertTriangle, Info, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const LEVEL_STYLES = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-brand-red/5 border-brand-red/20',
    iconColor: 'text-brand-red bg-brand-red/10 border-brand-red/20',
    dot: 'bg-brand-red',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/5 border-yellow-500/20',
    iconColor: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    dot: 'bg-yellow-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/5 border-blue-500/20',
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-400',
  },
};

export function FinancialAlertsPanel({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle size={36} className="text-green-500 mb-3" />
        <p className="text-white font-medium text-sm">Nenhum alerta ativo</p>
        <p className="text-gray-500 text-xs mt-1">Situação financeira estável.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => {
        const style = LEVEL_STYLES[alert.level] || LEVEL_STYLES.info;
        const Icon = style.icon;

        return (
          <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${style.iconColor}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <p className="text-white text-sm font-bold">{alert.title}</p>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{alert.message}</p>
              {alert.contractId && (
                <Link
                  to={`/admin/contratos/${alert.contractId}`}
                  className="inline-flex items-center gap-1 text-brand-gold text-xs font-medium mt-2 hover:underline"
                >
                  Ver contrato <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
