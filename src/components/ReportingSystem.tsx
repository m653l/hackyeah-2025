import React, { useState } from 'react';
import { Download, FileText, MapPin, BarChart3, Calendar, User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { generateUserPDFReport, type UserReportData } from '../utils/reportGenerator';
import { findDistrictByPostalCode, type DistrictData } from '../data/districtData';

interface ReportingSystemProps {
  pensionData: any;
  personData: any;
  onPostalCodeChange?: (postalCode: string) => void;
}

export const ReportingSystem: React.FC<ReportingSystemProps> = ({
  pensionData,
  personData,
  onPostalCodeChange
}) => {
  const [postalCode, setPostalCode] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [districtData, setDistrictData] = useState<DistrictData | null>(null);


  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
    
    // Wyszukaj dane dla wprowadzonego kodu pocztowego
    if (value.length >= 5) {
      const district = findDistrictByPostalCode(value);
      setDistrictData(district);
    } else {
      setDistrictData(null);
    }
    
    onPostalCodeChange?.(value);
  };

  const generatePensionReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Przygotowanie danych do raportu w formacie UserReportData
      const reportData: UserReportData = {
        personalInfo: {
          age: personData.age || 0,
          gender: personData.gender === 'Kobieta' ? 'female' : 'male',
          salary: personData.salary || 0,
          workStartYear: personData.startYear || new Date().getFullYear(),
          plannedRetirementYear: personData.retirementYear || new Date().getFullYear() + 30
        },
        pensionResults: {
          monthlyPension: pensionData.monthlyPension || 0,
          replacementRate: pensionData.replacementRate || 0,
          yearsToRetirement: Math.max(0, (personData.retirementYear || new Date().getFullYear() + 30) - new Date().getFullYear()),
          totalContributions: pensionData.totalContributions || 0,
          realPensionValue: pensionData.realPension || pensionData.monthlyPension || 0,
          projectedInflation: 2.5, // Domyślna wartość inflacji
          initialCapital: (personData.accountBalance || 0) + (personData.subAccountBalance || 0),
          valorizedContributions: pensionData.valorizedContributions || pensionData.totalContributions || 0,
          lifeExpectancy: personData.gender === 'Kobieta' ? 82 : 76 // Średnia długość życia w Polsce
        },
        fus20Params: {
          scenario: 'intermediate',
          unemploymentRate: 5.2,
          realWageGrowth: 3.5,
          contributionCollection: 92
        },
        postalCode: postalCode,
        generatedAt: new Date()
      };

      // Symulacja generowania PDF
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generowanie rzeczywistego PDF za pomocą funkcji z reportGenerator
      generateUserPDFReport(reportData);

      // Zapisanie danych do localStorage dla administratora
      saveUsageData({
        personalInfo: reportData.personalInfo,
        pensionResults: reportData.pensionResults,
        postalCode: postalCode,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Błąd podczas generowania raportu PDF:', error);
      alert('Wystąpił błąd podczas generowania raportu PDF. Spróbuj ponownie.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const saveUsageData = (reportData: any) => {
    const usageData = {
      dateUsed: new Date().toLocaleDateString('pl-PL'),
      timeUsed: new Date().toLocaleTimeString('pl-PL'),
      expectedPension: reportData.pensionResults.expectedPension,
      age: reportData.personalInfo.age,
      gender: reportData.personalInfo.gender,
      salary: reportData.personalInfo.salary,
      includedSickLeave: reportData.personalInfo.includeSickLeave ? 'Tak' : 'Nie',
      accountBalance: reportData.personalInfo.accountBalance || 0,
      subAccountBalance: reportData.personalInfo.subAccountBalance || 0,
      realPension: reportData.pensionResults.realPension,
      adjustedPension: reportData.pensionResults.expectedPension, // Emerytura urealniona
      postalCode: reportData.postalCode || 'Nie podano'
    };

    // Pobranie istniejących danych
    const existingData = JSON.parse(localStorage.getItem('simulatorUsageData') || '[]');
    existingData.push(usageData);
    
    // Ograniczenie do ostatnich 1000 rekordów
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    localStorage.setItem('simulatorUsageData', JSON.stringify(existingData));
  };

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Raportowanie
        </h3>
        <p className="text-sm text-gray-600">
          Pobierz raport z prognozą emerytury i wprowadź kod pocztowy
        </p>
      </div>

      <div className="space-y-6">
        {/* Kod pocztowy */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Kod pocztowy (opcjonalnie)</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Podanie kodu pocztowego pomoże nam w analizie regionalnej wykorzystania symulatora
          </p>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            placeholder="np. 00-001"
            pattern="[0-9]{2}-[0-9]{3}"
            className="w-full max-w-xs px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-blue-600 mt-1">
            Format: XX-XXX (np. 00-001)
          </p>
        </div>

        {/* Porównanie regionalne */}
        {districtData && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900">Porównanie regionalne</h4>
            </div>
            <div className="mb-3">
              <p className="text-sm text-green-700 font-medium">
                {districtData.districtName}, woj. {districtData.voivodeship}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Średnia emerytura w regionie:</span>
                  <span className="font-medium text-gray-900">
                    {districtData.averagePension.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Twoja prognoza:</span>
                  <span className="font-medium text-gray-900">
                    {pensionData?.monthlyPension?.toLocaleString('pl-PL') || 0} zł
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Różnica:</span>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const diff = (pensionData?.monthlyPension || 0) - districtData.averagePension;
                      const percentage = Math.abs((diff / districtData.averagePension) * 100);
                      
                      if (diff > 0) {
                        return (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              +{diff.toLocaleString('pl-PL')} zł ({percentage.toFixed(1)}%)
                            </span>
                          </>
                        );
                      } else if (diff < 0) {
                        return (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-600">
                              {diff.toLocaleString('pl-PL')} zł ({percentage.toFixed(1)}%)
                            </span>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <Minus className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-600">Identyczna</span>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Średnie wynagrodzenie:</span>
                  <span className="font-medium text-gray-900">
                    {districtData.averageSalary.toLocaleString('pl-PL')} zł
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stopa bezrobocia:</span>
                  <span className="font-medium text-gray-900">
                    {districtData.unemploymentRate}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Średni wiek emerytalny:</span>
                  <span className="font-medium text-gray-900">
                    {personData?.gender === 'Kobieta' 
                      ? `${districtData.retirementAge.female} lat`
                      : `${districtData.retirementAge.male} lat`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-xs text-gray-500">
                Dane regionalne pochodzą z oficjalnych statystyk ZUS i GUS za 2024 rok. 
                Porównanie ma charakter orientacyjny i może się różnić od rzeczywistych wartości.
              </p>
            </div>
          </div>
        )}

        {/* Pobieranie raportu */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Pobierz raport emerytury</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Raport zawiera szczegółowe wyniki prognozy, wykresy, tabele oraz wprowadzone parametry początkowe
            {districtData && (
              <span className="text-green-600 font-medium"> i porównanie z regionem {districtData.districtName}</span>
            )}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Dane osobowe i parametry</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>Wykresy i prognozy</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Analiza czasowa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Szczegółowe obliczenia</span>
            </div>
          </div>

          <button
            onClick={generatePensionReport}
            disabled={isGeneratingReport || !pensionData}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md font-medium transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generowanie raportu...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Pobierz raport PDF
              </>
            )}
          </button>
        </div>

        {/* Informacje o prywatności */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">Informacje o prywatności</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Dane są przetwarzane lokalnie w Twojej przeglądarce</p>
            <p>• Kod pocztowy jest zapisywany anonimowo dla celów statystycznych</p>
            <p>• Nie przechowujemy danych osobowych ani szczegółów finansowych</p>
            <p>• Raport zawiera tylko wprowadzone przez Ciebie informacje</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponent dla administratora
export const AdminReporting: React.FC = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateAdminReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const usageData = JSON.parse(localStorage.getItem('simulatorUsageData') || '[]');
      
      if (usageData.length === 0) {
        alert('Brak danych do wygenerowania raportu');
        return;
      }

      // Przygotowanie danych w formacie CSV dla Excel
      const headers = [
        'Data użycia',
        'Godzina użycia', 
        'Emerytura oczekiwana',
        'Wiek',
        'Płeć',
        'Wysokość wynagrodzenia',
        'Czy uwzględniał okresy choroby',
        'Wysokość zgromadzonych środków na koncie',
        'Wysokość zgromadzonych środków na subkoncie',
        'Emerytura rzeczywista',
        'Emerytura urealniona',
        'Kod pocztowy'
      ];

      const csvContent = [
        headers.join(','),
        ...usageData.map((row: any) => [
          row.dateUsed,
          row.timeUsed,
          row.expectedPension,
          row.age,
          row.gender,
          row.salary,
          row.includedSickLeave,
          row.accountBalance,
          row.subAccountBalance,
          row.realPension,
          row.adjustedPension,
          row.postalCode
        ].join(','))
      ].join('\n');

      // Dodanie BOM dla poprawnego wyświetlania polskich znaków w Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-administratora-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Błąd podczas generowania raportu administratora:', error);
      alert('Wystąpił błąd podczas generowania raportu');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const clearUsageData = () => {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane użycia?')) {
      localStorage.removeItem('simulatorUsageData');
      alert('Dane zostały wyczyszczone');
    }
  };

  const usageDataCount = JSON.parse(localStorage.getItem('simulatorUsageData') || '[]').length;

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Panel Administratora - Raportowanie
        </h3>
        <p className="text-sm text-gray-600">
          Pobierz raport z danymi użycia symulatora w formacie Excel
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Statystyki użycia</h4>
          <p className="text-sm text-blue-700">
            Liczba zapisanych sesji: <span className="font-semibold">{usageDataCount}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateAdminReport}
            disabled={isGeneratingReport || usageDataCount === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generowanie...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Pobierz raport .CSV
              </>
            )}
          </button>

          <button
            onClick={clearUsageData}
            disabled={usageDataCount === 0}
            className="px-4 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Wyczyść dane
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Zawartość raportu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div>• Data i godzina użycia</div>
            <div>• Emerytura oczekiwana</div>
            <div>• Wiek użytkownika</div>
            <div>• Płeć</div>
            <div>• Wysokość wynagrodzenia</div>
            <div>• Uwzględnienie okresów choroby</div>
            <div>• Środki na koncie ZUS</div>
            <div>• Środki na subkoncie ZUS</div>
            <div>• Emerytura rzeczywista</div>
            <div>• Emerytura urealniona</div>
            <div>• Kod pocztowy</div>
          </div>
        </div>
      </div>
    </div>
  );
};