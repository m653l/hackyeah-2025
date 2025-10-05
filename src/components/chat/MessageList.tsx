import React, { useEffect, useRef } from 'react';
import { User, Bot, Loader2, Clock, CheckCircle } from 'lucide-react';
import type { MessageListProps } from '../../types/chat';

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  theme = 'light',
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const themeClasses = {
    light: {
      container: 'bg-gray-50',
      userMessage: 'bg-zus-green-primary text-white',
      assistantMessage: 'bg-white text-gray-800 border border-gray-200',
      systemMessage: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      timestamp: 'text-gray-500',
      loadingDots: 'bg-gray-400'
    },
    dark: {
      container: 'bg-gray-700',
      userMessage: 'bg-zus-green-primary text-white',
      assistantMessage: 'bg-gray-600 text-gray-100 border border-gray-500',
      systemMessage: 'bg-yellow-900 text-yellow-200 border border-yellow-700',
      timestamp: 'text-gray-400',
      loadingDots: 'bg-gray-300'
    }
  };

  const currentTheme = themeClasses[theme];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.messageType === 'user';
    const isSystem = message.messageType === 'system';
    const isAssistant = message.messageType === 'assistant';

    return (
      <div
        key={message.id || index}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[85%]`}>
          {/* Avatar */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${isUser ? 'bg-zus-green-primary text-white ml-2' : 'bg-gray-200 text-gray-600 mr-2'}
            ${isSystem ? 'bg-yellow-200 text-yellow-800' : ''}
          `}>
            {isUser ? (
              <User size={16} aria-hidden="true" />
            ) : isSystem ? (
              <Clock size={16} aria-hidden="true" />
            ) : (
              <Bot size={16} aria-hidden="true" />
            )}
          </div>

          {/* Wiadomość */}
          <div className={`
            px-4 py-2 rounded-lg shadow-sm
            ${isUser ? currentTheme.userMessage : 
              isSystem ? currentTheme.systemMessage : 
              currentTheme.assistantMessage}
          `}>
            {/* Treść wiadomości */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Timestamp i metadata */}
            <div className={`
              flex items-center justify-between mt-2 text-xs
              ${currentTheme.timestamp}
            `}>
              <span>
                {message.createdAt ? formatTimestamp(message.createdAt) : 'Teraz'}
              </span>
              
              {/* Status dostarczenia (tylko dla wiadomości użytkownika) */}
              {isUser && (
                <CheckCircle size={12} className="opacity-60" aria-hidden="true" />
              )}
              
              {/* Czas przetwarzania (tylko dla odpowiedzi asystenta) */}
              {isAssistant && message.metadata?.processingTime && (
                <span className="opacity-60">
                  {(message.metadata.processingTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-2 max-w-[85%]">
        {/* Avatar asystenta */}
        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 mr-2">
          <Bot size={16} aria-hidden="true" />
        </div>

        {/* Animacja pisania */}
        <div className={`
          px-4 py-3 rounded-lg shadow-sm
          ${currentTheme.assistantMessage}
        `}>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Asystent pisze</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`
                    w-2 h-2 rounded-full animate-bounce
                    ${currentTheme.loadingDots}
                  `}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`
        p-4 space-y-2
        ${currentTheme.container}
        ${className}
      `}
      role="log"
      aria-label="Historia rozmowy z asystentem"
      aria-live="polite"
    >
      {/* Wiadomości */}
      {messages.map((message, index) => renderMessage(message, index))}
      
      {/* Wskaźnik ładowania */}
      {isLoading && <LoadingIndicator />}
      
      {/* Pusty element do auto-scroll */}
      <div ref={messagesEndRef} aria-hidden="true" />
      
      {/* Informacja gdy brak wiadomości */}
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          <Bot size={48} className="mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p className="text-sm">
            Rozpocznij rozmowę zadając pytanie o ZUS lub emerytury
          </p>
        </div>
      )}
    </div>
  );
};