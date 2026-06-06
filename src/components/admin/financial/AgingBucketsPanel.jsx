import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';

export function AgingBucketsPanel({ buckets = [] }) {
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const hasRisk = buckets.slice(1).some(b => b.count > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Total em aberto: <span className="text-white font-bold">{formatCurrency(total)}</span>
        </p>
        {hasRisk && (
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-brand-red/10 text-brand-red border border-brand-red/20">
            Risco de inadimplência
          </span>
        )}
      </div>

      <div className="space-y-3">
        {buckets.map((bucket, i) => (
          <div key={bucket.key}>
            <div className="flex justify-between text-sm mb-1">
              <div>
                <span className="text-gray-300 font-medium">{bucket.label}</span>
                <span className="text-gray-600 text-xs ml-2">{bucket.range}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold">{formatCurrency(bucket.amount)}</span>
                <span className="text-gray-500 text-xs ml-2">({bucket.count})</span>
              </div>
            </div>
            <div className="h-2 bg-gray-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bucket.pct}%` }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`h-full rounded-full ${bucket.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
