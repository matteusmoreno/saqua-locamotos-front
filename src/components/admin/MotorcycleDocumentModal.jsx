import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Eye, FileText, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';

export function MotorcycleDocumentModal({ isOpen, onClose, motorcycleId, documentUrl, onUpdateSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useConfirm();

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await MotorcycleService.uploadDocument(motorcycleId, formData);
      toast.success('Documento da moto anexado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess(response.data.documentUrl);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar documento da moto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    const isConfirmed = await confirm({
      title: 'Eliminar Documento',
      message: 'Tem a certeza que deseja remover o documento desta moto?',
      confirmText: 'Sim, Eliminar',
      isDanger: true
    });

    if (!isConfirmed) return;
    
    setIsDeleting(true);
    try {
      await MotorcycleService.deleteDocument(motorcycleId);
      toast.success('Documento eliminado com sucesso!');
      if (onUpdateSuccess) onUpdateSuccess(null);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao eliminar documento.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-lg bg-black-rich border border-gray-mid rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
                <FileText className="text-brand-gold" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Documento (CRLV)</h2>
                <p className="text-sm text-gray-400">Anexe o documento de rodagem da moto.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-dark hover:bg-gray-mid rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-gray-darker border border-gray-mid rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-brand-gold/30">
              
              <div className="flex-1 text-center sm:text-left w-full">
                <h4 className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-2">
                  {documentUrl ? <CheckCircle size={16} className="text-green-500" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  Certificado de Registo
                </h4>
                <p className="text-xs text-gray-400 mt-1 sm:pl-6">
                  {documentUrl ? 'Documento anexado, válido e ativo.' : 'Nenhum documento legal anexado ao veículo no momento.'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                {documentUrl ? (
                  <>
                    <a 
                      href={documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-black-pure rounded-xl text-sm font-bold transition-all"
                    >
                      <Eye size={16} /> Abrir
                    </a>
                    <button 
                      onClick={handleDeleteDocument} 
                      disabled={isDeleting} 
                      className="p-2.5 text-brand-red border border-brand-red/20 bg-brand-red/10 hover:bg-brand-red hover:text-white rounded-xl transition-all disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </>
                ) : (
                  <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold-hover text-black-pure rounded-xl text-sm font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    Fazer Upload
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf" 
                      onChange={handleFileUpload} 
                      disabled={isUploading} 
                    />
                  </label>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}