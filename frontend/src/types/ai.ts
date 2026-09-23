export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language?: string;
  timestamp: string;
  sources?: string[];
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  language: string;
  sources: string[];
  message?: string | null;
}
