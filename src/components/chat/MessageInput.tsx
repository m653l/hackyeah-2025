import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import type { MessageInputProps } from '../../types/chat';

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  theme = 'light',
  placeholder = 'Napisz wiadomość...',
  maxLength = 1000,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Inicjalizacja rozpoznawania mowy (jeśli dostępne)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pl-PL';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const themeClasses = {
    light: {
      container: 'bg-white border-gray-200',
      input: 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:border-zus-green-primary focus:ring-zus-green-primary',
      button: 'bg-zus-green-primary hover:bg-zus-green-secondary text-white disabled:bg-gray-300',
      micButton: 'text-gray-500 hover:text-zus-green-primary disabled:text-gray-300',
      counter: 'text-gray-500'
    },
    dark: {
      container: 'bg-gray-800 border-gray-600',
      input: 'bg-gray-700 text-gray-100 placeholder-gray-400 border-gray-600 focus:border-zus-green-primary focus:ring-zus-green-primary',
      button: 'bg-zus-green-primary hover:bg-zus-green-secondary text-white disabled:bg-gray-600',
      micButton: 'text-gray-400 hover:text-zus-green-primary disabled:text-gray-600',
      counter: 'text-gray-400'
    }
  };

  const currentTheme = themeClasses[theme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const isMessageValid = message.trim().length > 0 && message.length <= maxLength;
  const charactersLeft = maxLength - message.length;
  const isNearLimit = charactersLeft < 50;

  return (
    <div className={`p-4 border-t ${currentTheme.container} ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-end space-x-2">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              maxLength={maxLength}
              rows={1}
              className={`
                w-full px-3 py-2 border rounded-lg resize-none transition-colors duration-200
                ${currentTheme.input}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Wpisz swoją wiadomość"
              aria-describedby="message-help"
            />
            
            {/* Wskaźnik rozpoznawania mowy */}
            {isListening && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Mic size={16} className="animate-pulse" />
                  <span className="text-sm">Słucham...</span>
                </div>
              </div>
            )}
          </div>

          {/* Przycisk rozpoznawania mowy */}
          {recognitionRef.current && (
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${currentTheme.micButton}
                ${isListening ? 'bg-blue-100 text-blue-600' : ''}
              `}
              aria-label={isListening ? 'Zatrzymaj rozpoznawanie mowy' : 'Rozpocznij rozpoznawanie mowy'}
              title={isListening ? 'Zatrzymaj nagrywanie' : 'Nagrywaj głosem'}
            >
              {isListening ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>
          )}

          {/* Przycisk wysyłania */}
          <button
            type="submit"
            disabled={!isMessageValid || isLoading}
            className={`
              p-2 rounded-lg transition-all duration-200 flex items-center justify-center
              ${currentTheme.button}
              ${!isMessageValid || isLoading ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
            aria-label="Wyślij wiadomość"
            title="Wyślij (Enter)"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Licznik znaków i pomoc */}
        <div className="flex items-center justify-between text-xs">
          <div id="message-help" className={currentTheme.counter}>
            {isListening ? 'Mów teraz...' : 'Enter - wyślij, Shift+Enter - nowa linia'}
          </div>
          
          <div className={`
            ${currentTheme.counter}
            ${isNearLimit ? 'text-orange-500 font-medium' : ''}
            ${charactersLeft < 0 ? 'text-red-500 font-bold' : ''}
          `}>
            {charactersLeft < 100 && `${charactersLeft} znaków pozostało`}
          </div>
        </div>
      </form>
    </div>
  );
};