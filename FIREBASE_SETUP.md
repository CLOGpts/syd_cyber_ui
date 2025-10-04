# Firebase Authentication Setup - SYD Cyber

## Implementazione Completata

### File Creati

1. **src/config/firebase.ts**
   - Configurazione Firebase con validazione env vars
   - Export di `auth` e `db` (Firestore)
   - Logging errori inizializzazione

2. **src/hooks/useFirebaseAuth.ts**
   - Hook React per autenticazione
   - Funzioni: `login()`, `logout()`, `clearError()`
   - Observer stato auth con `onAuthStateChanged`
   - Messaggi errore tradotti in italiano

3. **firestore.rules**
   - Security rules per isolamento dati utente
   - Ogni utente può accedere solo ai propri dati
   - Collezioni: users, sessions, risks, reports, files

### File Modificati

1. **src/components/auth/Login.tsx**
   - Sostituito mock auth con Firebase Auth
   - Input email invece di select username
   - Gestione errori Firebase
   - Auto-login dopo autenticazione

2. **src/store/useStore.ts**
   - Aggiunto `userId` (Firebase UID)
   - Aggiunto `authToken`
   - Funzione `login()` ora accetta `(username, userId)`
   - Logout pulisce sessione completa

3. **src/components/layout/TopNav.tsx**
   - Integrato Firebase `signOut()`
   - Logout completo (Firebase + Store)

## Creazione Utenti Firebase

### Opzione 1: Firebase Console (Manuale)

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona progetto: **syd-cyber-prod**
3. Menu laterale → **Authentication**
4. Tab **Users** → Click **Add user**
5. Inserisci:
   - Email: `user@example.com`
   - Password: `your-password`
6. Click **Add user**

### Opzione 2: Firebase CLI (Batch)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Create users script
firebase functions:shell

# In Firebase shell:
admin.auth().createUser({
  email: 'dario@sydcyber.com',
  password: 'SecurePassword123!',
  displayName: 'Dario'
})
```

### Opzione 3: Script Node.js

Crea file `scripts/create-users.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const users = [
  { email: 'dario@sydcyber.com', password: 'Andrea17041992', displayName: 'Dario' },
  { email: 'dariom@sydcyber.com', password: 'Andrea17041992', displayName: 'Dario M.' },
  { email: 'marcello@sydcyber.com', password: 'Andrea17041992', displayName: 'Marcello' },
  { email: 'claudio@sydcyber.com', password: 'Andrea17041992', displayName: 'Claudio' }
];

async function createUsers() {
  for (const user of users) {
    try {
      const userRecord = await admin.auth().createUser(user);
      console.log('✅ Created user:', userRecord.email);
    } catch (error) {
      console.error('❌ Error creating user:', user.email, error);
    }
  }
}

createUsers().then(() => process.exit(0));
```

Esegui:
```bash
node scripts/create-users.js
```

## Deploy Firestore Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## Test Autenticazione

1. Build progetto: `npm run build`
2. Start dev server: `npm run dev`
3. Apri browser: http://localhost:5173
4. Login con credenziali Firebase create
5. Verifica console browser per log Firebase

## Credenziali Test (da creare)

```
Email: dario@sydcyber.com
Password: Andrea17041992

Email: dariom@sydcyber.com
Password: Andrea17041992

Email: marcello@sydcyber.com
Password: Andrea17041992

Email: claudio@sydcyber.com
Password: Andrea17041992
```

## Sicurezza

- ✅ Password minima 6 caratteri (Firebase default)
- ✅ Security rules isolano dati per userId
- ✅ No secrets in codice (uso env vars)
- ✅ Auth state persistence in localStorage
- ✅ Logout completo pulisce sessione

## Prossimi Passi

1. Creare utenti Firebase (vedi sopra)
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Testare login multi-utente
4. Verificare isolamento dati (ogni user vede solo i suoi)
5. Implementare Firestore persistence (opzionale, future task)

## Troubleshooting

### Error: "Invalid email"
- Verifica formato email corretto

### Error: "User not found"
- Utente non esiste in Firebase Authentication
- Crea utente tramite Console

### Error: "Wrong password"
- Password errata
- Reset password da Firebase Console

### Error: "Too many requests"
- Firebase rate limiting
- Aspetta qualche minuto

### Build errors
- Verifica env vars in `.env.local`
- Tutte le variabili `VITE_FIREBASE_*` devono essere presenti
