import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 80) return { stroke: '#22c55e', label: 'Excelente', text: 'text-green-500' };
  if (score >= 60) return { stroke: '#FACC15', label: 'Atenção', text: 'text-brand-gold' };
  if (score >= 40) return { stroke: '#f97316', label: 'Risco', text: 'text-orange-500' };
  return { stroke: '#EF4444', label: 'Crítico', text: 'text-brand-red' };
}

export function HealthScoreRing({ score = 0, metrics }) {
  const { stroke, label, text } = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${text}`}>{score}</span>
          <span className="text-[10px] text-gray-500 uppercase">/ 100</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className={`text-lg font-black ${text}`}>{label}</p>
        <p className="text-xs text-gray-400 leading-relaxed">Saúde financeira calculada com base em inadimplência, saldo e taxa de recebimento.</p>
        {metrics && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-3">
            <span className="text-gray-500">Recebimento</span>
            <span className="text-white font-bold">{metrics.collectionRate}%</span>
            <span className="text-gray-500">Em atraso</span>
            <span className="text-white font-bold">{metrics.overdueCount}</span>
            <span className="text-gray-500">Pendentes</span>
            <span className="text-white font-bold">{metrics.pendingCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
