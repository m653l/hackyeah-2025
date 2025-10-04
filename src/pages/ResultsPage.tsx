import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Info,
  Download,
  MapPin
} from 'lucide-react';
// import logoUrl from '/logo.png?url';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  calculateRetirementDelay, 
  type PensionCalculationResult, 
  type PersonData, 
  type FUS20Parameters 
} from '../utils/actuarialCalculations';
import { 
  getRetirementDelayStatistics
} from '../utils/dataIntegration';
import { 
  generateUserPDFReport, 
  type UserReportData 
} from '../utils/reportGenerator';
import { ProfessionalContext } from '../components/ProfessionalContext';
import { ReportingSystem } from '../components/ReportingSystem';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LocationState {
  formData: any;
  pensionResult: PensionCalculationResult;
  personData: PersonData;
  fus20Params: FUS20Parameters;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [postalCode, setPostalCode] = useState<string>('');
  const [showPostalCodeInput, setShowPostalCodeInput] = useState<boolean>(false);

  if (!state || !state.pensionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Brak danych do wyświetlenia</h2>
          <Link to="/formularz" className="text-zus-orange hover:text-zus-orange-dark">
            Wróć do formularza
          </Link>
        </div>
      </div>
    );
  }

  const { pensionResult, personData, fus20Params } = state;

  // Analiza opóźnienia emerytury
  const delayAnalysis = calculateRetirementDelay(personData, 2, fus20Params);
  
  // Statystyki opóźnienia emerytury
  const delayStats = getRetirementDelayStatistics();

  // Funkcja do generowania raportu PDF
  const handleGeneratePDFReport = () => {
    const reportData: UserReportData = {
      personalInfo: {
        age: personData.age,
        gender: personData.gender,
        salary: personData.salary,
        workStartYear: personData.workStartYear || new Date().getFullYear() - (personData.age - 18),
        plannedRetirementYear: personData.retirementYear || (new Date().getFullYear() + pensionResult.yearsToRetirement)
      },
      pensionResults: {
        monthlyPension: pensionResult.monthlyPension,
        replacementRate: pensionResult.replacementRate,
        yearsToRetirement: pensionResult.yearsToRetirement,
        totalContributions: pensionResult.totalContributions,
        realPensionValue: pensionResult.realPensionValue,
        projectedInflation: pensionResult.projectedInflation,
        initialCapital: pensionResult.initialCapital,
        valorizedContributions: pensionResult.valorizedContributions,
        lifeExpectancy: pensionResult.lifeExpectancy
      },
      fus20Params: {
        scenario: fus20Params.scenario === 'intermediate' ? 'Pośredni' : 
                 fus20Params.scenario === 'pessimistic' ? 'Pesymistyczny' : 'Optymistyczny',
        unemploymentRate: fus20Params.unemploymentRate,
        realWageGrowth: fus20Params.wageGrowth,
        contributionCollection: fus20Params.contributionCollection
      },
      delayAnalysis: {
        originalPension: delayAnalysis.originalPension,
        delayedPension: delayAnalysis.delayedPension,
        increasePercentage: delayAnalysis.increasePercentage
      },
      postalCode: postalCode || undefined,
      generatedAt: new Date()
    };

    generateUserPDFReport(reportData);
  };

  // Walidacja kodu pocztowego
  const isValidPostalCode = (code: string): boolean => {
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    return postalCodeRegex.test(code);
  };

  // Funkcja pomocnicza do uzyskania wynagrodzenia dla konkretnego roku (zgodna z actuarialCalculations.ts)
  const getSalaryForYear = (year: number): number => {
    // Sprawdź czy mamy dane historyczne dla tego konkretnego roku
    if (personData.historicalSalaries && personData.historicalSalaries.length > 0) {
      const historicalSalary = personData.historicalSalaries.find(item => item.year === year);
      if (historicalSalary && historicalSalary.amount > 0) {
        return historicalSalary.amount; // Dane historyczne są już roczne
      }
    }
    
    // Jeśli brak danych historycznych dla tego roku, użyj obecnego wynagrodzenia z prognozą wzrostu
    const currentYear = new Date().getFullYear();
    const wageGrowthRate = (fus20Params.wageGrowth || 3.5) / 100;
    
    // Wynagrodzenie z formularza jest MIESIĘCZNE, więc trzeba je pomnożyć przez 12
    let projectedSalary = Math.max(personData.salary * 12, 0);
    
    // Jeśli rok jest w przyszłości względem obecnego roku, zastosuj prognozę wzrostu
    if (year > currentYear) {
      const yearsInFuture = year - currentYear;
      projectedSalary = projectedSalary * Math.pow(1 + wageGrowthRate, yearsInFuture);
    }
    
    return projectedSalary;
  };

  // Dane do wykresów - uwzględniające dane historyczne z Dashboard zaawansowany
  const contributionProjectionData = {
    labels: Array.from({ length: pensionResult.yearsToRetirement }, (_, i) => 
      new Date().getFullYear() + i + 1
    ),
    datasets: [
      {
        label: 'Roczne składki emerytalne (zł)',
        data: Array.from({ length: pensionResult.yearsToRetirement }, (_, i) => {
          const year = new Date().getFullYear() + i + 1;
          const yearSalary = getSalaryForYear(year);
          // Składka emerytalna (19.52% z wynagrodzenia brutto)
          const annualContribution = yearSalary * 0.1952;
          return annualContribution;
        }),
        borderColor: 'rgb(255, 179, 79)',
        backgroundColor: 'rgba(255, 179, 79, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Skumulowane składki (zł)',
        data: Array.from({ length: pensionResult.yearsToRetirement }, (_, i) => {
          let cumulativeContributions = 0;
          for (let j = 0; j <= i; j++) {
            const year = new Date().getFullYear() + j + 1;
            const yearSalary = getSalaryForYear(year);
            const annualContribution = yearSalary * 0.1952;
            cumulativeContributions += annualContribution;
          }
          return cumulativeContributions;
        }),
        borderColor: 'rgb(0, 153, 63)',
        backgroundColor: 'rgba(0, 153, 63, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const benefitComparisonData = {
    labels: ['Obecna emerytura', 'Opóźnienie o 2 lata', 'Średnia krajowa'],
    datasets: [
      {
        label: 'Miesięczna emerytura (zł)',
        data: [
          pensionResult.monthlyPension,
          delayAnalysis.delayedPension,
          2850 // Średnia krajowa
        ],
        backgroundColor: [
          'rgba(255, 179, 79, 0.8)',
          'rgba(0, 153, 63, 0.8)',
          'rgba(108, 117, 125, 0.8)',
        ],
        borderColor: [
          'rgb(255, 179, 79)',
          'rgb(0, 153, 63)',
          'rgb(108, 117, 125)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Prognoza składek emerytalnych',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Porównanie wysokości świadczeń',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-2 rounded-lg mr-3">
                <img 
                  src="/logo.png" 
                  alt="ZUS Logo" 
                  className="h-10 w-10 object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <TrendingUp className="h-10 w-10 text-white" style={{ display: 'none' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zus-navy">
                  ZUS na Plus
                </h1>
                <p className="text-sm text-slate-600">Hackathon 2025</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Strona główna
              </Link>
              <Link
                to="/formularz"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Symulacja
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Kluczowe wskaźniki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-zus-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Miesięczna emerytura</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">
                    <span className="text-sm font-medium text-gray-600">Nominalna: </span>
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(pensionResult.nominalPensionValue)}
                  </p>
                  <p className="text-lg font-bold text-zus-green">
                    <span className="text-sm font-medium text-gray-600">Realna: </span>
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(pensionResult.realPensionValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-zus-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stopa zastąpienia</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {pensionResult.replacementRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {pensionResult.replacementRate >= 40 
                      ? '✅ Dobra stopa zastąpienia' 
                      : pensionResult.replacementRate >= 30 
                        ? '⚠️ Średnia stopa zastąpienia'
                        : '❌ Niska stopa zastąpienia'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-zus-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lata do emerytury</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pensionResult.yearsToRetirement}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-zus-navy" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600" title="Suma wszystkich składek emerytalnych wpłaconych w trakcie kariery zawodowej">
                  Łączne składki
                </p>
                <p className="text-xs text-gray-500 mb-1">Suma wszystkich wpłaconych składek</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.totalContributions)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kod pocztowy (opcjonalny) */}
        {showPostalCodeInput && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-zus-blue" />
              Kod pocztowy (opcjonalny)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Podanie kodu pocztowego pomoże nam w analizie regionalnej wykorzystania symulatora.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kod pocztowy (format: XX-XXX)
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="np. 00-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                  maxLength={6}
                />
                {postalCode && !isValidPostalCode(postalCode) && (
                  <p className="text-sm text-red-600 mt-1">Nieprawidłowy format kodu pocztowego</p>
                )}
              </div>
              <button
                onClick={() => setShowPostalCodeInput(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Pomiń
              </button>
            </div>
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/dashboard"
            className="bg-zus-orange text-white px-6 py-3 rounded-lg hover:bg-zus-orange-dark transition-colors flex items-center"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Zaawansowana analiza
          </Link>
          <button 
            onClick={handleGeneratePDFReport}
            className="bg-white text-zus-orange border border-zus-orange px-6 py-3 rounded-lg hover:bg-zus-orange hover:text-white transition-colors flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Pobierz raport PDF
          </button>
          {!showPostalCodeInput && (
            <button 
              onClick={() => setShowPostalCodeInput(true)}
              className="bg-white text-zus-blue border border-zus-blue px-6 py-3 rounded-lg hover:bg-zus-blue hover:text-white transition-colors flex items-center"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Dodaj kod pocztowy
            </button>
          )}
        </div>

        {/* Wykresy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prognoza składek emerytalnych</h3>
            <Line data={contributionProjectionData} options={chartOptions} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Porównanie wysokości świadczeń</h3>
            <Bar data={benefitComparisonData} options={barChartOptions} />
          </div>
        </div>

        {/* Professional Context */}
        {personData.professionalGroup && (
          <div className="mb-8">
            <ProfessionalContext
              selectedGroupId={personData.professionalGroup}
              onGroupSelect={() => {}} // Read-only in results
              userPension={pensionResult.monthlyPension}
            />
          </div>
        )}

        {/* Reporting System */}
        <div className="mb-8">
          <ReportingSystem
            pensionData={pensionResult}
            personData={personData}
          />
        </div>

        {/* Szczegółowa analiza */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-zus-blue" />
              Wpływ inflacji i waloryzacji
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Nominalna wartość emerytury:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.monthlyPension)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Realna wartość (dzisiejsza siła nabywcza):</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.realPensionValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prognozowana inflacja:</span>
                <span className="font-semibold">{pensionResult.projectedInflation.toFixed(1)}% rocznie</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kapitał początkowy:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.initialCapital)}
                </span>
              </div>
              
              {/* Dodatkowe wyjaśnienia różnic między składkami */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Rodzaje składek emerytalnych</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>• Łączne składki (brutto):</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(pensionResult.totalContributions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Po waloryzacji i ściągalności:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(pensionResult.valorizedContributions)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Różnica wynika z waloryzacji historycznych składek oraz uwzględnienia ściągalności składek ({((pensionResult.valorizedContributions / pensionResult.totalContributions) * 100).toFixed(1)}% z łącznych składek).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-zus-orange" />
              Analiza opóźnienia emerytury
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Opóźnienie o 1 rok</h4>
                  <p className="text-sm text-green-700 mb-1">
                    Wzrost: +{((calculateRetirementDelay(personData, 1, fus20Params).delayedPension / pensionResult.monthlyPension - 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(calculateRetirementDelay(personData, 1, fus20Params).delayedPension)}
                  </p>
                </div>
                
                <div className="p-4 bg-zus-orange bg-opacity-10 rounded-lg border border-zus-orange">
                  <h4 className="font-semibold text-zus-orange mb-2">Opóźnienie o 2 lata</h4>
                  <p className="text-sm text-orange-700 mb-1">
                    Wzrost: +{delayAnalysis.increasePercentage.toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-zus-orange">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(delayAnalysis.delayedPension)}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Opóźnienie o 5 lat</h4>
                  <p className="text-sm text-blue-700 mb-1">
                    Wzrost: +{((calculateRetirementDelay(personData, 5, fus20Params).delayedPension / pensionResult.monthlyPension - 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-lg font-bold text-blue-800">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(calculateRetirementDelay(personData, 5, fus20Params).delayedPension)}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Statystyki opóźnień w Polsce</h4>
                <p className="text-sm text-gray-600">
                  {delayStats.national.delay2YearsPlus.toFixed(1)}% Polaków opóźnia emeryturę o 2 lata lub więcej
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Dodatkowe informacje</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Przewidywana długość życia: {pensionResult.lifeExpectancy.toFixed(1)} lat</li>
                  <li title="Składki po uwzględnieniu waloryzacji historycznych składek oraz współczynnika ściągalności">
                    • Składki po waloryzacji i ściągalności: {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.valorizedContributions)}
                  </li>
                  {pensionResult.sickLeaveImpact > 0 && (
                    <li>• Wpływ zwolnień lekarskich: -{pensionResult.sickLeaveImpact.toFixed(1)}% składek</li>
                  )}
                  <li>• Scenariusz FUS20: {fus20Params.scenario === 'intermediate' ? 'Pośredni' : 
                    fus20Params.scenario === 'pessimistic' ? 'Pesymistyczny' : 'Optymistyczny'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;