import React, { useEffect, useRef } from 'react';
import { X, Trash2, MessageSquare, Sparkles, Bot, User } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickQuestions } from './QuickQuestions';
import type { ChatWindowProps } from '../../types/chat';

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClose,
  onClearChat,
  simulationData,
  theme = 'light',
  sessionId,
  className = ''
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  // Auto-focus na input gdy okno się otwiera
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = windowRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const themeClasses = {
    light: {
      window: 'bg-white border-gray-200 shadow-2xl',
      header: 'bg-zus-green-primary text-white',
      headerButton: 'text-white hover:bg-zus-green-secondary',
      content: 'bg-gray-50'
    },
    dark: {
      window: 'bg-gray-800 border-gray-600 shadow-2xl',
      header: 'bg-zus-green-secondary text-white',
      headerButton: 'text-gray-300 hover:bg-zus-green-primary',
      content: 'bg-gray-700'
    }
  };

  const currentTheme = themeClasses[theme];

  const handleQuickQuestion = (question: string) => {
    onSendMessage(question);
  };

  return (
    <div 
      ref={windowRef}
      className={`
        w-96 h-[600px] rounded-lg border-2 flex flex-col
        ${currentTheme.window}
        animate-in slide-in-from-bottom-4 duration-300
        ${className}
      `}
      role="dialog"
      aria-labelledby="chat-title"
      aria-describedby="chat-description"
    >
      {/* Header - sticky na górze */}
      <div className={`${currentTheme.header} px-4 py-3 flex items-center justify-between sticky top-0 z-10`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 id="chat-title" className="font-semibold text-sm">
              Asystent ZUS
            </h2>
            <p id="chat-description" className="text-xs opacity-90">
              Pytaj o emerytury i ZUS
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Przycisk czyszczenia czatu */}
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className={`
                p-2 rounded-md transition-colors duration-200
                ${currentTheme.headerButton}
              `}
              aria-label="Wyczyść historię czatu"
              title="Wyczyść czat"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
          
          {/* Przycisk zamknięcia */}
          <button
            onClick={onClose}
            className={`
              p-2 rounded-md transition-colors duration-200
              ${currentTheme.headerButton}
            `}
            aria-label="Zamknij czat"
            title="Zamknij"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Kontekst symulacji - sticky pod headerem */}
      {simulationData && (
        <div className="px-4 py-2 bg-zus-green-light border-b border-zus-green-secondary sticky top-[60px] z-10">
          <div className="flex items-center space-x-2">
            <User size={14} className="text-zus-green-primary" aria-hidden="true" />
            <span className="text-xs text-zus-green-primary">
              Kontekst: {simulationData.age ? `${simulationData.age} lat` : 'Symulacja'}, 
              {simulationData.salary ? ` ${simulationData.salary.toLocaleString('pl-PL')} zł` : ''}
              {simulationData.calculatedPension ? `, emerytura: ${simulationData.calculatedPension.toLocaleString('pl-PL')} zł` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Zawartość czatu - przewijalna */}
      <div className={`flex-1 flex flex-col overflow-hidden ${currentTheme.content}`}>
        {messages.length === 0 ? (
          /* Ekran powitalny z szybkimi pytaniami */
          <div className="flex-1 p-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-zus-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot size={32} className="text-zus-green-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Witaj w Asystencie ZUS!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Jestem tutaj, aby pomóc Ci zrozumieć system emerytalny w Polsce. 
                Możesz zadać mi pytanie lub wybrać jedno z poniższych:
              </p>
            </div>
            
            <QuickQuestions 
              onQuestionClick={handleQuickQuestion}
              theme={theme}
            />
          </div>
        ) : (
          /* Lista wiadomości - przewijalna */
          <div className="flex-1 overflow-y-auto">
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              theme={theme}
            />
          </div>
        )}

        {/* Input wiadomości - sticky na dole */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <MessageInput 
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            theme={theme}
            placeholder="Zapytaj o ZUS, emerytury, składki..."
          />
        </div>
      </div>

      {/* Informacja o sesji (tylko w trybie deweloperskim) */}
      {process.env.NODE_ENV === 'development' && sessionId && (
        <div className="px-2 py-1 bg-gray-100 border-t text-xs text-gray-500 text-center">
          Sesja: {sessionId.slice(-8)}
        </div>
      )}
    </div>
  );
};