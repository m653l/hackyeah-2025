import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  BarChart3, 
  Sliders, 
  Download, 
  RefreshCw, 
  MapPin, 
  Activity, 
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
// import logoUrl from '/logo.png?url';
import AnimatedNumber from '../components/AnimatedNumber';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  COUNTY_PENSION_DATA,
  COUNTY_SICK_LEAVE_DATA
} from '../utils/dataIntegration';
import { 
  type FUS20Parameters,
  calculateAccountBalanceProjection
} from '../utils/actuarialCalculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface FUS20Scenario {
  id: string;
  name: string;
  description: string;
  unemploymentRate: number;
  wageGrowth: number;
  inflation: number;
  contributionCollection: number;
}

const DashboardPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'intermediate' | 'pessimistic' | 'optimistic'>('intermediate');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [showAccountProjection, setShowAccountProjection] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [chartsVisible, setChartsVisible] = useState(true);
  const [customParams, setCustomParams] = useState<FUS20Parameters>({
    scenario: 'intermediate',
    unemploymentRate: 5.2,
    wageGrowth: 3.5,
    inflation: 2.5,
    contributionCollection: 92,
  });

  // Dane dla wybranego powiatu
  const selectedCountySickLeave = COUNTY_SICK_LEAVE_DATA.find(county => county.name === selectedCounty);
  
  // Funkcja do przeliczania prognoz
  const handleRecalculateForecasts = async () => {
    setIsRecalculating(true);
    
    try {
      // Animacja fade-out wykresów
      setChartsVisible(false);
      
      // Symulacja przeliczania - w rzeczywistej aplikacji tutaj byłyby wywołania do API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aktualizacja scenariusza na podstawie customParams
      const newScenario = determineScenarioFromParams(customParams);
      setSelectedScenario(newScenario);
      
      // Tutaj można dodać dodatkowe logiki przeliczania
      console.log('Prognozy przeliczone z parametrami:', customParams);
      
      // Animacja fade-in wykresów
      setTimeout(() => {
        setChartsVisible(true);
      }, 100);
      
    } catch (error) {
      console.error('Błąd podczas przeliczania prognoz:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Funkcja pomocnicza do określenia scenariusza na podstawie parametrów
  const determineScenarioFromParams = (params: FUS20Parameters): 'intermediate' | 'pessimistic' | 'optimistic' => {
    const { unemploymentRate, wageGrowth, inflation } = params;
    
    // Logika określania scenariusza na podstawie parametrów
    if (unemploymentRate > 6.5 || wageGrowth < 2.5 || inflation > 3.0) {
      return 'pessimistic';
    } else if (unemploymentRate < 4.0 && wageGrowth > 4.0 && inflation < 2.2) {
      return 'optimistic';
    } else {
      return 'intermediate';
    }
  };
  
  // Sample account projection for demonstration
  const accountProjectionData = calculateAccountBalanceProjection({
    age: 35,
    gender: 'male',
    salary: 6000,
    workStartYear: 2010,
    retirementYear: 2055,
    currentSavings: 50000
  }, {
    scenario: selectedScenario,
    unemploymentRate: customParams.unemploymentRate,
    wageGrowth: customParams.wageGrowth,
    inflation: customParams.inflation,
    contributionCollection: customParams.contributionCollection
  });

  // Transform data for charts
  const accountProjection = {
    years: accountProjectionData.map(item => item.year),
    mainAccount: accountProjectionData.map(item => item.accountBalance),
    subAccount: accountProjectionData.map(item => item.subaccountBalance),
    totalContributions: accountProjectionData.reduce((sum, item) => sum + item.annualContribution, 0)
  };

  const fus20Scenarios: FUS20Scenario[] = [
    {
      id: 'intermediate',
      name: 'Wariant 1 (Pośredni)',
      description: 'Umiarkowane założenia demograficzne i ekonomiczne',
      unemploymentRate: 5.2,
      wageGrowth: 3.5,
      inflation: 2.5,
      contributionCollection: 95.0,
    },
    {
      id: 'pessimistic',
      name: 'Wariant 2 (Pesymistyczny)',
      description: 'Niekorzystne trendy demograficzne i ekonomiczne',
      unemploymentRate: 7.8,
      wageGrowth: 2.1,
      inflation: 3.2,
      contributionCollection: 92.0,
    },
    {
      id: 'optimistic',
      name: 'Wariant 3 (Optymistyczny)',
      description: 'Korzystne założenia rozwoju gospodarczego',
      unemploymentRate: 3.5,
      wageGrowth: 4.8,
      inflation: 2.0,
      contributionCollection: 97.5,
    },
  ];

  // Funkcja do generowania danych demograficznych na podstawie parametrów
  const generateDemographicData = () => {
    const baseWorkingAge = [22.4, 21.8, 20.1, 18.9, 17.8, 16.9, 15.8];
    const baseRetirees = [9.2, 10.1, 12.3, 13.2, 13.8, 13.9, 13.7];
    
    // Modyfikacja populacji w wieku produkcyjnym na podstawie stopy bezrobocia
    // (wyższa stopa bezrobocia może oznaczać mniejszą aktywność zawodową)
    const unemploymentFactor = 1 - (customParams.unemploymentRate - 5.2) * 0.02;
    
    return {
      workingAge: baseWorkingAge.map(val => Math.max(val * unemploymentFactor, 10)),
      // Populacja emerytów pozostaje stała - to dane demograficzne niezależne od parametrów ekonomicznych
      retirees: baseRetirees
    };
  };

  const demographicData = generateDemographicData();
  
  // Dane demograficzne do wykresu
  const demographicChartData = {
    labels: ['2025', '2030', '2040', '2050', '2060', '2070', '2080'],
    datasets: [
      {
        label: 'Populacja w wieku produkcyjnym (mln)',
        data: demographicData.workingAge,
        borderColor: 'rgb(0, 153, 63)',
        backgroundColor: 'rgba(0, 153, 63, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Populacja emerytów (mln)',
        data: demographicData.retirees,
        borderColor: 'rgb(255, 179, 79)',
        backgroundColor: 'rgba(255, 179, 79, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const demographicOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Prognoza demograficzna MF 2022-2080',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liczba osób (mln)',
        },
      },
    },
  };

  // Funkcja do generowania danych salda funduszu na podstawie parametrów
  const generateFundBalanceData = () => {
    const baseOptimistic = [120, 150, 180, 200, 210, 220, 230];
    const basePessimistic = [80, 60, 40, 20, -10, -30, -50];
    const baseIntermediate = [100, 105, 110, 115, 120, 125, 130];
    
    // Modyfikacja na podstawie ściągalności składek i inflacji
    const collectionFactor = customParams.contributionCollection / 92;
    const inflationFactor = 1 - (customParams.inflation - 2.5) * 0.1;
    
    let baseData = selectedScenario === 'optimistic' ? baseOptimistic :
                   selectedScenario === 'pessimistic' ? basePessimistic :
                   baseIntermediate;
    
    return baseData.map(val => val * collectionFactor * inflationFactor);
  };

  // Dane salda funduszu
  const fundBalanceData = {
    labels: ['2025', '2030', '2040', '2050', '2060', '2070', '2080'],
    datasets: [
      {
        label: 'Saldo funduszu (mld zł)',
        data: generateFundBalanceData(),
        backgroundColor: selectedScenario === 'optimistic' ? 'rgba(0, 153, 63, 0.8)' :
                        selectedScenario === 'pessimistic' ? 'rgba(255, 99, 132, 0.8)' :
                        'rgba(63, 132, 210, 0.8)',
        borderColor: selectedScenario === 'optimistic' ? 'rgb(0, 153, 63)' :
                    selectedScenario === 'pessimistic' ? 'rgb(255, 99, 132)' :
                    'rgb(63, 132, 210)',
        borderWidth: 1,
      },
    ],
  };

  const fundBalanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Prognoza salda funduszu emerytalnego',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Saldo (mld zł)',
        },
        ticks: {
          callback: function(value: any) {
            return value + ' mld zł';
          },
        },
      },
    },
  };

  // Funkcja do generowania danych stopy zastąpienia na podstawie parametrów
  const generateReplacementRateData = () => {
    const baseOptimistic = [52, 48, 45, 42, 40, 38, 36];
    const basePessimistic = [48, 42, 38, 34, 30, 28, 25];
    const baseIntermediate = [50, 45, 41, 38, 35, 32, 30];
    
    // Modyfikacja na podstawie wzrostu płac i ściągalności składek
    const wageGrowthFactor = 1 + (customParams.wageGrowth - 3.5) * 0.02;
    const collectionFactor = customParams.contributionCollection / 92;
    
    let baseData = selectedScenario === 'optimistic' ? baseOptimistic :
                   selectedScenario === 'pessimistic' ? basePessimistic :
                   baseIntermediate;
    
    return baseData.map(val => Math.min(val * wageGrowthFactor * collectionFactor, 60));
  };

  // Dane stopy zastąpienia
  const replacementRateData = {
    labels: ['2025', '2030', '2040', '2050', '2060', '2070', '2080'],
    datasets: [
      {
        label: 'Stopa zastąpienia (%)',
        data: generateReplacementRateData(),
        borderColor: 'rgb(63, 132, 210)',
        backgroundColor: 'rgba(63, 132, 210, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const replacementRateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Stopa zastąpienia w 2060 roku (%)',
      },
    },
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId as 'intermediate' | 'pessimistic' | 'optimistic');
    const scenario = fus20Scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setCustomParams({
        scenario: scenarioId as 'intermediate' | 'pessimistic' | 'optimistic',
        unemploymentRate: scenario.unemploymentRate,
        wageGrowth: scenario.wageGrowth,
        inflation: scenario.inflation,
        contributionCollection: scenario.contributionCollection,
      });
    }
  };

  const handleParameterChange = (parameter: string, value: number) => {
    setCustomParams(prev => ({
      ...prev,
      [parameter]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zus-green-primary/5 to-zus-blue/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zus-navy mb-4">
            Dashboard Aktuarialny FUS20
          </h2>
          <p className="text-zus-gray-600">
            Zaawansowana analiza parametrów systemu emerytalnego z wykorzystaniem prognoz FUS20 do 2080 roku
          </p>
        </div>

        {/* Scenario Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Wybór wariantu FUS20
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {fus20Scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-zus-green-primary bg-zus-green-primary/5'
                    : 'border-zus-gray-200 hover:border-zus-gray-300'
                }`}
                onClick={() => handleScenarioChange(scenario.id)}
              >
                <h4 className="font-semibold text-zus-navy mb-2">{scenario.name}</h4>
                <p className="text-sm text-zus-gray-600 mb-3">{scenario.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Bezrobocie:</span>
                    <span className="font-medium">{scenario.unemploymentRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wzrost płac:</span>
                    <span className="font-medium">{scenario.wageGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inflacja:</span>
                    <span className="font-medium">{scenario.inflation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>

        {/* Custom Parameters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sliders className="h-5 w-5 mr-2" />
              Modyfikacja założeń makroekonomicznych
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-zus-navy mb-2">
                Stopa bezrobocia (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={customParams.unemploymentRate}
                onChange={(e) => handleParameterChange('unemploymentRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zus-navy mb-2">
                Wzrost płac realny (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={customParams.wageGrowth}
                onChange={(e) => handleParameterChange('wageGrowth', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zus-navy mb-2">
                Inflacja ogółem (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={customParams.inflation}
                onChange={(e) => handleParameterChange('inflation', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zus-navy mb-2">
                Ściągalność składek (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={customParams.contributionCollection}
                onChange={(e) => handleParameterChange('contributionCollection', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleRecalculateForecasts}
              disabled={isRecalculating}
              className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:ring-offset-2 flex items-center ${
                isRecalculating 
                  ? 'bg-zus-gray-300 text-zus-gray-500 cursor-not-allowed' 
                  : 'bg-zus-green-primary text-white hover:bg-zus-green-primary/90'
            }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Przeliczanie...' : 'Przelicz prognozy'}
            </button>
            <button className="bg-white text-zus-navy px-4 py-2 rounded-md border border-zus-navy hover:bg-zus-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zus-navy focus:ring-offset-2 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Eksportuj dane
            </button>
          </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <Card className={`transition-opacity duration-500 ${chartsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <CardContent>
              {isRecalculating ? (
                <div className="h-64 bg-zus-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-zus-gray-500">Przeliczanie danych...</div>
                </div>
              ) : (
                <Line data={demographicChartData} options={demographicOptions} />
              )}
            </CardContent>
          </Card>
          <Card className={`transition-opacity duration-500 ${chartsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <CardContent>
              {isRecalculating ? (
                <div className="h-64 bg-zus-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-zus-gray-500">Przeliczanie danych...</div>
                </div>
              ) : (
                <Bar data={fundBalanceData} options={fundBalanceOptions} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <Card className={`transition-opacity duration-500 ${chartsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <CardContent>
              {isRecalculating ? (
                <div className="h-64 bg-zus-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-zus-gray-500">Przeliczanie danych...</div>
                </div>
              ) : (
                <Line data={replacementRateData} options={replacementRateOptions} />
              )}
            </CardContent>
          </Card>
          
          {/* Key Indicators */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Kluczowe wskaźniki systemu emerytalnego
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Współczynnik obciążenia demograficznego</span>
                  <AnimatedNumber 
                    value={0.55 * (1 + (customParams.unemploymentRate - 5.2) * 0.01)} 
                    formatFunction={(val) => val.toFixed(2)}
                    className="font-semibold text-zus-navy"
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Średni wiek przejścia na emeryturę</span>
                  <AnimatedNumber 
                    value={62.3 + (customParams.wageGrowth - 3.5) * 0.2} 
                    formatFunction={(val) => `${val.toFixed(1)} lat`}
                    className="font-semibold text-zus-navy"
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Przeciętne dalsze trwanie życia</span>
                  <AnimatedNumber 
                    value={19.2 - (customParams.inflation - 2.5) * 0.1} 
                    formatFunction={(val) => `${val.toFixed(1)} lat`}
                    className="font-semibold text-zus-navy"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Stopa waloryzacji składek (2024)</span>
                  <AnimatedNumber 
                    value={15.26 + (customParams.wageGrowth - 3.5) * 2} 
                    formatFunction={(val) => `${val.toFixed(2)}%`}
                    className="font-semibold text-zus-navy"
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Średnia emerytura (2024)</span>
                  <AnimatedNumber 
                    value={2847 * (1 + (customParams.wageGrowth - 3.5) * 0.05)} 
                    formatFunction={(val) => `${Math.round(val).toLocaleString('pl-PL')} zł`}
                    className="font-semibold text-zus-navy"
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-zus-gray-50 rounded-lg">
                  <span className="text-zus-gray-600">Deficyt FUS (% PKB)</span>
                  <AnimatedNumber 
                    value={-1.2 - (customParams.contributionCollection - 92) * 0.02} 
                    formatFunction={(val) => `${val.toFixed(1)}%`}
                    className="font-semibold text-zus-red"
                  />
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>

        {/* County-Specific Sick Leave Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Szczegółowe okresy chorobowe wg powiatu
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-zus-navy mb-2">
                Wybierz powiat
              </label>
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-green-primary focus:border-transparent"
              >
                {COUNTY_PENSION_DATA.map((county) => (
                  <option key={county.name} value={county.name}>
                    {county.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="bg-zus-green-primary/10 p-4 rounded-lg w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zus-gray-600">Przeciętna długość absencji</p>
                    <p className="text-2xl font-bold text-zus-navy">
                      {selectedCountySickLeave?.averageAbsenceDays || 'N/A'} dni
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-zus-green-primary" />
                </div>
              </div>
            </div>
          </div>
          
          {selectedCountySickLeave && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <h4 className="font-semibold text-zus-navy mb-3">Statystyki absencji</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Średnia długość zaświadczenia:</span>
                    <span className="font-medium">{selectedCountySickLeave.averageCertificateDays} dni</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liczba przypadków/rok:</span>
                    <span className="font-medium">{selectedCountySickLeave.casesPerYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Procent pracowników:</span>
                    <span className="font-medium">{selectedCountySickLeave.percentageOfWorkers}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-zus-navy mb-3">Porównanie z krajem</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Średnia krajowa:</span>
                    <span className="font-medium">14.2 dni</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Różnica:</span>
                    <span className={`font-medium ${
                      (selectedCountySickLeave.averageAbsenceDays - 14.2) > 0 
                        ? 'text-zus-red' 
                        : 'text-zus-green'
                    }`}>
                      {(selectedCountySickLeave.averageAbsenceDays - 14.2) > 0 ? '+' : ''}
                      {(selectedCountySickLeave.averageAbsenceDays - 14.2).toFixed(1)} dni
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pozycja w rankingu:</span>
                    <span className="font-medium">{selectedCountySickLeave.nationalRanking}/380</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-zus-navy mb-3">Wpływ na emeryturę</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Redukcja składek:</span>
                    <span className="font-medium text-zus-red">
                      -{((selectedCountySickLeave.averageAbsenceDays / 365) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Szacowana strata emerytury:</span>
                    <span className="font-medium text-zus-red">
                      -{Math.round((selectedCountySickLeave.averageAbsenceDays / 365) * 2847)} zł/mies.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Account Balance Projection */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Podgląd zgromadzonych środków ZUS
              </CardTitle>
            <button
              onClick={() => setShowAccountProjection(!showAccountProjection)}
              className="bg-zus-green-primary text-white px-4 py-2 rounded-md hover:bg-zus-green-primary/90 transition-colors"
            >
              {showAccountProjection ? 'Ukryj projekcję' : 'Pokaż projekcję'}
            </button>
          </div>
          </CardHeader>
          <CardContent>
            {showAccountProjection && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <h4 className="font-semibold text-zus-navy mb-3">Projekcja konta głównego</h4>
                <Line 
                  data={{
                    labels: accountProjection.years,
                    datasets: [{
                      label: 'Konto główne (zł)',
                      data: accountProjection.mainAccount,
                      borderColor: 'rgb(0, 153, 63)',
                      backgroundColor: 'rgba(0, 153, 63, 0.1)',
                      tension: 0.1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: true, text: 'Wzrost środków na koncie głównym' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return new Intl.NumberFormat('pl-PL').format(value) + ' zł';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <h4 className="font-semibold text-zus-navy mb-3">Projekcja subkonta</h4>
                <Line 
                  data={{
                    labels: accountProjection.years,
                    datasets: [{
                      label: 'Subkonto (zł)',
                      data: accountProjection.subAccount,
                      borderColor: 'rgb(255, 179, 79)',
                      backgroundColor: 'rgba(255, 179, 79, 0.1)',
                      tension: 0.1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: true, text: 'Wzrost środków na subkoncie' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return new Intl.NumberFormat('pl-PL').format(value) + ' zł';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zus-gray-50 p-4 rounded-lg text-center">
              <DollarSign className="h-6 w-6 text-zus-green-primary mx-auto mb-2" />
              <p className="text-sm text-zus-gray-600">Łączne środki (2024)</p>
              <p className="text-lg font-bold text-zus-navy">
                {new Intl.NumberFormat('pl-PL').format(
                  accountProjection.mainAccount[0] + accountProjection.subAccount[0]
                )} zł
              </p>
            </div>
            
            <div className="bg-zus-gray-50 p-4 rounded-lg text-center">
              <Calendar className="h-6 w-6 text-zus-green-primary mx-auto mb-2" />
              <p className="text-sm text-zus-gray-600">Prognoza na emeryturę</p>
              <p className="text-lg font-bold text-zus-navy">
                {new Intl.NumberFormat('pl-PL').format(
                  accountProjection.mainAccount[accountProjection.mainAccount.length - 1] + 
                  accountProjection.subAccount[accountProjection.subAccount.length - 1]
                )} zł
              </p>
            </div>
            
            <div className="bg-zus-gray-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-6 w-6 text-zus-green-primary mx-auto mb-2" />
              <p className="text-sm text-zus-gray-600">Średni wzrost roczny</p>
              <p className="text-lg font-bold text-zus-navy">
                {((accountProjection.totalContributions / accountProjection.years.length) / 1000).toFixed(0)}k zł
              </p>
            </div>
            
            <div className="bg-zus-gray-50 p-4 rounded-lg text-center">
              <AlertTriangle className="h-6 w-6 text-zus-orange mx-auto mb-2" />
              <p className="text-sm text-zus-gray-600">Ryzyko inflacyjne</p>
              <p className="text-lg font-bold text-zus-navy">
                {customParams.inflation.toFixed(1)}% rocznie
              </p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Regional Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>
              Analiza regionalna i zawodowa
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <h4 className="font-semibold text-zus-navy mb-3">Przeciętne emerytury wg województw</h4>
              <div className="space-y-2 text-sm">
                {COUNTY_PENSION_DATA.slice(0, 5).map((county) => (
                  <div key={county.name} className="flex justify-between">
                    <span>{county.displayName}</span>
                    <span className="font-medium">{new Intl.NumberFormat('pl-PL').format(county.averagePension)} zł</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-zus-navy mb-3">Absencja chorobowa wg wieku</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>20-30 lat</span>
                  <span className="font-medium">8.2 dni/rok</span>
                </div>
                <div className="flex justify-between">
                  <span>31-40 lat</span>
                  <span className="font-medium">12.5 dni/rok</span>
                </div>
                <div className="flex justify-between">
                  <span>41-50 lat</span>
                  <span className="font-medium">18.7 dni/rok</span>
                </div>
                <div className="flex justify-between">
                  <span>51-60 lat</span>
                  <span className="font-medium">26.3 dni/rok</span>
                </div>
                <div className="flex justify-between">
                  <span>60+ lat</span>
                  <span className="font-medium">34.1 dni/rok</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-zus-navy mb-3">Opóźnienie emerytury</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>+1 rok</span>
                  <span className="font-medium text-zus-green">+8.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>+2 lata</span>
                  <span className="font-medium text-zus-green">+17.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>+3 lata</span>
                  <span className="font-medium text-zus-green">+28.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>+5 lat</span>
                  <span className="font-medium text-zus-green">+52.1%</span>
                </div>
                <div className="text-xs text-zus-gray-500 mt-3">
                  * Wzrost wysokości świadczenia emerytalnego
                </div>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;