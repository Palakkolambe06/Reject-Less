import { ChatMessage, ChatContext, ChatApiResponse, GeminiStatusResponse } from '../../types/chat';

class GeminiChatService {
  /**
   * Check whether the Gemini API key is configured on the backend
   */
  public async checkStatus(): Promise<GeminiStatusResponse> {
    try {
      const res = await fetch('/api/gemini/status');
      if (!res.ok) {
        return {
          configured: false,
          model: 'gemini-3.8-flash',
          provider: 'Google Gemini API',
        };
      }
      return await res.json();
    } catch {
      return {
        configured: false,
        model: 'gemini-3.8-flash',
        provider: 'Google Gemini API',
      };
    }
  }

  /**
   * Send a chat message with conversation history and optional application context
   */
  public async sendMessage(
    message: string,
    history: ChatMessage[],
    context?: ChatContext
  ): Promise<ChatApiResponse> {
    try {
      const formattedHistory = history.map((h) => ({
        role: h.role,
        text: h.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: formattedHistory,
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          configured: data.configured ?? false,
          error: data.error || `HTTP error: ${res.statusText}`,
        };
      }

      return data;
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        configured: false,
        error: error.message || 'Network error communicating with RejectLess AI Assistant.',
      };
    }
  }
}

export const geminiChatService = new GeminiChatService();
