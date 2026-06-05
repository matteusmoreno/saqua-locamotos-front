import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Eye, FileText, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '../../services/userService';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileSelect = (typeKey, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [typeKey]: file
    }));
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
    
    keysToUpload.forEach(key => {
      formData.append(key, selectedFiles[key]);
    });

    try {
      const response = await UserService.uploadDocuments(userId, formData);
      toast.success('Documentos enviados com sucesso!');
      setSelectedFiles({});
      if (onUpdateSuccess) onUpdateSuccess(response.data.documents);
      
      // Fechar o modal após o sucesso
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || 'Erro ao enviar documentos.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (typeKey) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este documento? Esta ação não pode ser desfeita.')) return;
    
    setIsDeleting(true);
    try {
      const response = await UserService.deleteDocuments(userId, [typeKey]);
      toast.success('Documento eliminado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess(response.data.documents);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao eliminar documento.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const hasFilesToUpload = Object.keys(selectedFiles).length > 0;

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
          className="relative w-full max-w-3xl bg-black-rich border border-gray-mid rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-mid shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-brand-gold" />
                Gestão de Documentos
              </h2>
              <p className="text-sm text-gray-400 mt-1">Anexe ou elimine os documentos legais do locatário.</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-dark hover:bg-gray-mid rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {DOCUMENT_TYPES.map((docType) => {
              const existingUrl = existingDocs ? existingDocs[docType.key] : null;
              const pendingFile = selectedFiles[docType.key];

              return (
                <div key={docType.key} className="bg-gray-dark border border-gray-mid rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-brand-gold/30">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{docType.label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {existingUrl ? 'Documento anexado no sistema.' : pendingFile ? 'Pronto para envio.' : 'Nenhum documento anexado.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {existingUrl ? (
                      <>
                        <a 
                          href={existingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black-pure rounded-xl text-sm font-bold transition-colors"
                        >
                          <Eye size={16} /> Ver
                        </a>
                        <button 
                          onClick={() => handleDeleteDocument(docType.key)}
                          disabled={isDeleting}
                          className="p-2 text-brand-red bg-brand-red/10 hover:bg-brand-red hover:text-white rounded-xl transition-colors disabled:opacity-50"
                          title="Eliminar documento"
                        >
                          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </>
                    ) : pendingFile ? (
                      <div className="flex w-full items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-sm font-medium truncate">
                          <CheckCircle size={16} className="shrink-0" />
                          <span className="truncate">{pendingFile.name}</span>
                        </div>
                        <button 
                          onClick={() => handleCancelSelection(docType.key)}
                          className="p-2 text-gray-400 hover:text-brand-red bg-gray-darker rounded-xl transition-colors"
                          title="Cancelar seleção"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-darker border border-dashed border-gray-500 text-gray-300 hover:text-white hover:border-brand-gold rounded-xl text-sm font-medium transition-colors cursor-pointer">
                        <Upload size={16} /> Selecionar
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

          <div className="p-6 border-t border-gray-mid bg-black-rich shrink-0 rounded-b-3xl flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {hasFilesToUpload ? `${Object.keys(selectedFiles).length} ficheiro(s) selecionado(s) para envio.` : 'Nenhuma alteração pendente.'}
            </span>
            <button 
              onClick={handleUploadAll}
              disabled={!hasFilesToUpload || isUploading}
              className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              Guardar Novos Anexos
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}