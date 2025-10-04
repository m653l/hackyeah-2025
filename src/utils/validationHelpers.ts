/**
 * Pomocnicze funkcje walidacji dla formularzy
 * Zgodne z wymaganiami WCAG 2.0 i specyfikacją ZUS
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Walidacja wieku użytkownika
 */
export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (age < 18) {
    errors.push('Wiek musi być większy niż 18 lat');
  }
  if (age > 100) {
    errors.push('Wiek nie może być większy niż 100 lat');
  }
  if (age > 67) {
    warnings.push('Jesteś już w wieku emerytalnym. Wyniki mogą być nieprecyzyjne.');
  }
  if (age < 25) {
    warnings.push('Młody wiek może wpłynąć na dokładność długoterminowych prognoz.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Walidacja wynagrodzenia
 */
export function validateSalary(salary: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const minWage = 4242; // Minimalne wynagrodzenie 2024
  const maxContributionBase = 177660; // Maksymalna podstawa składek 2024

  if (salary < minWage) {
    errors.push(`Wynagrodzenie nie może być niższe niż minimalne (${minWage} zł)`);
  }
  if (salary > maxContributionBase) {
    warnings.push(`Wynagrodzenie przekracza maksymalną podstawę składek (${maxContributionBase} zł). Składki będą naliczane tylko od maksymalnej podstawy.`);
  }
  if (salary > 50000) {
    warnings.push('Wysokie wynagrodzenie może wpłynąć na dokładność prognoz długoterminowych.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Walidacja roku rozpoczęcia pracy
 */
export function validateWorkStartYear(workStartYear: number, age: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const minWorkAge = 16;

  if (workStartYear < birthYear + minWorkAge) {
    errors.push(`Rok rozpoczęcia pracy nie może być wcześniejszy niż ${birthYear + minWorkAge} (wiek 16 lat)`);
  }
  if (workStartYear > currentYear) {
    errors.push('Rok rozpoczęcia pracy nie może być w przyszłości');
  }
  if (workStartYear < 1999) {
    warnings.push('Praca rozpoczęta przed 1999 rokiem może wymagać uwzględnienia kapitału początkowego.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Walidacja planowanego roku emerytury
 */
export function validateRetirementYear(retirementYear: number, age: number, gender: 'male' | 'female'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const currentYear = new Date().getFullYear();
  const minRetirementAge = gender === 'female' ? 60 : 65;
  const retirementAge = retirementYear - (currentYear - age);

  if (retirementYear <= currentYear) {
    errors.push('Rok emerytury musi być w przyszłości');
  }
  if (retirementAge < minRetirementAge) {
    errors.push(`Minimalny wiek emerytalny to ${minRetirementAge} lat dla ${gender === 'female' ? 'kobiet' : 'mężczyzn'}`);
  }
  if (retirementAge > 75) {
    warnings.push('Bardzo późna emerytura może wpłynąć na dokładność prognoz.');
  }
  if (retirementYear > 2080) {
    warnings.push('Prognozy FUS20 obejmują okres do 2080 roku. Wyniki mogą być mniej precyzyjne.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Walidacja stażu składkowego na 31.12.1998
 */
export function validateContributionPeriod(contributionPeriod: number, workStartYear: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (contributionPeriod < 0) {
    errors.push('Staż składkowy nie może być ujemny');
  }
  if (contributionPeriod > 50) {
    errors.push('Staż składkowy nie może przekraczać 50 lat');
  }
  if (workStartYear >= 1999 && contributionPeriod > 0) {
    warnings.push('Praca rozpoczęta po 1998 roku - staż składkowy powinien być równy 0');
  }
  if (workStartYear < 1999 && contributionPeriod === 0) {
    warnings.push('Praca rozpoczęta przed 1999 rokiem - rozważ wprowadzenie stażu składkowego');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Walidacja zgromadzonych środków na koncie ZUS
 */
export function validateCurrentSavings(currentSavings: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (currentSavings < 0) {
    errors.push('Zgromadzone środki nie mogą być ujemne');
  }
  if (currentSavings > 5000000) {
    warnings.push('Bardzo wysokie zgromadzone środki mogą wpłynąć na dokładność prognoz');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Kompleksowa walidacja formularza
 */
export function validateFormData(data: {
  age: number;
  gender: 'male' | 'female';
  salary: number;
  workStartYear: number;
  retirementYear: number;
  currentSavings?: number;
  contributionPeriod?: number;
}): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Walidacja poszczególnych pól
  const ageValidation = validateAge(data.age);
  const salaryValidation = validateSalary(data.salary);
  const workStartValidation = validateWorkStartYear(data.workStartYear, data.age);
  const retirementValidation = validateRetirementYear(data.retirementYear, data.age, data.gender);
  
  allErrors.push(...ageValidation.errors);
  allErrors.push(...salaryValidation.errors);
  allErrors.push(...workStartValidation.errors);
  allErrors.push(...retirementValidation.errors);
  
  allWarnings.push(...ageValidation.warnings);
  allWarnings.push(...salaryValidation.warnings);
  allWarnings.push(...workStartValidation.warnings);
  allWarnings.push(...retirementValidation.warnings);

  if (data.currentSavings !== undefined) {
    const savingsValidation = validateCurrentSavings(data.currentSavings);
    allErrors.push(...savingsValidation.errors);
    allWarnings.push(...savingsValidation.warnings);
  }

  if (data.contributionPeriod !== undefined) {
    const contributionValidation = validateContributionPeriod(data.contributionPeriod, data.workStartYear);
    allErrors.push(...contributionValidation.errors);
    allWarnings.push(...contributionValidation.warnings);
  }

  // Walidacja logiczna między polami
  const workingYears = data.retirementYear - data.workStartYear;
  if (workingYears < 1) {
    allErrors.push('Okres pracy musi być dłuższy niż 1 rok');
  }
  if (workingYears < 15) {
    allWarnings.push('Krótki okres pracy może wpłynąć na wysokość emerytury');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Formatowanie komunikatów błędów dla użytkownika
 */
export function formatValidationMessage(validation: ValidationResult): string {
  let message = '';
  
  if (validation.errors.length > 0) {
    message += 'Błędy:\n' + validation.errors.map(error => `• ${error}`).join('\n');
  }
  
  if (validation.warnings.length > 0) {
    if (message) message += '\n\n';
    message += 'Ostrzeżenia:\n' + validation.warnings.map(warning => `• ${warning}`).join('\n');
  }
  
  return message;
}

/**
 * Sprawdzenie czy dane są wystarczające do kalkulacji
 */
export function isDataSufficientForCalculation(data: {
  age: number;
  gender: 'male' | 'female';
  salary: number;
  workStartYear: number;
  retirementYear: number;
  currentSavings?: number;
  contributionPeriod?: number;
}): boolean {
  const validation = validateFormData(data);
  return validation.isValid;
}