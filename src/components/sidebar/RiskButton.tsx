import React from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../../store/useChat';

const RiskButton: React.FC = () => {
  const { addMessage, messages } = useChatStore();
  
  const handleClick = () => {
    console.log('🚀 RISK BUTTON CLICKED!');
    console.log('📝 Current messages:', messages.length);
    
    // Aggiungi messaggio ESATTAMENTE come ATECO
    const newMessage = {
      id: `risk-${Date.now()}`,
      text: `🛡️ **Benvenuto nel Risk Management!**
      
Sono qui per aiutarti con i rischi aziendali.

**Scegli una categoria:**
• 🔥 Danni fisici
• 💻 Sistemi informatici
• 🤝 Clienti e privacy
• 🔓 Frodi

Scrivi cosa ti interessa (es: "clienti")`,
      sender: 'agent',
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Adding message:', newMessage);
    addMessage(newMessage);
    console.log('✅ Message added! Total now:', messages.length + 1);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-orange-700 transition-all duration-200"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      🛡️ Risk Management TEST
    </motion.button>
  );
};

export default RiskButton;