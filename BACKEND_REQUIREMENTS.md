# 📋 REQUISITI PRECISI PER BACKEND ESTRAZIONE VISURE

## ⚡ PRIORITÀ ASSOLUTA: QUESTI CAMPI DEVONO ESSERE ESTRATTI SEMPRE

### 1. **CODICI ATECO** ⚠️ CRITICO
```python
# FORMATO CORRETTO:
{
  "codici_ateco": [
    {
      "codice": "66.12",  # SOLO IL CODICE, SENZA "ATECO:"
      "descrizione": "Negoziazione di contratti relativi a titoli e merci",
      "principale": true
    }
  ]
}

# DOVE CERCARE:
- Sezione "Attività"
- Vicino a "Codice:" o "Ateco:"
- Pattern regex: r'\b\d{2}\.\d{2}(?:\.\d{2})?\b'

# VALIDAZIONE:
- Format: XX.XX o XX.XX.XX
- NON sono ATECO: anni (2021, 2022), date, numeri singoli
- Per SIM/finanziarie: codici 64.xx, 65.xx, 66.xx
- Per software: 62.xx, 63.xx
```

### 2. **NUMERO REA** ⚠️ CRITICO
```python
# FORMATO CORRETTO:
{
  "numero_rea": "TO-1275874"  # SEMPRE PROVINCIA-NUMERO
}

# COME ESTRARRE:
1. Trova il numero REA (es: "1275874")
2. Trova la provincia dalla sede legale
3. Combina: f"{provincia}-{numero}"

# ERRORI DA EVITARE:
- MAI "LE-TO" o altre combinazioni assurde
- MAI solo "LE-" senza numero
- Se non trovi il numero, NON inventare
```

### 3. **SEDE LEGALE** ⚠️ CRITICO
```python
# FORMATO CORRETTO:
{
  "sede_legale": {
    "comune": "TORINO",      # SENZA "di" davanti!
    "provincia": "TO",        # SEMPRE 2 lettere
    "cap": "10121",
    "indirizzo": "Via Roma 1"
  }
}

# MAPPING OBBLIGATORIO:
comuni_province = {
  "TORINO": "TO",
  "MILANO": "MI", 
  "ROMA": "RM",
  "NAPOLI": "NA",
  "PALERMO": "PA",
  "GENOVA": "GE",
  "BOLOGNA": "BO",
  "FIRENZE": "FI",
  "VENEZIA": "VE"
}

# PULIZIA:
- Rimuovi "di " dal comune: "di TORINO" → "TORINO"
- Usa SEMPRE il mapping per la provincia corretta
```

## 🔴 ERRORI GRAVI DA NON COMMETTERE MAI

1. **MAI restituire ATECO vuoto o "Nessuno"**
   - Se non trovi ATECO, almeno cerca pattern XX.XX nel testo
   - Per SIM cerca 66.xx, per software 62.xx

2. **MAI confondere province**
   - Torino è TO, non LE
   - Milano è MI, non altro
   - Usa SEMPRE il mapping

3. **MAI REA incompleti**
   - Se trovi solo "LE-" senza numero, è SBAGLIATO
   - Cerca il numero completo

4. **MAI mesciare dati tra visure**
   - Ogni estrazione deve essere isolata
   - Non conservare stato tra richieste

## 📊 STRUTTURA OUTPUT RICHIESTA

```json
{
  "success": true,
  "data": {
    "denominazione": "NOME AZIENDA SRL",
    "forma_giuridica": "SRL|SPA|SNC|etc",
    "partita_iva": "12345678901",
    "codice_fiscale": "12345678901",
    "numero_rea": "TO-1234567",
    "codici_ateco": [
      {
        "codice": "62.01",
        "descrizione": "Produzione di software",
        "principale": true
      }
    ],
    "sede_legale": {
      "comune": "TORINO",
      "provincia": "TO",
      "cap": "10121",
      "indirizzo": "Via Roma 1"
    },
    "pec": "azienda@pec.it",
    "capitale_sociale": {
      "versato": 100000
    },
    "oggetto_sociale": "Testo completo dell'oggetto sociale...",
    "amministratori": [
      {
        "nome": "Mario",
        "cognome": "Rossi",
        "carica": "Amministratore Unico"
      }
    ]
  },
  "confidence": 0.85
}
```

## 🎯 TEST DI VALIDAZIONE

Prima di restituire i dati, verifica:

```python
def validate_extraction(data):
    errors = []
    
    # 1. ATECO presente e valido?
    if not data.get('codici_ateco') or len(data['codici_ateco']) == 0:
        errors.append("ATECO MANCANTE")
    
    # 2. REA formato corretto?
    if not re.match(r'^[A-Z]{2}-\d{6,7}$', data.get('numero_rea', '')):
        errors.append(f"REA ERRATO: {data.get('numero_rea')}")
    
    # 3. Provincia coerente con comune?
    comune = data.get('sede_legale', {}).get('comune', '').upper()
    provincia = data.get('sede_legale', {}).get('provincia', '')
    
    if comune == 'TORINO' and provincia != 'TO':
        errors.append(f"PROVINCIA ERRATA: Torino è TO, non {provincia}")
    
    return errors
```

## ⚠️ SE NON RIESCI AD ESTRARRE

Se non riesci a trovare un campo critico (ATECO, REA, provincia):
1. **NON inventare dati**
2. **NON usare valori di default sbagliati**
3. **Restituisci campo vuoto o null**
4. **Il frontend attiverà l'AI Chirurgica**

## 📝 ESEMPI DI ESTRAZIONE CORRETTA

### Visura Software (Celerya):
```json
{
  "denominazione": "CELERYA SRL",
  "numero_rea": "TO-1223096",
  "codici_ateco": [{"codice": "62.01", "descrizione": "Produzione di software"}],
  "sede_legale": {"comune": "BOSCONERO", "provincia": "TO"}
}
```

### Visura Finanziaria (Cuniberti):
```json
{
  "denominazione": "CUNIBERTI & PARTNERS SIM SPA",
  "numero_rea": "TO-1275874",
  "codici_ateco": [{"codice": "66.12", "descrizione": "Negoziazione titoli"}],
  "sede_legale": {"comune": "TORINO", "provincia": "TO"}
}
```

## 🚀 DEPLOYMENT

Quando aggiorni il backend:
1. Testa con ALMENO 3 visure diverse
2. Verifica che ATECO, REA e provincia siano corretti
3. Non deployare se anche solo un campo critico è sbagliato

---

**RICORDA**: È meglio non estrarre un campo che estrarlo male. L'AI Chirurgica completerà i campi mancanti.