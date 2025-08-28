import React from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/useStore';
import { generateReport } from '../../api/report';
import { useTranslations } from '../../hooks/useTranslations';
// FIX: Import the SessionMeta type to use it directly, ensuring correct type inference.
import type { SessionMeta } from '../../types';

const SessionPanel: React.FC = () => {
  const { sessionMeta, updateSessionMeta } = useAppStore();
  const t = useTranslations();
  
  const handleGenerateReport = async () => {
    const toastId = toast.loading('Generating report...');
    // TODO: Replace with real API call
    const result = await generateReport(sessionMeta);
    if (result.success) {
      toast.success(t.reportGenerated, { id: toastId });
    } else {
      toast.error('Failed to generate report.', { id: toastId });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // FIX: Cast the input name to a key of SessionMeta to ensure type safety when updating the store.
    updateSessionMeta({ [e.target.name as keyof SessionMeta]: e.target.value });
  };
  
  // FIX: Use the imported SessionMeta type for the 'name' prop. This correctly types 'name' as a union of string literals ('ateco' | 'address' | 'criticalAssets'), which is assignable to string properties like 'htmlFor', 'id', and 'name'.
  const InputField: React.FC<{ label: string, name: keyof SessionMeta, value: string }> = ({label, name, value}) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">
          {label}
        </label>
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
  );


  return (
    <div className="p-4 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg space-y-4">
      <h2 className="font-bold text-lg">{t.sessionBIA}</h2>
      
      <div className="space-y-4">
        <InputField label={t.atecoCode} name="ateco" value={sessionMeta.ateco} />
        <InputField label={t.legalAddress} name="address" value={sessionMeta.address} />
        <InputField label={t.criticalAssets} name="criticalAssets" value={sessionMeta.criticalAssets} />
      </div>

      <button
        onClick={handleGenerateReport}
        className="w-full mt-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
      >
        {t.generateReport}
      </button>
    </div>
  );
};

export default SessionPanel;
