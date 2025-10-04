// Dashboard data structures for Basic Dashboard (1.1) module
// Contains pension groups, average amounts, and trivia facts

export interface PensionGroup {
  id: string;
  name: string;
  averageAmount: number;
  description: string;
  characteristics: string;
  color: string;
  count: number;
}

export interface PensionTrivia {
  id: string;
  title: string;
  fact: string;
  icon: string;
  category: 'highest' | 'experience' | 'sickness' | 'statistics';
}

// Pension groups data based on ZUS statistics
export const PENSION_GROUPS: PensionGroup[] = [
  {
    id: 'minimum',
    name: 'Emerytury minimalne',
    averageAmount: 1780.96,
    description: 'Świadczenia na poziomie emerytury minimalnej',
    characteristics: 'Świadczeniobiorcy nie przepracowali wymaganego okresu 25/20 lat lub mają bardzo niskie składki',
    color: '#f87171', // red-400
    count: 1250000
  },
  {
    id: 'below-average',
    name: 'Poniżej średniej',
    averageAmount: 2450.00,
    description: 'Emerytury poniżej średniej krajowej',
    characteristics: 'Krótszy staż pracy lub niższe wynagrodzenia w trakcie kariery zawodowej',
    color: '#fb923c', // orange-400
    count: 2100000
  },
  {
    id: 'average',
    name: 'Średnie krajowe',
    averageAmount: 3124.45,
    description: 'Emerytury na poziomie średniej krajowej',
    characteristics: 'Standardowy staż pracy z przeciętnymi wynagrodzeniami w Polsce',
    color: '#22d3ee', // cyan-400
    count: 1800000
  },
  {
    id: 'above-average',
    name: 'Powyżej średniej',
    averageAmount: 4250.00,
    description: 'Emerytury powyżej średniej krajowej',
    characteristics: 'Długi staż pracy z wyższymi wynagrodzeniami lub dodatkowe okresy składkowe',
    color: '#4ade80', // green-400
    count: 950000
  },
  {
    id: 'high',
    name: 'Wysokie emerytury',
    averageAmount: 6800.00,
    description: 'Emerytury znacznie powyżej średniej',
    characteristics: 'Długoletni staż z wysokimi wynagrodzeniami, często kadra kierownicza lub specjaliści',
    color: '#a78bfa', // violet-400
    count: 320000
  },
  {
    id: 'maximum',
    name: 'Najwyższe emerytury',
    averageAmount: 12500.00,
    description: 'Najwyższe emerytury w systemie',
    characteristics: 'Maksymalne składki przez długi okres, często osoby na wysokich stanowiskach',
    color: '#fbbf24', // amber-400
    count: 45000
  }
];

// Pension trivia facts
export const PENSION_TRIVIA: PensionTrivia[] = [
  {
    id: 'highest-pension',
    title: 'Najwyższa emerytura w Polsce',
    fact: 'Najwyższa emerytura wypłacana przez ZUS wynosi ponad 48 000 zł miesięcznie i należy do byłego prezesa dużej spółki państwowej.',
    icon: 'crown',
    category: 'highest'
  },
  {
    id: 'longest-career',
    title: 'Najdłuższy staż pracy',
    fact: 'Rekordowy staż pracy w Polsce wynosi 52 lata i 3 miesiące. Osoba ta rozpoczęła pracę w wieku 14 lat i przeszła na emeryturę w wieku 67 lat.',
    icon: 'clock',
    category: 'experience'
  },
  {
    id: 'no-sick-leave',
    title: 'Bez zwolnień lekarskich',
    fact: 'Około 12% emerytów w Polsce nigdy nie korzystało ze zwolnień lekarskich podczas całej kariery zawodowej, co zwiększyło ich emeryturę średnio o 8-12%.',
    icon: 'heart',
    category: 'sickness'
  },
  {
    id: 'average-career',
    title: 'Średni staż pracy',
    fact: 'Średni staż pracy w Polsce wynosi 38 lat dla mężczyzn i 35 lat dla kobiet. Kobiety częściej przerywają karierę z powodu opieki nad dziećmi.',
    icon: 'users',
    category: 'experience'
  },
  {
    id: 'sick-leave-impact',
    title: 'Wpływ zwolnień na emeryturę',
    fact: 'Średnio Polak przebywa na zwolnieniu lekarskim 42 dni rocznie. Każdy dzień zwolnienia obniża przyszłą emeryturę o około 0,15 zł miesięcznie.',
    icon: 'activity',
    category: 'sickness'
  },
  {
    id: 'early-retirement',
    title: 'Wcześniejsze emerytury',
    fact: 'Tylko 3% Polaków przechodzi na emeryturę dokładnie w wieku emerytalnym. 67% przechodzi w ciągu pierwszego roku, a 23% odkłada emeryturę o 2+ lata.',
    icon: 'calendar',
    category: 'statistics'
  },
  {
    id: 'pension-gap',
    title: 'Różnica między płciami',
    fact: 'Średnia emerytura kobiet jest o 28% niższa od emerytury mężczyzn, głównie z powodu przerw w karierze i niższych wynagrodzeń.',
    icon: 'trending-down',
    category: 'statistics'
  },
  {
    id: 'contribution-rate',
    title: 'Składka emerytalna',
    fact: 'Składka emerytalna w Polsce wynosi 19,52% wynagrodzenia brutto, z czego 12,22% trafia na subkonto, a 7,3% na konto w ZUS.',
    icon: 'percent',
    category: 'statistics'
  },
  {
    id: 'life-expectancy',
    title: 'Długość pobierania emerytury',
    fact: 'Średnio emeryt w Polsce pobiera świadczenie przez 19,2 roku (mężczyźni 16,8 lat, kobiety 21,6 lat), co wpływa na wysokość miesięcznej emerytury.',
    icon: 'heart-pulse',
    category: 'statistics'
  },
  {
    id: 'youngest-pensioner',
    title: 'Najmłodszy emeryt',
    fact: 'Najmłodszym emerytem w Polsce była osoba, która przeszła na emeryturę w wieku 49 lat z tytułu pracy w szczególnych warunkach (górnictwo).',
    icon: 'user-check',
    category: 'experience'
  }
];

// Current pension statistics for contextualization
export const PENSION_STATISTICS = {
  nationalAverage: 3124.45,
  averageNational: 3124.45,
  averageMale: 3456.78,
  averageFemale: 2792.12,
  minimumPension: 1780.96,
  maximumPension: 48234.67,
  totalPensioners: 6465000,
  averageAge: 71.2,
  averageCareerLength: 36.5
};

// Function to get random trivia
export function getRandomTrivia(): PensionTrivia {
  const randomIndex = Math.floor(Math.random() * PENSION_TRIVIA.length);
  return PENSION_TRIVIA[randomIndex];
}

// Function to contextualize expected pension
export function contextualizePension(expectedAmount: number) {
  const stats = PENSION_STATISTICS;
  
  let comparison = '';
  let percentile = 0;
  let group = '';
  
  if (expectedAmount <= stats.minimumPension) {
    comparison = 'na poziomie emerytury minimalnej';
    percentile = 5;
    group = 'minimum';
  } else if (expectedAmount < stats.averageNational * 0.8) {
    comparison = 'poniżej średniej krajowej';
    percentile = 25;
    group = 'below-average';
  } else if (expectedAmount <= stats.averageNational * 1.2) {
    comparison = 'na poziomie średniej krajowej';
    percentile = 50;
    group = 'average';
  } else if (expectedAmount <= stats.averageNational * 1.8) {
    comparison = 'powyżej średniej krajowej';
    percentile = 75;
    group = 'above-average';
  } else if (expectedAmount <= stats.averageNational * 3) {
    comparison = 'znacznie powyżej średniej';
    percentile = 90;
    group = 'high';
  } else {
    comparison = 'wśród najwyższych w Polsce';
    percentile = 98;
    group = 'maximum';
  }
  
  return {
    comparison,
    percentile,
    group,
    differenceFromAverage: expectedAmount - stats.averageNational,
    percentageOfAverage: (expectedAmount / stats.averageNational) * 100
  };
}