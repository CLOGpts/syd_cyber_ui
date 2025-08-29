// ui/src/api/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export async function fetchGeminiAteco(code: string, backendData?: any) {
  try {
    console.log("🔎 Chiamata a Gemini per codice:", code);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Sei un consulente esperto in rischio e compliance per il settore indicato dal codice ATECO ${code}.

${backendData ? `
Dati ufficiali dal backend:
- Codice ATECO 2022: ${backendData.CODICE_ATECO_2022 || 'N/D'}
- Titolo ATECO 2022: ${backendData.TITOLO_ATECO_2022 || 'N/D'}
- Codice ATECO 2025: ${backendData.CODICE_ATECO_2025_RAPPRESENTATIVO || 'N/D'}
- Titolo ATECO 2025: ${backendData.TITOLO_ATECO_2025_RAPPRESENTATIVO || 'N/D'}
` : ''}

IMPORTANTE: Rispondi ESCLUSIVAMENTE in formato JSON valido, senza testo aggiuntivo prima o dopo.
Fornisci un'analisi DETTAGLIATA e SPECIFICA per questo settore con:

{
  "arricchimento": "Descrizione dettagliata del settore, caratteristiche principali, posizionamento tra sanità e retail se applicabile, requisiti di compliance specifici (2-3 paragrafi)",
  "normative": [
    "Regolamento (UE) XXXX/YYYY - Nome completo e ambito",
    "Direttiva XXXX/YY/CE - Descrizione specifica",
    "D.Lgs. XXX/YYYY - Normativa nazionale pertinente",
    "(almeno 8-10 normative EU e nazionali rilevanti)"
  ],
  "certificazioni": [
    "ISO 9001 - Sistema di gestione qualità",
    "ISO 27001 - Sicurezza delle informazioni",
    "ISO 22301 - Business continuity",
    "(almeno 5-6 certificazioni ISO o schemi tipici del settore)"
  ],
  "rischi": {
    "operativi": [
      "Descrizione specifica rischio operativo 1",
      "Descrizione specifica rischio operativo 2",
      "Descrizione specifica rischio operativo 3"
    ],
    "compliance": [
      "Rischio di non conformità a normativa specifica",
      "Violazioni possibili e relative sanzioni",
      "Rischi ispettivi e autorizzativi"
    ],
    "cyber": [
      "Data breach e violazione dati sensibili/sanitari",
      "Attacchi ransomware a sistemi critici",
      "Compromissione sistemi di pagamento (PCI DSS)"
    ],
    "reputazionali": [
      "Perdita di fiducia clienti/consumatori",
      "Danni da product recall o prodotti non conformi",
      "Impatto mediatico negativo"
    ]
  }
}

Assicurati che:
1. Le normative siano REALI e VERIFICABILI (con numeri corretti)
2. I rischi siano SPECIFICI per il settore ATECO indicato
3. Le certificazioni siano PERTINENTI al settore
4. L'output sia JSON VALIDO e COMPLETO
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ Risposta grezza Gemini:", text);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Nessun JSON trovato");
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("📨 JSON parsato Gemini:", parsed);
      return parsed;
    } catch (err) {
      console.warn("⚠️ Errore parsing JSON Gemini, uso fallback strutturato");
      return {
        arricchimento: "Analisi del settore non disponibile. Verificare il codice ATECO inserito.",
        normative: [
          "GDPR (Reg. UE 2016/679) - Protezione dati personali",
          "Codice del Consumo (D.Lgs. 206/2005) - Tutela consumatori"
        ],
        certificazioni: [
          "ISO 9001 - Sistema di gestione qualità",
          "ISO 27001 - Sicurezza delle informazioni"
        ],
        rischi: {
          operativi: ["Interruzione dei processi core"],
          compliance: ["Non conformità alle normative di settore"],
          cyber: ["Violazione dati e attacchi informatici"],
          reputazionali: ["Perdita di fiducia degli stakeholder"]
        }
      };
    }
  } catch (err) {
    console.error("❌ Errore Gemini API:", err);
    return null;
  }
}
