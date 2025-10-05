import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiConfig, GeminiService, SimulationData } from '../types/chat';

class GeminiServiceImpl implements GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY nie jest skonfigurowany w zmiennych środowiskowych');
    }

    this.config = {
      apiKey,
      model: 'models/gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
      },
    };

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.config.model,
      generationConfig: this.config.generationConfig
    });
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const contextPrompt = context ? `\n\nKONTEKST UŻYTKOWNIKA:\n${context}` : '';
      
      const fullPrompt = `${systemPrompt}${contextPrompt}\n\nPYTANIE UŻYTKOWNIKA: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Brak odpowiedzi od AI');
      }

      return text;
    } catch (error) {
      console.error('Błąd podczas generowania odpowiedzi:', error);
      
      // Sprawdź typ błędu i zwróć odpowiednią wiadomość
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
        return 'Przepraszam, wystąpił problem z konfiguracją API. Skontaktuj się z administratorem.';
      }
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('quota')) {
        return 'Przepraszam, osiągnięto limit zapytań. Spróbuj ponownie za chwilę.';
      }
      
      if (error.message?.includes('SAFETY') || error.message?.includes('safety')) {
        return 'Przepraszam, nie mogę odpowiedzieć na to pytanie ze względów bezpieczeństwa. Zadaj inne pytanie o system emerytalny.';
      }
      
      // Fallback response dla innych błędów
      return 'Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Oto podstawowe informacje: System emerytalny w Polsce składa się z I filara (ZUS) i II filara (OFE/PPK). Wiek emerytalny to 60 lat dla kobiet i 65 lat dla mężczyzn. Czy mogę pomóc w czymś konkretnym?';
    }
  }

  buildContextPrompt(simulationData?: SimulationData): string {
    if (!simulationData) {
      return '';
    }

    const context = [];

    // Dane podstawowe
    if (simulationData.age) {
      context.push(`Wiek: ${simulationData.age} lat`);
    }
    if (simulationData.gender) {
      context.push(`Płeć: ${simulationData.gender === 'male' ? 'mężczyzna' : 'kobieta'}`);
    }
    if (simulationData.salary) {
      context.push(`Wynagrodzenie brutto: ${simulationData.salary.toLocaleString('pl-PL')} zł`);
    }
    if (simulationData.workStartYear) {
      context.push(`Rok rozpoczęcia pracy: ${simulationData.workStartYear}`);
    }
    if (simulationData.retirementYear) {
      context.push(`Planowany rok emerytury: ${simulationData.retirementYear}`);
    }

    // Wyniki kalkulacji
    if (simulationData.calculatedPension) {
      context.push(`Prognozowana emerytura: ${simulationData.calculatedPension.toLocaleString('pl-PL')} zł`);
    }
    if (simulationData.realPension) {
      context.push(`Emerytura w wartościach realnych: ${simulationData.realPension.toLocaleString('pl-PL')} zł`);
    }
    if (simulationData.replacementRate) {
      context.push(`Stopa zastąpienia: ${(simulationData.replacementRate * 100).toFixed(1)}%`);
    }
    if (simulationData.totalContributions) {
      context.push(`Łączne składki: ${simulationData.totalContributions.toLocaleString('pl-PL')} zł`);
    }

    // Kontekst zawodowy i geograficzny
    if (simulationData.professionalData) {
      context.push(`Grupa zawodowa: ${simulationData.professionalData.name} (średnia emerytura: ${simulationData.professionalData.averagePension.toLocaleString('pl-PL')} zł)`);
    }
    if (simulationData.countyData) {
      context.push(`Powiat: ${simulationData.countyData.name} (średnia emerytura: ${simulationData.countyData.averagePension.toLocaleString('pl-PL')} zł)`);
    }

    // Prognozy opóźnienia emerytury
    if (simulationData.delayBenefits && simulationData.delayBenefits.length > 0) {
      context.push('Korzyści z opóźnienia emerytury:');
      simulationData.delayBenefits.forEach(benefit => {
        context.push(`- Opóźnienie o ${benefit.years} lat: +${benefit.increasedPension.toLocaleString('pl-PL')} zł (+${benefit.percentageIncrease.toFixed(1)}%)`);
      });
    }

    return context.join('\n');
  }

  private buildSystemPrompt(): string {
    return `Jesteś ekspertem ds. systemu emerytalnego w Polsce i asystentem aplikacji "ZUS na Plus". 

TWOJA ROLA:
- Pomagasz użytkownikom zrozumieć system emerytalny w Polsce
- Wyjaśniasz wyniki z symulatora emerytalnego
- Udzielasz praktycznych porad dotyczących planowania emerytalnego
- Odpowiadasz na pytania o ZUS, składki emerytalne i prognozy

ZASADY ODPOWIEDZI:
1. Używaj prostego, zrozumiałego języka polskiego
2. Bądź konkretny i praktyczny w swoich radach
3. Odwołuj się do aktualnych przepisów ZUS (stan na 2024 rok)
4. Jeśli masz kontekst symulacji użytkownika, wykorzystaj go w odpowiedzi
5. Zachęcaj do korzystania z symulatora dla dokładnych kalkulacji
6. Nie udzielaj porad prawnych ani finansowych - kieruj do specjalistów

KLUCZOWE TEMATY:
- System emerytalny w Polsce (I i II filar)
- Składki emerytalne i rentowe
- Wiek emerytalny (60 lat kobiety, 65 lat mężczyźni)
- Kapitał początkowy i waloryzacja składek
- Tablice dalszego trwania życia
- Stopa zastąpienia
- Korzyści z opóźnienia emerytury
- Zwolnienia lekarskie i ich wpływ na emeryturę

STYL KOMUNIKACJI:
- Przyjazny i pomocny ton
- Krótkie, klarowne odpowiedzi (max 300 słów)
- Zawsze odpowiadaj PLAIN TEXT. To jest bardzo istotne.
- Używaj przykładów i konkretnych liczb gdy to możliwe
- Zakończ odpowiedź pytaniem lub zachętą do dalszej rozmowy

Pamiętaj: Jesteś częścią aplikacji edukacyjnej, więc Twoim celem jest edukacja i pomoc w zrozumieniu systemu emerytalnego.`;
  }
}

export const geminiService = new GeminiServiceImpl();