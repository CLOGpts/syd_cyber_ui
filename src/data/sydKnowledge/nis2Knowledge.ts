// Estratto dal documento "04 - Fonti normative europee e relative descrizioni (ambito NIS2).pdf"
// Questo è un subset delle informazioni chiave per il Syd Agent

export const NIS2_KNOWLEDGE = `
=== DIRETTIVA NIS2 (UE) 2022/2555 ===

AMBITO DI APPLICAZIONE:
La NIS2 si applica a:
- Soggetti ESSENZIALI: energia, trasporti, sanità, acqua potabile, acque reflue, infrastrutture digitali, ICT B2B, pubblica amministrazione, spazio
- Soggetti IMPORTANTI: servizi postali, gestione rifiuti, fabbricazione dispositivi medici, prodotti chimici, alimenti, fabbricazione

CRITERI DIMENSIONALI:
- Medie imprese: ≥50 dipendenti O fatturato ≥10M€
- Grandi imprese: ≥250 dipendenti O fatturato ≥50M€

10 DOMINI DI SICUREZZA (Art. 21):
1. Politiche di analisi dei rischi e sicurezza dei sistemi informatici
2. Gestione degli incidenti (prevenzione, rilevamento, risposta)
3. Gestione della continuità operativa (backup, disaster recovery)
4. Sicurezza della catena di approvvigionamento
5. Sicurezza nell'acquisizione, sviluppo e manutenzione di sistemi
6. Valutazione dell'efficacia delle misure di gestione dei rischi
7. Pratiche di igiene informatica di base e formazione
8. Politiche e procedure per l'uso della crittografia
9. Sicurezza delle risorse umane
10. Politiche di controllo degli accessi

OBBLIGHI DI NOTIFICA:
- EARLY WARNING: entro 24 ore dall'awareness
- INCIDENT NOTIFICATION: entro 72 ore con valutazione iniziale
- FINAL REPORT: entro 1 mese dalla notifica

SANZIONI:
- Soggetti essenziali: fino a 10M€ o 2% fatturato globale
- Soggetti importanti: fino a 7M€ o 1,4% fatturato globale

SCADENZE IMPLEMENTAZIONE:
- 17 ottobre 2024: recepimento negli Stati membri
- 17 aprile 2025: identificazione soggetti essenziali/importanti
- 17 ottobre 2025: compliance completa

GOVERNANCE:
- Top management responsabile per approvazione misure
- Formazione obbligatoria per management
- Responsabilità personale dei dirigenti

REGISTRO SOGGETTI:
Ogni Stato membro mantiene un registro nazionale dei soggetti NIS2 con:
- Denominazione e ragione sociale
- Settore e sottosettore
- Dimensione (PMI/grande impresa)
- Recapiti incluso IP range e nomi dominio

SUPPLY CHAIN SECURITY:
- Valutazione rischi fornitori diretti
- Requisiti contrattuali di sicurezza
- Audit periodici fornitori critici
- Piani di contingenza per interruzioni

COOPERAZIONE:
- CSIRT nazionali per risposta incidenti
- Cooperation Group EU per coordinamento
- EU-CyCLONe per crisi su larga scala
- Peer review tra Stati membri

CERTIFICAZIONI RICONOSCIUTE:
- ISO/IEC 27001 per ISMS
- SOC 2 per service providers
- ISAE 3402 per servizi in outsourcing
- Schemi nazionali di certificazione cybersecurity
`;

export const NIS2_ASSESSMENT_QUESTIONS = [
  {
    category: "Identificazione soggetto",
    questions: [
      "La vostra organizzazione opera in uno dei settori essenziali o importanti definiti dalla NIS2?",
      "Quanti dipendenti ha la vostra organizzazione e qual è il fatturato annuo?",
      "Fornite servizi essenziali per il mantenimento di attività sociali o economiche critiche?"
    ]
  },
  {
    category: "Governance",
    questions: [
      "Il top management ha approvato formalmente le misure di cybersecurity?",
      "Esistono programmi di formazione cyber per il management?",
      "È stata definita la catena di responsabilità per la cybersecurity?"
    ]
  },
  {
    category: "Risk Management",
    questions: [
      "Avete implementato tutti i 10 domini di sicurezza richiesti dall'Art. 21?",
      "Esiste un processo formale di risk assessment cyber?",
      "Come valutate l'efficacia delle vostre misure di sicurezza?"
    ]
  },
  {
    category: "Incident Management",
    questions: [
      "Avete procedure per notificare incidenti entro 24 ore?",
      "Il vostro incident response plan copre early warning, notification e final report?",
      "Avete identificato il CSIRT nazionale di riferimento?"
    ]
  },
  {
    category: "Supply Chain",
    questions: [
      "Avete mappato i vostri fornitori critici ICT?",
      "I contratti con fornitori includono requisiti NIS2?",
      "Eseguite audit di sicurezza sui fornitori critici?"
    ]
  }
];