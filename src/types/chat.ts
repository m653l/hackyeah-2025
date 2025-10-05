// Typy TypeScript dla czatbota AI ZUS na Plus

export interface ChatMessage {
  id: string;
  sessionId: string;
  messageType: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  metadata?: ChatMessageMetadata;
}

export interface ChatMessageMetadata {
  type?: 'quick_question' | 'context_question' | 'regular';
  category?: 'general' | 'contributions' | 'calculations' | 'optimization';
  simulationId?: string;
  isTyping?: boolean;
  error?: boolean;
  processingTime?: number;
  tokensUsed?: number;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SimulationContext {
  id: string;
  sessionId: string;
  simulationData: SimulationData;
  createdAt: Date;
}

export interface SimulationData {
  // Dane wejściowe użytkownika
  age?: number;
  gender?: 'male' | 'female';
  salary?: number;
  workStartYear?: number;
  retirementYear?: number;
  currentSavings?: number;
  contributionPeriod?: number;
  includeSickLeave?: boolean;
  professionalGroup?: string;
  
  // Wyniki kalkulacji
  calculatedPension?: number;
  realPension?: number;
  replacementRate?: number;
  totalContributions?: number;
  initialCapital?: number;
  
  // Prognozy
  delayBenefits?: {
    years: number;
    increasedPension: number;
    percentageIncrease: number;
  }[];
  
  // Kontekst powiatowy/zawodowy
  countyData?: {
    name: string;
    averagePension: number;
  };
  professionalData?: {
    code: string;
    name: string;
    averagePension: number;
  };
}

export interface QuickQuestion {
  id: string;
  content: string;
  category: 'general' | 'contributions' | 'calculations' | 'optimization';
  icon?: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  simulationContext: SimulationContext | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-pro';
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
}

export interface ChatResponse {
  response: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}

export interface ChatRequest {
  message: string;
  context?: {
    simulationData?: SimulationData;
    sessionId: string;
  };
  conversationHistory?: ChatMessage[];
}

// Hooki
export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  session: ChatSession | null;
  error: string | null;
  sendMessage: (message: string, simulationData?: SimulationData | null) => Promise<void>;
  clearChat: () => void;
  retryLastMessage: () => Promise<void>;
  getMessageById: (messageId: string) => ChatMessage | undefined;
  getMessagesByType: (messageType: ChatMessage['messageType']) => ChatMessage[];
  exportChatHistory: () => string;
  importChatHistory: (jsonData: string) => boolean;
}

export interface UseSimulationContextReturn {
  simulationData: SimulationData | null;
  isLoading: boolean;
  hasContext: boolean;
  updateSimulationData: (data: SimulationData) => void;
  clearSimulationData: () => void;
  refreshContext: () => Promise<void>;
  getContextSummary: () => string;
  isContextComplete: () => boolean;
  getContextQuality: () => 'none' | 'basic' | 'partial' | 'complete';
  extractFromCurrentPage: () => SimulationData | null;
  validateSimulationData: (data: SimulationData) => string[];
}

// Komponenty Props
export interface ChatBotProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
}

export interface ChatBubbleProps {
  isOpen: boolean;
  hasNewMessage?: boolean;
  onClick: () => void;
  theme?: 'light' | 'dark';
  messageCount?: number;
  className?: string;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
  onClearChat: () => void;
  simulationData?: SimulationData | null;
  theme?: 'light' | 'dark';
  sessionId?: string;
  className?: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export interface QuickQuestionsProps {
  onQuestionClick: (question: string) => void;
  theme?: 'light' | 'dark';
  maxQuestions?: number;
  className?: string;
}

// Serwisy
export interface ChatService {
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>;
  saveChatHistory: (sessionId: string, messages: ChatMessage[]) => Promise<void>;
  loadChatHistory: (sessionId: string) => Promise<ChatMessage[]>;
  createSession: () => Promise<ChatSession>;
  saveSimulationContext: (sessionId: string, data: SimulationData) => Promise<void>;
  getQuickQuestions: () => Promise<ChatMessage[]>;
}

export interface GeminiService {
  generateResponse: (message: string, context?: string) => Promise<string>;
  buildContextPrompt: (simulationData?: SimulationData) => string;
}

export interface ContextService {
  setSimulationData: (data: SimulationData) => void;
  getSimulationData: () => SimulationData | null;
  clearSimulationData: () => void;
  subscribe: (callback: (data: SimulationData | null) => void) => () => void;
  extractSimulationFromUrl: () => SimulationData | null;
  extractSimulationFromLocalStorage: () => SimulationData | null;
  extractSimulationFromSessionStorage: () => SimulationData | null;
  autoDetectSimulationContext: () => SimulationData | null;
  buildContextSummary: (data: SimulationData) => string;
  extractSimulationFromDOM: () => SimulationData | null;
}