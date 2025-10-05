// Investment calculation utilities for Alternative Savings page

export interface InvestmentMethod {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: {
    min: number;
    max: number;
    average: number;
  };
  icon: string;
  color: string;
}

export interface SavingsCalculatorInput {
  monthlyAmount: number;
  yearsToRetirement: number;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  currentAge: number;
  zusPension: number;
}

export interface SavingsResult {
  method: InvestmentMethod;
  totalSavings: number;
  monthlyPensionIncrease: number;
  totalPension: number;
  realValue: number;
}

export interface AgeRecommendation {
  ageGroup: string;
  stocksPercentage: number;
  bondsPercentage: number;
  description: string;
}

export interface RiskProfile {
  name: string;
  description: string;
  methods: string[];
  color: string;
}

// Investment methods data
export const INVESTMENT_METHODS: InvestmentMethod[] = [
  {
    id: 'deposits',
    name: 'Lokaty terminowe',
    description: 'Bezpieczne lokaty bankowe',
    riskLevel: 'low',
    expectedReturn: { min: 1, max: 3, average: 2 },
    icon: 'PiggyBank',
    color: '#10B981'
  },
  {
    id: 'bonds',
    name: 'Obligacje skarbowe',
    description: 'Stabilne obligacje państwowe',
    riskLevel: 'low',
    expectedReturn: { min: 2, max: 4, average: 3 },
    icon: 'Shield',
    color: '#059669'
  },
  {
    id: 'funds',
    name: 'Fundusze inwestycyjne',
    description: 'Zdywersyfikowane portfele',
    riskLevel: 'medium',
    expectedReturn: { min: 4, max: 8, average: 6 },
    icon: 'BarChart3',
    color: '#0EA5E9'
  },
  {
    id: 'etf',
    name: 'ETF',
    description: 'Fundusze indeksowe',
    riskLevel: 'medium',
    expectedReturn: { min: 5, max: 9, average: 7 },
    icon: 'TrendingUp',
    color: '#3B82F6'
  },
  {
    id: 'stocks',
    name: 'Akcje',
    description: 'Inwestycje w spółki',
    riskLevel: 'high',
    expectedReturn: { min: 6, max: 12, average: 9 },
    icon: 'Activity',
    color: '#8B5CF6'
  },
  {
    id: 'realestate',
    name: 'Nieruchomości',
    description: 'Inwestycje w nieruchomości',
    riskLevel: 'high',
    expectedReturn: { min: 7, max: 10, average: 8 },
    icon: 'Home',
    color: '#F59E0B'
  }
];

// Age-based recommendations
export const AGE_RECOMMENDATIONS: AgeRecommendation[] = [
  {
    ageGroup: '20-35',
    stocksPercentage: 70,
    bondsPercentage: 30,
    description: 'Agresywna strategia z wysokim udziałem akcji'
  },
  {
    ageGroup: '35-50',
    stocksPercentage: 50,
    bondsPercentage: 50,
    description: 'Zrównoważona strategia z równym udziałem akcji i obligacji'
  },
  {
    ageGroup: '50-65',
    stocksPercentage: 30,
    bondsPercentage: 70,
    description: 'Konserwatywna strategia z przewagą obligacji'
  }
];

// Risk profiles configuration
export const RISK_PROFILES: Record<string, RiskProfile> = {
  conservative: {
    name: 'Bezpieczny',
    description: 'Niskie ryzyko, stabilne zwroty',
    methods: ['deposits', 'bonds'],
    color: '#10B981'
  },
  balanced: {
    name: 'Zrównoważony',
    description: 'Średnie ryzyko, umiarkowane zwroty',
    methods: ['funds', 'etf'],
    color: '#3B82F6'
  },
  aggressive: {
    name: 'Agresywny',
    description: 'Wysokie ryzyko, potencjalnie wysokie zwroty',
    methods: ['stocks', 'realestate'],
    color: '#8B5CF6'
  }
};

// Calculate compound interest
export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  
  // Future value of initial principal
  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, totalMonths);
  
  // Future value of monthly contributions (annuity)
  const futureValueContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  return futureValuePrincipal + futureValueContributions;
};

// Calculate savings results for different investment methods
export const calculateSavingsResults = (input: SavingsCalculatorInput): SavingsResult[] => {
  const { monthlyAmount, yearsToRetirement, riskProfile } = input;
  const relevantMethods = INVESTMENT_METHODS.filter(method => 
    RISK_PROFILES[riskProfile].methods.includes(method.id)
  );
  
  return relevantMethods.map(method => {
    const totalSavings = calculateCompoundInterest(
      0, // No initial principal
      monthlyAmount,
      method.expectedReturn.average,
      yearsToRetirement
    );
    
    const monthlyPensionIncrease = totalSavings / (20 * 12); // Assuming 20 years of retirement
    const totalPension = input.zusPension + monthlyPensionIncrease;
    
    // Calculate real value considering 2% inflation
    const realValue = totalSavings / Math.pow(1.02, yearsToRetirement);
    
    return {
      method,
      totalSavings,
      monthlyPensionIncrease,
      totalPension,
      realValue
    };
  });
};

// Get age-based recommendation for user
export const getAgeRecommendation = (age: number): AgeRecommendation => {
  if (age <= 35) return AGE_RECOMMENDATIONS[0];
  if (age <= 50) return AGE_RECOMMENDATIONS[1];
  return AGE_RECOMMENDATIONS[2];
};

// Calculate required monthly savings to reach target pension
export const calculateRequiredSavings = (
  currentZusPension: number,
  targetPension: number,
  yearsToRetirement: number,
  expectedReturn: number = 6 // Default 6% return
): number => {
  const requiredSavings = (targetPension - currentZusPension) * 20 * 12; // 20 years of retirement
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = yearsToRetirement * 12;
  
  // Calculate required monthly contribution using annuity formula
  const requiredMonthly = requiredSavings * monthlyRate / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  return Math.max(0, requiredMonthly);
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};