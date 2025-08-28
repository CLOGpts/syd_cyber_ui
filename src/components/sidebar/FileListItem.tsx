
import React from 'react';
import { FileText, FileJson, FileCode, FileImage, FileSpreadsheet, FileX, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { useTranslations } from '../../hooks/useTranslations';
import type { UploadFile } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface FileListItemProps {
  uploadFile: UploadFile;
}

const FileIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  if (mimeType.startsWith('image/')) return <FileImage className="text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileX className="text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className="text-green-500" />;
  if (mimeType.includes('json')) return <FileJson className="text-yellow-500" />;
  if (mimeType.includes('xml')) return <FileCode className="text-orange-500" />;
  return <FileText className="text-blue-500" />;
};

const FileListItem: React.FC<FileListItemProps> = ({ uploadFile }) => {
  const { removeFile } = useAppStore();
  const t = useTranslations();
  
  const statusIndicator = {
    uploading: <Loader size={16} className="text-blue-500 animate-spin" />,
    completed: <CheckCircle size={16} className="text-green-500" />,
    error: <AlertCircle size={16} className="text-red-500" />,
  };

  return (
    <li className="flex items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
      <div className="flex-shrink-0 mr-3">
        <FileIcon mimeType={uploadFile.file.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
          {formatBytes(uploadFile.file.size)} - 
          <span className={`ml-1 ${uploadFile.status === 'error' ? 'text-red-500' : ''}`}>
            {uploadFile.status === 'error' ? uploadFile.error : t.fileStatus[uploadFile.status]}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 ml-2">
          {statusIndicator[uploadFile.status]}
          <button onClick={() => removeFile(uploadFile.id)} className="text-slate-400 hover:text-red-500" title={t.remove}>
              <Trash2 size={16} />
          </button>
      </div>
    </li>
  );
};

export default FileListItem;
