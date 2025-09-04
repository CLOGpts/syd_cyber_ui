# 🚀 DEPLOY SU RENDER - GUIDA VELOCE

## IL PROBLEMA
Il backend su Render ha ancora il codice VECCHIO che crasha.
Dobbiamo caricare il codice NUOVO che estrae solo 3 campi.

## PASSI DA FARE:

### 1. VAI SU RENDER
- Apri: https://dashboard.render.com
- Fai login
- Trova il servizio: **ateco-lookup**

### 2. TROVA IL REPOSITORY
Il servizio dovrebbe essere collegato a un repository GitHub o GitLab.
Trova quale repository usa.

### 3. AGGIORNA IL REPOSITORY
Nel repository, sostituisci questi file:

#### File 1: `app.py` (o come si chiama il file principale)
Copia il contenuto di `backend_fix_visura.py` che ho creato

#### File 2: `requirements.txt`  
Copia il contenuto di `backend_requirements.txt` che ho creato

### 4. FAI IL COMMIT E PUSH
```bash
git add .
git commit -m "Fix visura extraction - solo 3 campi STRICT"
git push
```

### 5. RENDER FA IL DEPLOY AUTOMATICO
Render dovrebbe fare il deploy automatico quando vede il nuovo commit.

## ALTERNATIVA: CREA UN NUOVO SERVIZIO

Se non riesci ad accedere al repository esistente:

1. Crea un NUOVO repository GitHub
2. Metti dentro:
   - `app.py` (contenuto da `backend_fix_visura.py`)
   - `requirements.txt` (contenuto da `backend_requirements.txt`)
3. Su Render, crea un NUOVO Web Service
4. Collega il nuovo repository
5. Cambia l'URL nel frontend da `ateco-lookup.onrender.com` al nuovo URL

## VERIFICA CHE FUNZIONI

Dopo il deploy, prova:
```
https://[tuo-servizio].onrender.com/health
```

Dovrebbe rispondere:
```json
{"status": "healthy", "version": "STRICT-1.0"}
```

---

**NOTA**: Il sistema AI continuerà a funzionare come fallback finché non fixiamo il backend!