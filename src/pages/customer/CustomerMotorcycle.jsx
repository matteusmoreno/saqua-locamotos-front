import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike,
  ExternalLink,
  FileText,
  Loader2,
  Calendar,
  Gauge,
  Palette,
  Hash,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';

function DataRow({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-mid/50 bg-gray-darker/40 px-4 py-3">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <span className={`text-sm font-bold ${highlight ? 'text-brand-gold' : 'text-white'}`}>{value || '—'}</span>
    </div>
  );
}

export function CustomerMotorcycle() {
  const { user } = useAuth();
  const userId = user?.id || user?.userId;

  const [loading, setLoading] = useState(true);
  const [activeContract, setActiveContract] = useState(null);
  const [motorcycle, setMotorcycle] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const contractsRes = await UserService.getUserContracts(userId);
        const contracts = contractsRes.data || [];

        const activeContracts = contracts
          .filter((contract) => contract.status === 'ACTIVE')
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        const currentContract = activeContracts[0] || null;
        setActiveContract(currentContract);

        if (!currentContract) {
          setMotorcycle(null);
          return;
        }

        if (currentContract.motorcycle?.motorcycleId || currentContract.motorcycle?.documentUrl) {
          setMotorcycle(currentContract.motorcycle);
          return;
        }

        const motoId = currentContract.motorcycleId || currentContract.motorcycle?.id;
        if (!motoId) {
          setMotorcycle(currentContract.motorcycle || null);
          return;
        }

        const motorcycleRes = await MotorcycleService.getMotorcycleById(motoId);
        setMotorcycle(motorcycleRes.data || null);
      } catch (error) {
        console.error(error);
        toast.error('Não foi possível carregar os dados da moto.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const documentUrl = motorcycle?.documentUrl;

  const summary = useMemo(() => {
    if (!activeContract) return null;
    return {
      startDate: formatDate(activeContract.startDate),
      endDate: formatDate(activeContract.endDate),
      weeklyAmount: formatCurrency(activeContract.weeklyAmount),
      rentalType: RENTAL_TYPE_LABELS[activeContract.rentalType] || activeContract.rentalType,
    };
  }, [activeContract]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 size={44} className="mb-4 animate-spin text-brand-gold" />
        <p className="text-gray-400">Carregando sua moto...</p>
      </div>
    );
  }

  if (!activeContract) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="mb-1 flex items-center gap-3 text-3xl font-black text-white">
            <Bike className="text-brand-gold" size={30} />
            Minha Moto
          </h1>
          <p className="text-sm text-gray-400">Veja aqui os dados da sua moto alugada quando houver contrato ativo.</p>
        </div>

        <div className="rounded-3xl border border-gray-mid bg-black-rich p-10 text-center">
          <ShieldAlert size={54} className="mx-auto mb-4 text-gray-600" />
          <h2 className="mb-2 text-xl font-bold text-white">Nenhum contrato ativo</h2>
          <p className="mb-6 text-sm text-gray-400">Quando seu contrato estiver ativo, os dados da moto e o documento aparecerão aqui.</p>
          <Link
            to="/customer/contratos"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/25 bg-brand-gold/10 px-5 py-3 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold/20"
          >
            <FileText size={16} /> Ir para contratos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-1 flex items-center gap-3 text-3xl font-black text-white">
          <Bike className="text-brand-gold" size={30} />
          Minha Moto
        </h1>
        <p className="text-sm text-gray-400">Informações da moto vinculada ao seu contrato ativo.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-gray-mid bg-black-rich"
      >
        <div className="border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/8 to-transparent px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">
                {motorcycle?.brand || activeContract.motorcycle?.brand || 'Moto'} {motorcycle?.model || activeContract.motorcycle?.model || ''}
              </h2>
              <p className="mt-1 text-sm text-brand-gold font-semibold">
                {motorcycle?.plate || activeContract.motorcycle?.plate || 'Placa não informada'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ContractStatusBadge status={activeContract.status} size="lg" />
              {documentUrl && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/25 bg-brand-gold/10 px-4 py-2 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold/20"
                >
                  <ExternalLink size={14} /> Ver documento
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Dados da moto</h3>
            <DataRow icon={Hash} label="Placa" value={motorcycle?.plate || activeContract.motorcycle?.plate} highlight />
            <DataRow icon={Palette} label="Cor" value={motorcycle?.color || activeContract.motorcycle?.color || 'Não informada'} />
            <DataRow icon={Gauge} label="Quilometragem" value={motorcycle?.mileage ? `${Number(motorcycle.mileage).toLocaleString('pt-BR')} km` : 'Não informada'} />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Dados do contrato ativo</h3>
            <DataRow icon={Calendar} label="Início" value={summary?.startDate} />
            <DataRow icon={Calendar} label="Término" value={summary?.endDate} />
            <DataRow icon={FileText} label="Tipo" value={summary?.rentalType} />
            <DataRow icon={FileText} label="Valor semanal" value={summary?.weeklyAmount} highlight />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
