import React from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import type { ChatBubbleProps } from '../../types/chat';

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen,
  hasNewMessage = false,
  onClick,
  theme = 'light',
  messageCount = 0,
  className = ''
}) => {
  const themeClasses = {
    light: {
      bubble: 'bg-zus-green-primary hover:bg-zus-green-secondary text-white shadow-lg',
      notification: 'bg-red-500',
      pulse: 'animate-pulse bg-zus-green-light'
    },
    dark: {
      bubble: 'bg-zus-green-primary hover:bg-zus-green-secondary text-white shadow-lg',
      notification: 'bg-red-500',
      pulse: 'animate-pulse bg-zus-green-light'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <button
      onClick={onClick}
      className={`
        relative w-14 h-14 rounded-full transition-all duration-300 ease-in-out
        ${currentTheme.bubble}
        ${isOpen ? 'scale-110' : 'scale-100 hover:scale-105'}
        focus:outline-none focus:ring-4 focus:ring-zus-green-light focus:ring-opacity-50
        active:scale-95
        ${className}
      `}
      aria-label={isOpen ? 'Zamknij czat' : 'Otwórz czat z asystentem ZUS'}
      aria-expanded={isOpen}
      type="button"
    >
      {/* Ikona główna */}
      <div className="flex items-center justify-center w-full h-full">
        {isOpen ? (
          <X 
            size={24} 
            className="transition-transform duration-200" 
            aria-hidden="true"
          />
        ) : (
          <div className="relative">
            <MessageCircle 
              size={24} 
              className="transition-transform duration-200" 
              aria-hidden="true"
            />
            {/* Ikona AI/Sparkles */}
            <Sparkles 
              size={12} 
              className="absolute -top-1 -right-1 text-yellow-300" 
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Wskaźnik nowej wiadomości */}
      {hasNewMessage && !isOpen && (
        <div 
          className={`
            absolute -top-1 -right-1 w-4 h-4 rounded-full 
            ${currentTheme.notification}
            flex items-center justify-center
            animate-bounce
          `}
          aria-label="Nowa wiadomość"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Licznik wiadomości (opcjonalny) */}
      {messageCount > 0 && !hasNewMessage && !isOpen && (
        <div 
          className={`
            absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full 
            bg-gray-600 text-white text-xs
            flex items-center justify-center
            border-2 border-white
          `}
          aria-label={`${messageCount} wiadomości w historii`}
        >
          {messageCount > 99 ? '99+' : messageCount}
        </div>
      )}

      {/* Efekt pulsowania gdy czat jest aktywny */}
      {isOpen && (
        <div 
          className={`
            absolute inset-0 rounded-full 
            ${currentTheme.pulse}
            opacity-75
          `}
          aria-hidden="true"
        />
      )}

      {/* Tooltip */}
      <div 
        className={`
          absolute bottom-full right-0 mb-2 px-3 py-1 
          bg-gray-900 text-white text-sm rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap
          ${isOpen ? 'hidden' : 'block'}
        `}
        role="tooltip"
      >
        Zapytaj o ZUS i emerytury
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </button>
  );
};