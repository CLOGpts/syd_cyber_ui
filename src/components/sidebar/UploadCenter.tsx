
import React, { useRef, DragEvent, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { useUpload } from '../../hooks/useUpload';
import { useTranslations } from '../../hooks/useTranslations';
import FileListItem from './FileListItem';

const UploadCenter: React.FC = () => {
  const { uploadedFiles, clearAllFiles } = useAppStore();
  const { handleFiles } = useUpload();
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(over);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  return (
    <div className="p-4 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg space-y-4">
      <h2 className="font-bold text-lg">{t.uploadCenter}</h2>

      <div
        className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-blue-50 dark:bg-blue-900/50' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}
        onClick={handleAreaClick}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDrop={handleDrop}
        role="button"
        aria-label={t.dropFilesHere}
      >
        <UploadCloud size={32} className="mx-auto text-text-muted-light dark:text-text-muted-dark mb-2" />
        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{t.dropFilesHere}</p>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{t.uploadedFiles}</h3>
            <button
              onClick={clearAllFiles}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
            >
              <X size={14} />
              {t.clearAll}
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {uploadedFiles.map((file) => (
              <FileListItem key={file.id} uploadFile={file} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadCenter;
