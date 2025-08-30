
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useStore';
import { useTranslations } from './useTranslations';
import { useVisuraExtraction } from './useVisuraExtraction';

const MAX_FILE_SIZE_MB = 20;
const MAX_TOTAL_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/xml',
  'text/xml',
  'image/png',
  'image/jpeg',
];

export const useUpload = () => {
  const { addFile, updateFileStatus, uploadedFiles } = useAppStore();
  const t = useTranslations();
  const { extractVisuraData } = useVisuraExtraction();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const currentTotalSize = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);
    let newFilesTotalSize = 0;

    const validFiles = Array.from(files).filter(file => {
      if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
        toast.error(t.errors.unsupportedType(file.name));
        return false;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t.errors.fileTooLarge(file.name, MAX_FILE_SIZE_MB));
        return false;
      }
      newFilesTotalSize += file.size;
      return true;
    });

    if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE_BYTES) {
      toast.error(t.errors.totalSizeExceeded(MAX_TOTAL_SIZE_MB));
      return;
    }

    validFiles.forEach(async file => {
      // Genera ID unico con timestamp + random per evitare duplicati
      const id = `${Date.now()}_${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).substr(2, 9)}`;
      addFile({ id, file, status: 'uploading' });

      // Check se è una visura camerale (PDF con nome suggestivo)
      const isPotentialVisura = file.type === 'application/pdf' && (
        file.name.toLowerCase().includes('visura') ||
        file.name.toLowerCase().includes('camerale') ||
        file.name.toLowerCase().includes('cciaa') ||
        file.name.toLowerCase().includes('camera_commercio')
      );

      if (isPotentialVisura) {
        // Sistema antifragile a 3 livelli per visure
        const extracted = await extractVisuraData(file);
        
        if (extracted) {
          updateFileStatus(id, 'completed');
          toast.success('📋 Visura camerale elaborata e dati estratti!');
        } else {
          // L'estrazione è fallita ma il file è comunque caricato
          updateFileStatus(id, 'completed');
          toast('📎 File caricato. Puoi allegarlo nella chat per assistenza manuale.', {
            icon: 'ℹ️',
          });
        }
      } else {
        // File normale, upload standard
        setTimeout(() => {
          updateFileStatus(id, 'completed');
          
          // Se è un PDF generico, suggerisci che potrebbe essere una visura
          if (file.type === 'application/pdf') {
            toast('💡 Suggerimento: Se questo è una visura camerale, rinominala con "visura" nel nome per l\'estrazione automatica.', {
              duration: 5000,
              icon: '📄',
            });
          }
        }, 1000 + Math.random() * 1000);
      }
    });
  }, [uploadedFiles, addFile, updateFileStatus, t]);

  return { handleFiles };
};
