import React, { useState, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { useChat } from '../../hooks/useChat';
import { useSimulationContext } from '../../hooks/useSimulationContext';
import type { ChatBotProps } from '../../types/chat';

export const ChatBot: React.FC<ChatBotProps> = ({ 
  className = '',
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearChat,
    session 
  } = useChat();
  
  const { simulationData } = useSimulationContext();

  // Resetuj wskaźnik nowej wiadomości gdy czat jest otwarty
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Pokaż wskaźnik nowej wiadomości gdy czat jest zamknięty i przychodzi odpowiedź
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.messageType === 'assistant') {
        setHasNewMessage(true);
      }
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message, simulationData);
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
    }
  };

  const handleClearChat = () => {
    clearChat();
    setHasNewMessage(false);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6 sm:bottom-8 sm:right-8',
    'bottom-left': 'bottom-6 left-6 sm:bottom-8 sm:left-8',
    'top-right': 'top-6 right-6 sm:top-8 sm:right-8',
    'top-left': 'top-6 left-6 sm:top-8 sm:left-8'
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 max-w-sm ${className}`}
      role="complementary"
      aria-label="Asystent AI ZUS"
      style={{ 
        maxHeight: 'calc(100vh - 3rem)',
        maxWidth: 'calc(100vw - 3rem)'
      }}
    >
      {/* Okno czatu */}
      {isOpen && (
        <div className="mb-4">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClose={handleToggle}
            onClearChat={handleClearChat}
            simulationData={simulationData}
            theme={theme}
            sessionId={session?.sessionId}
          />
        </div>
      )}

      {/* Bubble czatu - pokazuj tylko gdy czat jest zamknięty */}
      {!isOpen && (
        <ChatBubble
          isOpen={isOpen}
          hasNewMessage={hasNewMessage}
          onClick={handleToggle}
          theme={theme}
          messageCount={messages.length}
        />
      )}
    </div>
  );
};