import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, Loader2, Plus, CheckCircle, Trash2,
  Download, Flag, User, Bike
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { PaymentService } from '../../services/paymentService';
import { useConfirm } from '../../context/ConfirmContext';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { CreatePaymentModal } from '../../components/admin/CreatePaymentModal';
import { RegisterPaymentModal } from '../../components/admin/RegisterPaymentModal';
import {
  PAYMENT_TYPE_LABELS, RENTAL_TYPE_LABELS, CONTRACT_STATUS_LABELS, PAYMENT_METHOD_LABELS
} from '../../utils/financialLabels';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

function ContractStatusBadge({ status }) {
  const styles = {
    ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
    FINISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CANCELLED: 'bg-brand-red/10 text-brand-red border-brand-red/20',
    OVERDUE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {CONTRACT_STATUS_LABELS[status] || status}
    </span>
  );
}

export function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [registerPayment, setRegisterPayment] = useState(null);

  const { confirm } = useConfirm();

  useEffect(() => {
    fetchContract();
  }, [id]);

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

  const handleDeletePayment = async (paymentId) => {
    const isConfirmed = await confirm({
      title: 'Excluir Pagamento',
      message: 'Tem certeza que deseja excluir este pagamento?',
      confirmText: 'Sim, Excluir',
      isDanger: true,
    });
    if (!isConfirmed) return;

    try {
      await PaymentService.deletePayment(paymentId);
      toast.success('Pagamento excluído.');
      fetchContract();
    } catch {
      toast.error('Erro ao excluir pagamento.');
    }
  };

  const handleFinishContract = async () => {
    const wantsFinish = await confirm({
      title: 'Finalizar Contrato',
      message: 'Tem certeza que deseja finalizar este contrato?',
      confirmText: 'Continuar',
      isDanger: false,
    });
    if (!wantsFinish) return;

    const refundDeposit = await confirm({
      title: 'Devolução da Caução',
      message: 'Deseja devolver a caução ao cliente?',
      confirmText: 'Sim, Devolver',
      cancelText: 'Não Devolver',
      isDanger: false,
    });

    try {
      await ContractService.finishContract(id, refundDeposit);
      toast.success('Contrato finalizado com sucesso!');
      fetchContract();
    } catch {
      toast.error('Erro ao finalizar contrato.');
    }
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
    } catch {
      toast.error('Erro ao gerar PDF.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Contrato não encontrado.</p>
        <Link to="/admin/contratos" className="text-brand-gold font-bold hover:underline mt-4 inline-block">
          Voltar para contratos
        </Link>
      </div>
    );
  }

  const payments = contract.payments || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <CreatePaymentModal
        isOpen={showCreatePayment}
        onClose={() => setShowCreatePayment(false)}
        contracts={[contract]}
        defaultContractId={contract.contractId}
        onSuccess={fetchContract}
      />
      <RegisterPaymentModal
        isOpen={!!registerPayment}
        onClose={() => setRegisterPayment(null)}
        payment={registerPayment}
        onSuccess={fetchContract}
      />

      <div className="flex items-center gap-4">
        <Link to="/admin/contratos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FileText className="text-brand-gold" size={32} /> Detalhes do Contrato
          </h1>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black-rich border border-gray-mid rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={20} className="text-brand-gold" /> Cliente
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Nome:</span><span className="text-white font-medium">{contract.user?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">E-mail:</span><span className="text-white">{contract.user?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Telefone:</span><span className="text-white">{contract.user?.phone || '—'}</span></div>
          </div>
        </div>

        <div className="bg-black-rich border border-gray-mid rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bike size={20} className="text-brand-gold" /> Moto
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Modelo:</span><span className="text-white font-medium">{contract.motorcycle?.brand} {contract.motorcycle?.model}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Placa:</span><span className="text-brand-gold font-bold">{contract.motorcycle?.plate}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cor:</span><span className="text-white">{contract.motorcycle?.color || '—'}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Informações do Contrato</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-400 mb-1">Tipo</p><p className="text-white font-medium">{RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}</p></div>
          <div><p className="text-gray-400 mb-1">Início</p><p className="text-white font-medium">{formatDate(contract.startDate)}</p></div>
          <div><p className="text-gray-400 mb-1">Término</p><p className="text-white font-medium">{formatDate(contract.endDate)}</p></div>
          <div><p className="text-gray-400 mb-1">Valor Semanal</p><p className="text-brand-gold font-bold">{formatCurrency(contract.weeklyAmount)}</p></div>
          <div><p className="text-gray-400 mb-1">Caução</p><p className="text-white font-medium">{formatCurrency(contract.depositAmount)}</p></div>
          <div><p className="text-gray-400 mb-1">Total Recebido</p><p className="text-green-400 font-bold">{formatCurrency(contract.totalAmount)}</p></div>
          <div><p className="text-gray-400 mb-1">Caução Paga</p><p className={contract.depositPaid ? 'text-green-400' : 'text-brand-red'}>{contract.depositPaid ? 'Sim' : 'Não'}</p></div>
          <div><p className="text-gray-400 mb-1">Caução Devolvida</p><p className="text-white">{contract.depositRefunded ? 'Sim' : 'Não'}</p></div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-mid">
          <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-gray-dark hover:bg-gray-mid text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} /> Baixar PDF
          </button>
          {contract.status === 'ACTIVE' && (
            <>
              <button onClick={() => setShowCreatePayment(true)} className="flex items-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-brand-gold/20 cursor-pointer">
                <Plus size={16} /> Novo Pagamento
              </button>
              <button onClick={handleFinishContract} className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/20">
                <Flag size={16} /> Finalizar Contrato
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-mid flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Pagamentos ({payments.length})</h2>
          <Link to="/admin/financeiro" className="text-sm text-brand-gold hover:underline font-medium">
            Ver no Financeiro →
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Nenhum pagamento registrado para este contrato.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="px-6 py-3 font-semibold">Tipo</th>
                  <th className="px-6 py-3 font-semibold">Valor</th>
                  <th className="px-6 py-3 font-semibold">Vencimento</th>
                  <th className="px-6 py-3 font-semibold">Pago em</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.paymentId} className="border-t border-gray-mid/50 hover:bg-gray-darker/50 transition-colors">
                    <td className="px-6 py-4 text-white">{PAYMENT_TYPE_LABELS[p.type] || p.type}</td>
                    <td className="px-6 py-4 text-brand-gold font-bold">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(p.dueDate)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(p.paidDate)}</td>
                    <td className="px-6 py-4">
                      <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                      {p.method && <p className="text-[10px] text-gray-500 mt-1">{PAYMENT_METHOD_LABELS[p.method]}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'PENDING' && contract.status === 'ACTIVE' && (
                          <button onClick={() => setRegisterPayment(p)} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" title="Registrar">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {contract.status === 'ACTIVE' && (
                          <button onClick={() => handleDeletePayment(p.paymentId)} className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
