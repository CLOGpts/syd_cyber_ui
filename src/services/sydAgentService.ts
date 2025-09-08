import { generateContextualPrompt } from '../data/sydKnowledge/systemPrompt';

// Configurazione Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class SydAgentService {
  private static instance: SydAgentService;
  
  private constructor() {}
  
  static getInstance(): SydAgentService {
    if (!SydAgentService.instance) {
      SydAgentService.instance = new SydAgentService();
    }
    return SydAgentService.instance;
  }

  async getResponse(
    userMessage: string,
    currentStep: string,
    selectedCategory?: string,
    selectedEvent?: string,
    currentQuestion?: number,
    lastMessages?: string[]
  ): Promise<string> {
    
    // Se non c'è API key, usa risposte di fallback
    if (!GEMINI_API_KEY) {
      return this.getFallbackResponse(userMessage, currentStep);
    }

    try {
      // Genera il prompt contestuale completo
      const systemPrompt = generateContextualPrompt(
        currentStep,
        selectedCategory,
        selectedEvent,
        currentQuestion,
        lastMessages
      );

      // Prepara la richiesta per Gemini
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: systemPrompt + '\n\nUtente: ' + userMessage + '\n\nSyd Agent (usa il metodo Socratico):'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      // Chiama Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return this.getFallbackResponse(userMessage, currentStep);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      return this.getFallbackResponse(userMessage, currentStep);
      
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return this.getFallbackResponse(userMessage, currentStep);
    }
  }

  private getFallbackResponse(userInput: string, currentStep: string): string {
    const input = userInput.toLowerCase();
    
    // Risposte di fallback basate sul metodo Socratico
    if (currentStep === 'categories' || currentStep === 'waiting_categories') {
      if (input.includes('quale') || input.includes('consiglio')) {
        return "Per guidarti nella scelta della categoria, aiutami a capire: qual è il tuo asset più critico? È un sistema informatico, un processo operativo o una risorsa fisica?";
      }
    }
    
    if (input.includes('nis2')) {
      return "La NIS2 richiede un approccio strutturato. Prima di tutto: sai già se la tua organizzazione rientra tra i soggetti essenziali o importanti? Questo determina il livello di compliance richiesto.";
    }
    
    if (input.includes('iso') || input.includes('27001')) {
      return "Per la ISO 27001:2022, partiamo dalle basi: hai già definito il perimetro del tuo SGSI? E quali processi intendi certificare?";
    }
    
    return "Interessante domanda. Per poterti guidare meglio, dimmi: stai cercando di rispondere a un requisito normativo specifico o stai facendo un'analisi preventiva?";
  }
}