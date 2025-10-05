import React from 'react';
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
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const HomePage: React.FC = () => {

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