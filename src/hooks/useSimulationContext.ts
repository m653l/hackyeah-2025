import { useState, useEffect, useCallback } from 'react';
import { contextService } from '../services/contextService';
import type { 
  SimulationData, 
  UseSimulationContextReturn 
} from '../types/chat';

export const useSimulationContext = (): UseSimulationContextReturn => {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContext, setHasContext] = useState(false);

  // Inicjalizacja - sprawdź dostępne źródła danych
  useEffect(() => {
    initializeContext();
  }, []);

  // Subskrypcja na zmiany w contextService
  useEffect(() => {
    const unsubscribe = contextService.subscribe((data) => {
      setSimulationData(data);
      setHasContext(!!data);
    });

    return unsubscribe;
  }, []);

  const initializeContext = async () => {
    try {
      setIsLoading(true);
      
      // Spróbuj automatycznie wykryć kontekst symulacji
      const detectedData = contextService.autoDetectSimulationContext();
      
      if (detectedData) {
        setSimulationData(detectedData);
        setHasContext(true);
      } else {
        setSimulationData(null);
        setHasContext(false);
      }
    } catch (error) {
      console.error('Błąd podczas inicjalizacji kontekstu symulacji:', error);
      setSimulationData(null);
      setHasContext(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSimulationData = useCallback((data: SimulationData) => {
    contextService.setSimulationData(data);
    
    // Zapisz również w localStorage dla przyszłych sesji
    try {
      localStorage.setItem('zus_simulation_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Nie udało się zapisać danych symulacji w localStorage:', error);
    }
  }, []);

  const clearSimulationData = useCallback(() => {
    contextService.clearSimulationData();
    
    // Wyczyść również localStorage
    try {
      localStorage.removeItem('zus_simulation_data');
      sessionStorage.removeItem('current_simulation');
    } catch (error) {
      console.warn('Nie udało się wyczyścić danych symulacji z storage:', error);
    }
  }, []);

  const refreshContext = useCallback(async () => {
    await initializeContext();
  }, []);

  const getContextSummary = useCallback((): string => {
    if (!simulationData) return 'Brak danych symulacji';
    
    return contextService.buildContextSummary(simulationData);
  }, [simulationData]);

  const isContextComplete = useCallback((): boolean => {
    if (!simulationData) return false;
    
    // Sprawdź czy mamy podstawowe dane potrzebne do analizy
    const hasBasicData = !!(
      simulationData.age && 
      simulationData.gender && 
      simulationData.salary
    );
    
    return hasBasicData;
  }, [simulationData]);

  const getContextQuality = useCallback((): 'none' | 'basic' | 'partial' | 'complete' => {
    if (!simulationData) return 'none';
    
    const hasBasicData = !!(simulationData.age && simulationData.gender);
    const hasFinancialData = !!(simulationData.salary);
    const hasCalculatedResults = !!(simulationData.calculatedPension);
    const hasDetailedData = !!(
      simulationData.workStartYear && 
      simulationData.retirementYear &&
      simulationData.replacementRate
    );
    
    if (hasBasicData && hasFinancialData && hasCalculatedResults && hasDetailedData) {
      return 'complete';
    } else if (hasBasicData && hasFinancialData && hasCalculatedResults) {
      return 'partial';
    } else if (hasBasicData && hasFinancialData) {
      return 'basic';
    } else {
      return 'none';
    }
  }, [simulationData]);

  const extractFromCurrentPage = useCallback((): SimulationData | null => {
    // Spróbuj wyodrębnić dane z aktualnej strony
    return contextService.extractSimulationFromDOM();
  }, []);

  const watchForSimulationChanges = useCallback(() => {
    // Obserwuj zmiany w URL i localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zus_simulation_data' || e.key === 'current_simulation') {
        refreshContext();
      }
    };

    const handlePopState = () => {
      refreshContext();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [refreshContext]);

  // Automatyczne obserwowanie zmian
  useEffect(() => {
    const cleanup = watchForSimulationChanges();
    return cleanup;
  }, [watchForSimulationChanges]);

  const validateSimulationData = useCallback((data: SimulationData): string[] => {
    const errors: string[] = [];
    
    if (!data.age || data.age < 18 || data.age > 100) {
      errors.push('Nieprawidłowy wiek (18-100 lat)');
    }
    
    if (!data.gender || !['male', 'female'].includes(data.gender)) {
      errors.push('Nieprawidłowa płeć');
    }
    
    if (!data.salary || data.salary < 0) {
      errors.push('Nieprawidłowe wynagrodzenie');
    }
    
    if (data.workStartYear && (data.workStartYear < 1950 || data.workStartYear > new Date().getFullYear())) {
      errors.push('Nieprawidłowy rok rozpoczęcia pracy');
    }
    
    if (data.retirementYear && data.retirementYear < new Date().getFullYear()) {
      errors.push('Rok emerytury nie może być w przeszłości');
    }
    
    return errors;
  }, []);

  return {
    simulationData,
    isLoading,
    hasContext,
    updateSimulationData,
    clearSimulationData,
    refreshContext,
    getContextSummary,
    isContextComplete,
    getContextQuality,
    extractFromCurrentPage,
    validateSimulationData
  };
};