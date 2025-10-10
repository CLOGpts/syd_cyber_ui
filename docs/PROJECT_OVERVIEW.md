# 🎯 SYD CYBER - Project Overview

**Project Name**: SYD Cyber Risk Assessment Platform
**Version**: 1.0 (Prototype)
**Owner**: Claudio (Clo)
**Status**: Active Development
**Last Updated**: October 10, 2025

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Vision & Mission](#vision--mission)
3. [Target Audience](#target-audience)
4. [Core Features](#core-features)
5. [Business Value](#business-value)
6. [Current Status](#current-status)
7. [Team Structure](#team-structure)
8. [Technology Stack](#technology-stack)
9. [Deployment](#deployment)
10. [Success Metrics](#success-metrics)

---

## 🎯 EXECUTIVE SUMMARY

**SYD Cyber** is an AI-powered risk assessment platform designed specifically for **Italian Small and Medium Enterprises (SMEs)** to evaluate and manage operational risks with a focus on cyber security and regulatory compliance.

### What Makes SYD Unique:

🤖 **AI Assistant "Syd"** - Intelligent consultant using Socratic method
📊 **Guided Risk Assessment** - 7 categories, 191 specific risk events
📄 **Automated Visura Extraction** - Extract company data from PDF documents
🎯 **Compliance-Ready** - Basel II/III and NIS2 directive aligned
👥 **Multi-Consultant Platform** - Separate environments per consultant
🇮🇹 **Italian-First Design** - Built for Italian market specifics

---

## 🌟 VISION & MISSION

### Vision
*"To become the leading cyber risk assessment platform for Italian SMEs, making enterprise-level risk management accessible and affordable for small businesses."*

### Mission
*"Empower Italian consultants to deliver professional, AI-enhanced cyber risk assessments that help SMEs understand and mitigate their operational risks efficiently."*

### Core Principles
1. **Simplicity** - Complex risk analysis made simple
2. **Guidance** - Step-by-step assistance, not just tools
3. **Intelligence** - AI that asks the right questions
4. **Compliance** - Always aligned with regulations
5. **Accessibility** - Professional results for all company sizes

---

## 👥 TARGET AUDIENCE

### Primary Users: Cyber Security Consultants
**Profile:**
- Independent consultants or small consulting firms
- Specializing in cyber security for SMEs
- Italian market focus
- Need professional tools without enterprise costs

**Pain Points We Solve:**
- ❌ Manual risk assessment takes too long
- ❌ Generic tools don't fit Italian context
- ❌ Difficult to create professional reports
- ❌ No guidance on ATECO-specific risks
- ❌ Hard to stay compliant with regulations

### Secondary Users: SME Business Owners
**Profile:**
- Italian small/medium business owners
- Limited cybersecurity knowledge
- Need to comply with NIS2 and other regulations
- Want to understand their risk exposure

---

## ✨ CORE FEATURES

### 1. **Intelligent Visura Extraction**
📄 Upload PDF visura camerale → Automatic extraction of:
- Partita IVA (VAT number)
- ATECO code (economic activity code)
- Business object/description
- **Status**: ⚠️ Currently mock - needs real implementation

### 2. **ATECO-Based Risk Profiling**
🔍 Automatic risk profile generation based on:
- ATECO 2022/2025 classification
- Industry-specific normative requirements
- Sector-specific risk factors
- Italian regulatory context
- **Status**: ⚠️ Backend not integrated - using Gemini AI fallback

### 3. **Guided Risk Assessment**
📊 **7 Risk Categories** (Basel II/III compliant):
1. **Damage/Danni** - Physical damage, disasters (10 events)
2. **Business Disruption** - Operations interruption (20 events)
3. **Employment Practices** - HR & employee issues (22 events)
4. **Execution & Delivery** - Process failures (59 events)
5. **Clients & Products** - Customer-related risks (44 events)
6. **Internal Fraud** - Internal misconduct (20 events)
7. **External Fraud** - External attacks (16 events)

**Total: 191 specific risk events**

### 4. **AI Assistant "Syd"**
🤖 Intelligent consultant that:
- Uses Socratic method to guide thinking
- Asks clarifying questions
- Provides context-aware suggestions
- Helps evaluate likelihood and impact
- Suggests appropriate controls
- **Powered by**: Google Gemini AI

### 5. **Risk Matrix Calculation**
📈 Automatic calculation of:
- **Risk Score** (0-100 scale)
- **Risk Matrix Position** (A1-D4 grid)
- **Inherent Risk** (economic + non-economic impact)
- **Control Adequacy** (++, +, -, --)
- **Residual Risk** after controls

### 6. **Professional Report Generation**
📄 PDF reports with:
- Executive summary
- Risk matrix visualization
- Category-by-category analysis
- Control recommendations
- Compliance checklist
- **Status**: ✅ Fully implemented

### 7. **Multi-Tenant Architecture**
👥 Separate consultant environments:
- **Dario**: syd-cyber-dario.vercel.app
- **Marcello**: syd-cyber-marcello.vercel.app
- **Claudio**: syd-cyber-claudio.vercel.app
- Isolated sessions and data

---

## 💰 BUSINESS VALUE

### For Consultants:
- ⏱️ **Save 50-70% time** on risk assessments
- 📊 **Professional reports** in minutes, not hours
- 🎯 **Stand out** with AI-enhanced service
- 💼 **Serve more clients** with same resources
- 📈 **Increase revenue** through efficiency

### For SMEs:
- 💰 **Affordable** professional risk assessment
- 🎓 **Educational** - understand risks better
- ✅ **Compliance-ready** for NIS2 and other regulations
- 🛡️ **Actionable** risk mitigation strategies
- 📋 **Documentation** for audits and certifications

### Market Opportunity:
- 🇮🇹 **200,000+ Italian SMEs** subject to NIS2
- 💼 **Growing cybersecurity awareness** post-pandemic
- 📈 **Regulatory pressure** increasing compliance needs
- 🎯 **Underserved market** - few Italian-specific solutions

---

## 📊 CURRENT STATUS

### ✅ What's Working (Production Ready)
- Frontend UI/UX - React application deployed
- User authentication and sessions
- Chat interface with Syd AI
- Risk assessment workflow (7 categories)
- Risk matrix calculation engine
- PDF report generation
- Multi-tenant deployment (3 consultants)
- Seismic zone lookup (419 cities)
- **Database infrastructure** - PostgreSQL on Railway ✅ NEW (Oct 9-10)
- **Real Visura extraction** - PDF processing with retry logic ✅ (Oct 8)
- **ATECO conversion** - 2022→2025 automatic conversion ✅ (Oct 8)

### ⚠️ What Needs Work (In Development)
- **Database Migration** - Migrate JSON/Excel data to PostgreSQL
- **Backend Endpoints** - Update to query database instead of files
- **Seismic Database** - Only 5% of Italian cities covered (419/8,102)
- **Assessment CRUD** - Save/load assessments from database
- **Testing** - No automated tests yet

### 🔴 Critical Issues (Updated Oct 10)
1. **Database Migration** - Phase 2 in progress (data migration scripts)
2. **Backend Integration** - Update endpoints to use database
3. **Incomplete seismic data** - Limited coverage (419/8,102 cities)

### 📈 Completion Status
- **Frontend**: ~90% complete
- **Backend API**: ~80% complete (+10% from database foundation)
- **ATECO System**: ✅ 100% complete (integrated Oct 8)
- **Database Infrastructure**: ✅ 85% complete (Phase 1 done, Phase 2 in progress)
- **Documentation**: ~75% complete (improving!)
- **Testing**: ~10% complete
- **Overall Project**: ~80% complete (+15% from Oct 8-10 work)

---

## 👥 TEAM STRUCTURE

### Current Team
- **Claudio (Clo)** - Project Owner, Developer
- **Claude AI** - Development Partner, Technical Advisor
- **BMAD Framework** - Optional structured workflow support

### Consultant Users (Beta Testers)
- **Dario** - Primary consultant user
- **Marcello** - Secondary consultant user
- **Claudio** - Developer + consultant user

### Future Roles Needed
- Frontend specialist (React/TypeScript)
- Backend specialist (Python/FastAPI)
- DevOps engineer (CI/CD, monitoring)
- UX designer (improvements)
- Italian SME domain expert
- Cybersecurity consultant (validation)

---

## 🛠️ TECHNOLOGY STACK

### Frontend
```
Location: /Varie/syd_cyber/ui/

Core:
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.2.0 (build tool)

UI/Styling:
- Tailwind CSS 3.4.3
- Framer Motion 12.23.12 (animations)
- Lucide React (icons)

State Management:
- Zustand 4.5.2

Backend Integration:
- Native Fetch API
- Firebase 12.3.0 (auth + storage)
- Google Generative AI 0.24.1 (Gemini)

Testing:
- Vitest 1.6.0
- Playwright 1.55.1 (E2E)

Deployment:
- Vercel (3 environments)
```

### Backend
```
Location: /Varie/Celerya_Cyber_Ateco/

Core:
- Python 3.11
- FastAPI (REST API)
- Uvicorn (ASGI server)

Data Processing:
- Pandas (data manipulation)
- OpenPyXL (Excel files)
- PyYAML (YAML configs)

PDF Processing:
- pdfplumber
- PyPDF2

Deployment:
- Railway (production)
```

### Data Storage
```
Current (Hybrid - Migration in Progress):
- PostgreSQL (Railway addon) ✅ NEW
  • Connection pooling (20+10 connections)
  • 6 tables schema designed
  • Health check endpoint active
  • Phase 2: Data migration in progress

- JSON files (MAPPATURE_EXCEL_PERFETTE.json) - Migrating to DB
- Excel files (tabella_ATECO.xlsx) - Migrating to DB
- YAML configs (mapping.yaml) - Migrating to DB

Target (Phase 2 Completion):
- 100% PostgreSQL for all persistent data
- JSON/Excel only for configuration files
```

### External APIs
```
- Google Gemini AI (Syd assistant)
- Firebase (authentication)
- Vercel (frontend hosting)
- Railway (backend hosting)
```

---

## 🚀 DEPLOYMENT

### Production Environments

#### Frontend (Vercel)
```
Dario:    https://syd-cyber-dario.vercel.app
Marcello: https://syd-cyber-marcello.vercel.app
Claudio:  https://syd-cyber-claudio.vercel.app

Status: ✅ Online 24/7
Deploy: Automatic on git push
Region: Global CDN
```

#### Backend (Railway)
```
Production: https://web-production-3373.up.railway.app

Status: ✅ Online 24/7
Deploy: Automatic on git push
Region: US/Europe
Runtime: Python 3.11
```

### Development Environments

#### Frontend Local
```
Location: /Varie/syd_cyber/ui/
Command: npm run dev
URL: http://localhost:5173
Hot Reload: ✅ Enabled
```

#### Backend Local
```
Location: /Varie/Celerya_Cyber_Ateco/
Command: python main.py
URL: http://localhost:8000
Docs: http://localhost:8000/docs (Swagger)
```

---

## 📈 SUCCESS METRICS

### Technical Metrics (Current Focus)
- ✅ Frontend uptime: 99%+
- ✅ Backend uptime: 99%+
- ⚠️ API response time: <500ms (needs optimization)
- ⚠️ Risk assessment completion rate: Track this
- ❌ Test coverage: 0% (needs implementation)
- ❌ Error rate: Not tracked (needs monitoring)

### Business Metrics (Future)
- Number of completed risk assessments
- Average assessment completion time
- Consultant satisfaction score
- SME clients served
- Revenue per consultant
- Customer retention rate

### User Experience Metrics (Future)
- Time to complete first assessment
- Syd AI interaction quality
- Report generation success rate
- User task completion rate
- Feature usage analytics
- Support ticket volume

---

## 🎯 NEXT MILESTONES

### Immediate (Next 2 Weeks)
1. ✅ Complete documentation suite
2. 🔧 Integrate ATECO lookup module
3. 🔧 Fix environment variables
4. 🗄️ Implement database layer

### Short Term (1 Month)
1. 📄 Real visura extraction
2. 🗺️ Complete seismic database
3. 🧪 Add automated tests
4. 📊 Implement monitoring

### Medium Term (2-3 Months)
1. 🔐 Security hardening
2. 📈 Performance optimization
3. 🎨 UI/UX improvements
4. 📱 Mobile responsiveness
5. 🌍 Multi-language support

### Long Term (6+ Months)
1. 🏢 Enterprise features
2. 📊 Advanced analytics
3. 🤖 Enhanced AI capabilities
4. 🔌 Third-party integrations
5. 💼 White-label version

---

## 📞 CONTACT & RESOURCES

### Project Owner
**Claudio (Clo)**
Role: Developer, Project Lead

### Key Resources
- Frontend Repo: `/Varie/syd_cyber/ui/`
- Backend Repo: `/Varie/Celerya_Cyber_Ateco/`
- Documentation: See docs/ folder
- BMAD Guide: `docs/BMAD_COMPLETE_GUIDE.md`

### External Links
- Frontend Production: See deployment section
- Backend API: https://web-production-3373.up.railway.app
- API Docs: https://web-production-3373.up.railway.app/docs

---

## 📝 DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 7, 2025 | Claude + Clo | Initial comprehensive overview |
| 1.1 | Oct 10, 2025 | Claude + Clo | Updated with database Phase 1 completion, increased completion to 80% |

---

## 🚀 CONCLUSION

SYD Cyber is a promising platform with **strong fundamentals** and **clear market need**. The frontend is polished, the AI assistant is functional, and the core risk assessment engine works well.

**Key strengths:**
- ✅ Well-defined target audience
- ✅ Unique value proposition (AI + Italian focus)
- ✅ Working prototype with real users
- ✅ Clear roadmap for improvement

**Priority improvements:**
- 🔧 Complete ATECO integration (critical)
- 🗄️ Add database persistence (critical)
- 📄 Real visura extraction (high value)
- 🧪 Testing infrastructure (quality)

**With focused development over the next 2-3 months, SYD Cyber can move from prototype to production-ready platform.**

---

*This document is part of the SYD Cyber documentation suite. For technical details, see ARCHITECTURE.md and TECHNICAL_REFERENCE.md. For development workflow, see DEVELOPMENT_GUIDE.md.*
