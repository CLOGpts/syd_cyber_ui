// ui/src/api/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export async function fetchGeminiAteco(code: string) {
  try {
    console.log("🔎 Chiamata a Gemini per codice:", code);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Sei un consulente esperto in rischio e compliance.
Codice ATECO: ${code}

1. Titolo ufficiale
2. Settore merceologico
3. Normative rilevanti
4. Certificazioni comuni
5. Principali rischi

Rispondi SOLO in JSON con questa struttura:

{
  "titolo": "...",
  "settore": "...",
  "normative": ["..."],
  "certificazioni": ["..."],
  "rischi": ["..."]
}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ Risposta grezza Gemini:", text);

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/); // prende solo il JSON
      if (!jsonMatch) throw new Error("Nessun JSON trovato");
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("📨 JSON parsato Gemini:", parsed);
      return parsed;
    } catch (err) {
      console.warn("⚠️ Gemini ha risposto male, fallback:", text);
      return { raw: text };
    }
  } catch (err) {
    console.error("❌ Errore Gemini API:", err);
    return null;
  }
}
