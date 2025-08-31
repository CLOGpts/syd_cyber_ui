export interface RiskCategory {
  id: string;
  name: string;
  displayName: string;
  icon: string;
}

export interface RiskEvent {
  code: string;
  description: string;
  category: string;
}

export interface RiskDescription {
  event_code: string;
  description: string;
}

const API_BASE = 'http://localhost:8000';

const CATEGORY_MAP: Record<string, { name: string; icon: string; keywords: string[] }> = {
  'Damage_Danni': { 
    name: 'Danni materiali', 
    icon: '🔥',
    keywords: ['danni', 'fisici', 'materiali', 'incendio', 'allagamento', 'terremoto']
  },
  'Business_disruption': { 
    name: 'Interruzioni di sistema', 
    icon: '💻',
    keywords: ['sistema', 'interruzione', 'downtime', 'crash', 'blocco', 'IT']
  },
  'Employment_practices_Dipendenti': { 
    name: 'Problemi con dipendenti', 
    icon: '👥',
    keywords: ['dipendenti', 'personale', 'lavoro', 'sicurezza', 'discriminazione']
  },
  'Execution_delivery_Problemi_di_produzione_o_consegna': { 
    name: 'Problemi di esecuzione/consegna', 
    icon: '⚙️',
    keywords: ['esecuzione', 'consegna', 'produzione', 'processo', 'delivery']
  },
  'Clients_product_Clienti': { 
    name: 'Rischi con clienti e prodotti', 
    icon: '🤝',
    keywords: ['clienti', 'prodotti', 'privacy', 'conformità', 'vendite', 'consulenza']
  },
  'Internal_Fraud_Frodi_interne': { 
    name: 'Frodi interne', 
    icon: '🔓',
    keywords: ['frodi', 'interne', 'furto', 'manipolazione', 'insider']
  },
  'External_fraud_Frodi_esterne': { 
    name: 'Frodi esterne', 
    icon: '🚨',
    keywords: ['frodi', 'esterne', 'hacker', 'phishing', 'furto', 'contraffazione']
  }
};

export const getRiskCategories = async (): Promise<RiskCategory[]> => {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    
    return data.categories.map((cat: string) => ({
      id: cat,
      name: CATEGORY_MAP[cat]?.name || cat,
      displayName: CATEGORY_MAP[cat]?.name || cat,
      icon: CATEGORY_MAP[cat]?.icon || '📋'
    }));
  } catch (error) {
    console.error('Error fetching risk categories:', error);
    throw error;
  }
};

export const getRiskEvents = async (category: string): Promise<RiskEvent[]> => {
  try {
    const response = await fetch(`${API_BASE}/events/${encodeURIComponent(category)}`);
    const data = await response.json();
    
    return data.events.map((event: string) => ({
      code: event,
      description: event,
      category: category
    }));
  } catch (error) {
    console.error('Error fetching risk events:', error);
    throw error;
  }
};

export const getRiskDescription = async (eventCode: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/description/${encodeURIComponent(eventCode)}`);
    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error fetching risk description:', error);
    throw error;
  }
};

export const groupEventsByTheme = (events: RiskEvent[]): Record<string, RiskEvent[]> => {
  const themes: Record<string, string[]> = {
    'Vendite e regole commerciali': ['vendita', 'commercia', 'marketing', 'pubblici'],
    'Privacy e protezione dati': ['privacy', 'dati', 'personali', 'breach', 'GDPR'],
    'Consulenza e investimenti': ['consulenza', 'investiment', 'finanzia', 'portafoglio'],
    'Conformità normativa': ['conformità', 'normativ', 'regolament', 'compliance'],
    'Contratti e documentazione': ['contratt', 'document', 'accordi', 'clausole'],
    'Autorizzazioni e permessi': ['autorizzazion', 'permess', 'licenz', 'approvazion'],
    'Prodotti e servizi': ['prodott', 'servizi', 'difett', 'qualità'],
    'Altri rischi': []
  };

  const grouped: Record<string, RiskEvent[]> = {};

  events.forEach(event => {
    const eventLower = event.description.toLowerCase();
    let assigned = false;

    for (const [theme, keywords] of Object.entries(themes)) {
      if (theme === 'Altri rischi') continue;
      
      if (keywords.some(kw => eventLower.includes(kw))) {
        if (!grouped[theme]) grouped[theme] = [];
        grouped[theme].push(event);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      if (!grouped['Altri rischi']) grouped['Altri rischi'] = [];
      grouped['Altri rischi'].push(event);
    }
  });

  return grouped;
};

export const searchEventsByKeyword = (events: RiskEvent[], keyword: string): RiskEvent[] => {
  const lowerKeyword = keyword.toLowerCase();
  return events.filter(event => 
    event.description.toLowerCase().includes(lowerKeyword)
  );
};

export const findCategoryByKeyword = (keyword: string): string | null => {
  const lowerKeyword = keyword.toLowerCase();
  
  for (const [categoryId, categoryInfo] of Object.entries(CATEGORY_MAP)) {
    if (categoryInfo.name.toLowerCase().includes(lowerKeyword) ||
        categoryInfo.keywords.some(kw => lowerKeyword.includes(kw))) {
      return categoryId;
    }
  }
  
  return null;
};

export const formatRiskMessage = (category: string, event: string, description: string): string => {
  const categoryInfo = CATEGORY_MAP[category];
  const eventCode = event.split(' - ')[0];
  const eventTitle = event.split(' - ').slice(1).join(' - ');
  
  return `
${categoryInfo?.icon || '📋'} **Categoria:** ${categoryInfo?.name || category}

📌 **Evento ${eventCode}:** ${eventTitle}

📄 **Descrizione dettagliata:**
${description}

💡 **Cosa significa per la tua azienda:**
Questo rischio potrebbe impattare le tue operazioni. È importante valutare:
• La probabilità che questo evento si verifichi nel tuo contesto
• L'impatto potenziale sulle tue attività
• Le misure preventive già in atto
• I controlli da implementare per mitigare il rischio
  `.trim();
};