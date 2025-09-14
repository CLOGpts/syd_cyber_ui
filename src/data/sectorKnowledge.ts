/**
 * Knowledge Base Settoriale per SYD Agent
 * Architettura a 3 livelli: Macro-settori → Sub-settori → Rischi specifici
 * Supporta modalità duale: Tecnico (esperti) e Socratico (inesperti)
 */

// Tipizzazione per la struttura
export interface RiskMapping {
  category: string;
  eventCode: string;
  technicalName?: string;
}

export interface SubSector {
  name: string;
  specificRisks: string[];
  commonQuestions?: string[];
}

export interface MacroSector {
  name: string;
  atecoRange: string[];  // es: ["10", "11"] per codici ATECO 10.xx e 11.xx
  rischiBase: string[];
  subSectors?: Record<string, SubSector>;
  riskMapping: Record<string, RiskMapping>;
  socraticExamples?: string[];  // Esempi per modalità socratica
}

// MAPPING ATECO → MACRO-SETTORE (primi 2 digit)
export const atecoToMacroSector: Record<string, string> = {
  // Alimentare e bevande
  "10": "Alimentare", "11": "Alimentare", "12": "Alimentare",

  // Manifatturiero
  "13": "Manifatturiero", "14": "Manifatturiero", "15": "Manifatturiero",
  "16": "Manifatturiero", "17": "Manifatturiero", "18": "Manifatturiero",
  "19": "Manifatturiero", "20": "Manifatturiero", "21": "Manifatturiero",
  "22": "Manifatturiero", "23": "Manifatturiero", "24": "Manifatturiero",
  "25": "Manifatturiero", "26": "Manifatturiero", "27": "Manifatturiero",
  "28": "Manifatturiero", "29": "Manifatturiero", "30": "Manifatturiero",
  "31": "Manifatturiero", "32": "Manifatturiero", "33": "Manifatturiero",

  // Edilizia
  "41": "Edilizia", "42": "Edilizia", "43": "Edilizia",

  // Commercio e retail
  "45": "Commercio", "46": "Commercio", "47": "Commercio",

  // Trasporti e logistica
  "49": "Trasporti", "50": "Trasporti", "51": "Trasporti", "52": "Trasporti", "53": "Trasporti",

  // Servizi alloggio e ristorazione
  "55": "Ristorazione", "56": "Ristorazione",

  // ICT e Software
  "58": "ICT", "59": "ICT", "60": "ICT", "61": "ICT", "62": "ICT", "63": "ICT",

  // Finanza e assicurazioni
  "64": "Finanza", "65": "Finanza", "66": "Finanza",

  // Servizi professionali
  "69": "Servizi Professionali", "70": "Servizi Professionali", "71": "Servizi Professionali",
  "72": "Servizi Professionali", "73": "Servizi Professionali", "74": "Servizi Professionali",

  // Healthcare
  "86": "Healthcare", "87": "Healthcare", "88": "Healthcare",

  // Altri servizi
  "90": "Altri Servizi", "91": "Altri Servizi", "92": "Altri Servizi",
  "93": "Altri Servizi", "94": "Altri Servizi", "95": "Altri Servizi", "96": "Altri Servizi"
};

// KNOWLEDGE BASE PER MACRO-SETTORI
export const sectorKnowledge: Record<string, MacroSector> = {
  "Alimentare": {
    name: "Alimentare e Bevande",
    atecoRange: ["10", "11", "12"],
    rischiBase: [
      "Contaminazione prodotti",
      "Scadenza materie prime",
      "Allergie e intolleranze clienti",
      "Interruzione catena del freddo",
      "Non conformità HACCP",
      "Ritiro prodotti dal mercato"
    ],
    subSectors: {
      "Panificio": {
        name: "Panificio e prodotti da forno",
        specificRisks: [
          "Guasto forni industriali",
          "Problemi di lievitazione",
          "Mancanza farina/lievito",
          "Black-out durante cottura"
        ],
        commonQuestions: [
          "Se il forno principale si guasta, quanto tempo serve per ripararlo?",
          "Hai un fornitore alternativo per la farina?",
          "Cosa succede se manca la corrente durante la notte?"
        ]
      },
      "Biscottificio": {
        name: "Produzione biscotti e dolciumi",
        specificRisks: [
          "Umidità in magazzino",
          "Difetti packaging",
          "Variazione ricette",
          "Problemi conservanti"
        ],
        commonQuestions: [
          "Come controlli l'umidità dove conservi i biscotti?",
          "Cosa fai se un lotto ha un problema di sapore?",
          "E se un cliente si lamenta per allergie non dichiarate?"
        ]
      }
    },
    riskMapping: {
      "Contaminazione prodotti": { category: "danni", eventCode: "301", technicalName: "Danni fisici a persone" },
      "Guasto forni industriali": { category: "sistemi", eventCode: "505", technicalName: "Interruzione sistemi" },
      "Allergie e intolleranze clienti": { category: "clienti", eventCode: "401", technicalName: "Responsabilità prodotto" },
      "Non conformità HACCP": { category: "compliance", eventCode: "701", technicalName: "Violazione normative" },
      "Ritiro prodotti": { category: "clienti", eventCode: "402", technicalName: "Difetti di prodotto" }
    },
    socraticExamples: [
      "Immagina che un cliente trovi un corpo estraneo nel tuo prodotto. Quanto ti costerebbe gestire il reclamo?",
      "Se il tuo forno principale si rompe, in quanto tempo riesci a riprendere la produzione?",
      "Hai mai pensato cosa succederebbe se dovessi ritirare un lotto intero dal mercato?"
    ]
  },

  "ICT": {
    name: "Information Technology e Software",
    atecoRange: ["58", "59", "60", "61", "62", "63"],
    rischiBase: [
      "Attacco cyber/ransomware",
      "Data breach (GDPR)",
      "Downtime servizi cloud",
      "Bug critico in produzione",
      "Perdita codice sorgente",
      "Violazione licenze software"
    ],
    subSectors: {
      "SaaS": {
        name: "Software as a Service",
        specificRisks: [
          "Interruzione servizio AWS/Azure",
          "Superamento limiti API",
          "Churn clienti enterprise",
          "Scalabilità insufficiente"
        ],
        commonQuestions: [
          "Cosa succede se AWS va down per 24 ore?",
          "Come gestisci un picco improvviso di utenti?",
          "E se un cliente enterprise minaccia di andarsene?"
        ]
      }
    },
    riskMapping: {
      "Attacco cyber/ransomware": { category: "frodi esterne", eventCode: "201", technicalName: "Cyber attack" },
      "Data breach (GDPR)": { category: "danni", eventCode: "302", technicalName: "Violazione privacy" },
      "Downtime servizi cloud": { category: "sistemi", eventCode: "501", technicalName: "System failure" },
      "Bug critico in produzione": { category: "produzione", eventCode: "601", technicalName: "Errore di processo" }
    },
    socraticExamples: [
      "Se un hacker cripta tutti i tuoi dati, quanto pagheresti di riscatto?",
      "Immagina che i dati dei tuoi clienti finiscano online. Quale sarebbe la multa GDPR?",
      "Se il tuo software principale ha un bug che blocca tutti i clienti, quanto perdi all'ora?"
    ]
  },

  "Servizi Professionali": {
    name: "Servizi Professionali e Consulenza",
    atecoRange: ["69", "70", "71", "72", "73", "74"],
    rischiBase: [
      "Errore professionale",
      "Perdita cliente chiave",
      "Contenzioso legale",
      "Furto proprietà intellettuale",
      "Mancato pagamento fatture",
      "Responsabilità consulenza"
    ],
    subSectors: {
      "Studio Legale": {
        name: "Studio legale e notarile",
        specificRisks: [
          "Scadenza termini processuali",
          "Conflitto di interessi",
          "Violazione segreto professionale",
          "Errore in atto notarile"
        ],
        commonQuestions: [
          "Cosa succede se perdi una scadenza importante per un cliente?",
          "Come gestisci informazioni riservate di clienti concorrenti?",
          "E se un errore in un contratto causa danni milionari?"
        ]
      }
    },
    riskMapping: {
      "Errore professionale": { category: "produzione", eventCode: "602", technicalName: "Errore di servizio" },
      "Perdita cliente chiave": { category: "clienti", eventCode: "403", technicalName: "Perdita clientela" },
      "Contenzioso legale": { category: "compliance", eventCode: "702", technicalName: "Dispute legali" },
      "Furto proprietà intellettuale": { category: "frodi interne", eventCode: "101", technicalName: "Furto IP" }
    },
    socraticExamples: [
      "Se il tuo cliente principale (che vale il 40% del fatturato) se ne va, come sopravvivi?",
      "Hai mai calcolato quanto ti costerebbe un errore in una consulenza importante?",
      "E se un dipendente portasse via tutti i tuoi clienti?"
    ]
  },

  "Manifatturiero": {
    name: "Manifatturiero e Produzione",
    atecoRange: ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33"],
    rischiBase: [
      "Guasto macchinari critici",
      "Infortunio sul lavoro",
      "Difetto di produzione",
      "Ritardo fornitori",
      "Obsolescenza magazzino",
      "Non conformità CE"
    ],
    subSectors: {
      "Officina Meccanica": {
        name: "Lavorazioni meccaniche",
        specificRisks: [
          "Rottura tornio CNC",
          "Errore tolleranze",
          "Mancanza acciaio speciale",
          "Infortunio con fresatrice"
        ],
        commonQuestions: [
          "Se il tornio principale si rompe, hai un backup?",
          "Cosa succede se sbagli le tolleranze di un pezzo importante?",
          "Come gestisci la sicurezza con macchinari pericolosi?"
        ]
      }
    },
    riskMapping: {
      "Guasto macchinari critici": { category: "sistemi", eventCode: "504", technicalName: "Equipment failure" },
      "Infortunio sul lavoro": { category: "dipendenti", eventCode: "801", technicalName: "Workplace injury" },
      "Difetto di produzione": { category: "produzione", eventCode: "603", technicalName: "Production defect" },
      "Ritardo fornitori": { category: "produzione", eventCode: "604", technicalName: "Supply chain delay" }
    },
    socraticExamples: [
      "Se la macchina più importante si ferma per una settimana, quanto perdi?",
      "Hai calcolato il costo di un infortunio grave in produzione?",
      "E se un lotto difettoso arriva al cliente finale?"
    ]
  },

  "Commercio": {
    name: "Commercio e Retail",
    atecoRange: ["45", "46", "47"],
    rischiBase: [
      "Furto in negozio",
      "Danneggiamento merce",
      "Crediti inesigibili",
      "Concorrenza online",
      "Calo traffico clienti",
      "Recensioni negative"
    ],
    riskMapping: {
      "Furto in negozio": { category: "frodi esterne", eventCode: "202", technicalName: "Furto/rapina" },
      "Danneggiamento merce": { category: "danni", eventCode: "303", technicalName: "Danni a beni" },
      "Crediti inesigibili": { category: "clienti", eventCode: "404", technicalName: "Default clienti" },
      "Recensioni negative": { category: "clienti", eventCode: "405", technicalName: "Danni reputazionali" }
    },
    socraticExamples: [
      "Quanto perdi ogni mese per furti o taccheggio?",
      "Se un cliente importante non paga, come impatta il tuo cash flow?",
      "Una recensione negativa virale quanto ti costa in termini di vendite?"
    ]
  }
};

// FUNZIONI HELPER PER GESTIONE SETTORI

/**
 * Ottiene il macro-settore da un codice ATECO
 */
export function getMacroSectorFromATECO(atecoCode: string): string {
  // Prendi i primi 2 digit del codice ATECO
  const prefix = atecoCode.split('.')[0].substring(0, 2);
  return atecoToMacroSector[prefix] || "Altri Servizi";
}

/**
 * Ottiene la knowledge base per un codice ATECO
 */
export function getSectorKnowledge(atecoCode: string): MacroSector | null {
  const macroSector = getMacroSectorFromATECO(atecoCode);
  return sectorKnowledge[macroSector] || null;
}

/**
 * Determina se usare modalità tecnica o socratica basandosi sul contesto
 */
export function determineInteractionMode(userMessage: string, userHistory?: string[]): 'technical' | 'socratic' {
  // Parole chiave che indicano expertise
  const technicalKeywords = [
    'basel', 'compliance', 'gdpr', 'nis2', 'iso', 'risk assessment',
    'matrice rischio', 'controlli interni', 'audit', 'kpi', 'kri',
    'probabilità', 'impatto', 'mitigazione', 'risk appetite'
  ];

  const messageLower = userMessage.toLowerCase();

  // Se l'utente usa termini tecnici, modalità technical
  if (technicalKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'technical';
  }

  // Se l'utente sembra confuso o inesperto, modalità socratica
  const confusedPhrases = [
    'non so', 'non capisco', 'aiutami', 'cosa significa',
    'come funziona', 'spiegami', 'sono nuovo', 'prima volta'
  ];

  if (confusedPhrases.some(phrase => messageLower.includes(phrase))) {
    return 'socratic';
  }

  // Default: socratica per essere inclusivi
  return 'socratic';
}

/**
 * Genera domande socratiche basate sul settore
 */
export function generateSocraticQuestions(
  atecoCode: string,
  riskCategory?: string
): string[] {
  const sector = getSectorKnowledge(atecoCode);
  if (!sector) return [];

  // Se abbiamo esempi socratici specifici, usali
  if (sector.socraticExamples && sector.socraticExamples.length > 0) {
    return sector.socraticExamples;
  }

  // Altrimenti genera domande generiche basate sui rischi base
  return sector.rischiBase.slice(0, 3).map(risk =>
    `Hai mai pensato cosa succederebbe in caso di ${risk.toLowerCase()}?`
  );
}

/**
 * Mappa un rischio in linguaggio naturale alla categoria tecnica
 */
export function mapNaturalRiskToTechnical(
  naturalRisk: string,
  atecoCode: string
): RiskMapping | null {
  const sector = getSectorKnowledge(atecoCode);
  if (!sector) return null;

  // Cerca corrispondenza diretta
  const directMapping = sector.riskMapping[naturalRisk];
  if (directMapping) return directMapping;

  // Cerca corrispondenza parziale (fuzzy matching semplice)
  const naturalLower = naturalRisk.toLowerCase();
  for (const [key, mapping] of Object.entries(sector.riskMapping)) {
    if (key.toLowerCase().includes(naturalLower) ||
        naturalLower.includes(key.toLowerCase())) {
      return mapping;
    }
  }

  return null;
}

/**
 * Ottiene rischi specifici per un sub-settore se disponibile
 */
export function getSubSectorRisks(
  atecoCode: string,
  subSectorHint?: string
): string[] {
  const sector = getSectorKnowledge(atecoCode);
  if (!sector) return [];

  // Se abbiamo un hint sul sub-settore, cerchiamolo
  if (subSectorHint && sector.subSectors) {
    for (const [key, subSector] of Object.entries(sector.subSectors)) {
      if (subSectorHint.toLowerCase().includes(key.toLowerCase()) ||
          subSector.name.toLowerCase().includes(subSectorHint.toLowerCase())) {
        return [...sector.rischiBase, ...subSector.specificRisks];
      }
    }
  }

  // Altrimenti ritorna solo i rischi base del macro-settore
  return sector.rischiBase;
}