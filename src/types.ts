
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

export interface UploadFile {
  id: string;
  file: File;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface SessionMeta {
  ateco: string;
  address: string;
  criticalAssets: string;
}
