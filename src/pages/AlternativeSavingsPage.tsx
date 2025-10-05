import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  PiggyBank, 
  BarChart3, 
  Activity, 
  Home,
  Target,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import AnimatedNumber from '../components/AnimatedNumber';
import {
  INVESTMENT_METHODS,
  RISK_PROFILES,
  AGE_RECOMMENDATIONS,
  calculateSavingsResults,
  getAgeRecommendation,
  calculateRequiredSavings,
  formatCurrency,
  formatPercentage,
  type SavingsCalculatorInput,
  type SavingsResult,
  type InvestmentMethod
} from '../utils/investmentCalculator';

// Icon mapping
const iconMap = {
  Calculator,
  TrendingUp,
  Shield,
  PiggyBank,
  BarChart3,
  Activity,
  Home
};

const AlternativeSavingsPage: React.FC = () => {
  const [calculatorInput, setCalculatorInput] = useState<SavingsCalculatorInput>({
    monthlyAmount: 500,
    yearsToRetirement: 30,
    riskProfile: 'balanced',
    currentAge: 35,
    zusPension: 2500
  });

  const [savingsResults, setSavingsResults] = useState<SavingsResult[]>([]);
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  // Calculate results when input changes
  useEffect(() => {
    const results = calculateSavingsResults(calculatorInput);
    setSavingsResults(results);
  }, [calculatorInput]);

  const handleInputChange = (field: keyof SavingsCalculatorInput, value: number | string) => {
    setCalculatorInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRiskProfileChange = (profile: 'conservative' | 'balanced' | 'aggressive') => {
    setSelectedRiskProfile(profile);
    setCalculatorInput(prev => ({
      ...prev,
      riskProfile: profile
    }));
  };

  const currentAgeRecommendation = getAgeRecommendation(calculatorInput.currentAge);
  const bestResult = savingsResults.length > 0 ? savingsResults[savingsResults.length - 1] : null;
  const requiredMonthlySavings = calculateRequiredSavings(
    calculatorInput.zusPension,
    calculatorInput.zusPension * 1.5, // Target 50% increase
    calculatorInput.yearsToRetirement
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zus-green/5 to-zus-navy/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-r from-zus-green to-zus-navy text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Alternatywne Oszczędzanie na Emeryturę
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Zwiększ swoją przyszłą emeryturę o 50-200% dzięki dodatkowym oszczędnościom
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-lg opacity-80 mb-2">Twoja prognoza ZUS</div>
              <div className="text-3xl font-bold">
                <AnimatedNumber value={calculatorInput.zusPension} />
                <span className="text-lg ml-1">zł</span>
              </div>
            </div>
            
            <ArrowRight className="w-8 h-8 opacity-80" />
            
            <div className="text-center">
              <div className="text-lg opacity-80 mb-2">Z oszczędnościami</div>
              <div className="text-3xl font-bold text-zus-light-green">
                {bestResult && (
                  <>
                    <AnimatedNumber value={Math.round(bestResult.totalPension)} />
                    <span className="text-lg ml-1">zł</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Interactive Calculator Section */}
        <section id="calculator">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-8 h-8 text-zus-green" />
              <h2 className="text-3xl font-bold text-zus-navy">Kalkulator Oszczędności</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zus-gray-700 mb-2">
                    Miesięczna kwota oszczędności (zł)
                  </label>
                  <Input
                    type="number"
                    value={calculatorInput.monthlyAmount}
                    onChange={(e) => handleInputChange('monthlyAmount', Number(e.target.value))}
                    className="w-full"
                    min="0"
                    step="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zus-gray-700 mb-2">
                    Lata do emerytury
                  </label>
                  <Input
                    type="number"
                    value={calculatorInput.yearsToRetirement}
                    onChange={(e) => handleInputChange('yearsToRetirement', Number(e.target.value))}
                    className="w-full"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zus-gray-700 mb-2">
                    Twój wiek
                  </label>
                  <Input
                    type="number"
                    value={calculatorInput.currentAge}
                    onChange={(e) => handleInputChange('currentAge', Number(e.target.value))}
                    className="w-full"
                    min="18"
                    max="67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zus-gray-700 mb-4">
                    Profil ryzyka
                  </label>
                  <div className="space-y-2">
                    {Object.entries(RISK_PROFILES).map(([key, profile]) => (
                      <button
                        key={key}
                        onClick={() => handleRiskProfileChange(key as any)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          selectedRiskProfile === key
                            ? 'border-zus-green bg-zus-green/10'
                            : 'border-gray-200 hover:border-zus-green/50'
                        }`}
                      >
                        <div className="font-semibold" style={{ color: profile.color }}>
                          {profile.name}
                        </div>
                        <div className="text-sm text-zus-gray-600 mt-1">
                          {profile.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-zus-navy mb-4">
                  Projekcje dla profilu: {RISK_PROFILES[selectedRiskProfile].name}
                </h3>
                
                {savingsResults.map((result) => {
                  const IconComponent = iconMap[result.method.icon as keyof typeof iconMap];
                  return (
                    <div
                      key={result.method.id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: result.method.color }} 
                        />
                        <div>
                          <div className="font-semibold text-zus-navy">
                            {result.method.name}
                          </div>
                          <div className="text-sm text-zus-gray-600">
                            {result.method.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-zus-gray-600">Zgromadzone środki</div>
                          <div className="font-semibold text-zus-green">
                            {formatCurrency(result.totalSavings)}
                          </div>
                        </div>
                        <div>
                          <div className="text-zus-gray-600">Miesięczny dodatek</div>
                          <div className="font-semibold text-zus-green">
                            {formatCurrency(result.monthlyPensionIncrease)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* Method Comparison Section */}
        <section id="comparison">
          <h2 className="text-3xl font-bold text-zus-navy mb-8 text-center">
            Porównanie Metod Inwestycyjnych
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(RISK_PROFILES).map(([key, profile]) => (
              <Card 
                key={key}
                className={`p-6 border-2 transition-all hover:shadow-lg ${
                  selectedRiskProfile === key 
                    ? 'border-zus-green bg-zus-green/5' 
                    : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${profile.color}20` }}
                  >
                    <Shield className="w-8 h-8" style={{ color: profile.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-zus-navy mb-2">
                    {profile.name}
                  </h3>
                  <p className="text-zus-gray-600">
                    {profile.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {profile.methods.map(methodId => {
                    const method = INVESTMENT_METHODS.find(m => m.id === methodId);
                    if (!method) return null;
                    
                    const IconComponent = iconMap[method.icon as keyof typeof iconMap];
                    return (
                      <div key={methodId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <IconComponent className="w-5 h-5" style={{ color: method.color }} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{method.name}</div>
                          <div className="text-xs text-zus-gray-600">
                            {formatPercentage(method.expectedReturn.min)}-{formatPercentage(method.expectedReturn.max)} rocznie
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handleRiskProfileChange(key as any)}
                  className={`w-full mt-6 ${
                    selectedRiskProfile === key
                      ? 'bg-zus-green hover:bg-zus-green/90'
                      : 'bg-gray-200 text-zus-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectedRiskProfile === key ? 'Wybrany profil' : 'Wybierz profil'}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Age Recommendations Section */}
        <section id="age-recommendations">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-8 h-8 text-zus-green" />
              <h2 className="text-3xl font-bold text-zus-navy">Rekomendacje Wiekowe</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-zus-navy mb-4">
                  Dla Twojego wieku ({calculatorInput.currentAge} lat)
                </h3>
                
                <div className="p-6 rounded-lg bg-zus-light-green/10 border border-zus-green/20">
                  <div className="text-lg font-semibold text-zus-navy mb-2">
                    Grupa wiekowa: {currentAgeRecommendation.ageGroup} lat
                  </div>
                  <p className="text-zus-gray-700 mb-4">
                    {currentAgeRecommendation.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zus-gray-700">Akcje/Fundusze akcyjne:</span>
                      <span className="font-semibold text-zus-green">
                        {currentAgeRecommendation.stocksPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-zus-green h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${currentAgeRecommendation.stocksPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-zus-gray-700">Obligacje/Lokaty:</span>
                      <span className="font-semibold text-zus-navy">
                        {currentAgeRecommendation.bondsPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-zus-navy h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${currentAgeRecommendation.bondsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-zus-navy mb-4">
                  Wszystkie grupy wiekowe
                </h3>
                
                <div className="space-y-4">
                  {AGE_RECOMMENDATIONS.map((rec, index) => (
                    <div 
                      key={rec.ageGroup}
                      className={`p-4 rounded-lg border transition-all ${
                        rec === currentAgeRecommendation
                          ? 'border-zus-green bg-zus-green/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-zus-navy">
                          {rec.ageGroup} lat
                        </span>
                        <span className="text-sm text-zus-gray-600">
                          {rec.stocksPercentage}% akcje / {rec.bondsPercentage}% obligacje
                        </span>
                      </div>
                      <p className="text-sm text-zus-gray-700">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ZUS Integration Section */}
        <section id="zus-integration">
          <Card className="p-8 bg-gradient-to-r from-zus-green/5 to-zus-navy/5">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zus-navy mb-4">
                Twoja Łączna Emerytura
              </h2>
              <p className="text-zus-gray-700 text-lg">
                Porównanie emerytury ZUS z dodatkowymi oszczędnościami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-zus-gray-600 mb-2">Emerytura ZUS</div>
                <div className="text-2xl font-bold text-zus-navy">
                  {formatCurrency(calculatorInput.zusPension)}
                </div>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-zus-gray-600 mb-2">Dodatek z oszczędności</div>
                <div className="text-2xl font-bold text-zus-green">
                  {bestResult ? formatCurrency(bestResult.monthlyPensionIncrease) : '0 zł'}
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-zus-green to-zus-navy text-white rounded-lg shadow-sm">
                <div className="opacity-90 mb-2">Łączna emerytura</div>
                <div className="text-2xl font-bold">
                  {bestResult ? formatCurrency(bestResult.totalPension) : formatCurrency(calculatorInput.zusPension)}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-zus-green" />
                <h3 className="text-lg font-semibold text-zus-navy">
                  Rekomendacja dla Ciebie
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-zus-gray-700 mb-4">
                    Aby zwiększyć swoją emeryturę o 50%, powinieneś oszczędzać miesięcznie:
                  </p>
                  <div className="text-3xl font-bold text-zus-green mb-2">
                    {formatCurrency(requiredMonthlySavings)}
                  </div>
                  <p className="text-sm text-zus-gray-600">
                    przy założeniu średniego zwrotu 6% rocznie
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <Button 
                    className="bg-zus-green hover:bg-zus-green/90 text-white px-8 py-3 text-lg"
                    onClick={() => {
                      setCalculatorInput(prev => ({
                        ...prev,
                        monthlyAmount: Math.round(requiredMonthlySavings)
                      }));
                      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Ustaw w kalkulatorze
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AlternativeSavingsPage;