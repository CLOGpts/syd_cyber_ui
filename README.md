
# SYD Cyber - AI Risk Assessment Platform

Sistema intelligente per la valutazione del rischio cyber per PMI italiane, con assistente AI integrato e supporto multi-consulente.

## 🚀 Quick Start

### Frontend (Local Development)
```bash
npm install
npm run dev
```
Accesso locale: http://localhost:5175

### Backend (Production)
Backend deployato su Railway: https://web-production-3373.up.railway.app

## 🌐 Production URLs

### Ambienti Consulenti
- **Dario**: https://syd-cyber-dario.vercel.app
- **Marcello**: https://syd-cyber-marcello.vercel.app
- **Claudio**: https://syd-cyber-claudio.vercel.app

## 📁 Struttura Progetto

```
syd_cyber/ui/
├── src/                    # Codice sorgente React
│   ├── components/         # Componenti UI
│   ├── hooks/             # React hooks personalizzati
│   ├── store/             # State management (Zustand)
│   └── data/              # Knowledge base e dati
├── Celerya_Cyber_Ateco/   # Backend Python/FastAPI
├── Database/              # Excel mappature rischi
├── docs/                  # Documentazione
└── _archive/              # File obsoleti archiviati
```

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Framer Motion
- Zustand (state management)

### Backend
- Python 3.11 + FastAPI
- Google Gemini AI
- Railway (hosting)

### Deployment
- Vercel (frontend)
- Railway (backend)
- GitHub Actions (CI/CD)

## 📖 Documentazione

- [Guida Demo](docs/DEMO_PRESENTAZIONE.md)
- [Deploy Vercel](docs/ISTRUZIONI_VERCEL_FACILI.md)
- [Architettura](claude_code.md)
- [Roadmap](progettazione.md)

## 🔑 Features Principali

- ✅ Estrazione automatica dati da visura camerale
- ✅ Risk assessment guidato (7 categorie, 191 rischi)
- ✅ Assistente AI Syd con metodo socratico
- ✅ Report professionale con matrice di rischio
- ✅ Multi-tenancy con sessioni isolate
- ✅ Compliance Basel II/III e NIS2

## 🚦 Status

- Backend: ✅ Online
- Frontend Dario: ✅ Online
- Frontend Marcello: ✅ Online
- Frontend Claudio: ✅ Online

## 📝 License

Proprietario - Tutti i diritti riservati

---

*Sviluppato con Claude AI per rivoluzionare la cyber security delle PMI italiane*
