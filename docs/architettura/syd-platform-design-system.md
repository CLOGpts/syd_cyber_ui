# 🎨 SYD PLATFORM DESIGN SYSTEM
## Sistema di Design Condiviso per SYD Cyber e SYD Prototipo

---

## 📐 ARCHITETTURA DEL DESIGN

### Principi Fondamentali
- **Consistenza**: Stesso look & feel su entrambi i verticali
- **Modularità**: Componenti riutilizzabili tra i progetti
- **Accessibilità**: Dark mode nativo, contrasti ottimizzati
- **Professionalità**: Design enterprise-grade

---

## 🎨 PALETTE COLORI

### Colori Primari (Blue Modern Palette)
```css
/* QUESTI COLORI VANNO IN ENTRAMBI I PROGETTI */
:root {
  /* Primary - Sky Blue Vibrante */
  --primary: #0EA5E9;        /* sky-500 */
  --primary-dark: #0284C7;   /* sky-600 */
  --primary-light: #38BDF8;  /* sky-400 */

  /* Secondary - Blue Classico */
  --secondary: #3B82F6;      /* blue-500 */
  --secondary-dark: #2563EB; /* blue-600 */
  --secondary-light: #60A5FA;/* blue-400 */

  /* Accent - Indigo */
  --accent: #6366F1;         /* indigo-500 */
  --accent-dark: #4F46E5;    /* indigo-600 */
  --accent-light: #818CF8;   /* indigo-400 */
}
```

### Tailwind Config Base
```js
colors: {
  primary: {
    light: '#3b82f6',    // blue-500
    DEFAULT: '#2563eb',  // blue-600
    dark: '#1d4ed8',     // blue-700
  },
  header: {
    light: '#1e3a8a',    // blue-800
    dark: '#1e293b',     // slate-800
  },
  background: {
    light: '#f1f5f9',    // slate-100
    dark: '#0f172a',     // slate-900
  },
  card: {
    light: '#ffffff',
    dark: '#1e293b',     // slate-800
  },
  text: {
    light: '#1e293b',    // slate-800
    dark: '#e2e8f0',     // slate-200
  },
  'text-muted': {
    light: '#64748b',    // slate-500
    dark: '#94a3b8',     // slate-400
  }
}
```

---

## 🎯 COMPONENTI STANDARD

### 1. Message Bubble (Chat)
```tsx
// Classe Agent
'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'

// Classe User
'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
```

### 2. Avatar Icons
```tsx
// Agent Avatar
'bg-gradient-to-br from-sky-500 to-blue-600'

// User Avatar
'bg-gradient-to-br from-blue-500 to-indigo-600'
```

### 3. Card Components
```tsx
// Card Base
'bg-card-light dark:bg-card-dark rounded-2xl shadow-lg'

// Card Hover
'hover:shadow-xl transition-all duration-300'

// Card Border
'border border-slate-200 dark:border-slate-700'
```

### 4. Button Styles
```tsx
// Primary Button
'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700'

// Secondary Button
'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'

// Danger Button
'bg-red-500 hover:bg-red-600 text-white'

// Success Button
'bg-green-500 hover:bg-green-600 text-white'
```

---

## 🌓 DARK MODE

### Implementazione
```tsx
// Sempre usare classi Tailwind con dark:
className="bg-white dark:bg-slate-900"

// Toggle Dark Mode
darkMode: 'class' // in tailwind.config.js
```

---

## ✨ ANIMAZIONI

### Framer Motion Standards
```tsx
// Slide in from side
const messageVariants = {
  hidden: {
    opacity: 0,
    x: isAgent ? -50 : 50,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.5
    }
  }
};

// Fade In
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Scale Up
const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200 }
  }
};
```

---

## 📏 SPACING & LAYOUT

### Padding/Margin Scale
```
p-1 = 0.25rem (4px)
p-2 = 0.5rem (8px)
p-3 = 0.75rem (12px)
p-4 = 1rem (16px)
p-6 = 1.5rem (24px)
p-8 = 2rem (32px)
```

### Container Widths
```tsx
// Chat Messages
'max-w-[85%] sm:max-w-[90%] lg:max-w-[95%]'

// Cards
'w-full max-w-4xl mx-auto'

// Modals
'max-w-md sm:max-w-lg md:max-w-xl'
```

---

## 🔤 TYPOGRAPHY

### Font Sizes
```tsx
// Headings
'text-3xl font-bold'    // H1
'text-2xl font-semibold' // H2
'text-xl font-medium'    // H3
'text-lg font-medium'    // H4

// Body
'text-base'             // Normal text
'text-sm'               // Small text
'text-xs'               // Extra small

// Muted
'text-text-muted-light dark:text-text-muted-dark'
```

---

## 🎭 ICONE (Lucide React)

### Set Standard
```tsx
import {
  Bot,           // Agent/AI
  User,          // Utente
  Copy,          // Copia
  Check,         // Conferma
  X,             // Chiudi
  AlertTriangle, // Warning
  Info,          // Informazione
  ChevronRight,  // Navigazione
  FileText,      // Documento
  Upload,        // Carica
  Download,      // Scarica
  Settings,      // Impostazioni
} from 'lucide-react';
```

---

## 🔲 CUSTOM SCROLLBAR

```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```tsx
// Tailwind Default
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

---

## 🚀 IMPLEMENTAZIONE IN SYD_PROTOTIPO

### Step 1: Installa dipendenze
```bash
npm install tailwindcss framer-motion lucide-react
```

### Step 2: Copia tailwind.config.js
Usa la stessa configurazione di SYD Cyber

### Step 3: Copia custom.css
Usa gli stessi stili CSS custom

### Step 4: Applica classi ai componenti
Mantieni le tue funzionalità ma usa le classi del design system

---

## ✅ CHECKLIST INTEGRAZIONE

- [ ] Colori primari/secondari/accent implementati
- [ ] Dark mode funzionante
- [ ] Animazioni Framer Motion
- [ ] Typography consistente
- [ ] Custom scrollbar
- [ ] Responsive design
- [ ] Icone Lucide React
- [ ] Card components con stesso stile
- [ ] Button styles uniformi
- [ ] Message bubbles (se hai chat)

---

## 📝 NOTE IMPORTANTI

1. **NON CAMBIARE** le funzionalità specifiche di ogni verticale
2. **MANTIENI** la stessa struttura di navigazione dove possibile
3. **USA** sempre le variabili CSS per i colori
4. **TESTA** sempre in light e dark mode
5. **DOCUMENTA** eventuali variazioni necessarie

---

## 🔗 RIFERIMENTI

- **SYD Cyber**: Risk Management & ATECO Analysis
- **SYD Prototipo**: Food Safety & Document Processing
- **Backend Condiviso**: Railway API (3000+ ATECO codes)
- **Comunicazioni**: Database/comunicazioni/comunicazioni.txt

---

Ultimo aggiornamento: 2025-09-18
Versione: 1.0.0