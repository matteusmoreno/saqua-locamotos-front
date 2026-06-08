import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Bike,
  Calendar,
  Eye,
  Pencil,
  Settings,
  AlertTriangle,
  CheckCircle,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { UserService } from '../../services/userService';
import { CustomerDocumentsModal } from '../../components/admin/CustomerDocumentsModal';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';
import { listAvailableDocuments, normalizeUserDocuments } from '../../utils/userDocuments';

const DOC_LABELS = {
  cnh: 'CNH',
  cpf: 'CPF',
  rg: 'RG',
  proof_of_residence: 'Comprovante de Residencia',
  criminal_record: 'Antecedentes Criminais',
  passport: 'Passaporte',
};

function KpiCard({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl px-4 py-3 group">
      {Icon && <Icon size={44} className="absolute -bottom-2 -right-2 text-gray-600/20 group-hover:scale-110 transition-transform" />}
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export function CustomerDetail() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customerRes, contractsRes] = await Promise.all([
          UserService.getCustomerById(id),
          UserService.getUserContracts(id),
        ]);

        setCustomer(customerRes.data);
        setContracts(contractsRes.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Nao foi possivel carregar os detalhes do cliente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const docs = useMemo(() => normalizeUserDocuments(customer?.documents), [customer?.documents]);
  const docsList = useMemo(() => listAvailableDocuments(docs), [docs]);

  const contractStats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === 'ACTIVE').length;
    const finished = contracts.filter((c) => c.status === 'FINISHED').length;
    const cancelled = contracts.filter((c) => c.status === 'CANCELLED').length;
    const totalReceived = contracts.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    return { total, active, finished, cancelled, totalReceived };
  }, [contracts]);

  const address = customer?.address || {};
  const fullAddress = [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
    address.zipCode,
    'Brasil',
  ]
    .filter((part) => part && String(part).trim() !== '')
    .join(', ');

  const hasAddressForMap = Boolean(address.city || address.street || address.zipCode);
  const googleMapsQuery = fullAddress || `${address.city || ''}, ${address.state || ''}, Brasil`;
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsDarkMapId = import.meta.env.VITE_GOOGLE_MAPS_DARK_MAP_ID;
  const hasOfficialDarkMapConfig = Boolean(mapsApiKey && mapsDarkMapId);
  const mapsSearchUrl = hasAddressForMap
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsQuery)}`
    : '';
  const mapsEmbedUrl = hasAddressForMap
    ? hasOfficialDarkMapConfig
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsApiKey)}&q=${encodeURIComponent(googleMapsQuery)}&zoom=15&maptype=roadmap&language=pt-BR&region=BR&map_id=${encodeURIComponent(mapsDarkMapId)}`
      : `https://maps.google.com/maps?q=${encodeURIComponent(googleMapsQuery)}&t=m&z=15&ie=UTF8&iwloc=&output=embed`
    : '';

  const handleDocumentsUpdated = (updatedDocuments) => {
    setCustomer((prev) => ({
      ...prev,
      documents: updatedDocuments || {},
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
        <p className="text-gray-400">A carregar detalhes do cliente...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center">
        <ShieldAlert size={56} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Cliente nao encontrado</h3>
        <Link to="/admin/clientes" className="text-brand-gold font-bold hover:underline">
          Voltar para lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CustomerDocumentsModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        userId={customer.customerId}
        existingDocs={docs}
        onUpdateSuccess={handleDocumentsUpdated}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/clientes" className="p-2.5 bg-gray-darker text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-mid">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Detalhes do Cliente</h1>
            <p className="text-gray-400 text-sm">Visao completa de dados, documentos e contratos.</p>
          </div>
        </div>

        <Link
          to={`/admin/clientes/${customer.customerId}/editar`}
          className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all"
        >
          <Pencil size={18} /> Editar Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <div className="flex items-start gap-4">
              {customer.pictureUrl ? (
                <img src={customer.pictureUrl} alt={customer.name} className="w-20 h-20 rounded-2xl object-cover border border-gray-mid" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-darker border border-gray-mid flex items-center justify-center text-2xl font-black text-brand-gold">
                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-2xl font-black text-white truncate">{customer.name || 'Sem nome'}</h2>
                <p className="text-brand-gold font-medium text-sm">{customer.cpf || 'CPF nao informado'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2"><Mail size={14} className="text-gray-500" /> {customer.email || 'Sem e-mail'}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-gray-500" /> {customer.phone || 'Sem telefone'}</div>
              <div className="flex items-center gap-2"><User size={14} className="text-gray-500" /> {customer.occupation || 'Profissao nao informada'}</div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-500 mt-0.5" />
                <span>
                  {customer.address?.city
                    ? `${customer.address.street || 'Rua nao informada'}, ${customer.address.number || 's/n'} - ${customer.address.city}/${customer.address.state || '--'}`
                    : 'Endereco nao informado'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-brand-gold" /> Documentos
            </h3>

            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              className="w-full mb-4 inline-flex items-center justify-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-3 rounded-xl font-bold border border-brand-gold/20"
            >
              <Settings size={16} /> Gerir Documentos
            </button>

            {docsList.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum documento anexado.</p>
            ) : (
              <div className="space-y-2">
                {docsList.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-mid bg-gray-darker/40 hover:border-brand-gold/40 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-200">{DOC_LABELS[key] || key}</span>
                    <ExternalLink size={14} className="text-brand-gold" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-brand-gold" /> Localizacao no Mapa
            </h3>

            {hasAddressForMap ? (
              <div className="space-y-4">
                <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-mid bg-black">
                  <iframe
                    className="w-full h-full"
                    title="Mapa do endereco do cliente"
                    src={mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-3 rounded-xl font-bold border border-brand-gold/20"
                >
                  <ExternalLink size={16} /> Abrir no Google Maps
                </a>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Endereco insuficiente para mostrar no mapa.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard icon={FileText} label="Contratos" value={contractStats.total} />
            <KpiCard icon={CheckCircle} label="Ativos" value={contractStats.active} color="text-green-500" />
            <KpiCard icon={CheckCircle} label="Finalizados" value={contractStats.finished} color="text-blue-400" />
            <KpiCard icon={AlertTriangle} label="Cancelados" value={contractStats.cancelled} color="text-brand-red" />
            <KpiCard icon={Wallet} label="Total Recebido" value={formatCurrency(contractStats.totalReceived)} color="text-brand-gold" />
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-mid flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Historico de Contratos</h3>
              <span className="text-xs text-gray-500">{contracts.length} registro(s)</span>
            </div>

            {contracts.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Este cliente ainda nao possui contratos.</div>
            ) : (
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.contractId}
                    className="relative bg-gray-darker/40 border border-gray-mid/50 hover:border-brand-gold/40 rounded-xl p-4 transition-colors overflow-hidden group"
                  >
                    <FileText className="absolute -bottom-4 -right-4 w-20 h-20 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">
                          {contract.motorcycle?.brand} {contract.motorcycle?.model}
                        </p>
                        <p className="text-brand-gold text-sm font-medium">{contract.motorcycle?.plate}</p>
                      </div>
                      <ContractStatusBadge status={contract.status} />
                    </div>

                    <div className="space-y-2.5 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Bike size={14} />
                        <span className="truncate">{RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(contract.startDate)} a {formatDate(contract.endDate)}</span>
                      </div>
                      <p className="text-sm text-brand-gold font-bold">Recebido: {formatCurrency(contract.totalAmount)}</p>
                    </div>

                    <Link
                      to={`/admin/contratos/${contract.contractId}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 text-sm font-bold"
                    >
                      <Eye size={14} /> Ver contrato
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
