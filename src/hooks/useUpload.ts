
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useStore';
import { useTranslations } from './useTranslations';

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

    validFiles.forEach(file => {
      const id = `${file.name}-${file.lastModified}-${file.size}`;
      addFile({ id, file, status: 'uploading' });

      // Simulate upload process
      setTimeout(() => {
        // TODO: Replace this with a real upload API call.
        // On success, call updateFileStatus(id, 'completed').
        // On failure, call updateFileStatus(id, 'error', 'Upload failed.').
        updateFileStatus(id, 'completed');
      }, 1000 + Math.random() * 1000);
    });
  }, [uploadedFiles, addFile, updateFileStatus, t]);

  return { handleFiles };
};
