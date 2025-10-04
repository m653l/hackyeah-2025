// Dane powiatowe - średnie emerytury i statystyki regionalne
export interface DistrictData {
  postalCode: string;
  districtName: string;
  voivodeship: string;
  averagePension: number;
  averageSalary: number;
  unemploymentRate: number;
  retirementAge: {
    male: number;
    female: number;
  };
  populationData: {
    total: number;
    workingAge: number;
    retirees: number;
  };
}

export const districtDatabase: DistrictData[] = [
  // Warszawa i okolice
  {
    postalCode: "00-001",
    districtName: "Warszawa Śródmieście",
    voivodeship: "mazowieckie",
    averagePension: 3250,
    averageSalary: 8500,
    unemploymentRate: 3.2,
    retirementAge: { male: 65.8, female: 61.2 },
    populationData: { total: 120000, workingAge: 75000, retirees: 18000 }
  },
  {
    postalCode: "02-001",
    districtName: "Warszawa Praga-Południe",
    voivodeship: "mazowieckie",
    averagePension: 2890,
    averageSalary: 7200,
    unemploymentRate: 4.1,
    retirementAge: { male: 65.3, female: 60.9 },
    populationData: { total: 180000, workingAge: 115000, retirees: 25000 }
  },
  
  // Kraków i okolice
  {
    postalCode: "30-001",
    districtName: "Kraków Stare Miasto",
    voivodeship: "małopolskie",
    averagePension: 2950,
    averageSalary: 7800,
    unemploymentRate: 3.8,
    retirementAge: { male: 65.5, female: 61.0 },
    populationData: { total: 95000, workingAge: 62000, retirees: 14000 }
  },
  {
    postalCode: "31-001",
    districtName: "Kraków Nowa Huta",
    voivodeship: "małopolskie",
    averagePension: 2650,
    averageSalary: 6800,
    unemploymentRate: 4.5,
    retirementAge: { male: 65.1, female: 60.7 },
    populationData: { total: 210000, workingAge: 135000, retirees: 32000 }
  },

  // Gdańsk i Trójmiasto
  {
    postalCode: "80-001",
    districtName: "Gdańsk Śródmieście",
    voivodeship: "pomorskie",
    averagePension: 2780,
    averageSalary: 7400,
    unemploymentRate: 4.2,
    retirementAge: { male: 65.4, female: 60.8 },
    populationData: { total: 85000, workingAge: 55000, retirees: 12000 }
  },
  {
    postalCode: "81-001",
    districtName: "Gdynia Śródmieście",
    voivodeship: "pomorskie",
    averagePension: 2820,
    averageSalary: 7600,
    unemploymentRate: 3.9,
    retirementAge: { male: 65.6, female: 61.1 },
    populationData: { total: 75000, workingAge: 48000, retirees: 10000 }
  },

  // Wrocław i okolice
  {
    postalCode: "50-001",
    districtName: "Wrocław Stare Miasto",
    voivodeship: "dolnośląskie",
    averagePension: 2920,
    averageSalary: 7900,
    unemploymentRate: 3.6,
    retirementAge: { male: 65.7, female: 61.2 },
    populationData: { total: 110000, workingAge: 72000, retirees: 16000 }
  },
  {
    postalCode: "51-001",
    districtName: "Wrocław Krzyki",
    voivodeship: "dolnośląskie",
    averagePension: 2750,
    averageSalary: 7300,
    unemploymentRate: 4.0,
    retirementAge: { male: 65.2, female: 60.8 },
    populationData: { total: 140000, workingAge: 90000, retirees: 20000 }
  },

  // Poznań i okolice
  {
    postalCode: "60-001",
    districtName: "Poznań Stare Miasto",
    voivodeship: "wielkopolskie",
    averagePension: 2880,
    averageSalary: 7700,
    unemploymentRate: 3.7,
    retirementAge: { male: 65.5, female: 61.0 },
    populationData: { total: 90000, workingAge: 58000, retirees: 13000 }
  },
  {
    postalCode: "61-001",
    districtName: "Poznań Nowe Miasto",
    voivodeship: "wielkopolskie",
    averagePension: 2720,
    averageSalary: 7100,
    unemploymentRate: 4.3,
    retirementAge: { male: 65.0, female: 60.6 },
    populationData: { total: 125000, workingAge: 80000, retirees: 18000 }
  },

  // Łódź i okolice
  {
    postalCode: "90-001",
    districtName: "Łódź Śródmieście",
    voivodeship: "łódzkie",
    averagePension: 2580,
    averageSalary: 6500,
    unemploymentRate: 5.1,
    retirementAge: { male: 64.8, female: 60.4 },
    populationData: { total: 95000, workingAge: 58000, retirees: 16000 }
  },
  {
    postalCode: "91-001",
    districtName: "Łódź Bałuty",
    voivodeship: "łódzkie",
    averagePension: 2420,
    averageSalary: 6200,
    unemploymentRate: 5.8,
    retirementAge: { male: 64.5, female: 60.1 },
    populationData: { total: 180000, workingAge: 105000, retirees: 28000 }
  },

  // Katowice i Śląsk
  {
    postalCode: "40-001",
    districtName: "Katowice Śródmieście",
    voivodeship: "śląskie",
    averagePension: 2680,
    averageSalary: 6900,
    unemploymentRate: 4.7,
    retirementAge: { male: 64.9, female: 60.5 },
    populationData: { total: 85000, workingAge: 52000, retirees: 14000 }
  },
  {
    postalCode: "41-001",
    districtName: "Chorzów",
    voivodeship: "śląskie",
    averagePension: 2520,
    averageSalary: 6400,
    unemploymentRate: 5.2,
    retirementAge: { male: 64.6, female: 60.2 },
    populationData: { total: 110000, workingAge: 65000, retirees: 20000 }
  },

  // Lublin i okolice
  {
    postalCode: "20-001",
    districtName: "Lublin Śródmieście",
    voivodeship: "lubelskie",
    averagePension: 2380,
    averageSalary: 5900,
    unemploymentRate: 6.2,
    retirementAge: { male: 64.3, female: 59.9 },
    populationData: { total: 70000, workingAge: 42000, retirees: 12000 }
  },

  // Białystok i okolice
  {
    postalCode: "15-001",
    districtName: "Białystok Centrum",
    voivodeship: "podlaskie",
    averagePension: 2320,
    averageSalary: 5700,
    unemploymentRate: 6.8,
    retirementAge: { male: 64.1, female: 59.7 },
    populationData: { total: 65000, workingAge: 38000, retirees: 11000 }
  },

  // Szczecin i okolice
  {
    postalCode: "70-001",
    districtName: "Szczecin Śródmieście",
    voivodeship: "zachodniopomorskie",
    averagePension: 2480,
    averageSalary: 6300,
    unemploymentRate: 5.5,
    retirementAge: { male: 64.7, female: 60.3 },
    populationData: { total: 80000, workingAge: 48000, retirees: 13000 }
  },

  // Rzeszów i okolice
  {
    postalCode: "35-001",
    districtName: "Rzeszów Centrum",
    voivodeship: "podkarpackie",
    averagePension: 2280,
    averageSalary: 5600,
    unemploymentRate: 7.1,
    retirementAge: { male: 64.0, female: 59.6 },
    populationData: { total: 60000, workingAge: 36000, retirees: 10000 }
  }
];

// Funkcja do wyszukiwania danych na podstawie kodu pocztowego
export const findDistrictByPostalCode = (postalCode: string): DistrictData | null => {
  // Normalizacja kodu pocztowego (usunięcie spacji i myślników)
  const normalizedCode = postalCode.replace(/[\s-]/g, '');
  
  // Szukanie dokładnego dopasowania
  let district = districtDatabase.find(d => 
    d.postalCode.replace(/[\s-]/g, '') === normalizedCode
  );
  
  // Jeśli nie znaleziono dokładnego dopasowania, szukaj po pierwszych 2 cyfrach
  if (!district && normalizedCode.length >= 2) {
    const prefix = normalizedCode.substring(0, 2);
    district = districtDatabase.find(d => 
      d.postalCode.substring(0, 2) === prefix
    );
  }
  
  return district || null;
};

// Funkcja do obliczania średniej krajowej
export const getNationalAverage = () => {
  const totalPension = districtDatabase.reduce((sum, district) => 
    sum + (district.averagePension * district.populationData.retirees), 0
  );
  const totalRetirees = districtDatabase.reduce((sum, district) => 
    sum + district.populationData.retirees, 0
  );
  
  return {
    averagePension: Math.round(totalPension / totalRetirees),
    averageSalary: 6800, // Średnia krajowa
    unemploymentRate: 5.2,
    retirementAge: { male: 65.0, female: 60.8 }
  };
};