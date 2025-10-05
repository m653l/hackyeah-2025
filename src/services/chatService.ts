import { supabase } from '../utils/supabaseClient';
import { geminiService } from './geminiService';
import type { 
  ChatService, 
  ChatRequest, 
  ChatResponse, 
  ChatMessage, 
  ChatSession, 
  SimulationData 
} from '../types/chat';

class ChatServiceImpl implements ChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const startTime = Date.now();
      
      // Buduj kontekst dla AI
      let contextPrompt = '';
      if (request.context?.simulationData) {
        contextPrompt = geminiService.buildContextPrompt(request.context.simulationData);
      }

      // Dodaj historię rozmowy do kontekstu
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        const recentHistory = request.conversationHistory
          .slice(-6) // Ostatnie 6 wiadomości
          .map(msg => `${msg.messageType === 'user' ? 'UŻYTKOWNIK' : 'ASYSTENT'}: ${msg.content}`)
          .join('\n');
        
        contextPrompt += contextPrompt ? '\n\nHISTORIA ROZMOWY:\n' + recentHistory : 'HISTORIA ROZMOWY:\n' + recentHistory;
      }

      // Generuj odpowiedź
      const response = await geminiService.generateResponse(request.message, contextPrompt);
      
      const processingTime = Date.now() - startTime;

      return {
        response,
        timestamp: new Date(),
        metadata: {
          processingTime,
          tokensUsed: response.length // Przybliżona liczba tokenów
        }
      };
    } catch (error) {
      console.error('Błąd w ChatService.sendMessage:', error);
      throw new Error('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
    }
  }

  async saveChatHistory(sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      // Zapisz tylko nowe wiadomości (te bez ID w bazie)
      const messagesToSave = messages.filter(msg => !msg.id.startsWith('temp-'));
      
      if (messagesToSave.length === 0) return;

      // Najpierw znajdź UUID sesji na podstawie session_id
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Nie znaleziono sesji:', sessionError);
        return;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(
          messagesToSave.map(msg => ({
            session_id: sessionData.id, // Używamy UUID zamiast string
            message_type: msg.messageType === 'assistant' ? 'ai' : msg.messageType, // Mapuj 'assistant' na 'ai'
            content: msg.content,
            metadata: msg.metadata || {}
          }))
        );

      if (error) {
        console.error('Błąd podczas zapisywania historii czatu:', error);
        throw error;
      }
    } catch (error) {
      console.error('Błąd w ChatService.saveChatHistory:', error);
      // Nie rzucamy błędu - historia czatu nie jest krytyczna
    }
  }

  async loadChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      // Najpierw znajdź UUID sesji na podstawie session_id
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Nie znaleziono sesji:', sessionError);
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionData.id) // Używamy UUID
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Błąd podczas ładowania historii czatu:', error);
        return [];
      }

      return (data || []).map(msg => ({
        id: msg.id,
        sessionId: sessionId, // Zwracamy oryginalny sessionId
        messageType: msg.message_type === 'ai' ? 'assistant' : msg.message_type, // Mapuj 'ai' na 'assistant'
        content: msg.content,
        createdAt: new Date(msg.created_at),
        metadata: msg.metadata
      }));
    } catch (error) {
      console.error('Błąd w ChatService.loadChatHistory:', error);
      return [];
    }
  }

  async createSession(): Promise<ChatSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Błąd podczas tworzenia sesji czatu:', error);
        throw error;
      }

      return {
        id: data.id,
        sessionId: data.session_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isActive: data.is_active
      };
    } catch (error) {
      console.error('Błąd w ChatService.createSession:', error);
      // Fallback - zwróć sesję lokalną
      const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: sessionId,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
    }
  }

  async saveSimulationContext(sessionId: string, data: SimulationData): Promise<void> {
    try {
      // Najpierw znajdź UUID sesji na podstawie session_id
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Nie znaleziono sesji:', sessionError);
        return;
      }

      const { error } = await supabase
        .from('simulation_context')
        .insert({
          session_id: sessionData.id, // Używamy UUID
          simulation_data: data
        });

      if (error) {
        console.error('Błąd podczas zapisywania kontekstu symulacji:', error);
        throw error;
      }
    } catch (error) {
      console.error('Błąd w ChatService.saveSimulationContext:', error);
      // Nie rzucamy błędu - kontekst nie jest krytyczny
    }
  }

  async getQuickQuestions(): Promise<ChatMessage[]> {
    try {
      // Zwróć domyślne pytania - nie ma potrzeby ładować z bazy
      return this.getDefaultQuickQuestions();
    } catch (error) {
      console.error('Błąd w ChatService.getQuickQuestions:', error);
      return this.getDefaultQuickQuestions();
    }
  }

  private getDefaultQuickQuestions(): ChatMessage[] {
    const defaultQuestions = [
      'Jak działa system emerytalny w Polsce?',
      'Kiedy mogę przejść na emeryturę?',
      'Jak obliczane są składki ZUS?',
      'Co to jest kapitał początkowy?',
      'Jak zwiększyć wysokość emerytury?',
      'Co oznacza stopa zastąpienia?'
    ];

    return defaultQuestions.map((question, index) => ({
      id: `default-${index}`,
      sessionId: 'default',
      messageType: 'system' as const,
      content: question,
      createdAt: new Date(),
      metadata: {
        type: 'quick_question',
        category: 'general'
      }
    }));
  }
}

export const chatService = new ChatServiceImpl();