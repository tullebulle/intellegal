import OpenAI from 'openai';
import { ChatMessage } from '../types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getChatCompletion(messages: any): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: typeof messages === 'string' ? [{ role: 'user', content: messages }] : messages,
      model: 'gpt-3.5-turbo',
    });

    return completion.choices[0].message.content || 'No response';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from AI');
  }
}

export async function getReformulation(text: string): Promise<string> {
  try {
    const systemPrompt = "Du er en ekspert på norsk språk og grammatikk. Din oppgave er å reformulere teksten som blir gitt på en måte som gjør den mer presis og grammatisk korrekt, samtidig som du bevarer den opprinnelige betydningen. Gjør kun nødvendige endringer.";
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'gpt-3.5-turbo',
    });

    return completion.choices[0].message.content || 'Kunne ikke reformulere teksten';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Kunne ikke reformulere teksten');
  }
} 