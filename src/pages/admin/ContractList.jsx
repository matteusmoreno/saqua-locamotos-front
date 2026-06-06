import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, ShieldAlert, Loader2, Download, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ContractService } from '../../services/contractService';
import { useConfirm } from '../../context/ConfirmContext';

export function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await ContractService.getAllContracts();
      setContracts(response.data);
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
      toast.error('Não foi possível carregar os contratos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelContract = async (contractId) => {
    const isConfirmed = await confirm({
      title: 'Cancelar Contrato',
      message: 'Tem a certeza que deseja cancelar este contrato? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Cancelar',
      isDanger: true
    });

    if (!isConfirmed) return;

    try {
      await ContractService.cancelContract(contractId);
      toast.success('Contrato cancelado com sucesso!');
      fetchContracts();
    } catch (error) {
      toast.error('Erro ao cancelar o contrato.');
    }
  };

  const handleDownloadPdf = async (contractId) => {
    try {
      const response = await ContractService.generatePdf(contractId);
      
      // Cria um link temporário para forçar o download do Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Erro ao gerar o PDF do contrato.');
    }
  };

  const filteredContracts = contracts.filter(contract => 
    contract.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.motorcycle?.plate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Ativo</span>;
      case 'FINISHED': return <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">Finalizado</span>;
      case 'CANCELLED': return <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase">Cancelado</span>;
      default: return <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3"><FileText className="text-brand-gold" size={32} /> Contratos</h1>
          <p className="text-gray-400">Faça a gestão dos contratos de locação das motos.</p>
        </div>
        
        <Link to="/admin/contratos/novo" className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] transform hover:-translate-y-1">
          <Plus size={20} /> Novo Contrato
        </Link>
      </div>

      <div className="bg-black-rich border border-gray-mid p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Search size={20} /></div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-xl text-white placeholder:text-gray-500 transition-all outline-none" placeholder="Buscar por nome do cliente ou placa da moto..."/>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 size={48} className="animate-spin text-brand-gold mb-4" /><p className="text-gray-400">A carregar contratos...</p></div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center flex flex-col items-center">
          <ShieldAlert size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum contrato encontrado</h3>
          {!searchTerm && <Link to="/admin/contratos/novo" className="text-brand-gold font-bold hover:underline">Criar primeiro contrato</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <motion.div key={contract.contractId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black-rich border border-gray-mid hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:shadow-[0_10px_30px_rgba(250,204,21,0.05)] relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white truncate max-w-[200px]">{contract.user?.name || 'Cliente'}</h3>
                  <p className="text-brand-gold font-medium">{contract.motorcycle?.model} - {contract.motorcycle?.plate}</p>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Tipo de Aluguel:</span> <span className="text-white font-medium">{contract.rentalType}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Data de Início:</span> <span className="text-white">{contract.startDate}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Valor Semanal:</span> <span className="text-brand-gold font-medium">R$ {contract.weeklyAmount?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Caução Pago:</span> <span className={contract.depositPaid ? "text-green-400" : "text-brand-red"}>{contract.depositPaid ? "Sim" : "Não"}</span></div>
              </div>

              <div className="pt-4 border-t border-gray-mid flex justify-between gap-3">
                {contract.status === 'ACTIVE' && (
                  <button onClick={() => handleCancelContract(contract.contractId)} className="flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors bg-gray-dark hover:bg-brand-red/20 text-brand-red" title="Cancelar Contrato">
                    <XCircle size={18} />
                  </button>
                )}
                
                <button onClick={() => handleDownloadPdf(contract.contractId)} className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-mid text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  <Download size={16} /> Baixar PDF
                </button>
                
                <Link to={`/admin/contratos/${contract.contractId}`} className="flex-1 flex items-center justify-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-brand-gold/30">
                  <FileText size={16} /> Detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}