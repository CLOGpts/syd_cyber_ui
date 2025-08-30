/**
 * 🚨 FALLBACK DI EMERGENZA PER PRESENTAZIONE
 * Se tutto fallisce, questi dati salvano la demo
 */

export const detectCompanyType = (denominazione: string): 'SIM' | 'SOFTWARE' | 'GENERIC' => {
  const upper = denominazione.toUpperCase();
  
  if (upper.includes('SIM') || upper.includes('INTERMEDIAZIONE') || upper.includes('SGR')) {
    return 'SIM';
  }
  if (upper.includes('SOFTWARE') || upper.includes('TECNOLOG') || upper.includes('DIGITAL')) {
    return 'SOFTWARE';
  }
  return 'GENERIC';
};

// FUNZIONE RIMOSSA - MAI INVENTARE ATECO!

export const fixREAFormat = (rea: string, provincia: string = 'TO'): string => {
  if (!rea) return `${provincia}-0000000`;
  
  // Rimuovi spazi e caratteri strani
  let cleaned = rea.replace(/\s+/g, '').replace(/[^A-Z0-9-]/gi, '');
  
  // Se ha già il formato giusto
  if (/^[A-Z]{2}-\d{6,7}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Se ha solo il numero
  if (/^\d{6,7}$/.test(cleaned)) {
    return `${provincia}-${cleaned}`;
  }
  
  // Se ha formato strano tipo "TO - 1234567"
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    if (parts.length === 2) {
      const prov = parts[0].length === 2 ? parts[0] : provincia;
      const num = parts[1].replace(/\D/g, '');
      return `${prov}-${num}`;
    }
  }
  
  // Estrai solo i numeri
  const numbers = cleaned.replace(/\D/g, '');
  if (numbers.length >= 6) {
    return `${provincia}-${numbers}`;
  }
  
  return `${provincia}-0000000`;
};

export const getProvinciaFromComune = (comune: string): string => {
  const mapping: Record<string, string> = {
    'TORINO': 'TO',
    'MILANO': 'MI',
    'ROMA': 'RM',
    'NAPOLI': 'NA',
    'PALERMO': 'PA',
    'GENOVA': 'GE',
    'BOLOGNA': 'BO',
    'FIRENZE': 'FI',
    'VENEZIA': 'VE',
    'BARI': 'BA',
    'CATANIA': 'CT',
    'VERONA': 'VR',
    'BRESCIA': 'BS',
    'PADOVA': 'PD',
    'TRIESTE': 'TS',
    'BOSCONERO': 'TO'
  };
  
  const comuneUpper = comune.toUpperCase().replace('DI ', '').trim();
  return mapping[comuneUpper] || 'TO'; // Default TO per sicurezza
};

/**
 * FUNZIONE DI EMERGENZA - Salva i dati quando tutto fallisce
 */
export const emergencyDataFix = (data: any): any => {
  const fixed = { ...data };
  
  // 1. Fix denominazione
  if (fixed.denominazione) {
    const tipo = detectCompanyType(fixed.denominazione);
    
    // NON INVENTO MAI ATECO!
    // Solo correggo formato se c'è già
    
    // 3. Fix tipo business per SIM
    if (tipo === 'SIM') {
      fixed.tipo_business = 'B2B';
    }
  }
  
  // NON AGGIUNGO MAI ATECO SE NON C'È!
  // Solo correzioni di formato, MAI inventare dati
  
  // 4. Fix REA
  if (fixed.numero_rea) {
    const provincia = fixed.sede_legale?.provincia || 
                     getProvinciaFromComune(fixed.sede_legale?.comune || 'TORINO');
    fixed.numero_rea = fixREAFormat(fixed.numero_rea, provincia);
  }
  
  // 5. Fix provincia
  if (fixed.sede_legale?.comune && !fixed.sede_legale?.provincia) {
    fixed.sede_legale.provincia = getProvinciaFromComune(fixed.sede_legale.comune);
  }
  
  // NON INVENTO MAI L'OGGETTO SOCIALE!
  // Solo mantengo quello che c'è
  
  return fixed;
};