import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Eye, FileText, Loader2, CheckCircle, FileUp, Clock3, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '../../services/userService';
import { normalizeUserDocuments } from '../../utils/userDocuments';
import { useConfirm } from '../../context/ConfirmContext';

const DOCUMENT_TYPES = [
  { key: 'cnh', label: 'Carta de Condução (CNH)' },
  { key: 'rg', label: 'Documento de Identidade (RG)' },
  { key: 'cpf', label: 'CPF' },
  { key: 'proof_of_residence', label: 'Comprovativo de Residência' },
  { key: 'criminal_record', label: 'Registo Criminal' },
  { key: 'passport', label: 'Passaporte' }
];

export function CustomerDocumentsModal({ isOpen, onClose, userId, existingDocs = {}, onUpdateSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState('');
  const normalizedDocs = normalizeUserDocuments(existingDocs);
  const { confirm } = useConfirm();

  const uploadedCount = useMemo(() => {
    return DOCUMENT_TYPES.filter((doc) => normalizedDocs[doc.key]).length;
  }, [normalizedDocs]);

  const pendingCount = Object.keys(selectedFiles).length;

  // NOVO: Efeito para fechar o modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleFileSelect = (typeKey, file) => {
    setSelectedFiles(prev => ({ ...prev, [typeKey]: file }));
  };

  const handleCancelSelection = (typeKey) => {
    setSelectedFiles(prev => {
      const newState = { ...prev };
      delete newState[typeKey];
      return newState;
    });
  };

  const handleUploadAll = async () => {
    const keysToUpload = Object.keys(selectedFiles);
    if (keysToUpload.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    keysToUpload.forEach(key => formData.append(key, selectedFiles[key]));

    try {
      const response = await UserService.uploadDocuments(userId, formData);
      toast.success('Documentos enviados com sucesso!');
      setSelectedFiles({});
      if (onUpdateSuccess) onUpdateSuccess(response.data.documents);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || 'Erro ao enviar documentos.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (typeKey) => {
    const docLabel = DOCUMENT_TYPES.find((doc) => doc.key === typeKey)?.label || 'documento';
    const canDelete = await confirm({
      title: 'Eliminar Documento',
      message: `Tem a certeza que deseja eliminar ${docLabel}? Esta acao nao pode ser desfeita.`,
      confirmText: 'Sim, eliminar',
      cancelText: 'Cancelar',
      isDanger: true,
    });

    if (!canDelete) return;

    setDeletingKey(typeKey);
    try {
      const response = await UserService.deleteDocuments(userId, [typeKey]);
      toast.success('Documento eliminado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess(response.data.documents);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao eliminar documento.');
    } finally {
      setDeletingKey('');
    }
  };

  if (!isOpen) return null;

  const hasFilesToUpload = pendingCount > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-black-rich border border-gray-mid rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/10 to-transparent shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
                <FileText className="text-brand-gold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Gestão de Documentos</h2>
                <p className="text-sm text-gray-400">Gerencie anexos com segurança e acompanhamento em tempo real.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-dark hover:bg-gray-mid rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-mid/50 bg-gray-darker/30 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-gray-mid/50 bg-black-pure/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Documentos enviados</p>
              <p className="text-lg font-black text-green-500">{uploadedCount}/{DOCUMENT_TYPES.length}</p>
            </div>
            <div className="rounded-xl border border-gray-mid/50 bg-black-pure/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pendentes de envio</p>
              <p className="text-lg font-black text-brand-gold">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-gray-mid/50 bg-black-pure/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status geral</p>
              <p className="text-sm font-bold text-gray-200 flex items-center gap-2 mt-1">
                {uploadedCount > 0 ? <ShieldCheck size={14} className="text-green-500" /> : <Clock3 size={14} className="text-orange-400" />}
                {uploadedCount > 0 ? 'Com anexos' : 'Sem anexos'}
              </p>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {DOCUMENT_TYPES.map((docType) => {
              const existingUrl = normalizedDocs[docType.key] || null;
              const pendingFile = selectedFiles[docType.key];

              return (
                <div key={docType.key} className="bg-gray-darker border border-gray-mid rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-brand-gold/30">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {existingUrl ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
                      {docType.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 pl-5">
                      {existingUrl ? 'Documento validado e ativo no sistema.' : pendingFile ? 'Ficheiro selecionado, aguardando envio.' : 'Pendente de envio.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {existingUrl ? (
                      <>
                        <a 
                          href={existingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold hover:text-black-pure rounded-xl text-sm font-bold transition-all"
                        >
                          <Eye size={16} /> Ver Anexo
                        </a>
                        <button 
                          onClick={() => handleDeleteDocument(docType.key)}
                          disabled={Boolean(deletingKey)}
                          className="p-2.5 text-brand-red bg-brand-red/10 border border-brand-red/20 hover:bg-brand-red hover:text-white rounded-xl transition-all disabled:opacity-50"
                          title="Eliminar documento"
                        >
                          {deletingKey === docType.key ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </>
                    ) : pendingFile ? (
                      <div className="flex w-full items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-sm font-medium truncate">
                          <FileUp size={16} className="shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-[150px]">{pendingFile.name}</span>
                        </div>
                        <button 
                          onClick={() => handleCancelSelection(docType.key)}
                          className="p-2.5 text-gray-400 border border-gray-mid hover:text-brand-red bg-gray-dark hover:bg-brand-red/10 rounded-xl transition-all"
                          title="Cancelar seleção"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-dark border border-dashed border-gray-500 text-gray-300 hover:text-brand-gold hover:border-brand-gold rounded-xl text-sm font-bold transition-all cursor-pointer">
                        <Upload size={16} /> Procurar
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if(e.target.files[0]) handleFileSelect(docType.key, e.target.files[0]);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-gray-mid bg-gray-darker/50 shrink-0 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">
              {hasFilesToUpload ? <span className="text-brand-gold">{pendingCount} ficheiro(s) pronto(s) para enviar.</span> : 'Nenhuma alteração pendente.'}
            </span>
            <button 
              onClick={handleUploadAll}
              disabled={!hasFilesToUpload || isUploading}
              className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              Confirmar Envios
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}