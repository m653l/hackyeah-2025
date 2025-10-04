// Dane referencyjne dla różnych grup kodów tytułu ubezpieczenia
// Źródło: ZUS - Przeciętne wysokości emerytur przyznanych w 2024 roku

export interface ProfessionalGroup {
  id: string;
  name: string;
  description: string;
  averagePension: number; // w PLN
  averageContributionBase: number; // w PLN
  codeRange: string;
}

export const professionalGroups: ProfessionalGroup[] = [
  {
    id: 'employees',
    name: 'Pracownicy',
    description: 'Osoby zatrudnione na podstawie umowy o pracę',
    averagePension: 3247.50,
    averageContributionBase: 6890.00,
    codeRange: '01-09'
  },
  {
    id: 'contractors',
    name: 'Zleceniobiorcy',
    description: 'Osoby wykonujące umowy zlecenia i o dzieło',
    averagePension: 2156.80,
    averageContributionBase: 4520.00,
    codeRange: '10-19'
  },
  {
    id: 'business_owners',
    name: 'Prowadzący działalność gospodarczą',
    description: 'Osoby prowadzące jednoosobową działalność gospodarczą',
    averagePension: 2834.20,
    averageContributionBase: 5670.00,
    codeRange: '20-29'
  },
  {
    id: 'farmers',
    name: 'Rolnicy',
    description: 'Osoby prowadzące gospodarstwo rolne',
    averagePension: 1876.40,
    averageContributionBase: 3240.00,
    codeRange: '30-39'
  },
  {
    id: 'freelancers',
    name: 'Wolne zawody',
    description: 'Osoby wykonujące wolne zawody (lekarze, prawnicy, itp.)',
    averagePension: 4123.60,
    averageContributionBase: 8950.00,
    codeRange: '40-49'
  },
  {
    id: 'public_servants',
    name: 'Służba publiczna',
    description: 'Funkcjonariusze służb mundurowych i urzędnicy',
    averagePension: 3856.70,
    averageContributionBase: 7820.00,
    codeRange: '50-59'
  }
];

export const getProfessionalGroupById = (id: string): ProfessionalGroup | undefined => {
  return professionalGroups.find(group => group.id === id);
};

export const getProfessionalGroupByName = (name: string): ProfessionalGroup | undefined => {
  return professionalGroups.find(group => group.name === name);
};

// Funkcja do porównania emerytury użytkownika z przeciętną dla grupy zawodowej
export const comparePensionWithGroup = (
  userPension: number, 
  group: ProfessionalGroup
): { 
  difference: number;
  percentageDifference: number;
  isHigher: boolean;
} => {
  const difference = userPension - group.averagePension;
  const percentageDifference = (difference / group.averagePension) * 100;
  const isHigher = difference > 0;

  return {
    difference,
    percentageDifference,
    isHigher
  };
};