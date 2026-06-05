import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Search, Phone, Mail, MapPin, 
  ShieldAlert, Loader2, MoreVertical, Edit, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '../../services/userService';
import { CustomerDocumentsModal } from '../../components/admin/CustomerDocumentsModal';

export function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para controlar qual cliente está com o Modal de Documentos aberto
  const [docModalCustomer, setDocModalCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await UserService.getAllCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error("Erro ao buscar locatários:", error);
      toast.error('Não foi possível carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cpf?.includes(searchTerm)
  );

  // Quando os documentos são atualizados no Modal, refletimos a mudança na lista local
  const handleDocsUpdated = (updatedDocs) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => 
        customer.customerId === docModalCustomer.customerId 
          ? { ...customer, documents: updatedDocs } 
          : customer
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Modal de Documentos que será aberto para o cliente selecionado */}
      <CustomerDocumentsModal 
        isOpen={!!docModalCustomer}
        onClose={() => setDocModalCustomer(null)}
        userId={docModalCustomer?.customerId}
        existingDocs={docModalCustomer?.documents || {}}
        onUpdateSuccess={handleDocsUpdated}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Users className="text-brand-gold" size={32} />
            Locatários
          </h1>
          <p className="text-gray-400">Gerencie todos os clientes da Saqua Locamotos.</p>
        </div>
        
        <Link to="/admin/clientes/novo" className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] transform hover:-translate-y-1">
          <Plus size={20} /> Novo Locatário
        </Link>
      </div>

      <div className="bg-black-rich border border-gray-mid p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-xl text-white placeholder:text-gray-500 transition-all outline-none"
            placeholder="Buscar por nome, e-mail ou CPF..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">Carregando carteira de clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center flex flex-col items-center">
          <ShieldAlert size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum locatário encontrado</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            {searchTerm ? `Não encontramos resultados para "${searchTerm}".` : "Você ainda não possui clientes cadastrados na plataforma."}
          </p>
          {!searchTerm && (
            <Link to="/admin/clientes/novo" className="text-brand-gold font-bold hover:underline">
              Cadastrar meu primeiro locatário
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => {
            
            // Lógica simples para contar documentos anexados neste card
            const docsCount = customer.documents ? Object.keys(customer.documents).length : 0;

            return (
              <motion.div key={customer.customerId || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-black-rich border border-gray-mid hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:shadow-[0_10px_30px_rgba(250,204,21,0.05)] group relative">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-brand-gold transition-colors">
                  <MoreVertical size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {customer.pictureUrl ? (
                      <img src={customer.pictureUrl} alt={customer.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-mid group-hover:border-brand-gold transition-colors"/>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-darker border-2 border-gray-mid group-hover:border-brand-gold flex items-center justify-center text-xl font-black text-brand-gold transition-colors">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black-rich rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate max-w-[180px]" title={customer.name}>{customer.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">Locatário</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone size={16} className="text-gray-500" />
                    {customer.phone || 'Não informado'}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 truncate" title={customer.email}>
                    <Mail size={16} className="text-gray-500" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 truncate">
                    <MapPin size={16} className="text-gray-500" />
                    {customer.address?.city ? `${customer.address.city} - ${customer.address.state}` : 'Endereço pendente'}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-mid flex justify-between gap-3">
                  <Link to={`/admin/clientes/${customer.customerId}/editar`} className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-mid text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    <Edit size={16} /> Editar
                  </Link>
                  
                  {/* Botão de Documentos conectando ao Modal */}
                  <button 
                    onClick={() => setDocModalCustomer(customer)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-brand-gold/10 text-brand-gold py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-brand-gold/30 relative"
                  >
                    <Camera size={16} /> Docs
                    
                    {/* Indicador visual de documentos no Card */}
                    {docsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-gold text-black-pure rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {docsCount}
                      </span>
                    )}
                  </button>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}