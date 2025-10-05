import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Calculator, TrendingUp, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { chatService } from '../../services/chatService';
import type { QuickQuestionsProps, QuickQuestion } from '../../types/chat';

export const QuickQuestions: React.FC<QuickQuestionsProps> = ({
  onQuestionClick,
  theme = 'light',
  maxQuestions = 6,
  className = ''
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuickQuestions();
  }, []);

  const loadQuickQuestions = async () => {
    try {
      setIsLoading(true);
      // Bezpośrednio używaj domyślnych pytań - chatService już zwraca domyślne pytania
      setQuestions(getDefaultQuestions().slice(0, maxQuestions));
    } catch (error) {
      console.error('Błąd podczas ładowania szybkich pytań:', error);
      // Fallback do domyślnych pytań
      setQuestions(getDefaultQuestions().slice(0, maxQuestions));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQuestions = (): string[] => [
    'Jak działa system emerytalny w Polsce?',
    'Kiedy mogę przejść na emeryturę?',
    'Jak obliczane są składki ZUS?',
    'Co to jest kapitał początkowy?',
    'Jak zwiększyć wysokość emerytury?',
    'Co oznacza stopa zastąpienia?',
    'Jak wpływają zwolnienia na emeryturę?',
    'Czy warto opóźnić przejście na emeryturę?'
  ];

  const themeClasses = {
    light: {
      container: 'bg-white',
      question: 'bg-gray-50 hover:bg-zus-green-light text-gray-800 border-gray-200 hover:border-zus-green-primary',
      icon: 'text-zus-green-primary',
      loading: 'bg-gray-100 animate-pulse'
    },
    dark: {
      container: 'bg-gray-800',
      question: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 hover:border-zus-green-primary',
      icon: 'text-zus-green-primary',
      loading: 'bg-gray-600 animate-pulse'
    }
  };

  const currentTheme = themeClasses[theme];

  const handleQuestionClick = (question: string) => {
    onQuestionClick(question);
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles size={16} className={currentTheme.icon} />
          <span className="text-sm font-medium text-gray-700">
            Popularne pytania
          </span>
        </div>
        
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`
              h-12 rounded-lg border
              ${currentTheme.loading}
            `}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${currentTheme.container} ${className}`}>
      {/* Nagłówek */}
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles size={16} className={currentTheme.icon} />
        <span className="text-sm font-medium text-gray-700">
          Popularne pytania
        </span>
      </div>

      {/* Lista pytań */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            className={`
              w-full p-3 rounded-lg border text-left transition-all duration-200
              ${currentTheme.question}
              hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              group
            `}
            aria-label={`Zadaj pytanie: ${question}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <HelpCircle 
                  size={16} 
                  className={`${currentTheme.icon} mt-0.5 flex-shrink-0`}
                  aria-hidden="true"
                />
                <span className="text-sm leading-relaxed">
                  {question}
                </span>
              </div>
              
              <ChevronRight 
                size={16} 
                className={`
                  ${currentTheme.icon} opacity-0 group-hover:opacity-100 
                  transition-opacity duration-200 flex-shrink-0 ml-2
                `}
                aria-hidden="true"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Informacja o możliwości zadawania własnych pytań */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <HelpCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Masz inne pytanie?</p>
            <p className="text-xs opacity-90">
              Możesz zadać dowolne pytanie o ZUS, emerytury, składki czy planowanie emerytalne. 
              Jestem tutaj, aby Ci pomóc!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};