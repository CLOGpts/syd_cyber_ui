import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { generateReport } from '../../api/report';
import { useTranslations } from '../../hooks/useTranslations';
import { useATECO } from '../../hooks/useATECO';
import ATECOAutocomplete from './ATECOAutocomplete';
import VisuraExtractionIndicator from './VisuraExtractionIndicator';
import type { SessionMeta } from '../../types';

const SessionPanel: React.FC = () => {
  const { sessionMeta, updateSessionMeta } = useAppStore();
  const t = useTranslations();
  const { processATECO, isLoading } = useATECO();

  const handleGenerateReport = async () => {
    const toastId = toast.loading('Generating report...');
    const result = await generateReport(sessionMeta);
    if (result.success) {
      toast.success(t.reportGenerated, { id: toastId });
    } else {
      toast.error('Failed to generate report.', { id: toastId });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateSessionMeta({ [e.target.name as keyof SessionMeta]: e.target.value });
  };

  const handleImpostaAteco = async () => {
    await processATECO();
  };

  const InputField: React.FC<{ label: string, name: keyof SessionMeta, value: string }> = ({ label, name, value }) => (
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
        <div>
          <label className="block text-sm font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">
            {t.atecoCode}
          </label>
          <ATECOAutocomplete
            value={sessionMeta.ateco}
            onChange={(value) => updateSessionMeta({ ateco: value })}
            onSelect={handleImpostaAteco}
            placeholder="Digita codice ATECO..."
          />
        </div>
        <InputField label={t.legalAddress} name="address" value={sessionMeta.address} />
        <InputField label={t.criticalAssets} name="criticalAssets" value={sessionMeta.criticalAssets} />
      </div>

      {/* Mostra dati arricchiti nel pannello */}
      {(sessionMeta.settore || sessionMeta.normative || sessionMeta.certificazioni) && (
        <div className="mt-4 space-y-2 text-sm">
          {sessionMeta.settore && <p><strong>Settore:</strong> {sessionMeta.settore}</p>}
          {sessionMeta.normative && <p><strong>Normative:</strong> {sessionMeta.normative}</p>}
          {sessionMeta.certificazioni && <p><strong>Certificazioni:</strong> {sessionMeta.certificazioni}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <motion.button
          onClick={handleImpostaAteco}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed relative overflow-hidden"
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10">
            {isLoading ? 'Analizzando...' : 'Imposta ATECO'}
          </span>
        </motion.button>

        <motion.button
          onClick={handleGenerateReport}
          className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          <span className="relative z-10">{t.generateReport}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SessionPanel;
