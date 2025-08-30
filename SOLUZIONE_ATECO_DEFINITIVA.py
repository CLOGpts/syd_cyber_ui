# 🎯 SOLUZIONE DEFINITIVA PER ATECO

## IL PROBLEMA:
# Il backend estrae TUTTO quello che trova come ATECO, inclusi anni e numeri casuali

## LA SOLUZIONE:
# Usa SOLO questi pattern SPECIFICI per trovare ATECO nella visura

import re

def extract_ateco_pulito(text):
    """
    Estrae SOLO codici ATECO validi dalla visura
    """
    ateco_trovati = []
    
    # PATTERN 1: Cerca specificamente la parola ATECO seguita dal codice
    # Esempio: "Codice ATECO: 62.01"
    pattern1 = r'(?:Codice\s+)?ATECO[\s:]+(\d{2}\.\d{2}(?:\.\d{2})?)'
    
    # PATTERN 2: Cerca "Attività prevalente" o "Attività principale"
    # Esempio: "Attività prevalente: 62.01"
    pattern2 = r'Attività\s+(?:prevalente|principale)[\s:]+(\d{2}\.\d{2}(?:\.\d{2})?)'
    
    # PATTERN 3: Formato con trattino
    # Esempio: "62.01 - Produzione di software"
    # MA SOLO se è all'inizio di una riga o dopo ATECO
    pattern3 = r'(?:^|ATECO[\s:]+)(\d{2}\.\d{2}(?:\.\d{2})?)\s*[-–]\s*([^\n]+)'
    
    # PATTERN 4: Import/Export (spesso indicano ATECO)
    # Esempio: "Import.: 62.01"
    pattern4 = r'(?:Import|Export|Attività)[\.\s:]+(\d{2}\.\d{2}(?:\.\d{2})?)'
    
    # Cerca con tutti i pattern
    for pattern in [pattern1, pattern2, pattern4]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            codice = match if isinstance(match, str) else match[0]
            
            # VALIDAZIONE IMPORTANTE
            if is_valid_ateco_code(codice):
                if codice not in [a['codice'] for a in ateco_trovati]:
                    ateco_trovati.append({
                        'codice': codice,
                        'descrizione': get_ateco_description(text, codice),
                        'principale': len(ateco_trovati) == 0
                    })
    
    # Se non trova niente con i pattern stretti, cerca il pattern con descrizione
    if not ateco_trovati:
        matches = re.findall(pattern3, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            codice = match[0]
            descrizione = match[1] if len(match) > 1 else ''
            
            if is_valid_ateco_code(codice):
                ateco_trovati.append({
                    'codice': codice,
                    'descrizione': clean_description(descrizione),
                    'principale': len(ateco_trovati) == 0
                })
    
    return ateco_trovati

def is_valid_ateco_code(code):
    """
    Verifica che sia un codice ATECO valido
    """
    # Deve essere nel formato XX.XX o XX.XX.XX
    if not re.match(r'^\d{2}\.\d{2}(?:\.\d{2})?$', code):
        return False
    
    # I codici ATECO validi vanno da 01.xx a 99.xx
    # MA escludiamo quelli che sembrano anni (19.xx, 20.xx, 21.xx)
    first_part = int(code.split('.')[0])
    
    # Escludi range che potrebbero essere anni
    if first_part in [19, 20, 21]:
        second_part = int(code.split('.')[1])
        # Se sembra un anno (es: 20.21, 20.22)
        if 0 <= second_part <= 99:
            return False
    
    # Escludi codici non standard
    if first_part == 0 or first_part > 99:
        return False
    
    return True

def get_ateco_description(text, codice):
    """
    Cerca la descrizione del codice ATECO nel testo
    """
    # Cerca il codice seguito da - o : e poi la descrizione
    pattern = re.escape(codice) + r'\s*[-–:]\s*([^\n]{5,100})'
    match = re.search(pattern, text, re.IGNORECASE)
    
    if match:
        desc = match.group(1)
        return clean_description(desc)
    
    # Dizionario di fallback per i codici più comuni
    descrizioni_default = {
        '62.01': 'Produzione di software',
        '62.02': 'Consulenza nel settore delle tecnologie dell\'informatica',
        '62.03': 'Gestione di strutture informatiche',
        '62.09': 'Altre attività dei servizi connessi alle tecnologie dell\'informatica',
        '63.11': 'Elaborazione dei dati, hosting e attività connesse',
        '63.12': 'Portali web',
        '47.91': 'Commercio al dettaglio per corrispondenza o internet',
        '70.22': 'Consulenza imprenditoriale e altra consulenza amministrativo-gestionale',
    }
    
    # Prendi solo i primi 5 caratteri per la ricerca (XX.XX)
    codice_base = codice[:5] if len(codice) >= 5 else codice
    return descrizioni_default.get(codice_base, 'Attività economica')

def clean_description(desc):
    """
    Pulisce la descrizione da testi inutili
    """
    # Rimuovi pattern inutili
    desc = re.sub(r'^\d+\s*$', '', desc)  # Solo numeri
    desc = re.sub(r'^[A-Z\s]+DEL\s+DECRETO.*', '', desc, flags=re.IGNORECASE)  # Riferimenti a decreti
    desc = re.sub(r'\d{2}/\d{2}/\d{4}.*', '', desc)  # Date e tutto dopo
    desc = re.sub(r'Addetti.*', '', desc, flags=re.IGNORECASE)  # Info addetti
    desc = re.sub(r'\s+', ' ', desc)  # Spazi multipli
    
    return desc.strip()

# TEST CON IL TUO ESEMPIO
if __name__ == "__main__":
    # Esempio di testo dalla visura
    test_text = """
    DATI ANAGRAFICI
    CELERYA SRL
    
    Codice ATECO: 62.01 - Produzione di software non connesso all'edizione
    
    Anno 2021
    Numero dipendenti: 3
    10 - BIS DEL DECRETO LEGGE 24
    Import.: 62.01
    2022 - bilancio
    
    Attività prevalente: 62.01 - sviluppo software
    """
    
    risultati = extract_ateco_pulito(test_text)
    
    print("CODICI ATECO TROVATI:")
    for ateco in risultati:
        print(f"  {ateco['codice']} - {ateco['descrizione']}")
    
    # Output atteso:
    # 62.01 - Produzione di software non connesso all'edizione
    
    # NON dovrebbe trovare: 2021, 10, 2022