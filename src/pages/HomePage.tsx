import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3, 
  ChevronRight, 
  Lightbulb,
  Target,
  TrendingUp,
  PiggyBank,
  Users,
  Settings,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Pension statistics data
const PENSION_STATISTICS = {
  nationalAverage: 2850,
  totalRetirees: 9200000, // Approximate number of retirees in Poland
  groups: [
    { 
      name: 'Poniżej 1500 zł', 
      percentage: 15, 
      amount: 1200, 
      minAmount: 0, 
      maxAmount: 1499,
      description: 'Najniższa grupa emerytalna - głównie osoby z krótkim stażem pracy lub niskimi zarobkami'
    },
    { 
      name: '1500-2500 zł', 
      percentage: 35, 
      amount: 2000, 
      minAmount: 1500, 
      maxAmount: 2499,
      description: 'Największa grupa emerytów - typowa emerytura z ZUS dla przeciętnych zarobków'
    },
    { 
      name: '2500-3500 zł', 
      percentage: 30, 
      amount: 3000, 
      minAmount: 2500, 
      maxAmount: 3499,
      description: 'Ponadprzeciętne emerytury - osoby z wyższymi zarobkami lub dłuższym stażem'
    },
    { 
      name: '3500-5000 zł', 
      percentage: 15, 
      amount: 4250, 
      minAmount: 3500, 
      maxAmount: 4999,
      description: 'Wysokie emerytury - kadra kierownicza, specjaliści z wysokimi zarobkami'
    },
    { 
      name: 'Powyżej 5000 zł', 
      percentage: 5, 
      amount: 6500, 
      minAmount: 5000, 
      maxAmount: Infinity,
      description: 'Najwyższe emerytury - top menedżerowie, przedsiębiorcy, osoby z maksymalnych składek'
    }
  ]
};

const HomePage: React.FC = () => {
  const [expectedPension, setExpectedPension] = useState('');
  const [showPensionInput, setShowPensionInput] = useState(false);
  const [contextualization, setContextualization] = useState('');

  // Function to determine which group the pension amount belongs to
  const getPensionGroup = (amount: number) => {
    if (amount < 1500) return 0;
    if (amount < 2500) return 1;
    if (amount < 3500) return 2;
    if (amount < 5000) return 3;
    return 4;
  };

  // Chart configuration with dynamic data - sorted by amount (ascending)
  const chartData = useMemo(() => {
    // Sort groups by average amount (ascending)
    const sortedGroups = [...PENSION_STATISTICS.groups].sort((a, b) => a.amount - b.amount);
    
    const labels = sortedGroups.map(group => group.name);
    const data = sortedGroups.map(group => group.percentage);
    const backgroundColor = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(147, 51, 234, 0.8)'
    ];
    const borderColor = [
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(147, 51, 234, 1)'
    ];

    // Add user's pension if entered and input is visible
    if (expectedPension && !isNaN(Number(expectedPension)) && showPensionInput) {
      const amount = Number(expectedPension);
      const groupIndex = getPensionGroup(amount);
      const userGroup = PENSION_STATISTICS.groups[groupIndex];
      
      // Find where to insert user's pension in sorted order
      let insertIndex = sortedGroups.findIndex(group => group.amount > amount);
      if (insertIndex === -1) insertIndex = sortedGroups.length;
      
      labels.splice(insertIndex, 0, 'Twoja emerytura');
      data.splice(insertIndex, 0, userGroup.percentage);
      backgroundColor.splice(insertIndex, 0, 'rgba(255, 102, 0, 0.8)');
      borderColor.splice(insertIndex, 0, 'rgba(255, 102, 0, 1)');
    }

    return {
      labels,
      datasets: [
        {
          label: 'Procent emerytów',
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1
        }
      ]
    };
  }, [expectedPension, showPensionInput]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const label = context.label;
            
            // Check if this is the user's pension bar
            if (label === 'Twoja emerytura') {
              const amount = Number(expectedPension);
              const groupIndex = getPensionGroup(amount);
              const userGroup = PENSION_STATISTICS.groups[groupIndex];
              const nationalAvg = PENSION_STATISTICS.nationalAverage;
              const totalRetirees = PENSION_STATISTICS.totalRetirees;
              const groupRetirees = Math.round((userGroup.percentage / 100) * totalRetirees);
              
              const comparisonText = amount > nationalAvg 
                ? `${((amount / nationalAvg - 1) * 100).toFixed(0)}% powyżej średniej krajowej`
                : `${((1 - amount / nationalAvg) * 100).toFixed(0)}% poniżej średniej krajowej`;
              
              return [
                `💰 Twoja emerytura: ${amount.toLocaleString('pl-PL')} zł`,
                `📊 Grupa: ${userGroup.name}`,
                `👥 Należysz do ${userGroup.percentage}% emerytów (${groupRetirees.toLocaleString('pl-PL')} osób)`,
                `📈 ${comparisonText}`,
                `ℹ️ ${userGroup.description}`
              ];
            }
            
            // Regular group tooltip - need to find the group by label since sorting changed indices
            const sortedGroups = [...PENSION_STATISTICS.groups].sort((a, b) => a.amount - b.amount);
            const group = sortedGroups.find(g => g.name === label) || PENSION_STATISTICS.groups[dataIndex];
            const totalRetirees = PENSION_STATISTICS.totalRetirees;
            const groupRetirees = Math.round((group.percentage / 100) * totalRetirees);
            const nationalAvg = PENSION_STATISTICS.nationalAverage;
            
            const comparisonText = group.amount > nationalAvg 
              ? `${((group.amount / nationalAvg - 1) * 100).toFixed(0)}% powyżej średniej`
              : `${((1 - group.amount / nationalAvg) * 100).toFixed(0)}% poniżej średniej`;
            
            return [
              `📊 ${group.name}`,
              `👥 ${group.percentage}% emerytów (${groupRetirees.toLocaleString('pl-PL')} osób)`,
              `💰 Średnia kwota: ${group.amount.toLocaleString('pl-PL')} zł`,
              `📈 ${comparisonText} krajowej (${nationalAvg.toLocaleString('pl-PL')} zł)`,
              `📋 Przedział: ${group.minAmount.toLocaleString('pl-PL')} - ${group.maxAmount === Infinity ? '∞' : group.maxAmount.toLocaleString('pl-PL')} zł`,
              `ℹ️ ${group.description}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  }), [expectedPension, showPensionInput]);

  // Contextualization logic
  useEffect(() => {
    if (expectedPension && !isNaN(Number(expectedPension))) {
      const amount = Number(expectedPension);
      const national = PENSION_STATISTICS.nationalAverage;
      
      let message = '';
      if (amount < national * 0.7) {
        message = `Twoja oczekiwana emerytura (${amount.toLocaleString('pl-PL')} zł) jest znacznie poniżej średniej krajowej (${national.toLocaleString('pl-PL')} zł). Rozważ dodatkowe oszczędzanie na emeryturę.`;
      } else if (amount < national) {
        message = `Twoja oczekiwana emerytura (${amount.toLocaleString('pl-PL')} zł) jest poniżej średniej krajowej (${national.toLocaleString('pl-PL')} zł). To wciąż rozsądna kwota, ale warto pomyśleć o dodatkowych oszczędnościach.`;
      } else if (amount <= national * 1.5) {
        message = `Twoja oczekiwana emerytura (${amount.toLocaleString('pl-PL')} zł) jest powyżej średniej krajowej (${national.toLocaleString('pl-PL')} zł). To dobry wynik!`;
      } else {
        message = `Twoja oczekiwana emerytura (${amount.toLocaleString('pl-PL')} zł) jest znacznie powyżej średniej krajowej (${national.toLocaleString('pl-PL')} zł). Gratulacje - jesteś dobrze przygotowany na emeryturę!`;
      }
      
      setContextualization(message);
    } else {
      setContextualization('');
    }
  }, [expectedPension]);

  return (
    <div className="min-h-screen bg-zus-gray-100">
      {/* Header */}


      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-zus-gray-900 mb-6 leading-tight">
                Czy Twoja emerytura wystarczy na godne życie?
              </h2>
              
              <p className="text-lg md:text-xl text-zus-gray-600 mb-8 leading-relaxed">
                Bezpłatny symulator ZUS pomoże Ci zaplanować przyszłość finansową. 
                Dowiedz się już dziś, ile będziesz otrzymywać na emeryturze.
              </p>
              
              {/* Kluczowe statystyki */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-zus-green-pale rounded-xl">
                  <div className="text-3xl font-bold text-zus-green-primary mb-1">47%</div>
                  <div className="text-sm text-zus-gray-600">średnia stopa zastąpienia emerytury</div>
                </div>
                <div className="text-center p-4 bg-zus-green-pale rounded-xl">
                  <div className="text-3xl font-bold text-zus-green-primary mb-1">2 850 zł</div>
                  <div className="text-sm text-zus-gray-600">średnia emerytura w Polsce</div>
                </div>
              </div>
              

            </div>
            
            <div className="relative">
              <Link 
                to="/formularz"
                className="block bg-gradient-to-br from-zus-green-pale to-white p-8 rounded-2xl border border-zus-green-primary/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-zus-green/10 hover:border-zus-green-primary/40"
              >
                <div className="text-center">
                  <div className="bg-zus-green-primary p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <PiggyBank className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-zus-gray-900 mb-4">
                    Planowanie to klucz do sukcesu
                  </h3>
                  <p className="text-zus-gray-600">
                    Wykorzystaj oficjalne dane ZUS i prognozy demograficzne, 
                    aby świadomie zaplanować swoją przyszłość finansową.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Awareness Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-zus-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zus-gray-900 mb-4">
              Poznaj rzeczywistość emerytalną w Polsce
            </h2>
            <p className="text-lg text-zus-gray-600 max-w-3xl mx-auto">
              Świadome planowanie emerytury wymaga zrozumienia aktualnej sytuacji demograficznej i ekonomicznej
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card variant="warning" className="text-center">
              <CardHeader>
                <div className="bg-zus-orange p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <CardTitle as="h3">Stopa zastąpienia spada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Emerytura z ZUS zastępuje coraz mniejszą część ostatniego wynagrodzenia. 
                  W 2040 roku może to być tylko 35-40%.
                </p>
                <div className="text-2xl font-bold text-zus-orange">35-40%</div>
                <div className="text-sm text-zus-gray-600">prognoza na 2040 rok</div>
              </CardContent>
            </Card>
            
            <Card variant="info" className="text-center">
              <CardHeader>
                <div className="bg-zus-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <CardTitle as="h3">Inflacja zjada oszczędności</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  To, co dziś kosztuje 1000 zł, za 30 lat może kosztować nawet 2500 zł. 
                  Planowanie jest kluczowe.
                </p>
                <div className="text-2xl font-bold text-zus-blue">2500 zł</div>
                <div className="text-sm text-zus-gray-600">za 30 lat (1000 zł dziś)</div>
              </CardContent>
            </Card>
            
            <Card variant="success" className="text-center">
              <CardHeader>
                <div className="bg-zus-green-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <CardTitle as="h3">Możesz to zmienić</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Świadome planowanie i dodatkowe oszczędzanie może zapewnić Ci 
                  komfortową emeryturę.
                </p>
                <div className="text-2xl font-bold text-zus-green-primary">70%</div>
                <div className="text-sm text-zus-gray-600">zalecana stopa zastąpienia</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center bg-white p-8 rounded-2xl border border-zus-gray-200">
            <h3 className="text-2xl font-bold text-zus-gray-900 mb-4">
              Nie czekaj - sprawdź swoją sytuację już dziś
            </h3>
            <p className="text-zus-gray-600 mb-6 max-w-2xl mx-auto">
              Im wcześniej zaczniesz planować, tym lepiej będziesz przygotowany na przyszłość. 
              Nasz symulator pomoże Ci zrozumieć, czego możesz się spodziewać.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/formularz"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-zus-green-primary rounded-lg hover:bg-zus-green-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zus-green-primary transition-colors"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Rozpocznij symulację
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-zus-green-primary bg-white border-2 border-zus-green-primary rounded-lg hover:bg-zus-green-pale focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zus-green-primary transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Dashboard zaawansowany
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
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 p-6 rounded-xl border border-zus-green/20">
                <div className="text-2xl font-bold text-zus-green mb-2">67 lat</div>
                <p className="text-sm text-zus-navy">
                  To obecny wiek emerytalny w Polsce dla wszystkich urodzonych po 1948 roku
                </p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-xl border border-zus-green/20">
                <div className="text-2xl font-bold text-zus-green mb-2">19,6%</div>
                <p className="text-sm text-zus-navy">
                  Składka emerytalna (9,76% pracownik + 9,76% pracodawca) trafia na Twoje konto w ZUS
                </p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-xl border border-zus-green/20">
                <div className="text-2xl font-bold text-zus-green mb-2">2080</div>
                <p className="text-sm text-zus-navy">
                  Do tego roku sięgają najnowsze prognozy demograficzne wykorzystane w symulatorze
                </p>
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
              <div className="bg-gradient-to-br from-zus-green to-zus-green-secondary p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-zus-green/20">
                <TrendingUp className="h-8 w-8 text-white drop-shadow-lg" />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-zus-green-pale to-white p-8 rounded-2xl border border-zus-green-primary/20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-zus-navy">Dane w liczbach</h3>
            <p className="text-xl text-zus-gray-600 max-w-2xl mx-auto">
              Symulator oparty na najnowszych danych i prognozach demograficznych
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-zus-green-primary/20 shadow-lg">
              <div className="text-5xl font-bold text-zus-orange mb-4 bg-gradient-to-r from-zus-orange to-yellow-400 bg-clip-text text-transparent">
                2080
              </div>
              <div className="text-xl font-semibold mb-2 text-zus-navy">Rok prognozy FUS20</div>
              <div className="text-zus-gray-600">Długoterminowe prognozy aktuarialne</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-zus-green-primary/20 shadow-lg">
              <div className="text-5xl font-bold text-zus-green mb-4 bg-gradient-to-r from-zus-green to-emerald-400 bg-clip-text text-transparent">
                3
              </div>
              <div className="text-xl font-semibold mb-2 text-zus-navy">Warianty demograficzne</div>
              <div className="text-zus-gray-600">Pesymistyczny, pośredni, optymistyczny</div>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-zus-green-primary/20 shadow-lg">
              <div className="text-3xl font-bold text-zus-blue mb-4 bg-gradient-to-r from-zus-blue to-blue-400 bg-clip-text text-transparent">
                WCAG 2.0
              </div>
              <div className="text-xl font-semibold mb-2 text-zus-navy">Zgodność z dostępnością</div>
              <div className="text-zus-gray-600">Aplikacja dostępna dla wszystkich</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}

    </div>
  );
};

export default HomePage;