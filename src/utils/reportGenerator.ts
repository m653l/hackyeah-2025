import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Dodaj wsparcie dla polskich znaków w jsPDF
declare module 'jspdf' {
  interface jsPDF {
    addFont(postScriptName: string, id: string, fontStyle: string): string;
  }
}

// Interfejsy dla danych raportu użytkownika
export interface UserReportData {
  personalInfo: {
    age: number;
    gender: 'male' | 'female';
    salary: number;
    workStartYear: number;
    plannedRetirementYear: number;
  };
  pensionResults: {
    monthlyPension: number;
    replacementRate: number;
    yearsToRetirement: number;
    totalContributions: number;
    realPensionValue: number;
    projectedInflation: number;
    initialCapital: number;
    valorizedContributions: number;
    lifeExpectancy: number;
  };
  fus20Params: {
    scenario: string;
    unemploymentRate: number;
    realWageGrowth: number;
    contributionCollection: number;
  };
  delayAnalysis?: {
    originalPension: number;
    delayedPension: number;
    increasePercentage: number;
  };
  postalCode?: string;
  generatedAt: Date;
}

// Interfejs dla danych raportu administracyjnego
export interface AdminReportEntry {
  dateUsed: string;
  timeUsed: string;
  expectedPension: number;
  age: number;
  gender: string;
  salary: number;
  includedSickness: boolean;
  accumulatedFunds: number;
  actualPension: number;
  realPension: number;
  postalCode?: string;
}

/**
 * Generuje raport PDF dla użytkownika
 */
export const generateUserPDFReport = (data: UserReportData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });
  
  // Ustaw kodowanie UTF-8 dla polskich znaków
  doc.setProperties({
    title: 'Raport Prognozy Emerytalnej ZUS',
    subject: 'Prognoza emerytalna',
    author: 'ZUS na Plus',
    keywords: 'emerytura, ZUS, prognoza',
    creator: 'ZUS na Plus'
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 25;

  // Funkcja pomocnicza do bezpiecznego dodawania tekstu z polskimi znakami
  const addPolishText = (text: string, x: number, y: number, options?: any): void => {
    // Zamień polskie znaki na bezpieczne odpowiedniki dla jsPDF
    const safeText = text
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/Ą/g, 'A')
      .replace(/Ć/g, 'C')
      .replace(/Ę/g, 'E')
      .replace(/Ł/g, 'L')
      .replace(/Ń/g, 'N')
      .replace(/Ó/g, 'O')
      .replace(/Ś/g, 'S')
      .replace(/Ź/g, 'Z')
      .replace(/Ż/g, 'Z');
    
    doc.text(safeText, x, y, options);
  };

  // Funkcja pomocnicza do formatowania liczb
  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `${formatted} zl`; // Użyj "zl" zamiast "zł"
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  // Funkcja do dodawania linii oddzielającej
  const addSeparatorLine = (y: number): void => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // NAGŁÓWEK DOKUMENTU
  doc.setFillColor(0, 102, 153); // Kolor ZUS
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  addPolishText('RAPORT PROGNOZY EMERYTALNEJ', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(16);
  addPolishText('Zaklad Ubezpieczen Spolecznych', pageWidth / 2, 25, { align: 'center' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Data wygenerowania
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = data.generatedAt.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const timeStr = data.generatedAt.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });
  addPolishText(`Wygenerowano: ${dateStr} ${timeStr}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 20;

  // SEKCJA 1: DANE OSOBOWE
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  addPolishText('DANE OSOBOWE', margin + 5, yPosition + 7);
  yPosition += 25;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const personalData = [
    ['Wiek:', `${data.personalInfo.age} lat`],
    ['Plec:', data.personalInfo.gender === 'male' ? 'Mezczyzna' : 'Kobieta'],
    ['Wynagrodzenie brutto:', formatCurrency(data.personalInfo.salary)],
    ['Rok rozpoczecia pracy:', data.personalInfo.workStartYear.toString()],
    ['Planowany rok emerytury:', data.personalInfo.plannedRetirementYear.toString()]
  ];

  personalData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    addPolishText(label, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    addPolishText(value, margin + 90, yPosition);
    yPosition += 15; // Zwiększ odstęp między liniami
  });

  yPosition += 10;
  addSeparatorLine(yPosition);
  yPosition += 20;

  // SEKCJA 2: WYNIKI PROGNOZY EMERYTALNEJ
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  addPolishText('WYNIKI PROGNOZY EMERYTALNEJ', margin + 5, yPosition + 7);
  yPosition += 25;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  // Główny wynik - miesięczna emerytura
  doc.setFillColor(255, 248, 220);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(204, 102, 0);
  addPolishText('Prognozowana miesieczna emerytura:', margin + 5, yPosition + 5);
  doc.setFontSize(18);
  addPolishText(formatCurrency(data.pensionResults.monthlyPension || 0), margin + 5, yPosition + 18);
  yPosition += 35;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const pensionData = [
    ['Stopa zastapienia:', `${formatNumber(data.pensionResults.replacementRate || 0, 1)}%`],
    ['Lata do emerytury:', `${data.pensionResults.yearsToRetirement || 0} lat`],
    ['Laczne skladki:', formatCurrency(data.pensionResults.totalContributions || 0)],
    ['Realna wartosc emerytury:', formatCurrency(data.pensionResults.realPensionValue || 0)],
    ['Kapital poczatkowy:', formatCurrency(data.pensionResults.initialCapital || 0)],
    ['Przewidywana dlugosc zycia:', `${formatNumber(data.pensionResults.lifeExpectancy || 0, 1)} lat`]
  ];

  pensionData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    addPolishText(label, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    addPolishText(value, margin + 110, yPosition);
    yPosition += 15; // Zwiększ odstęp między liniami
  });

  yPosition += 10;
  addSeparatorLine(yPosition);
  yPosition += 20;

  // SEKCJA 3: PARAMETRY PROGNOZY FUS20
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  addPolishText('PARAMETRY PROGNOZY FUS20', margin + 5, yPosition + 7);
  yPosition += 25;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const fus20Data = [
    ['Scenariusz:', data.fus20Params.scenario || 'Brak danych'],
    ['Stopa bezrobocia:', `${formatNumber(data.fus20Params.unemploymentRate || 0, 2)}%`],
    ['Realny wzrost wynagrodzen:', `${formatNumber(data.fus20Params.realWageGrowth || 0, 2)}%`],
    ['Sciaganlosc skladek:', `${formatNumber(data.fus20Params.contributionCollection || 0, 2)}%`]
  ];

  fus20Data.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    addPolishText(label, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    addPolishText(value, margin + 110, yPosition);
    yPosition += 15; // Zwiększ odstęp między liniami
  });

  // SEKCJA 4: ANALIZA OPÓŹNIENIA EMERYTURY (jeśli dostępna)
  if (data.delayAnalysis) {
    yPosition += 10;
    addSeparatorLine(yPosition);
    yPosition += 20;

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 153);
    addPolishText('ANALIZA OPOZNIENIA EMERYTURY', margin + 5, yPosition + 7);
    yPosition += 25;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const delayData = [
      ['Emerytura bez opoznienia:', formatCurrency(data.delayAnalysis.originalPension || 0)],
      ['Emerytura z opoznieniem o 2 lata:', formatCurrency(data.delayAnalysis.delayedPension || 0)],
      ['Wzrost swiadczenia:', `${formatNumber(data.delayAnalysis.increasePercentage || 0, 1)}%`]
    ];

    delayData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      addPolishText(label, margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      addPolishText(value, margin + 120, yPosition);
      yPosition += 15; // Zwiększ odstęp między liniami
    });
  }

  // Kod pocztowy (jeśli podano)
  if (data.postalCode) {
    yPosition += 20;
    doc.setFont('helvetica', 'bold');
    addPolishText('Kod pocztowy:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    addPolishText(data.postalCode, margin + 80, yPosition);
  }

  // STOPKA
  const footerY = doc.internal.pageSize.height - 25;
  addSeparatorLine(footerY - 10);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  addPolishText('Raport wygenerowany przez ZUS na Plus - narzedie edukacyjne', margin, footerY);
  addPolishText('Wyniki maja charakter prognostyczny i moga roznic sie od rzeczywistych swiadczen.', margin, footerY + 8);
  addPolishText('© 2025 Zaklad Ubezpieczen Spolecznych', pageWidth - margin, footerY + 8, { align: 'right' });

  // Pobierz plik
  const fileName = `raport-prognozy-emerytalnej-${data.generatedAt.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Generowanie raportu XLS dla administratora
export const generateAdminXLSReport = (data: AdminReportEntry[]): void => {
  // Przygotowanie danych do eksportu
  const worksheetData = data.map(entry => ({
    'Data użycia': entry.dateUsed,
    'Godzina użycia': entry.timeUsed,
    'Emerytura oczekiwana': entry.expectedPension,
    'Wiek': entry.age,
    'Płeć': entry.gender,
    'Wysokość wynagrodzenia': entry.salary,
    'Czy uwzględniał okresy choroby': entry.includedSickness ? 'Tak' : 'Nie',
    'Wysokość zgromadzonych środków na koncie i Subkoncie': entry.accumulatedFunds,
    'Emerytura rzeczywista': entry.actualPension,
    'Emerytura urealniona': entry.realPension,
    'Kod pocztowy': entry.postalCode || 'Nie podano'
  }));

  // Tworzenie arkusza kalkulacyjnego
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  // Dodanie arkusza do skoroszytu
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Raport użycia');
  
  // Ustawienie szerokości kolumn
  const columnWidths = [
    { wch: 12 }, // Data użycia
    { wch: 12 }, // Godzina użycia
    { wch: 18 }, // Emerytura oczekiwana
    { wch: 8 },  // Wiek
    { wch: 10 }, // Płeć
    { wch: 20 }, // Wysokość wynagrodzenia
    { wch: 25 }, // Czy uwzględniał okresy choroby
    { wch: 35 }, // Wysokość zgromadzonych środków
    { wch: 18 }, // Emerytura rzeczywista
    { wch: 18 }, // Emerytura urealniona
    { wch: 15 }  // Kod pocztowy
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Pobieranie pliku
  const fileName = `raport_administracyjny_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Przykładowe dane dla raportu administracyjnego (do testów)
export const generateSampleAdminData = (): AdminReportEntry[] => {
  const sampleData: AdminReportEntry[] = [
    {
      dateUsed: '2024-01-15',
      timeUsed: '14:30:25',
      expectedPension: 3500,
      age: 45,
      gender: 'M',
      salary: 6500,
      includedSickness: true,
      accumulatedFunds: 125000,
      actualPension: 3245,
      realPension: 2890,
      postalCode: '00-001'
    },
    {
      dateUsed: '2024-01-15',
      timeUsed: '15:45:12',
      expectedPension: 2800,
      age: 52,
      gender: 'K',
      salary: 4200,
      includedSickness: false,
      accumulatedFunds: 89000,
      actualPension: 2650,
      realPension: 2380,
      postalCode: '30-001'
    },
    {
      dateUsed: '2024-01-16',
      timeUsed: '09:15:33',
      expectedPension: 4200,
      age: 38,
      gender: 'M',
      salary: 8500,
      includedSickness: true,
      accumulatedFunds: 95000,
      actualPension: 4150,
      realPension: 3720,
    }
  ];
  
  return sampleData;
};