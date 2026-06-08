import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Search, Phone, Mail, MapPin, 
  ShieldAlert, Loader2, FileCheck, FileWarning, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '../../services/userService';
import { countValidDocuments } from '../../utils/userDocuments';

function StatPill({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl px-4 py-3 text-center min-w-[100px] flex-1 sm:flex-none group">
      {Icon && <Icon size={42} className="absolute -bottom-2 -right-2 text-gray-600/20 group-hover:scale-110 transition-transform" />}
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  const stats = useMemo(() => {
    const total = customers.length;
    const withDocs = customers.filter(c => countValidDocuments(c.documents) > 0).length;
    const pendingDocs = total - withDocs;
    return { total, withDocs, pendingDocs };
  }, [customers]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <Users className="text-brand-gold" size={32} /> Locatários
          </h1>
          <p className="text-gray-400 text-sm">Gestão completa da carteira de clientes.</p>
        </div>
        
        <Link to="/admin/clientes/novo" className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] transform hover:-translate-y-1">
          <Plus size={20} /> Novo Locatário
        </Link>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3">
          <StatPill icon={Users} label="Total Clientes" value={stats.total} />
          <StatPill icon={FileCheck} label="Com Documentos" value={stats.withDocs} color="text-green-500" />
          <StatPill icon={FileWarning} label="Docs Pendentes" value={stats.pendingDocs} color="text-orange-400" />
        </div>
      )}

      <div className="bg-black-rich border border-gray-mid p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold rounded-xl text-white placeholder:text-gray-500 transition-all outline-none text-sm"
            placeholder="Buscar por nome, e-mail ou CPF..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">A carregar carteira de clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center flex flex-col items-center">
          <ShieldAlert size={56} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum locatário encontrado</h3>
          <p className="text-gray-400 mb-6 text-sm">
            {searchTerm ? `Sem resultados para "${searchTerm}".` : "Ainda não possui clientes cadastrados."}
          </p>
          {!searchTerm && (
            <Link to="/admin/clientes/novo" className="text-brand-gold font-bold hover:underline">
              Cadastrar meu primeiro locatário
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCustomers.map((customer, index) => {
            const docsCount = countValidDocuments(customer.documents);
            const hasDocs = docsCount > 0;

            return (
              <motion.div 
                key={customer.customerId || index} 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.04 }} 
                onClick={() => navigate(`/admin/clientes/${customer.customerId}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/admin/clientes/${customer.customerId}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="relative bg-black-rich border border-gray-mid hover:border-brand-gold/60 rounded-2xl overflow-hidden transition-all group flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              >
                <Users className="absolute -bottom-5 -right-5 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                <div className="p-5 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/5 to-transparent flex items-start justify-between">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="relative shrink-0">
                      {customer.pictureUrl ? (
                        <img src={customer.pictureUrl} alt={customer.name} className="w-14 h-14 rounded-full object-cover border border-gray-mid"/>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-darker border border-gray-mid flex items-center justify-center text-lg font-black text-brand-gold">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black-rich rounded-full"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate" title={customer.name}>{customer.name}</h3>
                      <p className="text-brand-gold text-sm font-medium">{customer.cpf || 'Sem CPF'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  <div className="flex flex-col gap-2.5 text-sm text-gray-400">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate">{customer.phone || 'Telefone não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate" title={customer.email}>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate" title={customer.address?.city}>
                        {customer.address?.city ? `${customer.address.city} - ${customer.address.state}` : 'Endereço pendente'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold bg-gray-darker p-2.5 rounded-lg border border-gray-mid/50">
                    {hasDocs ? <FileCheck size={14} className="text-green-500" /> : <FileWarning size={14} className="text-orange-400" />}
                    <span className={hasDocs ? 'text-gray-300' : 'text-orange-400/80'}>
                      {hasDocs ? `${docsCount} documento(s) anexado(s)` : 'Nenhum documento anexado'}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-mid/50 mt-auto bg-gray-darker/20 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Toque para abrir detalhes</span>
                  <span className="inline-flex items-center gap-1.5 text-brand-gold font-bold">
                    <Eye size={14} /> Ver perfil
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}