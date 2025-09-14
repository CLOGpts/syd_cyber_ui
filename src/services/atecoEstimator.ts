/**
 * ATECO Estimator - Stima intelligente del codice ATECO da descrizione libera
 * Cuore della visione olistica: trasforma "faccio biscotti" in analisi professionale
 */

import { getMacroSectorFromATECO, getSectorKnowledge } from '../data/sectorKnowledge';

// Database semplificato dei codici ATECO più comuni con keywords
// In produzione questo verrebbe dal backend con tutti i 3158 codici
const atecoDatabase = [
  // ALIMENTARE
  { code: "10.71.10", description: "Produzione di pane fresco", keywords: ["pane", "panificio", "panetteria", "fornai", "pagnotta"] },
  { code: "10.71.20", description: "Produzione di pasticceria fresca", keywords: ["pasticceria", "dolci", "torte", "paste", "croissant", "brioche"] },
  { code: "10.72.00", description: "Produzione di biscotti e prodotti di pasticceria conservati", keywords: ["biscotti", "biscottificio", "frollini", "wafer", "crackers"] },
  { code: "10.73.00", description: "Produzione di paste alimentari", keywords: ["pasta", "pastificio", "spaghetti", "maccheroni", "ravioli", "tortellini"] },
  { code: "10.82.00", description: "Produzione di cacao e cioccolato", keywords: ["cioccolato", "cioccolateria", "cacao", "praline", "cioccolatini"] },
  { code: "10.85.01", description: "Produzione di piatti pronti", keywords: ["piatti pronti", "gastronomia", "ready to eat", "precotti", "surgelati"] },
  { code: "11.01.00", description: "Distillazione e produzione di alcolici", keywords: ["distilleria", "liquori", "grappa", "whisky", "vodka", "gin"] },
  { code: "11.02.10", description: "Produzione di vini", keywords: ["vino", "cantina", "vinicola", "vendemmia", "spumante", "prosecco"] },
  { code: "11.05.00", description: "Produzione di birra", keywords: ["birra", "birrificio", "brewery", "luppolo", "malto"] },

  // ICT & SOFTWARE
  { code: "62.01.00", description: "Produzione di software non connesso all'edizione", keywords: ["software", "sviluppo", "programmazione", "app", "applicazioni", "coding", "developer"] },
  { code: "62.02.00", description: "Consulenza informatica", keywords: ["consulenza it", "consulenza informatica", "system integrator", "it consulting"] },
  { code: "62.03.00", description: "Gestione di strutture informatizzate", keywords: ["data center", "server farm", "hosting", "cloud", "infrastruttura it"] },
  { code: "62.09.01", description: "Configurazione di personal computer", keywords: ["assistenza computer", "riparazione pc", "tecnico informatico", "assistenza informatica"] },
  { code: "63.11.11", description: "Elaborazione elettronica di dati", keywords: ["elaborazione dati", "data processing", "data entry", "digitalizzazione"] },
  { code: "63.12.00", description: "Portali web", keywords: ["portale web", "sito web", "website", "e-commerce", "marketplace", "piattaforma online"] },

  // SERVIZI PROFESSIONALI
  { code: "69.10.10", description: "Attività degli studi legali", keywords: ["avvocato", "studio legale", "legale", "avvocatura", "difesa", "causa"] },
  { code: "69.10.20", description: "Attività degli studi notarili", keywords: ["notaio", "studio notarile", "atti notarili", "rogito", "compravendita"] },
  { code: "69.20.11", description: "Servizi forniti da dottori commercialisti", keywords: ["commercialista", "dottore commercialista", "contabilità", "bilanci", "dichiarazioni"] },
  { code: "69.20.12", description: "Servizi forniti da ragionieri", keywords: ["ragioniere", "ragioneria", "contabile", "partita doppia", "libro giornale"] },
  { code: "69.20.13", description: "Servizi forniti da periti commerciali", keywords: ["perito commerciale", "perizia", "valutazione aziendale", "stima"] },
  { code: "69.20.20", description: "Attività delle società di revisione", keywords: ["revisione contabile", "audit", "revisore", "certificazione bilanci"] },
  { code: "70.21.00", description: "Pubbliche relazioni e comunicazione", keywords: ["pr", "pubbliche relazioni", "comunicazione", "ufficio stampa", "media relations"] },
  { code: "70.22.09", description: "Altre attività di consulenza amministrativo-gestionale", keywords: ["consulenza aziendale", "consulenza gestionale", "business consulting", "consulente"] },

  // MANIFATTURIERO & ARTIGIANATO
  { code: "25.11.00", description: "Fabbricazione di strutture metalliche", keywords: ["carpenteria metallica", "strutture metalliche", "ferro", "acciaio", "saldatura"] },
  { code: "25.62.00", description: "Lavori di meccanica generale", keywords: ["officina meccanica", "torneria", "fresatura", "lavorazioni meccaniche", "meccanico"] },
  { code: "31.01.10", description: "Fabbricazione di mobili per ufficio", keywords: ["mobili ufficio", "arredamento ufficio", "scrivanie", "sedie ufficio"] },
  { code: "31.02.00", description: "Fabbricazione di mobili per cucina", keywords: ["cucine", "mobili cucina", "arredamento cucina", "cucine componibili"] },
  { code: "31.09.10", description: "Fabbricazione di mobili per arredo domestico", keywords: ["mobili", "arredamento", "falegnameria", "mobilificio", "arredo casa"] },
  { code: "43.31.00", description: "Intonacatura e stuccatura", keywords: ["intonaco", "stuccatore", "intonacatura", "rasatura", "gesso"] },
  { code: "43.32.01", description: "Posa in opera di infissi", keywords: ["infissi", "serramenti", "finestre", "porte", "installazione infissi"] },
  { code: "43.33.00", description: "Rivestimento di pavimenti e pareti", keywords: ["piastrellista", "pavimenti", "rivestimenti", "piastrelle", "parquet"] },
  { code: "43.34.00", description: "Tinteggiatura e posa in opera di vetrate", keywords: ["imbianchino", "pittore", "tinteggiatura", "verniciatura", "decoratore"] },

  // EDILIZIA & COSTRUZIONI
  { code: "41.10.00", description: "Sviluppo di progetti immobiliari", keywords: ["immobiliare", "sviluppo immobiliare", "costruttore", "developer", "progetti edilizi"] },
  { code: "41.20.00", description: "Costruzione di edifici residenziali e non", keywords: ["costruzioni", "edilizia", "impresa edile", "cantiere", "costruttore edile"] },
  { code: "43.11.00", description: "Demolizione", keywords: ["demolizioni", "demolizione", "abbattimento", "smantellamento"] },
  { code: "43.12.00", description: "Preparazione del cantiere edile", keywords: ["movimento terra", "scavi", "sbancamento", "preparazione cantiere"] },
  { code: "43.21.01", description: "Installazione impianti elettrici", keywords: ["elettricista", "impianti elettrici", "installatore elettrico", "quadri elettrici"] },
  { code: "43.22.01", description: "Installazione impianti idraulici", keywords: ["idraulico", "impianti idraulici", "tubature", "rubinetteria", "termoidraulica"] },
  { code: "43.22.02", description: "Installazione impianti di riscaldamento", keywords: ["riscaldamento", "caldaie", "termosifoni", "impianti termici", "climatizzazione"] },

  // COMMERCIO & RETAIL
  { code: "47.11.00", description: "Commercio al dettaglio non specializzato", keywords: ["negozio", "minimarket", "alimentari", "drogheria", "bottega"] },
  { code: "47.21.00", description: "Commercio al dettaglio di frutta e verdura", keywords: ["fruttivendolo", "frutta", "verdura", "ortofrutta", "primizie"] },
  { code: "47.22.00", description: "Commercio al dettaglio di carni", keywords: ["macelleria", "macellaio", "carne", "salumeria", "polleria"] },
  { code: "47.24.10", description: "Commercio al dettaglio di pane", keywords: ["panetteria", "rivendita pane", "pane", "prodotti da forno"] },
  { code: "47.25.00", description: "Commercio al dettaglio di bevande", keywords: ["enoteca", "beviamo", "vini", "liquori", "bevande"] },
  { code: "47.52.10", description: "Commercio al dettaglio di ferramenta", keywords: ["ferramenta", "utensileria", "bulloneria", "viteria", "attrezzi"] },
  { code: "47.59.10", description: "Commercio al dettaglio di mobili", keywords: ["negozio mobili", "mobilificio", "arredamento", "showroom mobili"] },
  { code: "47.71.10", description: "Commercio al dettaglio di abbigliamento", keywords: ["abbigliamento", "vestiti", "boutique", "negozio vestiti", "moda"] },
  { code: "47.91.10", description: "Commercio al dettaglio via internet", keywords: ["e-commerce", "vendita online", "shop online", "negozio online", "marketplace"] },

  // RISTORAZIONE & HOSPITALITY
  { code: "55.10.00", description: "Alberghi", keywords: ["hotel", "albergo", "pensione", "locanda", "hospitality"] },
  { code: "55.20.10", description: "Villaggi turistici", keywords: ["villaggio turistico", "resort", "villaggio vacanze", "club vacanze"] },
  { code: "55.20.20", description: "Ostelli della gioventù", keywords: ["ostello", "hostel", "backpacker", "dormitorio"] },
  { code: "55.20.30", description: "Rifugi di montagna", keywords: ["rifugio", "rifugio alpino", "baita", "rifugio montagna"] },
  { code: "55.20.40", description: "Colonie marine e montane", keywords: ["colonia", "colonia estiva", "campo estivo", "summer camp"] },
  { code: "55.20.51", description: "Affittacamere per brevi soggiorni", keywords: ["affittacamere", "b&b", "bed and breakfast", "camera affitto", "airbnb"] },
  { code: "55.20.52", description: "Attività di alloggio connesse alle aziende agricole", keywords: ["agriturismo", "turismo rurale", "fattoria didattica", "country house"] },
  { code: "55.30.00", description: "Aree di campeggio", keywords: ["campeggio", "camping", "area camper", "caravan", "tende"] },
  { code: "56.10.11", description: "Ristorazione con somministrazione", keywords: ["ristorante", "trattoria", "osteria", "tavola calda", "ristorante"] },
  { code: "56.10.12", description: "Attività di ristorazione connesse alle aziende agricole", keywords: ["agriturismo ristorante", "ristorante agrituristico", "cucina contadina"] },
  { code: "56.10.20", description: "Ristorazione senza somministrazione", keywords: ["takeaway", "asporto", "take away", "da asporto", "delivery"] },
  { code: "56.10.30", description: "Gelaterie e pasticcerie", keywords: ["gelateria", "gelato", "gelataio", "ice cream", "sorbetteria"] },
  { code: "56.10.41", description: "Gelaterie ambulanti", keywords: ["gelato ambulante", "carretto gelati", "apecar gelati", "gelato mobile"] },
  { code: "56.10.42", description: "Ristorazione ambulante", keywords: ["food truck", "street food", "ambulante cibo", "chiosco ambulante", "paninaro"] },
  { code: "56.10.50", description: "Ristorazione su treni e navi", keywords: ["ristorazione treni", "vagone ristorante", "ristorazione navi", "catering navale"] },
  { code: "56.21.00", description: "Catering per eventi", keywords: ["catering", "banqueting", "servizio catering", "eventi", "matrimoni"] },
  { code: "56.30.00", description: "Bar e altri esercizi simili", keywords: ["bar", "caffè", "caffetteria", "snack bar", "wine bar", "pub"] },

  // TRASPORTI & LOGISTICA
  { code: "49.31.00", description: "Trasporto terrestre di passeggeri urbano", keywords: ["autobus urbano", "trasporto pubblico", "bus cittadino", "navetta"] },
  { code: "49.32.10", description: "Trasporto con taxi", keywords: ["taxi", "tassista", "radiotaxi", "noleggio con conducente"] },
  { code: "49.32.20", description: "Trasporto mediante noleggio con conducente", keywords: ["ncc", "noleggio conducente", "auto blu", "driver", "chauffeur"] },
  { code: "49.41.00", description: "Trasporto merci su strada", keywords: ["autotrasporto", "trasporto merci", "camion", "tir", "spedizioni"] },
  { code: "49.42.00", description: "Servizi di trasloco", keywords: ["traslochi", "trasloco", "traslocatore", "moving", "sgomberi"] },
  { code: "52.10.10", description: "Magazzini di custodia e deposito", keywords: ["magazzino", "deposito", "stoccaggio", "warehouse", "logistica"] },
  { code: "52.21.40", description: "Gestione di parcheggi", keywords: ["parcheggio", "parking", "autorimessa", "garage", "sosta"] },
  { code: "52.29.10", description: "Spedizionieri e agenzie di dogana", keywords: ["spedizioniere", "dogana", "import export", "sdoganamento", "corriere"] },
  { code: "53.10.00", description: "Attività postali con obbligo di servizio universale", keywords: ["poste", "postale", "corrispondenza", "lettere", "pacchi"] },
  { code: "53.20.00", description: "Altre attività postali e di corriere", keywords: ["corriere", "corriere espresso", "consegne", "delivery", "pony express"] },

  // SANITÀ & ASSISTENZA
  { code: "86.10.10", description: "Ospedali e case di cura generici", keywords: ["ospedale", "clinica", "casa di cura", "degenza", "ricovero"] },
  { code: "86.10.20", description: "Ospedali e case di cura specialistici", keywords: ["clinica specialistica", "centro specialistico", "ospedale specializzato"] },
  { code: "86.21.00", description: "Servizi degli studi medici generici", keywords: ["medico", "dottore", "medico di base", "studio medico", "ambulatorio"] },
  { code: "86.22.01", description: "Prestazioni sanitarie svolte da medici specialisti", keywords: ["specialista", "medico specialista", "visita specialistica", "cardiologo", "ortopedico"] },
  { code: "86.23.00", description: "Attività degli studi odontoiatrici", keywords: ["dentista", "odontoiatra", "studio dentistico", "ortodonzia", "igiene dentale"] },
  { code: "86.90.11", description: "Laboratori radiografici", keywords: ["radiologia", "radiografie", "raggi x", "ecografia", "tac", "risonanza"] },
  { code: "86.90.12", description: "Laboratori di analisi cliniche", keywords: ["analisi", "laboratorio analisi", "analisi sangue", "analisi cliniche", "prelievi"] },
  { code: "86.90.21", description: "Fisioterapia", keywords: ["fisioterapista", "fisioterapia", "riabilitazione", "massaggi terapeutici", "terapia fisica"] },
  { code: "86.90.29", description: "Altre attività paramediche", keywords: ["paramedico", "osteopata", "chiropratico", "naturopata", "terapista"] },
  { code: "87.10.00", description: "Strutture di assistenza residenziale per anziani", keywords: ["casa riposo", "rsa", "residenza anziani", "casa anziani", "ricovero anziani"] },
  { code: "87.20.00", description: "Strutture assistenza per disabili mentali", keywords: ["assistenza disabili", "centro disabili", "comunità terapeutica"] },
  { code: "87.30.00", description: "Strutture assistenza residenziale per anziani e disabili", keywords: ["assistenza anziani", "badante", "assistenza domiciliare"] },

  // ALTRI SERVIZI
  { code: "96.02.01", description: "Servizi dei saloni di barbiere e parrucchiere", keywords: ["parrucchiere", "barbiere", "hair stylist", "salone bellezza", "taglio capelli"] },
  { code: "96.02.02", description: "Servizi degli istituti di bellezza", keywords: ["estetista", "centro estetico", "beauty center", "trattamenti bellezza", "manicure"] },
  { code: "96.02.03", description: "Servizi di manicure e pedicure", keywords: ["manicure", "pedicure", "nails", "unghie", "onicotecnica"] },
  { code: "96.04.10", description: "Servizi di centri per il benessere fisico", keywords: ["spa", "centro benessere", "wellness", "sauna", "massaggi", "terme"] },
  { code: "96.09.01", description: "Attività di sgombero cantine solai e garage", keywords: ["sgomberi", "sgombero", "svuota cantine", "pulizia solai"] },
  { code: "96.09.02", description: "Attività di tatuaggio e piercing", keywords: ["tatuatore", "tattoo", "tatuaggi", "piercing", "body art"] },
  { code: "96.09.03", description: "Agenzie matrimoniali", keywords: ["agenzia matrimoniale", "incontri", "matchmaking", "single"] },
  { code: "96.09.04", description: "Servizi di cura degli animali", keywords: ["toelettatura", "toeletta cani", "dog sitter", "pet sitter", "pensione animali"] },
  { code: "96.09.05", description: "Organizzazione di feste e cerimonie", keywords: ["wedding planner", "organizzazione eventi", "party planner", "cerimonie"] }
];

/**
 * Calcola la similarità tra due stringhe (Levenshtein distance normalizzata)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1.0;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - (distance / maxLength);
}

/**
 * Estrae parole chiave rilevanti dalla descrizione
 */
function extractKeywords(description: string): string[] {
  // Rimuovi parole comuni italiane (stopwords)
  const stopwords = ['il', 'la', 'lo', 'i', 'le', 'gli', 'un', 'una', 'uno', 'di', 'da', 'in', 'su', 'per', 'con', 'tra', 'fra', 'che', 'e', 'è', 'sono', 'siamo', 'facciamo', 'faccio', 'vendo', 'vendiamo', 'produco', 'produciamo', 'mi', 'occupo', 'ci', 'occupiamo'];

  const words = description.toLowerCase()
    .replace(/[.,;:!?]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopwords.includes(word));

  return words;
}

/**
 * Stima il codice ATECO più probabile da una descrizione libera
 * Cuore della visione olistica: trasforma linguaggio naturale in analisi professionale
 */
export function estimateATECOFromDescription(description: string): {
  code: string;
  confidence: number;
  description: string;
  alternativeMatches?: Array<{code: string; description: string; confidence: number}>;
} {
  const keywords = extractKeywords(description);
  const scores: Map<string, number> = new Map();

  // Calcola score per ogni codice ATECO
  for (const ateco of atecoDatabase) {
    let score = 0;

    // Match sulla descrizione completa
    score += calculateSimilarity(description, ateco.description) * 0.3;

    // Match su ogni keyword estratta
    for (const keyword of keywords) {
      // Controlla match con le keywords dell'ATECO
      for (const atecoKeyword of ateco.keywords) {
        const similarity = calculateSimilarity(keyword, atecoKeyword);
        if (similarity > 0.6) {
          score += similarity * 0.7;
        }
      }

      // Controlla match con la descrizione ATECO
      if (ateco.description.toLowerCase().includes(keyword)) {
        score += 0.5;
      }
    }

    scores.set(ateco.code, score);
  }

  // Ordina per score e prendi i migliori
  const sortedScores = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Se non trova nulla di rilevante, default a commercio generico
  if (sortedScores.length === 0 || sortedScores[0][1] < 0.1) {
    return {
      code: "47.11.00",
      confidence: 0.1,
      description: "Commercio al dettaglio non specializzato"
    };
  }

  const bestMatch = sortedScores[0];
  const bestAteco = atecoDatabase.find(a => a.code === bestMatch[0])!;

  // Calcola confidence (0-1)
  const maxPossibleScore = keywords.length * 0.7 + 0.3;
  const confidence = Math.min(bestMatch[1] / maxPossibleScore, 1);

  // Prepara alternative se confidence non è altissima
  const alternativeMatches = sortedScores.slice(1, 4)
    .filter(([_, score]) => score > sortedScores[0][1] * 0.5)
    .map(([code, score]) => {
      const ateco = atecoDatabase.find(a => a.code === code)!;
      return {
        code,
        description: ateco.description,
        confidence: Math.min(score / maxPossibleScore, 1)
      };
    });

  return {
    code: bestAteco.code,
    confidence,
    description: bestAteco.description,
    alternativeMatches: alternativeMatches.length > 0 ? alternativeMatches : undefined
  };
}

/**
 * Genera una prima analisi immediata basata su ATECO stimato
 * Parte della visione olistica: valore immediato anche senza documenti
 */
export function generateFirstAnalysis(atecoCode: string, businessDescription?: string): {
  sector: string;
  mainRisks: string[];
  regulations: string[];
  quickWins: string[];
} {
  const sectorInfo = getSectorKnowledge(atecoCode);
  const macroSector = getMacroSectorFromATECO(atecoCode);

  if (!sectorInfo) {
    // Fallback generico se non troviamo il settore
    return {
      sector: "Servizi Generali",
      mainRisks: [
        "Interruzione attività",
        "Problemi con clienti",
        "Conformità normative"
      ],
      regulations: ["GDPR (protezione dati)", "Sicurezza sul lavoro"],
      quickWins: [
        "Verifica le tue coperture assicurative",
        "Documenta i processi critici",
        "Crea un piano di continuità operativa"
      ]
    };
  }

  // Prendi i 3 rischi principali
  const mainRisks = sectorInfo.rischiBase.slice(0, 3);

  // Determina normative basate sul settore
  const regulations = [];

  // Tutti devono rispettare GDPR
  regulations.push("GDPR (protezione dati clienti)");

  // Normative specifiche per settore
  if (macroSector === "Alimentare") {
    regulations.push("HACCP (sicurezza alimentare)");
    regulations.push("Reg. 1169/2011 (etichettatura)");
  } else if (macroSector === "ICT") {
    regulations.push("NIS2 (cybersecurity)");
    regulations.push("AI Act (se usi AI)");
  } else if (macroSector === "Healthcare") {
    regulations.push("Normative sanitarie regionali");
    regulations.push("Privacy dati sanitari");
  } else if (macroSector === "Finanza") {
    regulations.push("PSD2 (servizi pagamento)");
    regulations.push("Antiriciclaggio");
  } else {
    regulations.push("D.Lgs 81/08 (sicurezza lavoro)");
  }

  // Genera Quick Wins specifici per settore
  const quickWins = [];

  // Quick wins generici sempre validi
  quickWins.push("📋 Verifica che le tue assicurazioni coprano i rischi principali");

  // Quick wins specifici per settore
  if (sectorInfo.subSectors) {
    const firstSubSector = Object.values(sectorInfo.subSectors)[0];
    if (firstSubSector && firstSubSector.commonQuestions) {
      // Trasforma la prima domanda in un quick win
      const question = firstSubSector.commonQuestions[0];
      quickWins.push(`🔍 ${question}`);
    }
  }

  // Aggiungi un consiglio pratico basato sul primo rischio
  if (mainRisks[0]) {
    const risk = mainRisks[0].toLowerCase();
    if (risk.includes("cyber") || risk.includes("data")) {
      quickWins.push("💾 Implementa backup automatici giornalieri");
    } else if (risk.includes("guasto") || risk.includes("interruzione")) {
      quickWins.push("🔧 Crea un piano B per i processi critici");
    } else if (risk.includes("cliente") || risk.includes("pagamento")) {
      quickWins.push("💰 Definisci termini di pagamento chiari nei contratti");
    } else {
      quickWins.push("📊 Monitora questo rischio mensilmente");
    }
  }

  return {
    sector: sectorInfo.name,
    mainRisks,
    regulations,
    quickWins
  };
}

/**
 * Genera opzioni proattive per l'utente (le 3 vie)
 * Implementa la visione olistica: sempre 3 percorsi disponibili
 */
export function generateProactiveOptions(hasFirstAnalysis: boolean, currentState?: string): {
  continueToReport: string;
  askQuestions: string;
  learnMore: string;
} {
  if (!hasFirstAnalysis) {
    return {
      continueToReport: "📊 Inizia l'analisi completa dei rischi",
      askQuestions: "💬 Fammi domande sul mio settore",
      learnMore: "📚 Scopri cos'è il Risk Management"
    };
  }

  // Se abbiamo già una prima analisi
  if (currentState === 'educating') {
    return {
      continueToReport: "📊 Ora sono pronto per il report completo",
      askQuestions: "💬 Ho altre domande da farti",
      learnMore: "📚 Approfondisci un aspetto specifico"
    };
  }

  return {
    continueToReport: "📊 Continua verso il report di Risk Management",
    askQuestions: "💬 Fammi domande sui rischi identificati",
    learnMore: "📚 Come posso migliorare la gestione dei rischi?"
  };
}