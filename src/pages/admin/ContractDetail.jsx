import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, Loader2, Plus, CheckCircle, Trash2,
  Download, Flag, User, Bike, Wallet, Calendar, Mail, Phone, XCircle, Upload, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { PaymentService } from '../../services/paymentService';
import { useConfirm } from '../../context/ConfirmContext';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { ContractProgressBar } from '../../components/admin/contracts/ContractProgressBar';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { CreatePaymentModal } from '../../components/admin/CreatePaymentModal';
import { RegisterPaymentModal } from '../../components/admin/RegisterPaymentModal';
import {
  PAYMENT_TYPE_LABELS, RENTAL_TYPE_LABELS, PAYMENT_METHOD_LABELS
} from '../../utils/financialLabels';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';

function DetailKpi({ icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl p-4 group">
      <div className="absolute -bottom-3 -right-3 opacity-5 text-brand-gold group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

export function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [registerPayment, setRegisterPayment] = useState(null);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const fileInputRef = useRef(null);

  const { confirm } = useConfirm();

  useEffect(() => { fetchContract(); }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await ContractService.getContractById(id);
      setContract(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar contrato.');
    } finally {
      setLoading(false);
    }
  };

  const paymentStats = useMemo(() => {
    const payments = contract?.payments || [];
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    const overdue = payments.filter(p => isOverdue(p.dueDate, p.status));
    return {
      total: payments.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      pendingAmount: pending.reduce((s, p) => s + Number(p.amount), 0),
    };
  }, [contract]);

  const handleDeletePayment = async (paymentId) => {
    const ok = await confirm({ title: 'Excluir Pagamento', message: 'Tem certeza?', confirmText: 'Excluir', isDanger: true });
    if (!ok) return;
    try {
      await PaymentService.deletePayment(paymentId);
      toast.success('Pagamento excluído.');
      fetchContract();
    } catch { toast.error('Erro ao excluir.'); }
  };

  const handleCancelContract = async () => {
    const ok = await confirm({ title: 'Cancelar Contrato', message: 'Esta ação não pode ser desfeita.', confirmText: 'Cancelar Contrato', isDanger: true });
    if (!ok) return;
    try {
      await ContractService.cancelContract(id);
      toast.success('Contrato cancelado.');
      fetchContract();
    } catch { toast.error('Erro ao cancelar.'); }
  };

  const handleFinishContract = async () => {
    const wantsFinish = await confirm({ title: 'Finalizar Contrato', message: 'Deseja encerrar este contrato?', confirmText: 'Continuar' });
    if (!wantsFinish) return;
    const refundDeposit = await confirm({ title: 'Devolução da Caução', message: 'Devolver a caução ao cliente?', confirmText: 'Sim, Devolver', cancelText: 'Não Devolver' });
    try {
      await ContractService.finishContract(id, refundDeposit);
      toast.success('Contrato finalizado!');
      fetchContract();
    } catch { toast.error('Erro ao finalizar.'); }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await ContractService.generatePdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch { toast.error('Erro ao gerar PDF.'); }
  };

  const handleSelectContractFile = () => {
    fileInputRef.current?.click();
  };

  const handleUploadContractFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingContract(true);
    try {
      const response = await ContractService.uploadFile(id, formData);
      setContract(response.data);
      toast.success('Contrato assinado enviado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar contrato assinado.');
    } finally {
      setIsUploadingContract(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" size={48} /></div>;
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Contrato não encontrado.</p>
        <Link to="/admin/contratos" className="text-brand-gold font-bold hover:underline mt-4 inline-block cursor-pointer">Voltar</Link>
      </div>
    );
  }

  const payments = contract.payments || [];
  const TABS = [
    { key: 'overview', label: 'Resumo' },
    { key: 'payments', label: `Pagamentos (${payments.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <CreatePaymentModal isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} contracts={[contract]} defaultContractId={contract.contractId} onSuccess={fetchContract} />
      <RegisterPaymentModal isOpen={!!registerPayment} onClose={() => setRegisterPayment(null)} payment={registerPayment} onSuccess={fetchContract} />

      {/* Hero */}
      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-brand-gold/10 via-transparent to-transparent border-b border-gray-mid/50">
          <div className="flex items-start gap-4 justify-between">
            <Link to="/admin/contratos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors cursor-pointer shrink-0">
              <ArrowLeft size={22} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white truncate">{contract.user?.name}</h1>
                <ContractStatusBadge status={contract.status} size="lg" />
              </div>
              <p className="text-brand-gold font-medium">
                {contract.motorcycle?.brand} {contract.motorcycle?.model} — {contract.motorcycle?.plate}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {RENTAL_TYPE_LABELS[contract.rentalType]} · {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
              </p>
            </div>
            {contract.status === 'ACTIVE' && (
              <button onClick={() => setShowCreatePayment(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/20 transition-colors cursor-pointer text-sm font-bold shrink-0">
                <Plus size={16} /> Novo Pagamento
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pt-6">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleUploadContractFile}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-darker/60 border border-gray-mid/60 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-3">Documentos do contrato</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black-rich border border-gray-mid text-white hover:bg-gray-mid transition-colors cursor-pointer text-sm font-bold">
                  <Download size={16} /> Gerar Contrato
                </button>

                <button
                  onClick={handleSelectContractFile}
                  disabled={isUploadingContract}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/20 transition-colors cursor-pointer text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploadingContract ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {contract.contractUrl ? 'Substituir Assinado' : 'Upload Assinado'}
                </button>

                {contract.contractUrl && (
                  <a
                    href={contract.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-colors cursor-pointer text-sm font-bold"
                  >
                    <ExternalLink size={16} /> Ver Assinado
                  </a>
                )}
              </div>
            </div>

            {contract.status === 'ACTIVE' && (
              <div className="bg-gray-darker/60 border border-gray-mid/60 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-3">Ciclo do contrato</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleFinishContract} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer text-sm font-bold">
                    <Flag size={16} /> Finalizar Contrato
                  </button>
                  <button onClick={handleCancelContract} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-colors cursor-pointer text-sm font-bold">
                    <XCircle size={16} /> Cancelar Contrato
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DetailKpi icon={<Wallet size={14} />} label="Valor Semanal" value={formatCurrency(contract.weeklyAmount)} color="text-brand-gold" />
          <DetailKpi icon={<FileText size={14} />} label="Caução" value={formatCurrency(contract.depositAmount)} />
          <DetailKpi icon={<CheckCircle size={14} />} label="Total Recebido" value={formatCurrency(contract.totalAmount)} color="text-green-500" />
          <DetailKpi icon={<Calendar size={14} />} label="Pagamentos" value={`${paymentStats.paid}/${paymentStats.total}`} />
        </div>

        {contract.status === 'ACTIVE' && (
          <div className="px-6 pb-6">
            <ContractProgressBar startDate={contract.startDate} endDate={contract.endDate} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-mid overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-darker'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2"><User size={18} className="text-brand-gold" /> Cliente</h3>
                <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Nome</span><span className="text-white font-medium">{contract.user?.name}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400 flex items-center gap-1"><Mail size={12} /> E-mail</span><span className="text-white">{contract.user?.email}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400 flex items-center gap-1"><Phone size={12} /> Telefone</span><span className="text-white">{contract.user?.phone || '—'}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Bike size={18} className="text-brand-gold" /> Moto</h3>
                <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Modelo</span><span className="text-white font-medium">{contract.motorcycle?.brand} {contract.motorcycle?.model}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Placa</span><span className="text-brand-gold font-bold">{contract.motorcycle?.plate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Cor</span><span className="text-white">{contract.motorcycle?.color || '—'}</span></div>
                </div>
              </div>
              <div className="md:col-span-2 bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><p className="text-gray-500 text-xs mb-1">Caução paga</p><p className={contract.depositPaid ? 'text-green-500 font-bold' : 'text-brand-red font-bold'}>{contract.depositPaid ? 'Sim' : 'Não'}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Caução devolvida</p><p className="text-white font-bold">{contract.depositRefunded ? 'Sim' : 'Não'}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Pendentes</p><p className="text-yellow-500 font-bold">{formatCurrency(paymentStats.pendingAmount)}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Em atraso</p><p className="text-brand-red font-bold">{paymentStats.overdue}</p></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-gray-400 text-sm">{paymentStats.paid} pagos · {paymentStats.pending} pendentes · {paymentStats.overdue} em atraso</p>
                <div className="flex gap-2">
                  {contract.status === 'ACTIVE' && (
                    <button onClick={() => setShowCreatePayment(true)} className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-lg text-sm font-bold border border-brand-gold/20 hover:bg-brand-gold/20 transition-colors cursor-pointer">
                      <Plus size={16} /> Novo
                    </button>
                  )}
                  <Link to="/admin/financeiro" className="text-sm text-gray-400 hover:text-brand-gold font-medium cursor-pointer">Financeiro →</Link>
                </div>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Nenhum pagamento registrado.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-mid/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-darker text-gray-400 text-left">
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Valor</th>
                        <th className="px-4 py-3 font-semibold">Vencimento</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.paymentId} className={`border-t border-gray-mid/30 ${isOverdue(p.dueDate, p.status) ? 'bg-brand-red/[0.03]' : ''}`}>
                          <td className="px-4 py-3 text-white">{PAYMENT_TYPE_LABELS[p.type]}</td>
                          <td className="px-4 py-3 text-brand-gold font-bold">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatDate(p.dueDate)}</td>
                          <td className="px-4 py-3">
                            <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                            {p.method && <p className="text-[10px] text-gray-500 mt-0.5">{PAYMENT_METHOD_LABELS[p.method]}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {p.status === 'PENDING' && contract.status === 'ACTIVE' && (
                                <button onClick={() => setRegisterPayment(p)} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 cursor-pointer" title="Registrar"><CheckCircle size={16} /></button>
                              )}
                              {contract.status === 'ACTIVE' && (
                                <button onClick={() => handleDeletePayment(p.paymentId)} className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 cursor-pointer" title="Excluir"><Trash2 size={16} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
