
import type { UploadFile } from '../types';

// TODO: Replace this with a real API call to a service like FastAPI with a language model backend.

/**
 * Simulates an API call to the SYD assistant.
 * @param message The user's message.
 * @param files A list of uploaded files (optional).
 * @returns An async generator that yields chunks of the agent's response.
 */
export async function* sendMessage(message: string, files?: UploadFile[]): AsyncGenerator<string> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));

  const lowerCaseMessage = message.toLowerCase();
  let response = "I'm sorry, I don't have a specific response for that. I am a demo assistant. Try asking about 'New BIA' or 'Set ATECO'.";

  if (lowerCaseMessage.includes('bia')) {
    response = "Of course, let's start a new Business Impact Analysis. To begin, please provide the ATECO code for the company. You can also upload relevant documents like the company's registration certificate (Visura Camerale).";
  } else if (lowerCaseMessage.includes('ateco')) {
    response = "The ATECO code has been set. The next step is to identify the company's critical assets. Could you please list them or describe the company's core business processes?";
  } else if (files && files.length > 0) {
    const fileNames = files.map(f => f.file.name).join(', ');
    response = `Thank you for uploading the following document(s): ${fileNames}. I will now analyze their content to assist with the Business Impact Analysis.`;
  }

  // Simulate a streaming response
  const chunks = response.split(' ');
  for (const chunk of chunks) {
    yield chunk + ' ';
    await new Promise(resolve => setTimeout(resolve, 50)); // Delay between chunks
  }
}
