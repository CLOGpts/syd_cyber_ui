// Test veloce Telegram Bot
console.log('🚀 Invio messaggio test a Telegram...\n');

const TOKEN = '8487460592:AAEPO3TCVVVVe4s7yHRiQNt-NY0Y5yQB3Xk';
const CHAT_ID = '5123398987';

fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: '✅ Test SYD CYBER - Funziona!'
  })
})
.then(res => res.json())
.then(data => {
  if (data.ok) {
    console.log('✅ SUCCESSO! Controlla Telegram sul telefono!\n');
    console.log('📱 Hai ricevuto il messaggio?\n');
  } else {
    console.log('❌ Errore:', data.description);
  }
})
.catch(err => {
  console.log('❌ Errore:', err.message);
});
