import React from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/useStore';
import { useChatStore } from '../../store/useChat';
import { generateReport } from '../../api/report';
import { useTranslations } from '../../hooks/useTranslations';
import { fetchGeminiAteco } from '../../api/gemini';   // 👈 chiamata a Gemini
import type { SessionMeta } from '../../types';

const SessionPanel: React.FC = () => {
  const { sessionMeta, updateSessionMeta } = useAppStore();
  const { addMessage } = useChatStore();
  const t = useTranslations();

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
    try {
      const toastId = toast.loading('Ricerca codice ATECO...');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/lookup?code=${sessionMeta.ateco}`);
      const data = await res.json();

      let codice = sessionMeta.ateco;
      let titolo = "";
      let settore = "non mappato";
      let normative: string[] = [];
      let certificazioni: string[] = [];

      // 📌 Step 1: titolo e codice SEMPRE da Excel
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        codice = item.CODICE_ATECO_2022 || item.CODICE_ATECO_2025_RAPPRESENTATIVO || sessionMeta.ateco;
        titolo = item.TITOLO_ATECO_2022 || item.TITOLO_ATECO_2025_RAPPRESENTATIVO || "Titolo non trovato";
        settore = item.settore || "non mappato";
        normative = item.normative || [];
        certificazioni = item.certificazioni || [];

        updateSessionMeta({
          ateco: codice,
          address: sessionMeta.address,
          criticalAssets: sessionMeta.criticalAssets,
          settore,
          normative: normative.join(', '),
          certificazioni: certificazioni.join(', ')
        });
      }

      // 📌 Step 2: Gemini arricchisce SOLO normative/certificazioni/rischi
      const geminiData = await fetchGeminiAteco(codice);

      const responseText = `
✅ Codice ATECO impostato: ${codice}
📌 Titolo ufficiale: ${titolo}
🏷 Settore: ${settore}

📖 Normative di riferimento:
${(geminiData?.normative || normative).map((n: string) => `- ${n}`).join('\n') || 'Nessuna mappata'}

📜 Certificazioni tipiche:
${(geminiData?.certificazioni || certificazioni).map((c: string) => `- ${c}`).join('\n') || 'Nessuna mappata'}

⚠️ Rischi principali:
${(geminiData?.rischi || [
  "Operativi: interruzione processi core",
  "Compliance: mancata aderenza alle normative",
  "Cyber: ransomware, accessi non autorizzati",
  "Reputazionali: perdita di fiducia clienti/partner"
]).map((r: string) => `- ${r}`).join('\n')}
      `;

      // 👇 Mostra in chat
      addMessage({
        id: Date.now().toString(),
        sender: 'agent',
        text: responseText.trim(),
        timestamp: new Date().toISOString()
      });

      toast.success('Codice ATECO impostato ✅', { id: toastId });
    } catch (err) {
      console.error('Errore API ATECO/Gemini:', err);
      toast.error('Errore durante la ricerca ATECO');
    }
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
        <InputField label={t.atecoCode} name="ateco" value={sessionMeta.ateco} />
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
        <button
          onClick={handleImpostaAteco}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Imposta ATECO
        </button>

        <button
          onClick={handleGenerateReport}
          className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t.generateReport}
        </button>
      </div>
    </div>
  );
};

export default SessionPanel;
