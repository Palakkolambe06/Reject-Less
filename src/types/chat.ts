export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
  isError?: boolean;
}

export interface ChatContext {
  role?: string;
  batchId?: string;
  materialCategory?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  readinessScore?: number;
  incompleteChecklistItems?: string[];
}

export interface ChatApiResponse {
  success: boolean;
  configured: boolean;
  text?: string;
  error?: string;
  model?: string;
}

export interface GeminiStatusResponse {
  configured: boolean;
  model: string;
  provider: string;
}
