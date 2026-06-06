import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Eye, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';

export function MotorcycleDocumentModal({ isOpen, onClose, motorcycleId, documentUrl, onUpdateSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useConfirm();

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-black-rich border border-gray-mid rounded-3xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-mid">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-brand-gold" /> Documento Legal (CRLV)</h2>
              <p className="text-sm text-gray-400 mt-1">Anexe o documento de rodagem da moto.</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-dark hover:bg-gray-mid rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-dark border border-gray-mid rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-white text-sm">Documento do Veículo</h4>
                <p className="text-xs text-gray-500 mt-0.5">{documentUrl ? 'Documento anexado e válido.' : 'Nenhum documento anexado.'}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {documentUrl ? (
                  <>
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black-pure rounded-xl text-sm font-bold transition-colors">
                      <Eye size={16} /> Ver
                    </a>
                    <button onClick={handleDeleteDocument} disabled={isDeleting} className="p-2 text-brand-red bg-brand-red/10 hover:bg-brand-red hover:text-white rounded-xl transition-colors disabled:opacity-50">
                      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </>
                ) : (
                  <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50">
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Selecionar Arquivo
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={isUploading} />
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