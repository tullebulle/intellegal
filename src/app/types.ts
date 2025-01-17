// Define the type for our legal resources
export interface LegalResource {
  id: string;
  law_name: string;
  law_abbreviation: string;
  title: string;
  chapter: number;
  paragraph: number;
  content: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
} 