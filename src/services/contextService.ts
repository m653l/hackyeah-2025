import type { ContextService, SimulationData } from '../types/chat';

class ContextServiceImpl implements ContextService {
  private simulationData: SimulationData | null = null;
  private listeners: Array<(data: SimulationData | null) => void> = [];

  setSimulationData(data: SimulationData): void {
    this.simulationData = { ...data };
    this.notifyListeners();
  }

  getSimulationData(): SimulationData | null {
    return this.simulationData ? { ...this.simulationData } : null;
  }

  clearSimulationData(): void {
    this.simulationData = null;
    this.notifyListeners();
  }

  subscribe(callback: (data: SimulationData | null) => void): () => void {
    this.listeners.push(callback);
    
    // Zwróć funkcję do anulowania subskrypcji
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  extractSimulationFromUrl(): SimulationData | null {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const simulationParam = urlParams.get('simulation');
      
      if (simulationParam) {
        const decoded = decodeURIComponent(simulationParam);
        return JSON.parse(decoded) as SimulationData;
      }
    } catch (error) {
      console.warn('Nie udało się wyodrębnić danych symulacji z URL:', error);
    }
    
    return null;
  }

  extractSimulationFromLocalStorage(): SimulationData | null {
    try {
      const stored = localStorage.getItem('zus_simulation_data');
      if (stored) {
        return JSON.parse(stored) as SimulationData;
      }
    } catch (error) {
      console.warn('Nie udało się wyodrębnić danych symulacji z localStorage:', error);
    }
    
    return null;
  }

  extractSimulationFromSessionStorage(): SimulationData | null {
    try {
      const stored = sessionStorage.getItem('current_simulation');
      if (stored) {
        return JSON.parse(stored) as SimulationData;
      }
    } catch (error) {
      console.warn('Nie udało się wyodrębnić danych symulacji z sessionStorage:', error);
    }
    
    return null;
  }

  autoDetectSimulationContext(): SimulationData | null {
    // Sprawdź różne źródła danych symulacji w kolejności priorytetów
    
    // 1. Aktualne dane w serwisie
    if (this.simulationData) {
      return this.simulationData;
    }

    // 2. URL parameters (najwyższy priorytet dla nowych danych)
    const urlData = this.extractSimulationFromUrl();
    if (urlData) {
      this.setSimulationData(urlData);
      return urlData;
    }

    // 3. Session storage (dane z bieżącej sesji)
    const sessionData = this.extractSimulationFromSessionStorage();
    if (sessionData) {
      this.setSimulationData(sessionData);
      return sessionData;
    }

    // 4. Local storage (dane zapisane lokalnie)
    const localData = this.extractSimulationFromLocalStorage();
    if (localData) {
      this.setSimulationData(localData);
      return localData;
    }

    // 5. Sprawdź czy jesteśmy na stronie z wynikami symulacji
    const pathData = this.extractSimulationFromPath();
    if (pathData) {
      this.setSimulationData(pathData);
      return pathData;
    }

    return null;
  }

  private extractSimulationFromPath(): SimulationData | null {
    const path = window.location.pathname;
    
    // Jeśli jesteśmy na stronie wyników, spróbuj wyodrębnić podstawowe dane
    if (path.includes('/wyniki') || path.includes('/results')) {
      // Sprawdź czy są dostępne dane w DOM lub innych źródłach
      return this.extractSimulationFromDOM();
    }
    
    return null;
  }

  extractSimulationFromDOM(): SimulationData | null {
    try {
      // Spróbuj znaleźć dane symulacji w DOM
      const simulationElement = document.querySelector('[data-simulation]');
      if (simulationElement) {
        const data = simulationElement.getAttribute('data-simulation');
        if (data) {
          return JSON.parse(data) as SimulationData;
        }
      }

      // Alternatywnie, sprawdź meta tagi
      const metaSimulation = document.querySelector('meta[name="simulation-data"]');
      if (metaSimulation) {
        const content = metaSimulation.getAttribute('content');
        if (content) {
          return JSON.parse(content) as SimulationData;
        }
      }
    } catch (error) {
      console.warn('Nie udało się wyodrębnić danych symulacji z DOM:', error);
    }
    
    return null;
  }

  buildContextSummary(data: SimulationData): string {
    const parts: string[] = [];

    if (data.age && data.gender) {
      const genderText = data.gender === 'male' ? 'mężczyzna' : 'kobieta';
      parts.push(`${genderText}, ${data.age} lat`);
    }

    if (data.salary) {
      parts.push(`wynagrodzenie: ${data.salary.toLocaleString('pl-PL')} zł brutto`);
    }

    if (data.calculatedPension) {
      parts.push(`prognozowana emerytura: ${data.calculatedPension.toLocaleString('pl-PL')} zł`);
    }

    if (data.replacementRate) {
      parts.push(`stopa zastąpienia: ${(data.replacementRate * 100).toFixed(1)}%`);
    }

    return parts.join(', ');
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.simulationData);
      } catch (error) {
        console.error('Błąd podczas powiadamiania listenera:', error);
      }
    });
  }
}

export const contextService = new ContextServiceImpl();