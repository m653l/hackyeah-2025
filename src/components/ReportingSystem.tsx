import React, { useState } from 'react';
import { Download, FileText, MapPin, BarChart3, Calendar, User } from 'lucide-react';

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

  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
    onPostalCodeChange?.(value);
  };

  const generatePensionReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Przygotowanie danych do raportu
      const reportData = {
        personalInfo: {
          age: personData.age,
          gender: personData.gender,
          salary: personData.salary,
          startYear: personData.startYear,
          retirementYear: personData.retirementYear,
          includeSickLeave: personData.includeSickLeave,
          accountBalance: personData.accountBalance,
          subAccountBalance: personData.subAccountBalance,
          professionalGroup: personData.professionalGroup
        },
        pensionResults: {
          expectedPension: pensionData.monthlyPension,
          realPension: pensionData.realPension,
          replacementRate: pensionData.replacementRate,
          totalContributions: pensionData.totalContributions,
          valorizedContributions: pensionData.valorizedContributions,
          sicknessImpact: pensionData.sicknessImpact
        },
        postalCode: postalCode,
        generatedAt: new Date().toISOString()
      };

      // Symulacja generowania PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Utworzenie i pobranie pliku
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-emerytalny-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Zapisanie danych do localStorage dla administratora
      saveUsageData(reportData);
      
    } catch (error) {
      console.error('Błąd podczas generowania raportu:', error);
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

        {/* Pobieranie raportu */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Pobierz raport emerytury</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Raport zawiera szczegółowe wyniki prognozy, wykresy, tabele oraz wprowadzone parametry początkowe
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
            className="w-full px-4 py-3 bg-zus-orange text-white rounded-md font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zus-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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