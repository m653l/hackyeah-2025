import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import { contextService } from '../services/contextService';
import type { 
  ChatMessage, 
  ChatSession, 
  SimulationData, 
  UseChatReturn 
} from '../types/chat';

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<ChatSession | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Aktualizuj ref przy zmianie stanu
  useEffect(() => {
    sessionRef.current = session;
    messagesRef.current = messages;
  }, [session, messages]);

  // Inicjalizacja sesji
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const newSession = await chatService.createSession();
      setSession(newSession);
      
      // Załaduj historię czatu jeśli istnieje
      if (newSession.sessionId) {
        const history = await chatService.loadChatHistory(newSession.sessionId);
        setMessages(history);
      }
    } catch (error) {
      console.error('Błąd podczas inicjalizacji sesji czatu:', error);
      setError('Nie udało się zainicjalizować czatu');
    }
  };

  const sendMessage = useCallback(async (
    messageContent: string, 
    simulationData?: SimulationData | null
  ): Promise<void> => {
    if (!messageContent.trim() || isLoading) return;

    const currentSession = sessionRef.current;
    if (!currentSession) {
      setError('Sesja czatu nie jest zainicjalizowana');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Dodaj wiadomość użytkownika
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      sessionId: currentSession.sessionId,
      messageType: 'user',
      content: messageContent,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Przygotuj kontekst dla AI
      const context = simulationData ? {
        simulationData,
        sessionId: currentSession.sessionId
      } : undefined;

      // Wyślij zapytanie do AI
      const response = await chatService.sendMessage({
        message: messageContent,
        context,
        conversationHistory: messagesRef.current.slice(-10) // Ostatnie 10 wiadomości
      });

      // Dodaj odpowiedź asystenta
      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        sessionId: currentSession.sessionId,
        messageType: 'assistant',
        content: response.response,
        createdAt: response.timestamp,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Zapisz kontekst symulacji jeśli został podany
      if (simulationData) {
        try {
          await chatService.saveSimulationContext(currentSession.sessionId, simulationData);
        } catch (error) {
          console.warn('Nie udało się zapisać kontekstu symulacji:', error);
        }
      }

      // Zapisz historię czatu (asynchronicznie)
      const updatedMessages = [...messagesRef.current, userMessage, assistantMessage];
      chatService.saveChatHistory(currentSession.sessionId, updatedMessages)
        .catch(error => console.warn('Nie udało się zapisać historii czatu:', error));

    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      
      // Określ treść wiadomości błędu na podstawie typu błędu
      let errorContent = 'Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Spróbuj ponownie.';
      
      if (error instanceof Error) {
        if (error.message.includes('API') || error.message.includes('konfiguracja')) {
          errorContent = error.message;
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorContent = 'Osiągnięto limit zapytań. Spróbuj ponownie za chwilę.';
        }
      }
      
      // Dodaj wiadomość o błędzie
      const errorMessage: ChatMessage = {
        id: `temp-error-${Date.now()}`,
        sessionId: currentSession.sessionId,
        messageType: 'system',
        content: errorContent,
        createdAt: new Date(),
        metadata: { error: true }
      };

      setMessages(prev => [...prev, errorMessage]);
      setError('Błąd podczas wysyłania wiadomości');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Opcjonalnie utwórz nową sesję
    initializeSession();
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.messageType === 'user');

    if (lastUserMessage) {
      // Usuń ostatnią odpowiedź asystenta jeśli była błędna
      setMessages(prev => {
        const lastAssistantIndex = prev.map(msg => msg.messageType).lastIndexOf('assistant');
        if (lastAssistantIndex > -1) {
          return prev.slice(0, lastAssistantIndex);
        }
        return prev;
      });

      // Wyślij ponownie ostatnią wiadomość użytkownika
      const simulationData = contextService.getSimulationData();
      await sendMessage(lastUserMessage.content, simulationData);
    }
  }, [messages, sendMessage]);

  const getMessageById = useCallback((messageId: string): ChatMessage | undefined => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  const getMessagesByType = useCallback((messageType: ChatMessage['messageType']): ChatMessage[] => {
    return messages.filter(msg => msg.messageType === messageType);
  }, [messages]);

  const exportChatHistory = useCallback((): string => {
    const chatData = {
      session: session,
      messages: messages,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(chatData, null, 2);
  }, [session, messages]);

  const importChatHistory = useCallback((jsonData: string): boolean => {
    try {
      const chatData = JSON.parse(jsonData);
      if (chatData.messages && Array.isArray(chatData.messages)) {
        setMessages(chatData.messages);
        if (chatData.session) {
          setSession(chatData.session);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Błąd podczas importu historii czatu:', error);
      return false;
    }
  }, []);

  return {
    messages,
    isLoading,
    session,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
    getMessageById,
    getMessagesByType,
    exportChatHistory,
    importChatHistory
  };
};