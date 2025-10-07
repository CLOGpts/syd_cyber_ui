# 🔧 SYD CYBER - Development Guide

**Complete Setup and Development Procedures**

**Document Version**: 1.0
**Last Updated**: October 7, 2025

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running Locally](#running-locally)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [Useful Commands](#useful-commands)

---

## ✅ PREREQUISITES

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.0.0+ | Frontend development |
| **npm** | 10.0.0+ | Package management |
| **Python** | 3.11+ | Backend development |
| **pip** | Latest | Python package management |
| **Git** | Latest | Version control |

### Optional Tools

- **VSCode** - Recommended IDE
- **Postman** - API testing
- **PostgreSQL** - Local database (future)

### Check Your Setup

```bash
# Check Node.js
node --version  # Should be v20.0.0 or higher

# Check npm
npm --version   # Should be 10.0.0 or higher

# Check Python
python --version  # Should be Python 3.11 or higher

# Check pip
pip --version

# Check Git
git --version
```

---

## 🚀 INITIAL SETUP

### 1. Clone the Repositories

**Frontend**:
```bash
cd /Varie/syd_cyber/ui/
# Already cloned if you're reading this!
```

**Backend**:
```bash
cd /Varie/Celerya_Cyber_Ateco/
# Already exists!
```

---

### 2. Frontend Setup

```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your keys
# Required:
# VITE_GEMINI_API_KEY=your_key_here
# VITE_API_BASE=https://web-production-3373.up.railway.app
```

**Required Environment Variables**:

Create `/Varie/syd_cyber/ui/.env`:
```bash
# Gemini API Key (required for Syd AI)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API Base URL
VITE_API_BASE=https://web-production-3373.up.railway.app

# Firebase Configuration (for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Get API Keys**:
- **Gemini AI**: https://makersuite.google.com/app/apikey
- **Firebase**: https://console.firebase.google.com/

---

### 3. Backend Setup

```bash
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/

# Install dependencies
pip install -r config/requirements.txt

# Or install full dependencies (including ATECO module)
pip install -r config/backend_requirements.txt

# No .env needed for backend currently
# (all config in files)
```

---

## 💻 RUNNING LOCALLY

### Start Frontend (Development Mode)

```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/

# Start development server
npm run dev

# Output:
#   VITE v5.2.0  ready in 234 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

**Access**: Open http://localhost:5173 in your browser

**Features**:
- ✅ Hot Module Replacement (instant updates)
- ✅ Error overlay in browser
- ✅ Fast refresh

---

### Start Backend (Development Mode)

```bash
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/

# Option 1: Main server (without ATECO)
python main.py

# Option 2: ATECO server (includes ATECO lookup)
python ateco_lookup.py --file tabella_ATECO.xlsx --serve

# Output:
#   INFO:     Uvicorn running on http://0.0.0.0:8000
#   INFO:     Application startup complete.
```

**Access**:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)

---

### Run Both Together

**Terminal 1** (Frontend):
```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/
npm run dev
```

**Terminal 2** (Backend):
```bash
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/
python main.py
```

**Update Frontend .env** for local backend:
```bash
# Use local backend instead of production
VITE_API_BASE=http://localhost:8000
```

---

## 🔄 DEVELOPMENT WORKFLOW

### Making Changes

#### **Frontend Changes**:

1. **Edit files** in `/Varie/syd_cyber/ui/src/`
2. **See changes** automatically in browser (hot reload)
3. **Check console** for errors
4. **Test** the feature

#### **Backend Changes**:

1. **Edit files** in `/Varie/Celerya_Cyber_Ateco/`
2. **Restart server** to see changes (Ctrl+C, then `python main.py`)
3. **Test** with Swagger docs at http://localhost:8000/docs

---

### Code Structure

**Frontend**:
```
src/
├── components/     # React components
│   ├── auth/      # Login/authentication
│   ├── chat/      # Chat interface
│   ├── risk/      # Risk assessment
│   └── sydAgent/  # AI assistant
│
├── hooks/         # Custom React hooks
│   ├── useATECO.ts
│   ├── useRiskFlow.ts
│   └── useChat.ts
│
├── services/      # Business logic
│   ├── sydAgentService.ts
│   └── atecoEstimator.ts
│
├── api/           # External API calls
│   ├── gemini.ts  # Gemini AI
│   └── report.ts  # Report generation
│
└── store/         # State management
    └── useStore.ts
```

**Backend**:
```
Celerya_Cyber_Ateco/
├── main.py                    # Main FastAPI app
├── ateco_lookup.py           # ATECO module
├── visura_extractor_FINAL_embedded.py
│
├── config/
│   ├── requirements.txt
│   └── mapping.yaml
│
└── Data files:
    ├── MAPPATURE_EXCEL_PERFETTE.json
    ├── tabella_ATECO.xlsx
    └── zone_sismiche_comuni.json
```

---

### Git Workflow

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/my-feature

# Make changes, then stage
git add .

# Commit with message
git commit -m "Add: description of changes"

# Push to remote
git push origin feature/my-feature

# (Create PR on GitHub if needed)
```

---

## 🧪 TESTING

### Frontend Testing

#### **Run Unit Tests**:
```bash
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/
npm test
```

#### **Run E2E Tests** (Playwright):
```bash
npm run test:e2e
```

#### **Manual Testing Checklist**:
- [ ] Login works
- [ ] ATECO lookup works
- [ ] Risk assessment flow completes
- [ ] Syd AI responds
- [ ] Report generates
- [ ] No console errors

---

### Backend Testing

#### **Test API with Swagger**:
1. Open http://localhost:8000/docs
2. Click endpoint to test
3. Click "Try it out"
4. Enter parameters
5. Execute
6. See response

#### **Test with curl**:
```bash
# Health check
curl http://localhost:8000/health

# Get risk events
curl http://localhost:8000/events/Damage_Danni

# ATECO lookup
curl "http://localhost:8000/lookup?code=62.01"
```

#### **Python Tests** (Future):
```bash
cd /mnt/c/Users/speci/Desktop/Varie/Celerya_Cyber_Ateco/
pytest
```

---

## 🚀 DEPLOYMENT

### Frontend Deployment (Vercel)

**Automatic Deployment**:
```bash
# Just push to main branch
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs npm run build
# 3. Deploys to production
# 4. Updates URL
```

**Manual Deployment**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /mnt/c/Users/speci/Desktop/Varie/syd_cyber/ui/
vercel --prod
```

**Check Deployment**:
- Dario: https://syd-cyber-dario.vercel.app
- Marcello: https://syd-cyber-marcello.vercel.app
- Claudio: https://syd-cyber-claudio.vercel.app

---

### Backend Deployment (Railway)

**Automatic Deployment**:
```bash
# Push to connected branch
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Runs pip install
# 3. Starts uvicorn
# 4. Updates production
```

**Manual Deployment** (via Railway Dashboard):
1. Go to https://railway.app
2. Select project
3. Click "Deploy"
4. Choose commit
5. Confirm

**Check Deployment**:
- Production: https://web-production-3373.up.railway.app
- Health: https://web-production-3373.up.railway.app/health

---

### Environment Variables (Production)

**Vercel**:
1. Go to project settings
2. Click "Environment Variables"
3. Add/edit variables
4. Redeploy for changes to take effect

**Railway**:
1. Go to project settings
2. Click "Variables"
3. Add/edit variables
4. Automatically reloads

---

## 🔧 TROUBLESHOOTING

### Frontend Issues

#### **Port already in use**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

#### **Dependencies out of sync**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Environment variables not working**:
```bash
# Restart dev server (Ctrl+C, npm run dev)
# Vite only loads .env on startup
```

#### **Build fails**:
```bash
# Check for TypeScript errors
npm run lint

# Try clean build
rm -rf dist
npm run build
```

---

### Backend Issues

#### **Port 8000 already in use**:
```bash
# Find process
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)

# Or use different port
python main.py --port 8001
```

#### **Module not found**:
```bash
# Reinstall dependencies
pip install -r config/requirements.txt

# Or install specific package
pip install package-name
```

#### **Data files not found**:
```bash
# Check current directory
pwd

# Should be in: /Varie/Celerya_Cyber_Ateco/

# Files should exist:
ls MAPPATURE_EXCEL_PERFETTE.json
ls tabella_ATECO.xlsx
ls zone_sismiche_comuni.json
```

---

### Common Errors

#### **"CORS error" in browser**:
- Backend not running
- Wrong API_BASE in .env
- CORS not configured properly

**Fix**:
1. Ensure backend is running
2. Check VITE_API_BASE in .env
3. Restart frontend dev server

#### **"Cannot read property of undefined"**:
- Data not loaded yet
- API response changed
- Missing null check

**Fix**:
1. Add loading states
2. Check API response format
3. Add optional chaining (`?.`)

#### **"Network Error"**:
- Backend not accessible
- Wrong URL
- Firewall blocking

**Fix**:
1. Check backend is running
2. Verify URL in .env
3. Try curl to test backend directly

---

## 📝 USEFUL COMMANDS

### Frontend Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests

# Dependencies
npm install              # Install dependencies
npm update               # Update dependencies
npm audit fix            # Fix security issues
```

### Backend Commands

```bash
# Development
python main.py                           # Start main server
python ateco_lookup.py --serve --file tabella_ATECO.xlsx  # Start with ATECO

# Testing
pytest                                   # Run tests (when added)
python -m pdb main.py                   # Debug with pdb

# Dependencies
pip install -r config/requirements.txt   # Install dependencies
pip list                                 # List installed packages
pip freeze > requirements.txt            # Save current packages
```

### Git Commands

```bash
# Status and info
git status               # Check status
git log --oneline -10    # Recent commits
git branch               # List branches

# Making changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote

# Branches
git checkout -b feature/name  # Create and switch to branch
git checkout main        # Switch to main
git merge feature/name   # Merge branch

# Undoing
git reset HEAD~1         # Undo last commit (keep changes)
git checkout -- file     # Discard changes to file
git stash                # Temporarily save changes
git stash pop            # Restore stashed changes
```

### System Commands

```bash
# Processes
ps aux | grep python     # Find Python processes
ps aux | grep node       # Find Node processes
kill -9 PID              # Kill process by ID

# Ports
lsof -ti:8000            # Find what's using port 8000
netstat -an | grep 8000  # Check port status

# Disk space
df -h                    # Disk usage
du -sh *                 # Size of current directory contents
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ROADMAP.md](./ROADMAP.md) - Development roadmap
- [COLLABORATION_FRAMEWORK.md](./COLLABORATION_FRAMEWORK.md) - How we work

### External Links
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Vite Docs](https://vitejs.dev/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 🆘 GETTING HELP

### When Stuck:

1. **Check this guide** - Common issues covered
2. **Check error message** - Often tells you what's wrong
3. **Check browser console** - Frontend errors show here
4. **Check terminal** - Backend errors show here
5. **Ask Claude** - Describe the issue with context

### Providing Good Error Reports:

Include:
- What you were trying to do
- What happened instead
- Full error message
- Steps to reproduce
- Screenshots if relevant

---

*This guide will be updated as development practices evolve.*

**Last Updated**: October 7, 2025
**Version**: 1.0
