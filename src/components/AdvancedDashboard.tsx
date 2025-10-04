import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Calendar, Calculator, BarChart3, Sliders, RotateCcw } from 'lucide-react';

interface AdvancedDashboardProps {
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
}

// Klucze localStorage
const DASHBOARD_STORAGE_KEY = 'advancedDashboard';
const DASHBOARD_TAB_KEY = 'advancedDashboardTab';

// Funkcje pomocnicze dla localStorage
const saveDashboardData = (data: any) => {
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Nie można zapisać danych dashboard do localStorage:', error);
  }
};

const getSavedDashboardData = () => {
  try {
    const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Nie można odczytać danych dashboard z localStorage:', error);
    return {};
  }
};

const saveActiveTab = (tab: string) => {
  try {
    localStorage.setItem(DASHBOARD_TAB_KEY, tab);
  } catch (error) {
    console.warn('Nie można zapisać aktywnej zakładki do localStorage:', error);
  }
};

const getSavedActiveTab = () => {
  try {
    return localStorage.getItem(DASHBOARD_TAB_KEY) || 'historical';
  } catch (error) {
    console.warn('Nie można odczytać aktywnej zakładki z localStorage:', error);
    return 'historical';
  }
};

const clearDashboardData = () => {
  try {
    localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    localStorage.removeItem(DASHBOARD_TAB_KEY);
  } catch (error) {
    console.warn('Nie można wyczyścić danych dashboard z localStorage:', error);
  }
};

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  onParameterChange,
  currentParameters
}) => {
  const [activeTab, setActiveTab] = useState(getSavedActiveTab());
  const [dashboardData, setDashboardData] = useState(getSavedDashboardData());

  // Przywracanie danych przy inicjalizacji
  useEffect(() => {
    const savedData = getSavedDashboardData();
    if (Object.keys(savedData).length > 0) {
      // Przywróć wszystkie zapisane parametry
      Object.keys(savedData).forEach(key => {
        if (savedData[key] !== undefined && savedData[key] !== null) {
          onParameterChange(key, savedData[key]);
        }
      });
      setDashboardData(savedData);
    }
  }, []);

  // Funkcja do aktualizacji parametrów z zapisem do localStorage
  const handleParameterChange = (parameter: string, value: any) => {
    const updatedData = { ...dashboardData, [parameter]: value };
    setDashboardData(updatedData);
    saveDashboardData(updatedData);
    onParameterChange(parameter, value);
  };

  // Funkcja do zmiany zakładki z zapisem
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    saveActiveTab(tabId);
  };

  // Funkcja resetowania ustawień
  const handleResetSettings = () => {
    if (window.confirm('Czy na pewno chcesz zresetować wszystkie ustawienia Dashboard Zaawansowany?')) {
      clearDashboardData();
      setDashboardData({});
      setActiveTab('historical');
      
      // Wyczyść wszystkie parametry w komponencie nadrzędnym
      const keysToReset = [
        'historicalSalaries', 'salaryGrowthRate', 'contributionValorizationRate', 
        'inflationRate', 'forecastHorizon', 'sicknessPeriods', 'mainAccount', 
        'subAccount', 'showAccountGrowth', 'includeValorization', 'fus20Variant',
        'unemploymentRate', 'realWageGrowth', 'generalInflation', 
        'contributionCollection', 'realGDPGrowth', 'pensionerInflation'
      ];
      
      keysToReset.forEach(key => {
        onParameterChange(key, undefined);
      });
    }
  };

  const tabs = [
    { id: 'historical', label: 'Dane Historyczne', icon: Calendar },
    { id: 'future', label: 'Prognozy Przyszłe', icon: TrendingUp },
    { id: 'sickness', label: 'Okresy Choroby', icon: Calculator },
    { id: 'zus_account', label: 'Konto ZUS', icon: BarChart3 },
    { id: 'fus20', label: 'Warianty FUS20', icon: Settings },
    { id: 'macro', label: 'Parametry Makro', icon: Sliders }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dashboard Zaawansowany
            </h3>
            <p className="text-sm text-gray-600">
              Modyfikuj parametry i założenia do obliczeń emerytalnych
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSettings}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
            title="Resetuj wszystkie ustawienia dashboard"
          >
            <RotateCcw className="h-3 w-3" />
            Resetuj ustawienia
          </button>
        </div>
      </div>

      {/* Zakładki */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-zus-orange text-zus-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Zawartość zakładek */}
      <div className="space-y-6">
        {activeTab === 'historical' && (
          <HistoricalDataPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
            savedData={dashboardData}
          />
        )}
        
        {activeTab === 'future' && (
          <FutureForecastPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
          />
        )}
        
        {activeTab === 'sickness' && (
          <SicknessPeriodsPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
            savedData={dashboardData}
          />
        )}
        
        {activeTab === 'zus_account' && (
          <ZUSAccountPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
          />
        )}
        
        {activeTab === 'fus20' && (
          <FUS20VariantsPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
          />
        )}
        
        {activeTab === 'macro' && (
          <MacroParametersPanel 
            onParameterChange={handleParameterChange}
            currentParameters={currentParameters}
          />
        )}
      </div>
    </div>
  );
};

// Panel danych historycznych
const HistoricalDataPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
  savedData: any;
}> = ({ onParameterChange, currentParameters, savedData }) => {
  const [historicalSalaries, setHistoricalSalaries] = useState(
    savedData.historicalSalaries || currentParameters.historicalSalaries || []
  );

  const addHistoricalSalary = () => {
    const newSalary = { year: new Date().getFullYear() - 1, amount: 0 };
    const updated = [...historicalSalaries, newSalary];
    setHistoricalSalaries(updated);
    onParameterChange('historicalSalaries', updated);
  };

  const updateHistoricalSalary = (index: number, field: string, value: any) => {
    const updated = [...historicalSalaries];
    updated[index] = { ...updated[index], [field]: value };
    setHistoricalSalaries(updated);
    onParameterChange('historicalSalaries', updated);
  };

  const removeHistoricalSalary = (index: number) => {
    const updated = historicalSalaries.filter((_: any, i: number) => i !== index);
    setHistoricalSalaries(updated);
    onParameterChange('historicalSalaries', updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Modyfikacja Danych Historycznych</h4>
        <button
          type="button"
          onClick={addHistoricalSalary}
          className="px-3 py-1 bg-zus-orange text-white rounded text-sm hover:bg-orange-600"
        >
          Dodaj rok
        </button>
      </div>
      
      <p className="text-sm text-gray-600">
        Wprowadź inne kwoty wynagrodzeń z poprzednich lat
      </p>

      <div className="space-y-3">
        {historicalSalaries.map((salary: any, index: number) => (
          <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Rok
              </label>
              <input
                type="number"
                value={salary.year}
                onChange={(e) => updateHistoricalSalary(index, 'year', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="1999"
                max={new Date().getFullYear() - 1}
              />
            </div>
            <div className="flex-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Wynagrodzenie brutto (zł)
              </label>
              <input
                type="number"
                value={salary.amount}
                onChange={(e) => updateHistoricalSalary(index, 'amount', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <button
              type="button"
              onClick={() => removeHistoricalSalary(index)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Usuń
            </button>
          </div>
        ))}
        
        {historicalSalaries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Brak danych historycznych</p>
            <p className="text-xs">Kliknij "Dodaj rok" aby wprowadzić dane</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Panel prognoz przyszłych
const FutureForecastPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
}> = ({ onParameterChange, currentParameters }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Modyfikacja Prognoz Przyszłych</h4>
      <p className="text-sm text-gray-600">
        Wprowadź inne kwoty lub wskaźniki indeksacji na przyszłość
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Przewidywany wzrost wynagrodzeń (% rocznie)
          </label>
          <input
            type="number"
            value={currentParameters.salaryGrowthRate || 3.5}
            onChange={(e) => onParameterChange('salaryGrowthRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wskaźnik waloryzacji składek (% rocznie)
          </label>
          <input
            type="number"
            value={currentParameters.contributionValorizationRate || 4.2}
            onChange={(e) => onParameterChange('contributionValorizationRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Przewidywana inflacja (% rocznie)
          </label>
          <input
            type="number"
            value={currentParameters.inflationRate || 2.5}
            onChange={(e) => onParameterChange('inflationRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horyzont prognozy (lata)
          </label>
          <input
            type="number"
            value={currentParameters.forecastHorizon || 30}
            onChange={(e) => onParameterChange('forecastHorizon', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="1"
            max="50"
          />
        </div>
      </div>
    </div>
  );
};

// Panel okresów choroby
const SicknessPeriodsPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
  savedData: any;
}> = ({ onParameterChange, currentParameters, savedData }) => {
  const [sicknessPeriods, setSicknessPeriods] = useState(
    savedData.sicknessPeriods || currentParameters.sicknessPeriods || []
  );

  const addSicknessPeriod = () => {
    const newPeriod = { 
      year: new Date().getFullYear(), 
      days: 0, 
      type: 'past',
      county: ''
    };
    const updated = [...sicknessPeriods, newPeriod];
    setSicknessPeriods(updated);
    onParameterChange('sicknessPeriods', updated);
  };

  const updateSicknessPeriod = (index: number, field: string, value: any) => {
    const updated = [...sicknessPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setSicknessPeriods(updated);
    onParameterChange('sicknessPeriods', updated);
  };

  const removeSicknessPeriod = (index: number) => {
    const updated = sicknessPeriods.filter((_: any, i: number) => i !== index);
    setSicknessPeriods(updated);
    onParameterChange('sicknessPeriods', updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Modyfikacja Okresów Choroby</h4>
        <button
          type="button"
          onClick={addSicknessPeriod}
          className="px-3 py-1 bg-zus-orange text-white rounded text-sm hover:bg-orange-600"
        >
          Dodaj okres
        </button>
      </div>
      
      <p className="text-sm text-gray-600">
        Wprowadź okresy choroby w przeszłości i przyszłości
      </p>

      <div className="space-y-3">
        {sicknessPeriods.map((period: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rok
                </label>
                <input
                  type="number"
                  value={period.year}
                  onChange={(e) => updateSicknessPeriod(index, 'year', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1999"
                  max="2080"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dni choroby
                </label>
                <input
                  type="number"
                  value={period.days}
                  onChange={(e) => updateSicknessPeriod(index, 'days', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={period.type}
                  onChange={(e) => updateSicknessPeriod(index, 'type', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="past">Przeszłość</option>
                  <option value="future">Przyszłość</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSicknessPeriod(index)}
                  className="w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Usuń
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Powiat (opcjonalnie - dla statystyk regionalnych)
              </label>
              <input
                type="text"
                value={period.county}
                onChange={(e) => updateSicknessPeriod(index, 'county', e.target.value)}
                placeholder="np. warszawski, krakowski..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        ))}
        
        {sicknessPeriods.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Brak okresów choroby</p>
            <p className="text-xs">Kliknij "Dodaj okres" aby wprowadzić dane</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Panel konta ZUS
const ZUSAccountPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
}> = ({ onParameterChange, currentParameters }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Podgląd Konta ZUS</h4>
      <p className="text-sm text-gray-600">
        Śledź wzrost kwot zgromadzonych na koncie i subkoncie ZUS
      </p>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-3">Aktualne stany kont</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konto główne (zł)
            </label>
            <input
              type="number"
              value={currentParameters.mainAccount || 0}
              onChange={(e) => onParameterChange('mainAccount', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subkonto (zł)
            </label>
            <input
              type="number"
              value={currentParameters.subAccount || 0}
              onChange={(e) => onParameterChange('subAccount', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Pokaż prognozę wzrostu kont
          </span>
          <input
            type="checkbox"
            checked={currentParameters.showAccountGrowth || false}
            onChange={(e) => onParameterChange('showAccountGrowth', e.target.checked)}
            className="h-4 w-4 text-zus-orange focus:ring-zus-orange border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Uwzględnij waloryzację roczną
          </span>
          <input
            type="checkbox"
            checked={currentParameters.includeValorization || true}
            onChange={(e) => onParameterChange('includeValorization', e.target.checked)}
            className="h-4 w-4 text-zus-orange focus:ring-zus-orange border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
};

// Panel wariantów FUS20
const FUS20VariantsPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
}> = ({ onParameterChange, currentParameters }) => {
  const variants = [
    {
      id: 'intermediate',
      name: 'Wariant 1 (Pośredni)',
      description: 'Umiarkowane założenia demograficzne i ekonomiczne',
      characteristics: ['Średni wzrost PKB: 2.8%', 'Stopa bezrobocia: 4.5%', 'Inflacja: 2.5%'],
      macroParams: {
        realGDPGrowth: 2.8,
        unemploymentRate: 4.5,
        generalInflation: 2.5,
        realWageGrowth: 2.8,
        pensionerInflation: 2.3,
        contributionCollection: 95.5
      }
    },
    {
      id: 'pessimistic', 
      name: 'Wariant 2 (Pesymistyczny)',
      description: 'Konserwatywne założenia, niższy wzrost gospodarczy',
      characteristics: ['Średni wzrost PKB: 2.2%', 'Stopa bezrobocia: 6.0%', 'Inflacja: 3.0%'],
      macroParams: {
        realGDPGrowth: 2.2,
        unemploymentRate: 6.0,
        generalInflation: 3.0,
        realWageGrowth: 2.2,
        pensionerInflation: 2.8,
        contributionCollection: 92.0
      }
    },
    {
      id: 'optimistic',
      name: 'Wariant 3 (Optymistyczny)', 
      description: 'Pozytywne założenia, wyższy wzrost gospodarczy',
      characteristics: ['Średni wzrost PKB: 3.5%', 'Stopa bezrobocia: 3.5%', 'Inflacja: 2.0%'],
      macroParams: {
        realGDPGrowth: 3.5,
        unemploymentRate: 3.5,
        generalInflation: 2.0,
        realWageGrowth: 3.5,
        pensionerInflation: 1.8,
        contributionCollection: 97.0
      }
    }
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Wybór Wariantu Prognostycznego FUS20</h4>
      <p className="text-sm text-gray-600">
        Wybierz jeden z trzech wariantów prognozy demograficzno-ekonomicznej
      </p>

      <div className="space-y-3">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              currentParameters.fus20Variant === variant.id
                ? 'border-zus-orange bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              onParameterChange('fus20Variant', variant.id);
              // Automatycznie ustaw parametry makroekonomiczne dla wybranego wariantu
              Object.entries(variant.macroParams).forEach(([key, value]) => {
                onParameterChange(key, value);
              });
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={currentParameters.fus20Variant === variant.id}
                    onChange={() => {
                      onParameterChange('fus20Variant', variant.id);
                      // Automatycznie ustaw parametry makroekonomiczne dla wybranego wariantu
                      Object.entries(variant.macroParams).forEach(([key, value]) => {
                        onParameterChange(key, value);
                      });
                    }}
                    className="h-4 w-4 text-zus-orange focus:ring-zus-orange"
                  />
                  <h5 className="font-medium text-gray-900">{variant.name}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">{variant.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {variant.characteristics.map((char, index) => (
                    <li key={index}>• {char}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Panel parametrów makroekonomicznych
const MacroParametersPanel: React.FC<{
  onParameterChange: (parameter: string, value: any) => void;
  currentParameters: any;
}> = ({ onParameterChange, currentParameters }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Modyfikacja Parametrów Makroekonomicznych</h4>
      <p className="text-sm text-gray-600">
        Dostosuj kluczowe założenia FUS20 wpływające na wyniki prognozy
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stopa bezrobocia (%)
          </label>
          <input
            type="number"
            value={currentParameters.unemploymentRate || 4.5}
            onChange={(e) => onParameterChange('unemploymentRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Realny wzrost wynagrodzeń (%)
          </label>
          <input
            type="number"
            value={currentParameters.realWageGrowth || 2.8}
            onChange={(e) => onParameterChange('realWageGrowth', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="-5"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inflacja ogółem (%)
          </label>
          <input
            type="number"
            value={currentParameters.generalInflation || 2.5}
            onChange={(e) => onParameterChange('generalInflation', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ściągalność składek (%)
          </label>
          <input
            type="number"
            value={currentParameters.contributionCollection || 95.5}
            onChange={(e) => onParameterChange('contributionCollection', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="70"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Realny wzrost PKB (%)
          </label>
          <input
            type="number"
            value={currentParameters.realGDPGrowth || 2.8}
            onChange={(e) => onParameterChange('realGDPGrowth', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="-3"
            max="8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inflacja dla emerytów (%)
          </label>
          <input
            type="number"
            value={currentParameters.pensionerInflation || 2.3}
            onChange={(e) => onParameterChange('pensionerInflation', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="15"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h5 className="font-medium text-yellow-800 mb-2">Uwaga</h5>
        <p className="text-sm text-yellow-700">
          Modyfikacja parametrów makroekonomicznych może znacząco wpłynąć na wyniki prognozy. 
          Zalecane jest korzystanie z wartości domyślnych opartych na oficjalnych prognozach FUS20.
        </p>
      </div>
    </div>
  );
};