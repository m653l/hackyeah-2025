/**
 * Integracja danych z różnych źródeł
 * R004: Prognoza FUS20 (2022) do 2080 roku, Prognoza Demograficzna MF, GUS, NBP, MF
 */

export interface MacroeconomicData {
  year: number;
  gdpGrowth: number;
  inflation: number;
  unemploymentRate: number;
  averageWage: number;
  pensionIndexation: number;
}

export interface DemographicData {
  year: number;
  totalPopulation: number;
  workingAgePopulation: number;
  retiredPopulation: number;
  birthRate: number;
  deathRate: number;
  lifeExpectancyMale: number;
  lifeExpectancyFemale: number;
}

export interface CountyPensionData {
  name: string;
  displayName: string;
  countyCode: string;
  countyName: string;
  averagePension: number;
  averagePension2024: number;
  highestPension: number;
  lowestPension: number;
  averagePensionByTitle: { [titleCode: string]: number };
  retirementDelayStats: {
    exactAge: number; // Procent przechodzących dokładnie w wieku emerytalnym
    delay1to11Months: number; // Opóźnienie 1-11 miesięcy
    delay2YearsPlus: number; // Opóźnienie 2 lata i więcej
  };
  sickLeaveData: {
    averageAbsenceDays: number;
    averageCertificateDays: number;
  };
}

export interface CountySickLeaveData {
  name: string;
  displayName: string;
  averageAbsenceDays: number;
  averageCertificateDays: number;
  casesPerYear: number;
  percentageOfWorkers: number;
  nationalRanking: number;
}

export interface ProfessionalGroupData {
  titleCode: string;
  titleName: string;
  averagePension2024: number;
  description: string;
}

/**
 * Historyczne dane makroekonomiczne (2020-2024)
 * Źródło: GUS, NBP, MF
 */
export const HISTORICAL_MACROECONOMIC_DATA: MacroeconomicData[] = [
  {
    year: 2024,
    gdpGrowth: 3.1,
    inflation: 3.6,
    unemploymentRate: 5.0,
    averageWage: 7850,
    pensionIndexation: 12.12
  },
  {
    year: 2023,
    gdpGrowth: 0.2,
    inflation: 11.4,
    unemploymentRate: 5.2,
    averageWage: 7224,
    pensionIndexation: 14.8
  },
  {
    year: 2022,
    gdpGrowth: 5.1,
    inflation: 16.6,
    unemploymentRate: 5.2,
    averageWage: 6571,
    pensionIndexation: 7.0
  },
  {
    year: 2021,
    gdpGrowth: 6.9,
    inflation: 5.1,
    unemploymentRate: 6.0,
    averageWage: 5973,
    pensionIndexation: 4.24
  },
  {
    year: 2020,
    gdpGrowth: -2.5,
    inflation: 3.4,
    unemploymentRate: 6.2,
    averageWage: 5604,
    pensionIndexation: 3.56
  }
];

// Dane o okresach chorobowych w powiatach
export const COUNTY_SICK_LEAVE_DATA: CountySickLeaveData[] = [
  {
    name: 'mazowieckie',
    displayName: 'Mazowieckie',
    averageAbsenceDays: 14.2,
    averageCertificateDays: 16.8,
    casesPerYear: 2.3,
    percentageOfWorkers: 68.5,
    nationalRanking: 8
  },
  {
    name: 'malopolskie',
    displayName: 'Małopolskie',
    averageAbsenceDays: 13.8,
    averageCertificateDays: 15.9,
    casesPerYear: 2.1,
    percentageOfWorkers: 65.2,
    nationalRanking: 12
  },
  {
    name: 'pomorskie',
    displayName: 'Pomorskie',
    averageAbsenceDays: 12.69,
    averageCertificateDays: 14.5,
    casesPerYear: 1.9,
    percentageOfWorkers: 62.8,
    nationalRanking: 15
  },
  {
    name: 'lodzkie',
    displayName: 'Łódzkie',
    averageAbsenceDays: 15.8,
    averageCertificateDays: 18.2,
    casesPerYear: 2.6,
    percentageOfWorkers: 72.1,
    nationalRanking: 4
  },
  {
    name: 'nowosadecki',
    displayName: 'Nowosądecki',
    averageAbsenceDays: 12.69, // Powiat nowosądecki - dane z 2024 r.
    averageCertificateDays: 14.2,
    casesPerYear: 1.8,
    percentageOfWorkers: 59.3,
    nationalRanking: 18
  }
];

/**
 * Prognoza demograficzna MF z 2022 r. do 2080 roku
 * Źródło: Ministerstwo Finansów, Prognoza demograficzna 2022
 */
export const DEMOGRAPHIC_PROJECTIONS: DemographicData[] = [
  {
    year: 2025,
    totalPopulation: 37.8,
    workingAgePopulation: 22.4,
    retiredPopulation: 9.2,
    birthRate: 8.9,
    deathRate: 11.2,
    lifeExpectancyMale: 74.1,
    lifeExpectancyFemale: 81.8
  },
  {
    year: 2030,
    totalPopulation: 37.3,
    workingAgePopulation: 21.8,
    retiredPopulation: 10.1,
    birthRate: 8.7,
    deathRate: 11.8,
    lifeExpectancyMale: 75.2,
    lifeExpectancyFemale: 82.4
  },
  {
    year: 2040,
    totalPopulation: 36.2,
    workingAgePopulation: 20.1,
    retiredPopulation: 12.3,
    birthRate: 8.5,
    deathRate: 13.1,
    lifeExpectancyMale: 77.1,
    lifeExpectancyFemale: 83.8
  },
  {
    year: 2050,
    totalPopulation: 34.8,
    workingAgePopulation: 18.9,
    retiredPopulation: 13.2,
    birthRate: 8.4,
    deathRate: 14.2,
    lifeExpectancyMale: 78.8,
    lifeExpectancyFemale: 85.1
  },
  {
    year: 2060,
    totalPopulation: 33.1,
    workingAgePopulation: 17.8,
    retiredPopulation: 13.8,
    birthRate: 8.3,
    deathRate: 15.1,
    lifeExpectancyMale: 80.2,
    lifeExpectancyFemale: 86.2
  },
  {
    year: 2070,
    totalPopulation: 31.2,
    workingAgePopulation: 16.9,
    retiredPopulation: 13.9,
    birthRate: 8.2,
    deathRate: 15.8,
    lifeExpectancyMale: 81.4,
    lifeExpectancyFemale: 87.1
  },
  {
    year: 2080,
    totalPopulation: 29.1,
    workingAgePopulation: 15.8,
    retiredPopulation: 13.7,
    birthRate: 8.1,
    deathRate: 16.2,
    lifeExpectancyMale: 82.3,
    lifeExpectancyFemale: 87.8
  }
];

/**
 * Przykładowe dane powiatowe - przeciętna wysokość emerytury 2024
 * W3.6: Kontekst powiatowy/zawodowy
 */
export const COUNTY_PENSION_DATA: CountyPensionData[] = [
  {
    name: 'mazowieckie',
    displayName: 'Mazowieckie',
    countyCode: '1465',
    countyName: 'Warszawa',
    averagePension: 3245.67,
    averagePension2024: 3245.67,
    highestPension: 22600.63,
    lowestPension: 1780.96,
    averagePensionByTitle: {
      '0510': 3890.23, // Umowa o pracę
      '0570': 2876.45, // Działalność gospodarcza
      '0590': 4123.78  // Wolne zawody
    },
    retirementDelayStats: {
      exactAge: 77.7, // Mężczyźni w 2022 r.
      delay1to11Months: 15.8,
      delay2YearsPlus: 6.5
    },
    sickLeaveData: {
      averageAbsenceDays: 14.2,
      averageCertificateDays: 16.8
    }
  },
  {
    name: 'malopolskie',
    displayName: 'Małopolskie',
    countyCode: '1261',
    countyName: 'Kraków',
    averagePension: 2987.34,
    averagePension2024: 2987.34,
    highestPension: 19876.45,
    lowestPension: 1654.23,
    averagePensionByTitle: {
      '0510': 3456.12,
      '0570': 2543.89,
      '0590': 3789.45
    },
    retirementDelayStats: {
      exactAge: 75.2,
      delay1to11Months: 17.3,
      delay2YearsPlus: 7.5
    },
    sickLeaveData: {
      averageAbsenceDays: 13.8,
      averageCertificateDays: 15.9
    }
  },
  {
    name: 'pomorskie',
    displayName: 'Pomorskie',
    countyCode: '3065',
    countyName: 'Gdańsk',
    averagePension: 2834.56,
    averagePension2024: 2834.56,
    highestPension: 18234.78,
    lowestPension: 1598.34,
    averagePensionByTitle: {
      '0510': 3234.67,
      '0570': 2456.78,
      '0590': 3567.89
    },
    retirementDelayStats: {
      exactAge: 73.8,
      delay1to11Months: 18.7,
      delay2YearsPlus: 7.5
    },
    sickLeaveData: {
      averageAbsenceDays: 12.69,
      averageCertificateDays: 14.5
    }
  },
  {
    name: 'lodzkie',
    displayName: 'Łódzkie',
    countyCode: '2465',
    countyName: 'Bełchatów',
    averagePension: 2456.78,
    averagePension2024: 2456.78,
    highestPension: 22600.63, // Najwyższa emerytura bez dodatków dla mężczyzn
    lowestPension: 1456.78,
    averagePensionByTitle: {
      '0510': 2789.45,
      '0570': 2123.67,
      '0590': 2987.34
    },
    retirementDelayStats: {
      exactAge: 79.3,
      delay1to11Months: 14.2,
      delay2YearsPlus: 6.5
    },
    sickLeaveData: {
      averageAbsenceDays: 15.8,
      averageCertificateDays: 18.2
    }
  },
  {
    name: 'nowosadecki',
    displayName: 'Nowosądecki',
    countyCode: '1264',
    countyName: 'Nowy Sącz',
    averagePension: 2234.56,
    averagePension2024: 2234.56,
    highestPension: 16789.23,
    lowestPension: 1398.45,
    averagePensionByTitle: {
      '0510': 2567.89,
      '0570': 1987.34,
      '0590': 2789.45
    },
    retirementDelayStats: {
      exactAge: 81.2,
      delay1to11Months: 12.8,
      delay2YearsPlus: 6.0
    },
    sickLeaveData: {
      averageAbsenceDays: 12.69, // Powiat nowosądecki - dane z 2024 r.
      averageCertificateDays: 14.2
    }
  }
];

/**
 * Grupy zawodowe - przeciętna wysokość emerytury 2024
 * IV.8: Kontekst zawodowy
 */
export const PROFESSIONAL_GROUPS: ProfessionalGroupData[] = [
  {
    titleCode: '0510',
    titleName: 'Pracownicy (umowa o pracę)',
    averagePension2024: 3456.78,
    description: 'Osoby zatrudnione na podstawie umowy o pracę'
  },
  {
    titleCode: '0570',
    titleName: 'Osoby prowadzące działalność gospodarczą',
    averagePension2024: 2789.45,
    description: 'Przedsiębiorcy i osoby samozatrudnione'
  },
  {
    titleCode: '0590',
    titleName: 'Osoby wykonujące wolne zawody',
    averagePension2024: 3987.34,
    description: 'Lekarze, prawnicy, architekci i inne wolne zawody'
  },
  {
    titleCode: '0520',
    titleName: 'Osoby na zleceniu',
    averagePension2024: 2234.56,
    description: 'Osoby zatrudnione na podstawie umowy zlecenia'
  },
  {
    titleCode: '0580',
    titleName: 'Posłowie i Senatorowie',
    averagePension2024: 8976.45,
    description: 'Członkowie parlamentu RP'
  },
  {
    titleCode: '0560',
    titleName: 'Rolnicy',
    averagePension2024: 1876.23,
    description: 'Osoby prowadzące działalność rolniczą'
  }
];

/**
 * Statystyki opóźnień przejścia na emeryturę (2022-2024)
 * IV.5a: Prognoza odroczenia - Opóźnienie Statystyczne
 */
export const RETIREMENT_DELAY_STATISTICS = {
  male: {
    2022: {
      exactAge: 77.7,
      delay1to11Months: 15.8,
      delay2YearsPlus: 6.5
    },
    2023: {
      exactAge: 76.2,
      delay1to11Months: 16.4,
      delay2YearsPlus: 7.4
    },
    2024: {
      exactAge: 75.8,
      delay1to11Months: 17.1,
      delay2YearsPlus: 7.1
    }
  },
  female: {
    2022: {
      exactAge: 82.3,
      delay1to11Months: 12.4,
      delay2YearsPlus: 5.3
    },
    2023: {
      exactAge: 81.7,
      delay1to11Months: 13.1,
      delay2YearsPlus: 5.2
    },
    2024: {
      exactAge: 80.9,
      delay1to11Months: 13.8,
      delay2YearsPlus: 5.3
    }
  }
};

/**
 * Przeciętne emerytury w Polsce (2024)
 * Źródło: ZUS, dane statystyczne
 */
export const NATIONAL_PENSION_AVERAGES = {
  overall: 3234.67,
  male: 3567.89,
  female: 2987.45,
  minimum: 1780.96,
  maximum: 22600.63
};

/**
 * Prognoza demograficzna i ekonomiczna FUS20
 * F4.0: Wybór wariantu FUS20 (pośredni, pesymistyczny, optymistyczny)
 */
export function getFUS20Projections(scenario: 'intermediate' | 'pessimistic' | 'optimistic', year: number) {
  const projections = {
    intermediate: {
      pensioners: 9.2 + (year - 2025) * 0.15, // Wzrost liczby emerytów
      workers: 16.8 - (year - 2025) * 0.08,   // Spadek liczby pracujących
      dependencyRatio: 0.55 + (year - 2025) * 0.01,
      fundBalance: -15.2 - (year - 2025) * 2.1 // Pogłębianie deficytu
    },
    pessimistic: {
      pensioners: 9.2 + (year - 2025) * 0.18,
      workers: 16.8 - (year - 2025) * 0.12,
      dependencyRatio: 0.55 + (year - 2025) * 0.015,
      fundBalance: -15.2 - (year - 2025) * 2.8
    },
    optimistic: {
      pensioners: 9.2 + (year - 2025) * 0.12,
      workers: 16.8 - (year - 2025) * 0.05,
      dependencyRatio: 0.55 + (year - 2025) * 0.008,
      fundBalance: -15.2 - (year - 2025) * 1.6
    }
  };
  
  return projections[scenario];
}

/**
 * Prognoza makroekonomiczna FUS20 do 2080 roku
 * F4.1: Modyfikacja założeń makroekonomicznych
 */
export function generateMacroeconomicProjections(
  scenario: 'intermediate' | 'pessimistic' | 'optimistic',
  customParams?: Partial<{
    unemploymentRate: number;
    wageGrowth: number;
    inflation: number;
    contributionCollection: number;
  }>
): MacroeconomicData[] {
  const baseProjections = {
    intermediate: {
      gdpGrowth: 2.8,
      inflation: 2.5,
      unemploymentRate: 5.2,
      wageGrowth: 3.5,
      contributionCollection: 95.0
    },
    pessimistic: {
      gdpGrowth: 1.8,
      inflation: 3.2,
      unemploymentRate: 7.1,
      wageGrowth: 2.1,
      contributionCollection: 92.0
    },
    optimistic: {
      gdpGrowth: 3.8,
      inflation: 2.0,
      unemploymentRate: 4.2,
      wageGrowth: 4.2,
      contributionCollection: 97.0
    }
  };

  const params = { ...baseProjections[scenario], ...customParams };
  const projections: MacroeconomicData[] = [];
  
  const currentYear = new Date().getFullYear();
  const lastHistoricalWage = HISTORICAL_MACROECONOMIC_DATA[0].averageWage;
  
  for (let year = currentYear + 1; year <= 2080; year += 5) {
    const yearsFromNow = year - currentYear;
    const projectedWage = lastHistoricalWage * Math.pow(1 + params.wageGrowth / 100, yearsFromNow);
    
    projections.push({
      year,
      gdpGrowth: params.gdpGrowth + (Math.random() - 0.5) * 0.5, // Dodanie losowej zmienności
      inflation: params.inflation + (Math.random() - 0.5) * 0.3,
      unemploymentRate: params.unemploymentRate + (Math.random() - 0.5) * 0.8,
      averageWage: Math.round(projectedWage),
      pensionIndexation: params.inflation + 0.5 // Waloryzacja emerytury = inflacja + 0.5%
    });
  }
  
  return projections;
}

/**
 * Pobieranie danych powiatowych
 * W3.6: Przeciętna wysokość emerytury w wybranym powiecie
 */
export function getCountyPensionData(countyCode: string): CountyPensionData | null {
  return COUNTY_PENSION_DATA.find(county => county.countyCode === countyCode) || null;
}

/**
 * Analiza historycznych odsetków opóźnienia przejścia na emeryturę
 * W3.4: Porównanie z historycznymi odsetkami opóźnienia
 */
export function getRetirementDelayStatistics(countyCode?: string): {
  national: { exactAge: number; delay1to11Months: number; delay2YearsPlus: number };
  county?: { exactAge: number; delay1to11Months: number; delay2YearsPlus: number };
} {
  // Średnie krajowe (obliczone z danych powiatowych)
  const nationalStats = {
    exactAge: 77.4, // Średnia z wszystkich powiatów
    delay1to11Months: 15.76,
    delay2YearsPlus: 6.84
  };
  
  const result: any = { national: nationalStats };
  
  if (countyCode) {
    const countyData = getCountyPensionData(countyCode);
    if (countyData) {
      result.county = countyData.retirementDelayStats;
    }
  }
  
  return result;
}

/**
 * Interpolacja danych dla konkretnego roku
 */
export function interpolateDataForYear<T extends { year: number }>(
  data: T[],
  targetYear: number,
  valueKey: keyof T
): number {
  // Znajdź najbliższe lata
  const sortedData = data.sort((a, b) => a.year - b.year);
  
  // Jeśli rok jest poza zakresem, zwróć wartość skrajną
  if (targetYear <= sortedData[0].year) {
    return sortedData[0][valueKey] as number;
  }
  if (targetYear >= sortedData[sortedData.length - 1].year) {
    return sortedData[sortedData.length - 1][valueKey] as number;
  }
  
  // Znajdź lata do interpolacji
  let lowerData = sortedData[0];
  let upperData = sortedData[1];
  
  for (let i = 0; i < sortedData.length - 1; i++) {
    if (sortedData[i].year <= targetYear && sortedData[i + 1].year >= targetYear) {
      lowerData = sortedData[i];
      upperData = sortedData[i + 1];
      break;
    }
  }
  
  // Interpolacja liniowa
  const ratio = (targetYear - lowerData.year) / (upperData.year - lowerData.year);
  const lowerValue = lowerData[valueKey] as number;
  const upperValue = upperData[valueKey] as number;
  
  return lowerValue + (upperValue - lowerValue) * ratio;
}

/**
 * Pobieranie danych demograficznych dla konkretnego roku
 */
export function getDemographicDataForYear(year: number): DemographicData {
  const interpolatedData: DemographicData = {
    year,
    totalPopulation: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'totalPopulation'),
    workingAgePopulation: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'workingAgePopulation'),
    retiredPopulation: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'retiredPopulation'),
    birthRate: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'birthRate'),
    deathRate: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'deathRate'),
    lifeExpectancyMale: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'lifeExpectancyMale'),
    lifeExpectancyFemale: interpolateDataForYear(DEMOGRAPHIC_PROJECTIONS, year, 'lifeExpectancyFemale')
  };
  
  return interpolatedData;
}

/**
 * Pobieranie danych makroekonomicznych dla konkretnego roku
 */
export function getMacroeconomicDataForYear(
  year: number,
  scenario: 'intermediate' | 'pessimistic' | 'optimistic' = 'intermediate'
): MacroeconomicData {
  // Sprawdź dane historyczne
  const historicalData = HISTORICAL_MACROECONOMIC_DATA.find(data => data.year === year);
  if (historicalData) {
    return historicalData;
  }
  
  // Generuj prognozę
  const projections = generateMacroeconomicProjections(scenario);
  const interpolatedData: MacroeconomicData = {
    year,
    gdpGrowth: interpolateDataForYear(projections, year, 'gdpGrowth'),
    inflation: interpolateDataForYear(projections, year, 'inflation'),
    unemploymentRate: interpolateDataForYear(projections, year, 'unemploymentRate'),
    averageWage: interpolateDataForYear(projections, year, 'averageWage'),
    pensionIndexation: interpolateDataForYear(projections, year, 'pensionIndexation')
  };
  
  return interpolatedData;
}