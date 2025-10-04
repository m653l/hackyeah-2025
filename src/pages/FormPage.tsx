import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, User, Calendar, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculatePension, type FUS20Parameters, type PersonData, type HistoricalSalary, type SicknessPeriod } from '../utils/actuarialCalculations';
import { ProfessionalContext } from '../components/ProfessionalContext';
import { AdvancedDashboard } from '../components/AdvancedDashboard';
// import logoUrl from '/logo.png?url';

const formSchema = z.object({
  age: z.number().min(18, 'Wiek musi być większy niż 18 lat').max(67, 'Wiek nie może przekraczać 67 lat'),
  gender: z.enum(['male', 'female'], 'Wybierz płeć'),
  salary: z.number().min(1000, 'Wynagrodzenie musi być większe niż 1000 zł').max(50000, 'Wynagrodzenie nie może przekraczać 50000 zł'),
  workStartYear: z.number().min(1980, 'Rok rozpoczęcia pracy nie może być wcześniejszy niż 1980').max(2025, 'Rok rozpoczęcia pracy nie może być późniejszy niż 2025'),
  retirementYear: z.number().min(2025, 'Planowany rok emerytury nie może być wcześniejszy niż 2025').max(2080, 'Planowany rok emerytury nie może być późniejszy niż 2080'),
  currentSavings: z.number().min(0, 'Zgromadzone środki nie mogą być ujemne').optional(),
  contributionPeriod: z.number().min(0, 'Staż składkowy nie może być ujemny').max(50, 'Staż składkowy nie może przekraczać 50 lat').optional(),
  includeSickLeave: z.boolean().optional(),
  professionalGroup: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProfessionalGroup, setSelectedProfessionalGroup] = useState<string | undefined>();
  
  // State do przechowywania parametrów z Dashboard Zaawansowany
  const [dashboardParameters, setDashboardParameters] = useState<{
    // Dane historyczne
    historicalSalaries?: HistoricalSalary[];
    // Prognozy przyszłe
    salaryGrowthRate?: number;
    contributionValorizationRate?: number;
    inflationRate?: number;
    forecastHorizon?: number;
    // Okresy choroby
    sicknessPeriods?: SicknessPeriod[];
    // Konto ZUS
    mainAccount?: number;
    subAccount?: number;
    showAccountGrowth?: boolean;
    includeValorization?: boolean;
    // Warianty FUS20
    fus20Variant?: 'intermediate' | 'pessimistic' | 'optimistic';
    // Parametry makroekonomiczne
    unemploymentRate?: number;
    realWageGrowth?: number;
    generalInflation?: number;
    pensionerInflation?: number;
    realGDPGrowth?: number;
    contributionCollection?: number;
  }>({
    // Wartości domyślne
    salaryGrowthRate: 3.5,
    contributionValorizationRate: 4.2,
    inflationRate: 2.5,
    forecastHorizon: 10,
    mainAccount: 0,
    subAccount: 0,
    showAccountGrowth: false,
    includeValorization: true,
    fus20Variant: 'intermediate',
    unemploymentRate: 5.2,
    realWageGrowth: 3.5,
    generalInflation: 2.5,
    pensionerInflation: 2.5,
    realGDPGrowth: 2.8,
    contributionCollection: 95.0,
    historicalSalaries: [],
    sicknessPeriods: []
  });

  // Funkcja do odczytywania danych z localStorage
  const getSavedFormData = (): Partial<FormData> => {
    try {
      const savedData = localStorage.getItem('pensionFormData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Błąd podczas odczytywania danych z localStorage:', error);
    }
    return {};
  };

  // Funkcja do odczytywania parametrów dashboard z localStorage
  const getSavedDashboardData = () => {
    try {
      console.log('=== FORMPAGE: GET SAVED DASHBOARD DATA ===');
      const savedData = localStorage.getItem('advancedDashboard');
      console.log('RAW localStorage data:', savedData);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('Załadowane parametry dashboard z localStorage:', parsed);
        console.log('Typ danych:', typeof parsed);
        console.log('Klucze obiektu:', Object.keys(parsed));
        console.log('fus20Variant w danych:', parsed.fus20Variant);
        return parsed;
      }
    } catch (error) {
      console.error('Błąd podczas odczytywania parametrów dashboard z localStorage:', error);
    }
    console.log('Brak danych w localStorage - zwracam pusty obiekt');
    return {};
  };

  // Funkcja do zapisywania danych do localStorage
  const saveFormData = (data: FormData) => {
    try {
      localStorage.setItem('pensionFormData', JSON.stringify(data));
    } catch (error) {
      console.error('Błąd podczas zapisywania danych do localStorage:', error);
    }
  };

  // Funkcja do czyszczenia zapisanych danych
  const clearSavedData = () => {
    try {
      localStorage.removeItem('pensionFormData');
    } catch (error) {
      console.error('Błąd podczas usuwania danych z localStorage:', error);
    }
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      gender: 'male',
      salary: 5000,
      workStartYear: 2020,
      retirementYear: 2067,
      currentSavings: 0,
      contributionPeriod: 0,
    },
  });

  // useEffect do automatycznego wypełniania formularza zapisanymi danymi
  useEffect(() => {
    const savedData = getSavedFormData();
    if (Object.keys(savedData).length > 0) {
      // Wypełnij formularz zapisanymi danymi
      Object.entries(savedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key as keyof FormData, value);
        }
      });
    }
  }, [setValue]);

  // useEffect do ładowania parametrów dashboard z localStorage
  useEffect(() => {
    console.log('=== ŁADOWANIE PARAMETRÓW DASHBOARD ===');
    const savedDashboardData = getSavedDashboardData();
    console.log('Obecne dashboardParameters przed aktualizacją:', dashboardParameters);
    if (Object.keys(savedDashboardData).length > 0) {
      console.log('Aktualizowanie parametrów dashboard:', savedDashboardData);
      setDashboardParameters(prev => {
        const newParams = {
          ...prev,
          ...savedDashboardData
        };
        console.log('Nowe parametry dashboard po aktualizacji:', newParams);
        return newParams;
      });
    } else {
      console.log('Brak danych do załadowania - pozostawiam domyślne parametry');
    }
  }, []);

  // useEffect do nasłuchiwania zmian w localStorage (gdy użytkownik zmienia ustawienia w Dashboard)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('=== STORAGE EVENT DETECTED ===');
      console.log('Event key:', e.key);
      console.log('Event newValue:', e.newValue);
      if (e.key === 'advancedDashboard' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          console.log('Wykryto zmianę w localStorage dashboard:', newData);
          setDashboardParameters(prev => {
            const updatedParams = {
              ...prev,
              ...newData
            };
            console.log('Aktualizacja parametrów przez storage event:', updatedParams);
            return updatedParams;
          });
        } catch (error) {
          console.error('Błąd podczas parsowania nowych danych dashboard:', error);
        }
      }
    };

    console.log('Dodawanie event listenera dla storage');
    window.addEventListener('storage', handleStorageChange);
    return () => {
      console.log('Usuwanie event listenera dla storage');
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const age = watch('age');
  // const workStartYear = watch('workStartYear');

  // Calculate suggested retirement year based on age and gender
  const getSuggestedRetirementYear = (currentAge: number, gender: string) => {
    const retirementAge = gender === 'female' ? 60 : 65;
    const currentYear = new Date().getFullYear();
    return currentYear + (retirementAge - currentAge);
  };

  // Funkcja obsługująca zmiany parametrów z Dashboard
  const handleParameterChange = (parameter: string, value: any) => {
    console.log(`=== PARAMETER CHANGE: ${parameter} = ${value} ===`);
    setDashboardParameters(prev => {
      const newParams = {
        ...prev,
        [parameter]: value
      };
      console.log('Nowe parametry po zmianie:', newParams);
      return newParams;
    });
  };

  // Funkcja do ręcznego odświeżania parametrów dashboard
  const refreshDashboardParameters = () => {
    console.log('=== RĘCZNE ODŚWIEŻANIE PARAMETRÓW DASHBOARD ===');
    console.log('Aktualne parametry dashboard przed odświeżeniem:', dashboardParameters);
    
    const savedDashboardData = getSavedDashboardData();
    console.log('Dane z localStorage:', savedDashboardData);
    
    if (Object.keys(savedDashboardData).length > 0) {
      console.log('Znalezione dane do odświeżenia:', savedDashboardData);
      console.log('Sprawdzenie fus20Variant:', savedDashboardData.fus20Variant);
      
      setDashboardParameters(prev => {
        const refreshedParams = {
          ...prev,
          ...savedDashboardData
        };
        console.log('Poprzednie parametry:', prev);
        console.log('Odświeżone parametry dashboard:', refreshedParams);
        console.log('fus20Variant po odświeżeniu:', refreshedParams.fus20Variant);
        return refreshedParams;
      });
    } else {
      console.log('Brak danych do odświeżenia');
    }
  };

  const onSubmit = (data: FormData) => {
    console.log('Dane formularza:', data);
    console.log('Parametry z dashboard:', dashboardParameters);
    
    // Zapisz dane formularza do localStorage przed przejściem do wyników
    saveFormData(data);
    
    try {
      // Przygotowanie danych dla kalkulacji aktuarialnej z parametrami z dashboard
      const personData: PersonData = {
        age: data.age,
        gender: data.gender,
        salary: data.salary,
        workStartYear: data.workStartYear,
        retirementYear: data.retirementYear,
        currentSavings: data.currentSavings || 0,
        contributionPeriod: data.contributionPeriod || 0,
        includeSickLeave: data.includeSickLeave || false,
        professionalGroup: data.professionalGroup,
        // Dodaj parametry z dashboard
        historicalSalaries: dashboardParameters.historicalSalaries,
        sicknessPeriods: dashboardParameters.sicknessPeriods,
        salaryGrowthRate: dashboardParameters.salaryGrowthRate,
        contributionValorizationRate: dashboardParameters.contributionValorizationRate,
        inflationRate: dashboardParameters.inflationRate,
        forecastHorizon: dashboardParameters.forecastHorizon,
        mainAccount: dashboardParameters.mainAccount,
        subAccount: dashboardParameters.subAccount,
        showAccountGrowth: dashboardParameters.showAccountGrowth,
        includeValorization: dashboardParameters.includeValorization
      };

      // Parametry FUS20 z dashboard zamiast stałych wartości
      const fus20Params: FUS20Parameters = {
        scenario: dashboardParameters.fus20Variant || 'intermediate',
        unemploymentRate: dashboardParameters.unemploymentRate || 5.2,
        wageGrowth: dashboardParameters.realWageGrowth || 3.5,
        inflation: dashboardParameters.generalInflation || 2.5,
        contributionCollection: dashboardParameters.contributionCollection || 95.0,
        fus20Variant: dashboardParameters.fus20Variant,
        generalInflation: dashboardParameters.generalInflation,
        pensionerInflation: dashboardParameters.pensionerInflation,
        realGDPGrowth: dashboardParameters.realGDPGrowth
      };

      // Wykonanie kalkulacji aktuarialnej
      const pensionResult = calculatePension(personData, fus20Params);
      
      console.log('Wyniki kalkulacji:', pensionResult);
      console.log('Dane osobowe:', personData);
      console.log('Parametry FUS20:', fus20Params);
      
      // Przekazanie wyników do strony wyników
      navigate('/wyniki', { 
        state: { 
          formData: data, 
          pensionResult,
          personData,
          fus20Params
        } 
      });
    } catch (error) {
      console.error('Błąd podczas obliczania emerytury:', error);
      alert('Wystąpił błąd podczas obliczania prognozy emerytury. Spróbuj ponownie.');
    }
  };

  // Funkcja do czyszczenia formularza
  const handleClearForm = () => {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane formularza?')) {
      clearSavedData();
      reset({
        age: 30,
        gender: 'male',
        salary: 5000,
        workStartYear: 2020,
        retirementYear: 2067,
        currentSavings: 0,
        contributionPeriod: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zus-orange/5 to-zus-green/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-zus-orange to-zus-orange/80 p-2 rounded-lg mr-3">
                <img 
                  src="/logo.png" 
                  alt="ZUS Logo" 
                  className="h-10 w-10 object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <Calculator className="h-10 w-10 text-white" style={{ display: 'none' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zus-navy">
                  ZUS na Plus
                </h1>
                <p className="text-sm text-slate-600">Hackathon 2025</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Strona główna
              </Link>
              <span className="px-4 py-2 text-zus-orange bg-zus-orange/10 rounded-lg font-medium">
                Symulacja
              </span>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zus-navy mb-4">
              Formularz danych osobowych
            </h2>
            <p className="text-zus-gray-600">
              Wprowadź swoje dane, aby otrzymać prognozę wysokości emerytury
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-zus-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-zus-navy mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dane podstawowe
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-zus-navy mb-2">
                    Wiek (lata) *
                  </label>
                  <input
                    type="number"
                    id="age"
                    {...register('age', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder="30"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-zus-red">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-zus-navy mb-2">
                    Płeć *
                  </label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                  >
                    <option value="male">Mężczyzna</option>
                    <option value="female">Kobieta</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-zus-red">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-zus-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-zus-navy mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Dane finansowe
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-zus-navy mb-2">
                    Wysokość wynagrodzenia brutto (zł) *
                  </label>
                  <input
                    type="number"
                    id="salary"
                    {...register('salary', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder="5000"
                  />
                  {errors.salary && (
                    <p className="mt-1 text-sm text-zus-red">{errors.salary.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currentSavings" className="block text-sm font-medium text-zus-navy mb-2">
                    Zgromadzone środki na koncie ZUS (zł)
                  </label>
                  <input
                    type="number"
                    id="currentSavings"
                    {...register('currentSavings', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder="0"
                  />
                  {errors.currentSavings && (
                    <p className="mt-1 text-sm text-zus-red">{errors.currentSavings.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Work History */}
            <div className="bg-zus-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-zus-navy mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Historia zatrudnienia
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="workStartYear" className="block text-sm font-medium text-zus-navy mb-2">
                    Rok rozpoczęcia pracy *
                  </label>
                  <input
                    type="number"
                    id="workStartYear"
                    {...register('workStartYear', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder="2020"
                  />
                  {errors.workStartYear && (
                    <p className="mt-1 text-sm text-zus-red">{errors.workStartYear.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="retirementYear" className="block text-sm font-medium text-zus-navy mb-2">
                    Planowany rok zakończenia aktywności *
                  </label>
                  <input
                    type="number"
                    id="retirementYear"
                    {...register('retirementYear', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder={getSuggestedRetirementYear(age || 30, 'male').toString()}
                  />
                  {errors.retirementYear && (
                    <p className="mt-1 text-sm text-zus-red">{errors.retirementYear.message}</p>
                  )}
                  <p className="mt-1 text-sm text-zus-gray-500">
                    Sugerowany rok emerytury: {getSuggestedRetirementYear(age || 30, watch('gender') || 'male')}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="contributionPeriod" className="block text-sm font-medium text-zus-navy mb-2">
                    Staż składkowy/nieskładkowy na 31.12.1998 (lata)
                  </label>
                  <input
                    type="number"
                    id="contributionPeriod"
                    {...register('contributionPeriod', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                    placeholder="0"
                  />
                  {errors.contributionPeriod && (
                    <p className="mt-1 text-sm text-zus-red">{errors.contributionPeriod.message}</p>
                  )}
                  <p className="mt-1 text-sm text-zus-gray-500">
                    Dotyczy osób urodzonych przed 1969 rokiem
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeSickLeave"
                      {...register('includeSickLeave')}
                      className="h-4 w-4 text-zus-orange focus:ring-zus-orange border-zus-gray-300 rounded"
                    />
                    <label htmlFor="includeSickLeave" className="ml-2 block text-sm text-zus-navy">
                      Uwzględnij zwolnienia lekarskie w kalkulacji
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-zus-gray-500">
                    Opcja uwzględnia statystyczny wpływ zwolnień lekarskich na wysokość emerytury
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Context */}
            <ProfessionalContext
              selectedGroupId={selectedProfessionalGroup}
              onGroupSelect={(groupId) => {
                setSelectedProfessionalGroup(groupId);
                setValue('professionalGroup', groupId);
              }}
            />

            {/* Submit Button */}
            <div 
              className="w-full"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: '24px'
              }}
            >
              <Link
                to="/"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#1e3a8a',
                  backgroundColor: 'white',
                  textDecoration: 'none',
                  textAlign: 'center',
                  minWidth: '120px',
                  display: 'inline-block'
                }}
              >
                Anuluj
              </Link>
              <button
                type="button"
                onClick={handleClearForm}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  color: '#dc2626',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                Wyczyść formularz
              </button>
              <button
                type="button"
                onClick={refreshDashboardParameters}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  color: '#2563eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                Odśwież Dashboard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgb(0, 153, 63)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  minWidth: '200px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'rgb(0, 133, 53)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'rgb(0, 153, 63)';
                  }
                }}
              >
                {isSubmitting ? 'Obliczanie...' : 'Oblicz prognozę emerytury'}
              </button>
            </div>
          </form>

          {/* Advanced Dashboard - poza formularzem */}
          <div className="mt-8">
            <AdvancedDashboard
              onParameterChange={handleParameterChange}
              currentParameters={dashboardParameters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;