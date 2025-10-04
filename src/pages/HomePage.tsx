import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Settings, 
  Shield, 
  FileText, 
  Award, 
  ChevronRight, 
  BarChart3,
  PiggyBank,
  Info,
  Lightbulb,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PENSION_GROUPS, PENSION_STATISTICS, getRandomTrivia, contextualizePension } from '../utils/dashboardData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HomePage: React.FC = () => {
  const [expectedPension, setExpectedPension] = useState<string>('');
  const [contextualization, setContextualization] = useState<string>('');
  const [currentTrivia, setCurrentTrivia] = useState(getRandomTrivia());
  const [showPensionInput, setShowPensionInput] = useState(false);

  useEffect(() => {
    if (expectedPension) {
      const amount = parseFloat(expectedPension);
      if (!isNaN(amount)) {
        const result = contextualizePension(amount);
        setContextualization(typeof result === 'string' ? result : JSON.stringify(result));
      }
    } else {
      setContextualization('');
    }
  }, [expectedPension]);

  const chartData = {
    labels: PENSION_GROUPS.map(group => group.name),
    datasets: [
      {
        label: 'Średnia wysokość emerytury (zł)',
        data: PENSION_GROUPS.map(group => group.averageAmount),
        backgroundColor: [
          'rgba(220, 38, 127, 0.8)',   // zus-pink
          'rgba(255, 102, 0, 0.8)',    // zus-orange
          'rgba(0, 150, 136, 0.8)',    // zus-green
          'rgba(33, 150, 243, 0.8)',   // zus-blue
          'rgba(13, 71, 161, 0.8)',    // zus-navy
        ],
        borderColor: [
          'rgba(220, 38, 127, 1)',
          'rgba(255, 102, 0, 1)',
          'rgba(0, 150, 136, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(13, 71, 161, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Średnie wysokości emerytur w Polsce (2024)',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#0d47a1',
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(13, 71, 161, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ff6600',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 16,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const groupIndex = context[0].dataIndex;
            return PENSION_GROUPS[groupIndex].name;
          },
          label: function(context: any) {
            const groupIndex = context.dataIndex;
            const group = PENSION_GROUPS[groupIndex];
            return [
              `Średnia: ${group.averageAmount.toLocaleString('pl-PL')} zł`,
              `Opis: ${group.description}`,
              `Charakterystyka: ${group.characteristics}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('pl-PL') + ' zł';
          },
          color: '#64748b',
          font: {
            size: 12,
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        }
      },
      x: {
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    }
  };

  const refreshTrivia = () => {
    setCurrentTrivia(getRandomTrivia());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-2 rounded-lg mr-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zus-navy">
                  Symulator Emerytalny ZUS
                </h1>
                <p className="text-sm text-slate-600">Hackathon 2025</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-zus-orange bg-zus-orange/10 rounded-lg font-medium"
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

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-zus-navy/5 via-transparent to-zus-orange/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-zus-orange/10 to-zus-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-zus-blue/10 to-zus-navy/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-zus-orange/10 to-zus-green/10 px-6 py-3 rounded-full mb-8 border border-zus-orange/20">
              <Award className="h-5 w-5 text-zus-orange mr-2" />
              <span className="text-zus-navy font-semibold text-sm">
                Oficjalne narzędzie prognostyczne ZUS
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-zus-navy mb-8 leading-tight">
              Sprawdź swoją przyszłą
              <span className="block bg-gradient-to-r from-zus-orange to-zus-green bg-clip-text text-transparent">
                emeryturę
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nowoczesne narzędzie do prognozowania wysokości emerytury z wykorzystaniem 
              danych aktuarialnych FUS20 i najnowszych wskaźników demograficznych.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/formularz"
                className="group bg-gradient-to-r from-zus-orange to-zus-orange/90 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-zus-orange/30 flex items-center"
              >
                Rozpocznij symulację
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="group bg-white text-zus-navy px-10 py-4 rounded-xl font-semibold border-2 border-zus-navy hover:bg-zus-navy hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-zus-navy/30 flex items-center"
              >
                Dashboard zaawansowany
                <BarChart3 className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Dashboard Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-zus-navy mb-4">
              Dashboard podstawowy
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Sprawdź swoją emeryturę w kontekście średnich krajowych i poznaj ciekawostki emerytalne
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Expected Pension Input */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-zus-orange/5 to-zus-orange/10 p-8 rounded-2xl border border-zus-orange/20 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-3 rounded-xl mr-4">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-zus-navy">
                      Twoja oczekiwana emerytura
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowPensionInput(!showPensionInput)}
                    className="p-2 text-zus-orange hover:bg-zus-orange/10 rounded-lg transition-colors"
                    aria-label={showPensionInput ? "Ukryj kalkulator" : "Pokaż kalkulator"}
                  >
                    {showPensionInput ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {showPensionInput && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="expected-pension" className="block text-sm font-medium text-zus-navy mb-2">
                        Wprowadź kwotę (zł)
                      </label>
                      <input
                        id="expected-pension"
                        type="number"
                        value={expectedPension}
                        onChange={(e) => setExpectedPension(e.target.value)}
                        placeholder="np. 3000"
                        className="w-full px-4 py-3 border border-zus-orange/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-zus-orange/20 focus:border-zus-orange text-lg"
                        aria-describedby="pension-context"
                      />
                    </div>
                    
                    {contextualization && (
                      <div 
                        id="pension-context"
                        className="bg-white/80 p-4 rounded-xl border border-zus-orange/20"
                        role="status"
                        aria-live="polite"
                      >
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-zus-orange mt-0.5 mr-3 flex-shrink-0" />
                          <p className="text-sm text-zus-navy leading-relaxed">
                            {contextualization}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!showPensionInput && (
                  <div className="text-center py-8">
                    <PiggyBank className="h-16 w-16 text-zus-orange/60 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Kliknij aby sprawdzić swoją emeryturę w kontekście średnich krajowych
                    </p>
                    <div className="text-sm text-slate-500">
                      Średnia emerytura w Polsce: <span className="font-semibold text-zus-navy">{PENSION_STATISTICS.nationalAverage.toLocaleString('pl-PL')} zł</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pension Groups Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-zus-navy/5 to-zus-blue/10 p-8 rounded-2xl border border-zus-navy/20 h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-zus-navy to-zus-navy/80 p-3 rounded-xl mr-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-zus-navy">
                    Grupy emerytalne w Polsce
                  </h4>
                </div>
                
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
                
                <div className="mt-6 text-sm text-slate-600">
                  <p className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-zus-blue" />
                    Najedź kursorem na słupki aby zobaczyć szczegółowe informacje o każdej grupie
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pension Facts/Trivia */}
          <div className="bg-gradient-to-br from-zus-green/5 to-zus-green/10 p-8 rounded-2xl border border-zus-green/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-zus-green to-zus-green/80 p-3 rounded-xl mr-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-zus-navy">
                  Czy wiesz, że...?
                </h4>
              </div>
              <button
                onClick={refreshTrivia}
                className="bg-zus-green text-white px-4 py-2 rounded-lg hover:bg-zus-green/90 transition-colors focus:outline-none focus:ring-4 focus:ring-zus-green/30 text-sm font-medium"
                aria-label="Pokaż nową ciekawostkę"
              >
                Nowa ciekawostka
              </button>
            </div>
            
            <div className="bg-white/80 p-6 rounded-xl border border-zus-green/20">
              <h5 className="font-semibold text-zus-navy mb-3 text-lg">
                {currentTrivia.title}
              </h5>
              <p className="text-slate-700 leading-relaxed mb-4">
                {currentTrivia.fact}
              </p>
              <div className="flex items-center text-sm text-zus-green font-medium">
                <Info className="h-4 w-4 mr-2" />
                Źródło: ZUS, GUS, Ministerstwo Finansów
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-zus-navy mb-4">
              Funkcjonalności symulatora
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Kompleksowe narzędzie wykorzystujące najnowsze dane aktuarialne i demograficzne
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-zus-orange/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-zus-navy mb-3">
                Kalkulacje FUS20
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Precyzyjne obliczenia oparte na najnowszych prognozach aktuarialnych do 2080 roku
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-zus-green/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-zus-green to-zus-green/80 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-zus-navy mb-3">
                Waloryzacja składek
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Historyczne i prognozowane wskaźniki waloryzacji rocznej i kwartalnej
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-zus-blue/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-zus-blue to-zus-blue/80 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-zus-navy mb-3">
                Analiza demograficzna
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Tablice dalszego trwania życia i prognozy demograficzne Ministerstwa Finansów
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-zus-navy/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-zus-navy to-zus-navy/80 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-zus-navy mb-3">
                Parametry zaawansowane
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Modyfikacja założeń makroekonomicznych i scenariuszy prognostycznych FUS20
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-zus-navy via-zus-navy/95 to-zus-navy text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zus-orange/20 via-transparent to-zus-green/20"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Dane w liczbach</h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Symulator oparty na najnowszych danych i prognozach demograficznych
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-5xl font-bold text-zus-orange mb-4 bg-gradient-to-r from-zus-orange to-yellow-400 bg-clip-text text-transparent">
                2080
              </div>
              <div className="text-xl font-semibold mb-2">Rok prognozy FUS20</div>
              <div className="text-slate-300">Długoterminowe prognozy aktuarialne</div>
            </div>
            
            <div className="text-center bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-5xl font-bold text-zus-green mb-4 bg-gradient-to-r from-zus-green to-emerald-400 bg-clip-text text-transparent">
                3
              </div>
              <div className="text-xl font-semibold mb-2">Warianty demograficzne</div>
              <div className="text-slate-300">Pesymistyczny, pośredni, optymistyczny</div>
            </div>
            
            <div className="text-center bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-zus-blue mb-4 bg-gradient-to-r from-zus-blue to-blue-400 bg-clip-text text-transparent">
                WCAG 2.0
              </div>
              <div className="text-xl font-semibold mb-2">Zgodność z dostępnością</div>
              <div className="text-slate-300">Aplikacja dostępna dla wszystkich</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-2 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Symulator Emerytalny ZUS</div>
                <div className="text-slate-400 text-sm">Hackathon 2025</div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm">Dokumentacja</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span className="text-sm">Bezpieczeństwo</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              &copy; 2025 Zakład Ubezpieczeń Społecznych - Wszystkie prawa zastrzeżone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;