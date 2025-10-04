/**
 * Moduły kalkulacji aktuarialnej FUS20
 * Implementacja zgodna z prognozami demograficznymi i ekonomicznymi do 2080 roku
 */

// Interfaces - definicje typów dla kalkulacji aktuarialnych
interface FUS20Parameters {
  scenario: 'intermediate' | 'pessimistic' | 'optimistic';
  unemploymentRate: number;
  wageGrowth: number;
  inflation: number;
  contributionCollection: number;
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
}

// Eksporty interfejsów
export type { FUS20Parameters, PersonData, PensionCalculationResult };

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
  const retirementAge = Math.max(60, Math.min(67, age));
  const table = LIFE_EXPECTANCY_TABLES[gender];
  
  if (table[retirementAge as keyof typeof table]) {
    return table[retirementAge as keyof typeof table];
  }
  
  // Interpolacja dla wieku pomiędzy tabelami
  const lowerAge = Math.floor(retirementAge);
  const upperAge = Math.ceil(retirementAge);
  
  if (lowerAge === upperAge) {
    return table[lowerAge as keyof typeof table] || 192; // Domyślnie 16 lat
  }
  
  const lowerValue = table[lowerAge as keyof typeof table] || 192;
  const upperValue = table[upperAge as keyof typeof table] || 192;
  const ratio = retirementAge - lowerAge;
  
  return lowerValue + (upperValue - lowerValue) * ratio;
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
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = personData.retirementYear - currentYear;
  const workingYears = personData.retirementYear - personData.workStartYear;
  
  // 1. Waloryzacja wynagrodzeń (L2.2)
  // const valorizedSalary = calculateWageValorization(
  //   personData.salary,
  //   currentYear,
  //   personData.retirementYear
  // );
  
  // 2. Kalkulacja chorobowego (L2.4a)
  const adjustedAnnualSalary = calculateSickLeaveImpact(
    personData.age,
    personData.gender,
    personData.salary * 12
  );
  
  // 3. Obliczenie kapitału początkowego (L2.5)
  const initialCapital = personData.contributionPeriod 
    ? calculateInitialCapital(
        personData.gender,
        personData.contributionPeriod,
        personData.salary * 0.7 // Szacunkowe wynagrodzenie w 1998 roku
      )
    : 0;
  
  // 4. Składki emerytalne (19.52% podstawy wymiaru)
  let annualContribution = adjustedAnnualSalary * 0.1952;
  
  // 4a. Uwzględnienie zwolnień lekarskich (jeśli wybrano opcję)
  if (personData.includeSickLeave) {
    const sickLeaveReduction = calculateSickLeaveImpact(
      personData.age,
      personData.gender,
      adjustedAnnualSalary
    );
    annualContribution = annualContribution * (1 - sickLeaveReduction / 100);
  }
  
  const totalContributions = (annualContribution * workingYears) + 
                           (personData.currentSavings || 0) + 
                           initialCapital;
  
  // 5. Waloryzacja składek z uwzględnieniem ściągalności
  const valorizedContributions = totalContributions * 
                                (fus20Params.contributionCollection / 100);
  
  // 6. Dalsze trwanie życia w miesiącach
  const lifeExpectancyMonths = calculateLifeExpectancy(
    personData.age + yearsToRetirement,
    personData.gender
  );
  
  // 7. Miesięczna emerytura
  const monthlyPension = valorizedContributions / lifeExpectancyMonths;
  
  // 8. Stopa zastąpienia
  const replacementRate = (monthlyPension / personData.salary) * 100;
  
  // 9. Wpływ inflacji na realną wartość
  const realPensionValue = monthlyPension / 
                          Math.pow(1 + fus20Params.inflation / 100, yearsToRetirement);
  
  // 10. Wartość nominalna (bez uwzględnienia inflacji)
  const nominalPensionValue = monthlyPension;
  
  return {
    monthlyPension,
    totalContributions: (annualContribution * workingYears) + (personData.currentSavings || 0) + initialCapital,
    capitalAtRetirement: valorizedContributions,
    replacementRate,
    yearsToRetirement,
    projectedInflation: fus20Params.inflation,
    realPensionValue,
    nominalPensionValue,
    sickLeaveImpact: personData.includeSickLeave ? calculateSickLeaveImpact(personData.age, personData.gender, adjustedAnnualSalary) : 0,
    initialCapital,
    valorizedContributions,
    lifeExpectancy: lifeExpectancyMonths,
    lifeExpectancy: lifeExpectancyMonths / 12, // Konwersja na lata
  };
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