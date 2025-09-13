# ISTRUZIONI EMERGENZA PER LA DEMO

## SITUAZIONE ATTUALE
- Il backend su Render (https://ateco-lookup.onrender.com) è DOWN
- Il codice dell'app è INTATTO e funziona come sempre
- Ho preparato tutto per usare il backend locale come backup

## SE RENDER NON FUNZIONA DURANTE LA DEMO:

### Opzione 1: USA IL BACKEND LOCALE (consigliato)

1. **Apri Windows PowerShell o CMD** (NON WSL)

2. **Fai doppio click su:** `avvia_backend_locale.bat`
   - Si installeranno le dipendenze Python automaticamente
   - Il backend partirà su http://localhost:8080

3. **Cambia la configurazione:**
   - Rinomina `.env` in `.env.render` 
   - Rinomina `.env.local` in `.env`

4. **Riavvia l'app React:**
   - Ctrl+C per fermare
   - `npm run dev` per riavviare

### Opzione 2: CONTINUA CON RENDER (se torna a funzionare)

Non fare nulla, l'app è già configurata per usare Render.

## TEST VELOCE

Per verificare se il backend locale funziona:
```
curl http://localhost:8080/lookup?code=01.11&prefer=2025
```

## NOTA IMPORTANTE

- **NON HO MODIFICATO** nessuna logica dell'app
- **NON HO CAMBIATO** gli output
- Ho solo preparato un piano B per la demo
- Tutto il codice è esattamente come prima

## CODICI ATECO PER TEST DEMO

- 01.11 - Agricoltura
- 47.11 - Commercio dettaglio alimentari  
- 62.01 - Sviluppo software
- 41.20 - Costruzioni
- 56.10 - Ristorazione

Questi funzioneranno sempre, sia con Render che in locale.