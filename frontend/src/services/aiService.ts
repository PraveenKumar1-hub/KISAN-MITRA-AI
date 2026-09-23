import api from './api';
import type { ChatResponse } from '../types/ai';

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/api/ai/chat', {
    message: message.trim()
  });
  return response.data;
}
