import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Info,
  Download,
  MapPin,
  Settings,
  ArrowLeft,
  CheckCircle,
  TrendingDown,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
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


  if (!state || !state.pensionResult) {
    return (
      <div className="min-h-screen bg-zus-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zus-gray-900 mb-4">Brak danych do wyświetlenia</h2>
          <Link to="/formularz" className="text-zus-green-primary hover:text-zus-green-primary/80">
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
      postalCode: undefined,
      generatedAt: new Date()
    };

    generateUserPDFReport(reportData);
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
    <div className="min-h-screen bg-zus-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        <div className="mb-6">
          <Card variant="success" className="border-zus-green-primary/20 bg-zus-green-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-zus-green-primary mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-zus-green-primary">
                    Prognoza emerytury została obliczona pomyślnie
                  </h2>
                  <p className="text-sm text-zus-gray-700 mt-1">
                    Poniżej znajdziesz szczegółowe wyniki analizy Twojej przyszłej emerytury
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card variant="default" className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="p-2 bg-zus-green-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-zus-green-primary" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zus-gray-600 mb-2">Miesięczna emerytura</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-zus-gray-500">Nominalna:</p>
                    <p className="text-lg font-bold text-zus-gray-900">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(pensionResult.nominalPensionValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-gray-500">Realna (siła nabywcza):</p>
                    <p className="text-lg font-bold text-zus-green-primary">
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
          </Card>

          <Card variant="default" className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${
                pensionResult.replacementRate >= 40 
                  ? 'bg-zus-green-primary/10' 
                  : pensionResult.replacementRate >= 30 
                    ? 'bg-zus-yellow/10' 
                    : 'bg-zus-red/10'
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  pensionResult.replacementRate >= 40 
                    ? 'text-zus-green-primary' 
                    : pensionResult.replacementRate >= 30 
                      ? 'text-zus-yellow' 
                      : 'text-zus-red'
                }`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zus-gray-600 mb-2">Stopa zastąpienia</p>
                <p className="text-2xl font-bold text-zus-gray-900 mb-1">
                  {pensionResult.replacementRate.toFixed(1)}%
                </p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  pensionResult.replacementRate >= 40 
                    ? 'bg-zus-green-primary/10 text-zus-green-primary' 
                    : pensionResult.replacementRate >= 30 
                      ? 'bg-zus-yellow/10 text-zus-yellow' 
                      : 'bg-zus-red/10 text-zus-red'
                }`}>
                  {pensionResult.replacementRate >= 40 
                    ? '✓ Dobra stopa' 
                    : pensionResult.replacementRate >= 30 
                      ? '⚠ Średnia stopa'
                      : '⚠ Niska stopa'
                  }
                </div>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="p-2 bg-zus-green-primary/10 rounded-lg">
          <Calendar className="h-6 w-6 text-zus-green-primary" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zus-gray-600 mb-2">Lata do emerytury</p>
                <p className="text-2xl font-bold text-zus-gray-900 mb-1">
                  {pensionResult.yearsToRetirement}
                </p>
                <p className="text-xs text-zus-gray-500">
                  Planowana emerytura: {personData.retirementYear || (new Date().getFullYear() + pensionResult.yearsToRetirement)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="p-2 bg-zus-navy/10 rounded-lg">
          <DollarSign className="h-6 w-6 text-zus-navy" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zus-gray-600 mb-2">Łączne składki</p>
                <p className="text-lg font-bold text-zus-gray-900 mb-1">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    minimumFractionDigits: 0,
                  }).format(pensionResult.totalContributions)}
                </p>
                <p className="text-xs text-zus-gray-500">
                  Suma wszystkich wpłaconych składek
                </p>
              </div>
            </div>
          </Card>
        </div>



        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link to="/dashboard" className="flex-1 sm:flex-none">
            <Button variant="primary" size="large" className="w-full sm:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              Zaawansowana analiza
            </Button>
          </Link>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-zus-green" />
                Prognoza składek emerytalnych
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={contributionProjectionData} options={chartOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingDown className="h-5 w-5 mr-2 text-zus-green-primary" />
                Porównanie wysokości świadczeń
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={benefitComparisonData} options={barChartOptions} />
            </CardContent>
          </Card>
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

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="h-5 w-5 mr-2 text-zus-green-primary" />
                Wpływ inflacji i waloryzacji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zus-gray-100">
                  <span className="text-zus-gray-600">Nominalna wartość emerytury:</span>
                  <span className="font-semibold text-zus-gray-900">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(pensionResult.monthlyPension)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zus-gray-100">
          <span className="text-zus-gray-600">Realna wartość (dzisiejsza siła nabywcza):</span>
                  <span className="font-semibold text-zus-gray-900">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(pensionResult.realPensionValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zus-gray-100">
          <span className="text-zus-gray-600">Prognozowana inflacja:</span>
                  <span className="font-semibold text-zus-gray-900">{pensionResult.projectedInflation.toFixed(1)}% rocznie</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zus-gray-600">Kapitał początkowy:</span>
                  <span className="font-semibold text-zus-gray-900">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      minimumFractionDigits: 0,
                    }).format(pensionResult.initialCapital)}
                  </span>
                </div>
                
                {/* Contribution Types Explanation */}
                <Card variant="info" className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-base">Rodzaje składek emerytalnych</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zus-green-primary">• Łączne składki (brutto):</span>
          <span className="font-medium text-zus-green-primary">
                          {new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN',
                            minimumFractionDigits: 0,
                          }).format(pensionResult.totalContributions)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zus-green-primary">• Po waloryzacji i ściągalności:</span>
          <span className="font-medium text-zus-green-primary">
                          {new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN',
                            minimumFractionDigits: 0,
                          }).format(pensionResult.valorizedContributions)}
                        </span>
                      </div>
                      <p className="text-xs text-zus-gray-600 mt-3 p-3 bg-zus-green-primary/10 rounded-lg">
                        Różnica wynika z waloryzacji historycznych składek oraz uwzględnienia ściągalności składek ({((pensionResult.valorizedContributions / pensionResult.totalContributions) * 100).toFixed(1)}% z łącznych składek).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2 text-zus-green-primary" />
                Analiza opóźnienia emerytury
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 bg-zus-green-primary/10 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-zus-green-primary mb-2">Opóźnienie o 1 rok</h4>
                    <p className="text-sm text-zus-green-primary/80 mb-2">
                      Wzrost: +{((calculateRetirementDelay(personData, 1, fus20Params).delayedPension / pensionResult.monthlyPension - 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-lg font-bold text-zus-green-primary">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(calculateRetirementDelay(personData, 1, fus20Params).delayedPension)}
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-zus-green-primary/10 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-zus-green-primary mb-2">Opóźnienie o 2 lata</h4>
                    <p className="text-sm text-zus-green-primary/80 mb-2">
                      Wzrost: +{delayAnalysis.increasePercentage.toFixed(1)}%
                    </p>
                    <p className="text-lg font-bold text-zus-green-primary">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(delayAnalysis.delayedPension)}
                    </p>
                  </div>

                  <div className="flex-1 bg-zus-green-primary/10 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-zus-green-primary mb-2">Opóźnienie o 5 lat</h4>
                    <p className="text-sm text-zus-green-primary/80 mb-2">
                      Wzrost: +{((calculateRetirementDelay(personData, 5, fus20Params).delayedPension / pensionResult.monthlyPension - 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-lg font-bold text-zus-green-primary">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(calculateRetirementDelay(personData, 5, fus20Params).delayedPension)}
                    </p>
                  </div>
                </div>
                
                <Card variant="default">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-zus-gray-700 mb-2 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Statystyki opóźnień w Polsce
                    </h4>
                    <p className="text-sm text-zus-gray-600">
                      {delayStats.national.delay2YearsPlus.toFixed(1)}% Polaków opóźnia emeryturę o 2 lata lub więcej
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="default">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-zus-gray-700 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Dodatkowe informacje
                    </h4>
                    <ul className="text-sm text-zus-gray-600 space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-zus-green" />
                        Przewidywana długość życia: {pensionResult.lifeExpectancy.toFixed(1)} lat
                      </li>
                      <li className="flex items-center" title="Składki po uwzględnieniu waloryzacji historycznych składek oraz współczynnika ściągalności">
                        <CheckCircle className="h-4 w-4 mr-2 text-zus-green" />
                        Składki po waloryzacji i ściągalności: {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                        minimumFractionDigits: 0,
                      }).format(pensionResult.valorizedContributions)}
                      </li>
                      {pensionResult.sickLeaveImpact > 0 && (
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-zus-orange" />
                          Wpływ zwolnień lekarskich: -{pensionResult.sickLeaveImpact.toFixed(1)}% składek
                        </li>
                      )}
                      <li className="flex items-center">
                        <Info className="h-4 w-4 mr-2 text-zus-green-primary" />
                        Scenariusz FUS20: {fus20Params.scenario === 'intermediate' ? 'Pośredni' : 
                        fus20Params.scenario === 'pessimistic' ? 'Pesymistyczny' : 'Optymistyczny'}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;