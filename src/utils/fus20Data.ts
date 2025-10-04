// Kluczowe parametry FUS20 Wariant 1 (Pośredni) - Prognoza Ministerstwa Finansów z 2022 r.

export interface FUS20MacroeconomicData {
  year: number;
  unemploymentRate: number; // Stopa bezrobocia (%)
  realWageGrowth: number; // Realny wzrost wynagrodzenia (%)
  contributionCollection: number; // Ściągalność składek (%)
}

export interface FUS20ForecastResults {
  year: number;
  annualBalance: number; // Saldo roczne (mln PLN, zdyskontowane na 2021 r.)
  revenues: number; // Wpływy (mln PLN, zdyskontowane na 2021 r.)
  expenditures: number; // Wydatki (mln PLN, zdyskontowane na 2021 r.)
  note?: string; // Dodatkowe informacje
}

export interface FUS20EfficiencyBurden {
  year: number;
  efficiency: number; // Wydolność (%)
  burdenCoefficient: number; // Współczynnik obciążenia
  note?: string; // Dodatkowe informacje
}

export interface FUS20Variant1Data {
  source: string;
  variant: number;
  name: string;
  forecastPeriod: string;
  macroeconomicData: FUS20MacroeconomicData[];
  forecastResults: FUS20ForecastResults[];
  efficiencyBurden: FUS20EfficiencyBurden[];
}

// Dane makroekonomiczne FUS20 Wariant 1 (2023-2080)
export const FUS20_MACROECONOMIC_DATA: FUS20MacroeconomicData[] = [
  {
    year: 2023,
    unemploymentRate: 5.40,
    realWageGrowth: 100.30,
    contributionCollection: 99.00
  },
  {
    year: 2025,
    unemploymentRate: 5.00,
    realWageGrowth: 103.70,
    contributionCollection: 99.00
  },
  {
    year: 2040,
    unemploymentRate: 5.00,
    realWageGrowth: 102.70,
    contributionCollection: 99.00
  },
  {
    year: 2080,
    unemploymentRate: 5.00,
    realWageGrowth: 102.00,
    contributionCollection: 99.00
  }
];

// Wyniki prognostyczne FUS20 Wariant 1 (mln PLN, zdyskontowane na 2021 r.)
export const FUS20_FORECAST_RESULTS: FUS20ForecastResults[] = [
  {
    year: 2023,
    annualBalance: -59575,
    revenues: 145016,
    expenditures: 204591
  },
  {
    year: 2030,
    annualBalance: -93104,
    revenues: 177027,
    expenditures: 270131
  },
  {
    year: 2052,
    annualBalance: -93100, // Największa wartość deficytu
    revenues: 0, // Dane nie są dostępne dla tego roku
    expenditures: 0, // Dane nie są dostępne dla tego roku
    note: "Największa wartość deficytu zdyskontowanego inflacją na 2021 r. wynosi 93,1 mld zł"
  },
  {
    year: 2080,
    annualBalance: -52121,
    revenues: 372457,
    expenditures: 424578
  }
];

// Wydolność i obciążenie FUS20 Wariant 1
export const FUS20_EFFICIENCY_BURDEN: FUS20EfficiencyBurden[] = [
  {
    year: 2023,
    efficiency: 71,
    burdenCoefficient: 0.40
  },
  {
    year: 2060,
    efficiency: 78,
    burdenCoefficient: 0.81
  },
  {
    year: 2080,
    efficiency: 88,
    burdenCoefficient: 0.84,
    note: "wzrost o 16,8 p.p. od 2023 r."
  }
];

// Kompletne dane FUS20 Wariant 1
export const FUS20_VARIANT_1: FUS20Variant1Data = {
  source: "Prognoza Ministerstwa Finansów z 2022 r.",
  variant: 1,
  name: "Pośredni",
  forecastPeriod: "2023-2080",
  macroeconomicData: FUS20_MACROECONOMIC_DATA,
  forecastResults: FUS20_FORECAST_RESULTS,
  efficiencyBurden: FUS20_EFFICIENCY_BURDEN
};

// Funkcje pomocnicze do pobierania danych FUS20

/**
 * Pobiera dane makroekonomiczne dla określonego roku
 */
export const getMacroeconomicDataForYear = (year: number): FUS20MacroeconomicData | null => {
  return FUS20_MACROECONOMIC_DATA.find(data => data.year === year) || null;
};

/**
 * Pobiera wyniki prognostyczne dla określonego roku
 */
export const getForecastResultsForYear = (year: number): FUS20ForecastResults | null => {
  return FUS20_FORECAST_RESULTS.find(data => data.year === year) || null;
};

/**
 * Pobiera dane wydolności i obciążenia dla określonego roku
 */
export const getEfficiencyBurdenForYear = (year: number): FUS20EfficiencyBurden | null => {
  return FUS20_EFFICIENCY_BURDEN.find(data => data.year === year) || null;
};

/**
 * Interpoluje dane makroekonomiczne dla roku, który nie jest bezpośrednio dostępny
 */
export const interpolateMacroeconomicData = (targetYear: number): FUS20MacroeconomicData => {
  // Znajdź najbliższe lata
  const sortedData = [...FUS20_MACROECONOMIC_DATA].sort((a, b) => a.year - b.year);
  
  // Jeśli rok jest przed pierwszym dostępnym rokiem
  if (targetYear <= sortedData[0].year) {
    return sortedData[0];
  }
  
  // Jeśli rok jest po ostatnim dostępnym roku
  if (targetYear >= sortedData[sortedData.length - 1].year) {
    return sortedData[sortedData.length - 1];
  }
  
  // Znajdź lata do interpolacji
  let lowerYear = sortedData[0];
  let upperYear = sortedData[1];
  
  for (let i = 0; i < sortedData.length - 1; i++) {
    if (targetYear >= sortedData[i].year && targetYear <= sortedData[i + 1].year) {
      lowerYear = sortedData[i];
      upperYear = sortedData[i + 1];
      break;
    }
  }
  
  // Interpolacja liniowa
  const ratio = (targetYear - lowerYear.year) / (upperYear.year - lowerYear.year);
  
  return {
    year: targetYear,
    unemploymentRate: lowerYear.unemploymentRate + (upperYear.unemploymentRate - lowerYear.unemploymentRate) * ratio,
    realWageGrowth: lowerYear.realWageGrowth + (upperYear.realWageGrowth - lowerYear.realWageGrowth) * ratio,
    contributionCollection: lowerYear.contributionCollection + (upperYear.contributionCollection - lowerYear.contributionCollection) * ratio
  };
};

/**
 * Pobiera wszystkie dostępne lata w danych FUS20
 */
export const getAvailableYears = (): number[] => {
  const allYears = new Set<number>();
  
  FUS20_MACROECONOMIC_DATA.forEach(data => allYears.add(data.year));
  FUS20_FORECAST_RESULTS.forEach(data => allYears.add(data.year));
  FUS20_EFFICIENCY_BURDEN.forEach(data => allYears.add(data.year));
  
  return Array.from(allYears).sort((a, b) => a - b);
};

/**
 * Sprawdza czy dany rok jest w zakresie prognozy FUS20
 */
export const isYearInForecastRange = (year: number): boolean => {
  return year >= 2023 && year <= 2080;
};