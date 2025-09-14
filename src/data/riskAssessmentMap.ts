// Mapping dettagliato per ogni step del Risk Assessment
// Fonte di verità unica per domande, opzioni e navigazione

export interface AssessmentStepDetails {
  questionNumber: number;
  totalQuestions: number;
  fieldName: string;
  fieldId: string;
  question: string;
  helpText?: string;
  category?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    emoji?: string;
  }>;
  nextStep: string | null;
  previousStep: string | null;
}

export const assessmentStepsMap: Record<string, AssessmentStepDetails> = {
  'assessment_q1': {
    questionNumber: 1,
    totalQuestions: 7,
    fieldName: 'Impatto Finanziario',
    fieldId: 'perdita_economica',
    question: "Qual è l'impatto finanziario stimato per questo evento di rischio?",
    helpText: "Valuta la potenziale perdita economica diretta che l'evento potrebbe causare alla tua organizzazione",
    options: [
      { value: 'N/A', label: 'N/A', description: 'Non applicabile o non valutabile', emoji: '❌' },
      { value: '0', label: '0 - 1k€', description: 'Impatto minimo, facilmente gestibile', emoji: '🟢' },
      { value: '1', label: '1k - 10k€', description: 'Impatto basso, gestibile con risorse ordinarie', emoji: '🟡' },
      { value: '2', label: '10k - 100k€', description: 'Impatto medio, richiede attenzione', emoji: '🟠' },
      { value: '3', label: '100k - 1M€', description: 'Impatto significativo, richiede intervento', emoji: '🔴' },
      { value: '4', label: 'Oltre 1M€', description: 'Impatto critico, priorità massima', emoji: '🚨' }
    ],
    nextStep: 'assessment_q2',
    previousStep: null
  },

  'assessment_q2': {
    questionNumber: 2,
    totalQuestions: 7,
    fieldName: 'Frequenza',
    fieldId: 'frequenza',
    question: "Con quale frequenza stimata potrebbe verificarsi questo evento?",
    helpText: "Considera la probabilità basata su dati storici e tendenze del settore",
    options: [
      { value: '1', label: 'Molto bassa', description: 'Meno di una volta ogni 10 anni', emoji: '🟢' },
      { value: '2', label: 'Bassa', description: 'Una volta ogni 5-10 anni', emoji: '🟡' },
      { value: '3', label: 'Media', description: 'Una volta ogni 2-5 anni', emoji: '🟠' },
      { value: '4', label: 'Alta', description: 'Una volta all\'anno', emoji: '🔴' },
      { value: '5', label: 'Molto alta', description: 'Più volte all\'anno', emoji: '🚨' }
    ],
    nextStep: 'assessment_q3',
    previousStep: 'assessment_q1'
  },

  'assessment_q3': {
    questionNumber: 3,
    totalQuestions: 7,
    fieldName: 'Impatto Operativo',
    fieldId: 'impatto_operativo',
    question: "Quale sarebbe l'impatto sulle operazioni aziendali?",
    helpText: "Valuta l'interruzione dei processi critici e la continuità operativa",
    options: [
      { value: '1', label: 'Minimo', description: 'Nessuna interruzione significativa', emoji: '🟢' },
      { value: '2', label: 'Basso', description: 'Interruzione di poche ore', emoji: '🟡' },
      { value: '3', label: 'Medio', description: 'Interruzione di 1-3 giorni', emoji: '🟠' },
      { value: '4', label: 'Alto', description: 'Interruzione di 3-7 giorni', emoji: '🔴' },
      { value: '5', label: 'Critico', description: 'Interruzione oltre 7 giorni', emoji: '🚨' }
    ],
    nextStep: 'assessment_q4',
    previousStep: 'assessment_q2'
  },

  'assessment_q4': {
    questionNumber: 4,
    totalQuestions: 7,
    fieldName: 'Impatto Reputazionale',
    fieldId: 'impatto_reputazionale',
    question: "Quale potrebbe essere l'impatto sulla reputazione aziendale?",
    helpText: "Considera l'effetto su clienti, partner, media e stakeholder",
    options: [
      { value: '1', label: 'Nullo', description: 'Nessun impatto percepibile', emoji: '🟢' },
      { value: '2', label: 'Limitato', description: 'Impatto locale o temporaneo', emoji: '🟡' },
      { value: '3', label: 'Moderato', description: 'Copertura mediatica regionale', emoji: '🟠' },
      { value: '4', label: 'Significativo', description: 'Copertura nazionale, perdita clienti', emoji: '🔴' },
      { value: '5', label: 'Devastante', description: 'Crisi reputazionale, perdita di fiducia', emoji: '🚨' }
    ],
    nextStep: 'assessment_q5',
    previousStep: 'assessment_q3'
  },

  'assessment_q5': {
    questionNumber: 5,
    totalQuestions: 7,
    fieldName: 'Velocità di Manifestazione',
    fieldId: 'velocita_manifestazione',
    question: "Con quale velocità si manifesterebbe l'evento una volta iniziato?",
    helpText: "Tempo disponibile per reagire e implementare contromisure",
    options: [
      { value: '1', label: 'Molto lenta', description: 'Settimane o mesi di preavviso', emoji: '🟢' },
      { value: '2', label: 'Lenta', description: 'Giorni di preavviso', emoji: '🟡' },
      { value: '3', label: 'Media', description: 'Ore di preavviso', emoji: '🟠' },
      { value: '4', label: 'Rapida', description: 'Minuti di preavviso', emoji: '🔴' },
      { value: '5', label: 'Istantanea', description: 'Nessun preavviso', emoji: '🚨' }
    ],
    nextStep: 'assessment_q6',
    previousStep: 'assessment_q4'
  },

  'assessment_q6': {
    questionNumber: 6,
    totalQuestions: 7,
    fieldName: 'Livello di Controllo',
    fieldId: 'controllo',
    question: "Qual è il livello attuale dei controlli per mitigare questo rischio?",
    helpText: "Valuta l'efficacia delle misure preventive e dei controlli esistenti",
    options: [
      { value: '++', label: 'Adeguato', description: 'Controlli efficaci e consolidati', emoji: '✅' },
      { value: '+', label: 'Sostanzialmente adeguato', description: 'Controlli presenti ma migliorabili', emoji: '🟡' },
      { value: '-', label: 'Parzialmente adeguato', description: 'Controlli non formalizzati', emoji: '🟠' },
      { value: '--', label: 'Non adeguato', description: 'Controlli assenti o inefficaci', emoji: '❌' }
    ],
    nextStep: 'assessment_q7',
    previousStep: 'assessment_q5'
  },

  'assessment_q7': {
    questionNumber: 7,
    totalQuestions: 7,
    fieldName: 'Conformità Normativa',
    fieldId: 'conformita_normativa',
    question: "Qual è il livello di conformità normativa per questo rischio?",
    helpText: "Considera GDPR, NIS2, AI Act e altre normative applicabili",
    options: [
      { value: '1', label: 'Piena conformità', description: 'Tutti i requisiti soddisfatti', emoji: '✅' },
      { value: '2', label: 'Conformità parziale', description: 'Maggior parte requisiti ok', emoji: '🟡' },
      { value: '3', label: 'Gap significativi', description: 'Diversi requisiti mancanti', emoji: '🟠' },
      { value: '4', label: 'Non conforme', description: 'Requisiti critici non soddisfatti', emoji: '❌' }
    ],
    nextStep: null,
    previousStep: 'assessment_q6'
  }
};

// Helper functions per navigazione e accesso
export const getStepDetails = (stepId: string): AssessmentStepDetails | null => {
  return assessmentStepsMap[stepId] || null;
};

export const getQuestionByNumber = (questionNumber: number): AssessmentStepDetails | null => {
  const stepId = `assessment_q${questionNumber}`;
  return getStepDetails(stepId);
};

export const formatStepContext = (stepId: string): string => {
  const details = getStepDetails(stepId);
  if (!details) return '';

  return `Domanda ${details.questionNumber} di ${details.totalQuestions}: ${details.question}`;
};

// Funzione per generare contesto completo per Syd Agent
export const generateSydContext = (stepId: string, selectedCategory?: string, eventCode?: string): string => {
  const details = getStepDetails(stepId);
  if (!details) return 'Stato assessment non disponibile';

  let context = `📊 **Risk Assessment in corso**\n\n`;

  if (selectedCategory) {
    context += `📁 Categoria: ${selectedCategory}\n`;
  }
  if (eventCode) {
    context += `🎯 Evento: ${eventCode}\n\n`;
  }

  context += `**Domanda ${details.questionNumber} di ${details.totalQuestions}**\n`;
  context += `${details.question}\n\n`;

  if (details.helpText) {
    context += `💡 *${details.helpText}*\n\n`;
  }

  context += `**Opzioni disponibili:**\n`;
  details.options.forEach((option, index) => {
    const emoji = option.emoji || '';
    context += `${index + 1}. ${emoji} ${option.label}`;
    if (option.description) {
      context += ` - ${option.description}`;
    }
    context += '\n';
  });

  if (details.nextStep) {
    const nextDetails = getStepDetails(details.nextStep);
    if (nextDetails) {
      context += `\n📍 Prossima domanda: ${nextDetails.fieldName}`;
    }
  } else {
    context += `\n✅ Ultima domanda dell'assessment`;
  }

  return context;
};