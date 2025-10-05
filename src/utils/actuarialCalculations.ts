/**
 * Moduły kalkulacji aktuarialnej FUS20
 * Implementacja zgodna z prognozami demograficznymi i ekonomicznymi do 2080 roku
 */

// Interfaces - definicje typów dla kalkulacji aktuarialnych
interface HistoricalSalary {
  year: number;
  amount: number;
}

interface SicknessPeriod {
  year: number;
  days: number;
  type: 'past' | 'future';
  county?: string;
}

interface FUS20Parameters {
  scenario: 'intermediate' | 'pessimistic' | 'optimistic';
  unemploymentRate: number;
  wageGrowth: number;
  inflation: number;
  contributionCollection: number;
  // Nowe parametry z dashboard
  fus20Variant?: 'intermediate' | 'pessimistic' | 'optimistic';
  generalInflation?: number;
  pensionerInflation?: number;
  realGDPGrowth?: number;
}

interface PersonData {
  age: number;
  gender: 'male' | 'female';
  salary: number;
  workStartYear: number;
  retirementYear: number;
  currentSavings?: number;
  contributionPeriod?: number;
  includeSickLeave?: boolean;
  professionalGroup?: string;
  // Nowe parametry z dashboard
  historicalSalaries?: HistoricalSalary[];
  sicknessPeriods?: SicknessPeriod[];
  salaryGrowthRate?: number;
  contributionValorizationRate?: number;
  inflationRate?: number;
  forecastHorizon?: number;
  mainAccount?: number;
  subAccount?: number;
  showAccountGrowth?: boolean;
  includeValorization?: boolean;
}

interface PensionCalculationResult {
  monthlyPension: number;
  totalContributions: number;
  capitalAtRetirement: number;
  replacementRate: number;
  lifeExpectancy: number;
  projectedInflation: number;
  realPensionValue: number;
  nominalPensionValue: number;
  yearsToRetirement: number;
  initialCapital: number;
  valorizedContributions: number;
  sickLeaveImpact: number;
  // Dodatkowe właściwości używane w FormPage
  monthlyPensionReal?: number;
  withSickness?: number;
  withoutSickness?: number;
  estimatedSavings?: number;
}

// Eksporty interfejsów
export type { FUS20Parameters, PersonData, PensionCalculationResult, HistoricalSalary, SicknessPeriod };

/**
 * Historyczne wskaźniki waloryzacji składek (roczne i kwartalne)
 * Źródło: ZUS, dane historyczne 2000-2024
 */
export const VALORIZATION_RATES = {
  annual: {
    2024: 15.26,
    2023: 11.89,
    2022: 4.24,
    2021: 3.84,
    2020: 3.56,
    2019: 7.05,
    2018: 2.60,
    2017: 4.17,
    2016: 2.67,
    2015: 2.26,
    2014: 2.07,
    2013: 2.33,
    2012: 4.62,
    2011: 4.31,
    2010: 3.81,
  },
  quarterly: {
    2024: [3.45, 3.78, 4.12, 3.91],
    2023: [2.87, 3.12, 2.95, 2.95],
    2022: [1.02, 1.08, 1.06, 1.08],
    2021: [0.96, 0.98, 0.95, 0.95],
    2020: [0.89, 0.91, 0.88, 0.88],
  }
};

/**
 * Tablice dalszego trwania życia (w miesiącach)
 * Źródło: GUS, tablice trwania życia 2023
 */
export const LIFE_EXPECTANCY_TABLES = {
  male: {
    60: 252, // 21.0 lat
    61: 240, // 20.0 lat
    62: 228, // 19.0 lat
    63: 216, // 18.0 lat
    64: 204, // 17.0 lat
    65: 192, // 16.0 lat
    66: 180, // 15.0 lat
    67: 168, // 14.0 lat
  },
  female: {
    60: 276, // 23.0 lat
    61: 264, // 22.0 lat
    62: 252, // 21.0 lat
    63: 240, // 20.0 lat
    64: 228, // 19.0 lat
    65: 216, // 18.0 lat
    66: 204, // 17.0 lat
    67: 192, // 16.0 lat
  }
};

/**
 * Kapitał początkowy - tabele referencyjne dla stażu 1-20 lat na 31.12.1998
 * Źródło: Rozporządzenie Ministra Pracy i Polityki Społecznej
 */
export const INITIAL_CAPITAL_TABLES = {
  male: {
    1: 0.7, 2: 1.5, 3: 2.2, 4: 2.9, 5: 3.6,
    6: 4.3, 7: 5.0, 8: 5.7, 9: 6.4, 10: 7.1,
    11: 7.8, 12: 8.5, 13: 9.2, 14: 9.9, 15: 10.6,
    16: 11.3, 17: 12.0, 18: 12.7, 19: 13.4, 20: 14.1
  },
  female: {
    1: 0.8, 2: 1.6, 3: 2.4, 4: 3.2, 5: 4.0,
    6: 4.8, 7: 5.6, 8: 6.4, 9: 7.2, 10: 8.0,
    11: 8.8, 12: 9.6, 13: 10.4, 14: 11.2, 15: 12.0,
    16: 12.8, 17: 13.6, 18: 14.4, 19: 15.2, 20: 16.0
  }
};

/**
 * Średnia długość absencji chorobowej w podziale na wiek i płeć
 * Źródło: ZUS, statystyki zasiłków chorobowych
 */
export const SICK_LEAVE_STATISTICS = {
  male: {
    '20-30': 8.2,
    '31-40': 12.5,
    '41-50': 18.7,
    '51-60': 26.3,
    '60+': 34.1
  },
  female: {
    '20-30': 11.4,
    '31-40': 16.8,
    '41-50': 22.3,
    '51-60': 29.7,
    '60+': 37.2
  }
};

/**
 * Waloryzacja wynagrodzeń - odwracanie indeksacji
 * L2.2: Wykorzystanie historycznych wskaźników waloryzacji składek
 */
export function calculateWageValorization(
  baseSalary: number,
  startYear: number,
  endYear: number,
  useQuarterly: boolean = false
): number {
  let valorizedSalary = baseSalary;
  
  for (let year = startYear; year <= endYear; year++) {
    if (useQuarterly && VALORIZATION_RATES.quarterly[year as keyof typeof VALORIZATION_RATES.quarterly]) {
      // Kalkulacja kwartalna
      const quarterlyRates = VALORIZATION_RATES.quarterly[year as keyof typeof VALORIZATION_RATES.quarterly];
      for (const rate of quarterlyRates) {
        valorizedSalary *= (1 + rate / 100);
      }
    } else if (VALORIZATION_RATES.annual[year as keyof typeof VALORIZATION_RATES.annual]) {
      // Kalkulacja roczna
      const annualRate = VALORIZATION_RATES.annual[year as keyof typeof VALORIZATION_RATES.annual];
      valorizedSalary *= (1 + annualRate / 100);
    } else {
      // Prognozowana waloryzacja dla lat przyszłych (3.5% rocznie)
      valorizedSalary *= 1.035;
    }
  }
  
  return valorizedSalary;
}

/**
 * Kalkulacja chorobowego z uwzględnieniem wieku i płci
 * L2.4a: Średnia długość absencji chorobowej w podziale na wiek i płeć
 */
export function calculateSickLeaveImpact(
  age: number,
  gender: 'male' | 'female',
  annualSalary: number
): number {
  let ageGroup: string;
  
  if (age <= 30) ageGroup = '20-30';
  else if (age <= 40) ageGroup = '31-40';
  else if (age <= 50) ageGroup = '41-50';
  else if (age <= 60) ageGroup = '51-60';
  else ageGroup = '60+';
  
  const avgSickDays = SICK_LEAVE_STATISTICS[gender][ageGroup as keyof typeof SICK_LEAVE_STATISTICS[typeof gender]];
  const workingDaysPerYear = 250; // Przyjęte 250 dni roboczych w roku
  const sickLeaveRatio = avgSickDays / workingDaysPerYear;
  
  // Zasiłek chorobowy to 80% wynagrodzenia
  const sickLeaveCompensation = annualSalary * sickLeaveRatio * 0.8;
  const regularSalary = annualSalary * (1 - sickLeaveRatio);
  
  return regularSalary + sickLeaveCompensation;
}

/**
 * Obliczenie kapitału początkowego
 * L2.5: Wykorzystanie zgromadzonego Kapitału Początkowego
 */
export function calculateInitialCapital(
  gender: 'male' | 'female',
  contributionPeriod: number,
  avgSalaryAt1998: number
): number {
  if (contributionPeriod <= 0 || contributionPeriod > 20) {
    return 0;
  }
  
  const multiplier = INITIAL_CAPITAL_TABLES[gender][contributionPeriod as keyof typeof INITIAL_CAPITAL_TABLES[typeof gender]];
  return avgSalaryAt1998 * multiplier;
}

/**
 * Obliczenie dalszego trwania życia
 * Wykorzystanie tablic dalszego trwania życia w miesiącach
 */
export function calculateLifeExpectancy(
  age: number,
  gender: 'male' | 'female'
): number {
  // Użyj rzeczywistego wieku na emeryturze, nie wieku emerytalnego
  const retirementAge = Math.max(60, Math.min(67, age));
  const table = LIFE_EXPECTANCY_TABLES[gender];
  
  console.log('Obliczanie dalszego trwania życia:', { age, retirementAge, gender });
  
  if (table[retirementAge as keyof typeof table]) {
    const lifeExpectancy = table[retirementAge as keyof typeof table];
    console.log('Dalsze trwanie życia z tabeli:', lifeExpectancy, 'miesięcy');
    return lifeExpectancy;
  }
  
  // Interpolacja dla wieku pomiędzy tabelami
  const lowerAge = Math.floor(retirementAge);
  const upperAge = Math.ceil(retirementAge);
  
  if (lowerAge === upperAge) {
    const defaultValue = table[lowerAge as keyof typeof table] || 192; // Domyślnie 16 lat
    console.log('Dalsze trwanie życia (domyślne):', defaultValue, 'miesięcy');
    return defaultValue;
  }
  
  const lowerValue = table[lowerAge as keyof typeof table] || 192;
  const upperValue = table[upperAge as keyof typeof table] || 192;
  const ratio = retirementAge - lowerAge;
  const interpolatedValue = lowerValue + (upperValue - lowerValue) * ratio;
  
  console.log('Dalsze trwanie życia (interpolowane):', interpolatedValue, 'miesięcy');
  return interpolatedValue;
}

/**
 * Główna funkcja kalkulacji emerytury zgodnie z FUS20
 * Implementuje wszystkie moduły aktuarialne
 */
export function calculatePension(
  personData: PersonData,
  fus20Params: FUS20Parameters = {
    scenario: 'intermediate',
    unemploymentRate: 5.2,
    wageGrowth: 3.5,
    inflation: 2.5,
    contributionCollection: 95.0
  }
): PensionCalculationResult {
  console.log('=== ROZPOCZĘCIE KALKULACJI EMERYTURY ===');
  console.log('Dane wejściowe:', { personData, fus20Params });
  console.log('Wariant FUS20:', fus20Params.fus20Variant || fus20Params.scenario);
  console.log('Parametry makroekonomiczne:', {
    unemploymentRate: fus20Params.unemploymentRate,
    wageGrowth: fus20Params.wageGrowth,
    inflation: fus20Params.inflation,
    realGDPGrowth: fus20Params.realGDPGrowth,
    generalInflation: fus20Params.generalInflation,
    pensionerInflation: fus20Params.pensionerInflation
  });

  const currentYear = new Date().getFullYear();
  const yearsToRetirement = personData.retirementYear - currentYear;
  const workingYears = personData.retirementYear - personData.workStartYear;
  
  console.log('Podstawowe obliczenia:', { currentYear, yearsToRetirement, workingYears });

  // Walidacja podstawowych danych
  if (yearsToRetirement < 0) {
    console.error('BŁĄD: Rok emerytury jest w przeszłości!');
    throw new Error('Rok emerytury nie może być w przeszłości');
  }
  
  if (workingYears <= 0) {
    console.error('BŁĄD: Nieprawidłowy okres pracy!');
    throw new Error('Okres pracy musi być większy od 0');
  }

  // Użyj parametrów z dashboard jeśli dostępne
  const effectiveInflation = personData.inflationRate || fus20Params.generalInflation || fus20Params.inflation || 2.5;
  const effectiveWageGrowth = personData.salaryGrowthRate || fus20Params.wageGrowth || 3.5;
  const effectiveContributionCollection = fus20Params.contributionCollection || 95.0;
  const effectiveScenario = fus20Params.fus20Variant || fus20Params.scenario || 'intermediate';
  
  console.log('Parametry efektywne:', { effectiveInflation, effectiveWageGrowth, effectiveContributionCollection, effectiveScenario });

  // 1. Waloryzacja wynagrodzeń z uwzględnieniem danych historycznych (L2.2)
  // Funkcja pomocnicza do uzyskania wynagrodzenia dla konkretnego roku
  const getSalaryForYear = (year: number): number => {
    // Sprawdź czy mamy dane historyczne dla tego konkretnego roku
    if (personData.historicalSalaries && personData.historicalSalaries.length > 0) {
      const historicalSalary = personData.historicalSalaries.find(item => item.year === year);
      if (historicalSalary && historicalSalary.amount > 0) {
        console.log(`Rok ${year}: używam danych historycznych - ${historicalSalary.amount} zł (roczne)`);
        return historicalSalary.amount; // Dane historyczne są już roczne
      }
    }
    
    // Jeśli brak danych historycznych dla tego roku, użyj obecnego wynagrodzenia z prognozą wzrostu
    const currentYear = new Date().getFullYear();
    const wageGrowthRate = fus20Params.wageGrowth / 100; // Domyślnie 3.5%
    
    // POPRAWKA: wynagrodzenie z formularza jest MIESIĘCZNE, więc trzeba je pomnożyć przez 12
    let projectedSalary = Math.max(personData.salary * 12, 0); // Konwersja z miesięcznego na roczne
    
    // Jeśli rok jest w przyszłości względem obecnego roku, zastosuj prognozę wzrostu
    if (year > currentYear) {
      const yearsInFuture = year - currentYear;
      projectedSalary = projectedSalary * Math.pow(1 + wageGrowthRate, yearsInFuture);
    }
    
    console.log(`Rok ${year}: używam prognozowanego wynagrodzenia - ${projectedSalary.toFixed(2)} zł (roczne, z miesięcznego ${personData.salary} zł)`);
    return projectedSalary;
  };

  console.log('=== ROZPOCZĘCIE KALKULACJI WYNAGRODZEŃ ROK PO ROK ===');

  // 2. Kalkulacja chorobowego z uwzględnieniem okresów z dashboard (L2.4a)
  // Najpierw obliczmy średnie wynagrodzenie dla celów chorobowego
  let totalSalaryForSickLeave = 0;
  for (let year = 0; year < workingYears; year++) {
    const currentYear = personData.workStartYear + year;
    totalSalaryForSickLeave += getSalaryForYear(currentYear);
  }
  const avgAnnualSalary = totalSalaryForSickLeave / workingYears;
  
  let sickLeaveReduction = 0;
  
  // Uwzględnij okresy choroby z dashboard
  if (personData.sicknessPeriods && personData.sicknessPeriods.length > 0) {
    let totalSickDays = 0;
    personData.sicknessPeriods.forEach(period => {
      if (period.type === 'past' || period.year <= currentYear) {
        totalSickDays += Math.max(period.days, 0);
      }
    });
    
    // Redukcja wynagrodzenia o dni choroby (zakładając 250 dni roboczych rocznie)
    sickLeaveReduction = Math.min(totalSickDays / (250 * Math.max(workingYears, 1)), 0.1); // max 10% redukcji
  } else {
    // Standardowa kalkulacja chorobowego
    const sickLeaveImpact = calculateSickLeaveImpact(
      personData.age,
      personData.gender,
      avgAnnualSalary
    );
    sickLeaveReduction = Math.min(sickLeaveImpact / 100, 0.1); // max 10% redukcji
  }
  
  console.log('Redukcja z tytułu chorobowego:', { avgAnnualSalary, sickLeaveReduction });

  // 3. Obliczenie kapitału początkowego (L2.5)
  let initialCapital = 0;
  
  if (personData.contributionPeriod && personData.contributionPeriod > 0) {
    // avgAnnualSalary jest już roczne, więc używamy go bezpośrednio
    const estimatedSalary1998 = Math.max(avgAnnualSalary * 0.3, 1000); // Minimum 1000 zł
    initialCapital = calculateInitialCapital(
      personData.gender,
      personData.contributionPeriod,
      estimatedSalary1998
    );
  }
  
  // Uwzględnij konto główne i subkonto z dashboard
  if (personData.mainAccount && personData.mainAccount > 0) {
    initialCapital += personData.mainAccount;
  }
  if (personData.subAccount && personData.subAccount > 0) {
    initialCapital += personData.subAccount;
  }
  
  initialCapital = Math.max(initialCapital, 0); // Zabezpieczenie przed ujemnymi wartościami
  console.log('Kapitał początkowy:', initialCapital);

  // 4. Składki emerytalne (19.52% podstawy wymiaru) - NOWA LOGIKA ROK PO ROK
  const contributionRate = 0.1952; // 19.52% - składka emerytalna w Polsce
  console.log('Stopa składkowa:', contributionRate * 100 + '%');
  
  console.log('=== SZCZEGÓŁOWA KALKULACJA SKŁADEK ROK PO ROK ===');

  // 5. Obliczenie całkowitych składek za cały okres pracy - POPRAWIONA LOGIKA Z HISTORYCZNYMI WYNAGRODZENIAMI
  let totalContributions = 0;
  
  // Oblicz składki rok po rok - używając konkretnych wynagrodzeń dla każdego roku
  for (let year = 0; year < workingYears; year++) {
    const currentYear = personData.workStartYear + year;
    
    // Pobierz wynagrodzenie dla konkretnego roku (historyczne lub prognozowane)
    const yearSalary = getSalaryForYear(currentYear);
    
    // Zastosuj redukcję chorobową
    const adjustedYearSalary = yearSalary * (1 - sickLeaveReduction);
    
    // Oblicz składkę dla tego roku
    let yearlyContribution = adjustedYearSalary * contributionRate;
    
    // WALORYZACJA TYLKO DLA LAT HISTORYCZNYCH (do 2024)
    if (currentYear <= 2024 && VALORIZATION_RATES.annual[currentYear as keyof typeof VALORIZATION_RATES.annual]) {
      // Dla lat historycznych - zastosuj rzeczywistą waloryzację
      const historicalRate = VALORIZATION_RATES.annual[currentYear as keyof typeof VALORIZATION_RATES.annual];
      yearlyContribution *= (1 + historicalRate / 100);
      console.log(`Rok ${currentYear}: wynagrodzenie ${yearSalary.toFixed(2)} zł → składka ${yearlyContribution.toFixed(2)} zł (waloryzacja ${historicalRate}%)`);
    } else if (currentYear > 2024) {
      // Dla lat przyszłych - BEZ WALORYZACJI, tylko nominalna składka
      console.log(`Rok ${currentYear}: wynagrodzenie ${yearSalary.toFixed(2)} zł → składka ${yearlyContribution.toFixed(2)} zł (przyszłość - bez waloryzacji)`);
    } else {
      // Dla lat przed 2010 - bez waloryzacji
      console.log(`Rok ${currentYear}: wynagrodzenie ${yearSalary.toFixed(2)} zł → składka ${yearlyContribution.toFixed(2)} zł (przed 2010 - bez waloryzacji)`);
    }
    
    totalContributions += yearlyContribution;
  }
  
  console.log(`Suma składek za ${workingYears} lat: ${totalContributions.toFixed(2)} zł`);
  
  // Dodaj kapitał początkowy i obecne oszczędności
  totalContributions += initialCapital + (personData.currentSavings || 0);
  
  console.log('Całkowite składki (po prawidłowej waloryzacji):', totalContributions);

  // 6. Waloryzacja składek z uwzględnieniem ściągalności
  const valorizedContributions = Math.max(totalContributions * (effectiveContributionCollection / 100), 0);
  
  console.log('Składki po uwzględnieniu ściągalności:', valorizedContributions);

  // 7. Dalsze trwanie życia w miesiącach - użyj rzeczywistego wieku na emeryturze
  const actualRetirementAge = personData.age + yearsToRetirement;
  const lifeExpectancyMonths = calculateLifeExpectancy(actualRetirementAge, personData.gender);
  
  console.log('Dalsze trwanie życia:', { actualRetirementAge, lifeExpectancyMonths });

  // Walidacja dalszego trwania życia
  if (lifeExpectancyMonths <= 0) {
    console.error('BŁĄD: Nieprawidłowe dalsze trwanie życia!');
    throw new Error('Dalsze trwanie życia musi być większe od 0');
  }

  // 8. Miesięczna emerytura
  const monthlyPension = Math.max(valorizedContributions / lifeExpectancyMonths, 0);
  
  console.log('Miesięczna emerytura:', monthlyPension);

  // 9. POPRAWIONA STOPA ZASTĄPIENIA - zgodnie z dokumentacją
  // Stopa zastąpienia = (prognozowane świadczenie / wynagrodzenie zindeksowane) * 100
  // Wynagrodzenie zindeksowane = obecne wynagrodzenie * wzrost płac przez lata do emerytury
  const currentSalary = Math.max(personData.salary, 0); // Miesięczne wynagrodzenie z formularza
  const indexedSalary = currentSalary * Math.pow(1 + effectiveWageGrowth / 100, yearsToRetirement);
  const replacementRate = indexedSalary > 0 ? (monthlyPension / indexedSalary) * 100 : 0;
  
  console.log('POPRAWIONA Stopa zastąpienia:', { 
    currentSalary, 
    indexedSalary, 
    monthlyPension,
    replacementRate 
  });

  // 10. Wpływ inflacji na realną wartość
  const inflationFactor = Math.pow(1 + effectiveInflation / 100, yearsToRetirement);
  const realPensionValue = monthlyPension / inflationFactor;
  
  // 11. Wartość nominalna (bez uwzględnienia inflacji)
  const nominalPensionValue = monthlyPension;
  
  console.log('Wartości emerytury:', { realPensionValue, nominalPensionValue, inflationFactor });

  const result = {
    monthlyPension: Math.round(monthlyPension * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    capitalAtRetirement: Math.round(valorizedContributions * 100) / 100,
    replacementRate: Math.round(replacementRate * 100) / 100,
    yearsToRetirement,
    projectedInflation: effectiveInflation,
    realPensionValue: Math.round(realPensionValue * 100) / 100,
    nominalPensionValue: Math.round(nominalPensionValue * 100) / 100,
    sickLeaveImpact: sickLeaveReduction * 100,
    initialCapital: Math.round(initialCapital * 100) / 100,
    valorizedContributions: Math.round(valorizedContributions * 100) / 100,
    lifeExpectancy: Math.round((lifeExpectancyMonths / 12) * 100) / 100,
  };

  console.log('=== WYNIK KALKULACJI ===', result);
  
  return result;
}

/**
 * Analiza opóźnienia emerytury
 * W3.4: Prognoza wzrostu świadczenia przy odłożeniu o X lat
 */
export function calculateRetirementDelay(
  personData: PersonData,
  delayYears: number,
  fus20Params?: FUS20Parameters
): { 
  originalPension: number;
  delayedPension: number;
  increasePercentage: number;
  additionalContributions: number;
} {
  // Kalkulacja dla oryginalnego wieku emerytalnego
  const originalResult = calculatePension(personData, fus20Params);
  
  // Kalkulacja z opóźnieniem
  const delayedPersonData = {
    ...personData,
    retirementYear: personData.retirementYear + delayYears
  };
  const delayedResult = calculatePension(delayedPersonData, fus20Params);
  
  const increasePercentage = ((delayedResult.monthlyPension - originalResult.monthlyPension) / 
                             originalResult.monthlyPension) * 100;
  
  const additionalContributions = delayedResult.totalContributions - originalResult.totalContributions;
  
  return {
    originalPension: originalResult.monthlyPension,
    delayedPension: delayedResult.monthlyPension,
    increasePercentage,
    additionalContributions
  };
}

/**
 * Kalkulacja emerytury z i bez uwzględnienia chorobowego
 * IV.4: Analiza okresów chorobowych
 */
export function calculateSickLeaveComparison(
  personData: PersonData,
  fus20Params?: FUS20Parameters
): {
  pensionWithSickLeave: number;
  pensionWithoutSickLeave: number;
  difference: number;
  differencePercentage: number;
} {
  // Kalkulacja z uwzględnieniem chorobowego
  const resultWithSickLeave = calculatePension(personData, fus20Params);
  
  // Kalkulacja bez uwzględnienia chorobowego (pełne wynagrodzenie)
  const personDataWithoutSickLeave = {
    ...personData,
    salary: personData.salary // Bez redukcji z tytułu chorobowego
  };
  
  // Tymczasowo wyłączamy wpływ chorobowego
  const originalSickLeaveStats = SICK_LEAVE_STATISTICS;
  // @ts-ignore
  SICK_LEAVE_STATISTICS.male = Object.fromEntries(
    Object.keys(originalSickLeaveStats.male).map(key => [key, 0])
  );
  // @ts-ignore
  SICK_LEAVE_STATISTICS.female = Object.fromEntries(
    Object.keys(originalSickLeaveStats.female).map(key => [key, 0])
  );
  
  const resultWithoutSickLeave = calculatePension(personDataWithoutSickLeave, fus20Params);
  
  // Przywracamy oryginalne dane
  Object.assign(SICK_LEAVE_STATISTICS, originalSickLeaveStats);
  
  const difference = resultWithoutSickLeave.monthlyPension - resultWithSickLeave.monthlyPension;
  const differencePercentage = (difference / resultWithSickLeave.monthlyPension) * 100;
  
  return {
    pensionWithSickLeave: resultWithSickLeave.monthlyPension,
    pensionWithoutSickLeave: resultWithoutSickLeave.monthlyPension,
    difference,
    differencePercentage
  };
}

/**
 * Analiza osiągnięcia oczekiwań emerytalnych
 * IV.6: Osiągnięcie oczekiwań
 */
export function calculateExpectationGap(
  personData: PersonData,
  expectedPension: number,
  fus20Params?: FUS20Parameters
): {
  predictedPension: number;
  expectedPension: number;
  gap: number;
  additionalYearsNeeded: number;
  isExpectationMet: boolean;
} {
  const result = calculatePension(personData, fus20Params);
  const gap = expectedPension - result.monthlyPension;
  
  let additionalYearsNeeded = 0;
  
  if (gap > 0) {
    // Szacowanie dodatkowych lat pracy potrzebnych do osiągnięcia oczekiwań
    const annualContribution = personData.salary * 12 * 0.1952;
    const lifeExpectancyMonths = calculateLifeExpectancy(
      personData.age + (personData.retirementYear - new Date().getFullYear()),
      personData.gender
    );
    
    const additionalCapitalNeeded = gap * lifeExpectancyMonths;
    additionalYearsNeeded = Math.ceil(additionalCapitalNeeded / annualContribution);
  }
  
  return {
    predictedPension: result.monthlyPension,
    expectedPension,
    gap,
    additionalYearsNeeded,
    isExpectationMet: gap <= 0
  };
}

/**
 * Prognoza zgromadzonych środków na koncie ZUS w czasie
 * V.5: Podgląd zgromadzonych środków
 */
export function calculateAccountBalanceProjection(
  personData: PersonData,
  fus20Params?: FUS20Parameters
): Array<{
  year: number;
  age: number;
  accountBalance: number;
  subaccountBalance: number;
  totalBalance: number;
  annualContribution: number;
}> {
  const currentYear = new Date().getFullYear();
  const projection = [];
  
  let accountBalance = personData.currentSavings || 0;
  let subaccountBalance = 0;
  
  for (let year = currentYear; year <= personData.retirementYear; year++) {
    const age = personData.age + (year - currentYear);
    const adjustedSalary = calculateSickLeaveImpact(age, personData.gender, personData.salary * 12);
    const annualContribution = adjustedSalary * 0.1952;
    
    // 12.22% trafia na konto, 7.3% na subkonto
    const accountContribution = annualContribution * (12.22 / 19.52);
    const subaccountContribution = annualContribution * (7.3 / 19.52);
    
    // Waloryzacja środków
    const valorization = fus20Params?.wageGrowth || 3.5;
    accountBalance = accountBalance * (1 + valorization / 100) + accountContribution;
    subaccountBalance = subaccountBalance * (1 + valorization / 100) + subaccountContribution;
    
    projection.push({
      year,
      age,
      accountBalance,
      subaccountBalance,
      totalBalance: accountBalance + subaccountBalance,
      annualContribution
    });
  }
  
  return projection;
}

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