import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, User, Calendar, DollarSign, Settings, ArrowLeft, HelpCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculatePension, type FUS20Parameters, type PersonData, type HistoricalSalary, type SicknessPeriod } from '../utils/actuarialCalculations';
import { ProfessionalContext } from '../components/ProfessionalContext';
import { AdvancedDashboard } from '../components/AdvancedDashboard';
import { 
  saveSimulation, 
  logFormStart, 
  logCalculationStart, 
  logCalculationComplete, 
  logCalculationError,
  getSessionId,
  type SimulationData 
} from '../utils/supabaseService';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

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

  const onSubmit = async (data: FormData) => {
    console.log('Dane formularza:', data);
    console.log('Parametry z dashboard:', dashboardParameters);
    
    const calculationStartTime = Date.now();
    
    // Zapisz dane formularza do localStorage przed przejściem do wyników
    saveFormData(data);
    
    // Loguj rozpoczęcie kalkulacji
    await logCalculationStart(data);
    
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
      
      const calculationEndTime = Date.now();
      const calculationDuration = calculationEndTime - calculationStartTime;
      
      console.log('Wyniki kalkulacji:', pensionResult);
      console.log('Dane osobowe:', personData);
      console.log('Parametry FUS20:', fus20Params);
      
      // Przygotowanie danych do zapisania w Supabase
      const simulationData: SimulationData = {
        // Dane wejściowe
        age: data.age,
        gender: data.gender === 'male' ? 'M' : 'F',
        salary: data.salary,
        workStartYear: data.workStartYear,
        workEndYear: data.retirementYear,
        currentSavings: data.currentSavings,
        workExperience1998: data.contributionPeriod,
        includeSickness: data.includeSickLeave,
        
        // Parametry FUS20
        fus20Variant: dashboardParameters.fus20Variant === 'intermediate' ? 1 : 
                     dashboardParameters.fus20Variant === 'pessimistic' ? 2 : 3,
        unemploymentRate: dashboardParameters.unemploymentRate,
        realWageGrowth: dashboardParameters.realWageGrowth,
        inflationRate: dashboardParameters.generalInflation,
        contributionCollection: dashboardParameters.contributionCollection,
        
        // Wyniki kalkulacji
        pensionAmount: pensionResult.monthlyPension,
        pensionAmountReal: pensionResult.monthlyPensionReal || pensionResult.realPensionValue || pensionResult.monthlyPension,
        replacementRate: pensionResult.replacementRate,
        withSickness: pensionResult.withSickness || pensionResult.sickLeaveImpact || 0,
        withoutSickness: pensionResult.withoutSickness || pensionResult.monthlyPension,
        initialCapital: pensionResult.initialCapital,
        estimatedSavings: pensionResult.estimatedSavings || pensionResult.totalContributions || 0,
        totalContributions: pensionResult.totalContributions,
        
        // Metadane
        sessionId: getSessionId(),
        calculationDurationMs: calculationDuration
      };
      
      // Zapisz symulację do Supabase
      const savedSimulation = await saveSimulation(simulationData);
      
      // Loguj zakończenie kalkulacji
      await logCalculationComplete(
        savedSimulation?.id || 'unknown', 
        pensionResult.monthlyPension
      );
      
      // Przekazanie wyników do strony wyników (z ID symulacji jeśli zapisano)
      navigate('/wyniki', { 
        state: { 
          formData: data, 
          pensionResult,
          personData,
          fus20Params,
          simulationId: savedSimulation?.id
        } 
      });
    } catch (error) {
      console.error('Błąd podczas obliczania emerytury:', error);
      
      // Loguj błąd kalkulacji
      await logCalculationError(error instanceof Error ? error.message : 'Unknown error');
      
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
    <div className="min-h-screen bg-zus-gray-50">


      <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="bg-zus-green-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-zus-green-primary">Dane osobowe</span>
            </div>
            <div className="w-12 h-0.5 bg-zus-gray-300"></div>
            <div className="flex items-center">
              <div className="bg-zus-gray-300 text-zus-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-zus-gray-600">Wyniki</span>
            </div>
          </div>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle as="h1" className="text-2xl md:text-3xl mb-2">
              Oblicz swoją przyszłą emeryturę
            </CardTitle>
            <p className="text-zus-gray-600">
              Wprowadź swoje dane, aby otrzymać realistyczną prognozę wysokości emerytury z ZUS. 
              Wszystkie obliczenia bazują na oficjalnych danych aktuarialnych.
            </p>
          </CardHeader>
          
          <CardContent>

          <form id="pension-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card variant="default" className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-zus-green-primary" />
                  Dane podstawowe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Wiek (lata)"
                    type="number"
                    placeholder="30"
                    required
                    {...register('age', { valueAsNumber: true })}
                    error={errors.age?.message}
                    helpText="Podaj swój aktualny wiek"
                  />

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-zus-gray-900 mb-2">
                      Płeć <span className="text-zus-red">*</span>
                    </label>
                    <select
                      id="gender"
                      {...register('gender')}
                      className="w-full px-3 py-3 border border-zus-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green-primary/20 focus:border-zus-green-primary transition-colors"
                      aria-describedby="gender-help"
                    >
                      <option value="male">Mężczyzna</option>
                      <option value="female">Kobieta</option>
                    </select>
                    <p id="gender-help" className="mt-1 text-sm text-zus-gray-600">
                      Płeć wpływa na wiek emerytalny i tablice trwania życia
                    </p>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-zus-red" role="alert">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card variant="default" className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2 text-zus-green-primary" />
                  Dane finansowe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Wysokość wynagrodzenia brutto (zł)"
                    type="number"
                    placeholder="5000"
                    required
                    {...register('salary', { valueAsNumber: true })}
                    error={errors.salary?.message}
                    helpText="Podaj swoje miesięczne wynagrodzenie brutto"
                    icon={<DollarSign className="h-4 w-4" />}
                  />

                  <Input
                    label="Zgromadzone środki na koncie ZUS (zł)"
                    type="number"
                    placeholder="0"
                    {...register('currentSavings', { valueAsNumber: true })}
                    error={errors.currentSavings?.message}
                    helpText="Opcjonalnie: środki już zgromadzone na koncie i subkoncie ZUS"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work History */}
            <Card variant="default" className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-zus-green-primary" />
                  Historia zatrudnienia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Rok rozpoczęcia pracy"
                    type="number"
                    placeholder="2020"
                    required
                    {...register('workStartYear', { valueAsNumber: true })}
                    error={errors.workStartYear?.message}
                    helpText="Rok, w którym rozpocząłeś pierwszą pracę"
                  />

                  <div>
                    <Input
                      label="Planowany rok zakończenia aktywności"
                      type="number"
                      placeholder={getSuggestedRetirementYear(age || 30, 'male').toString()}
                      required
                      {...register('retirementYear', { valueAsNumber: true })}
                      error={errors.retirementYear?.message}
                    />
                    <div className="mt-2 p-3 bg-zus-blue/10 rounded-lg border border-zus-blue/20">
                      <div className="flex items-center text-sm text-zus-blue">
                        <Info className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          Sugerowany rok emerytury: {getSuggestedRetirementYear(age || 30, watch('gender') || 'male')}
                        </span>
                      </div>
                      <p className="text-xs text-zus-gray-600 mt-1">
                        Bazuje na ustawowym wieku emerytalnym (K: 60 lat, M: 65 lat)
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Staż składkowy/nieskładkowy na 31.12.1998 (lata)"
                      type="number"
                      placeholder="0"
                      {...register('contributionPeriod', { valueAsNumber: true })}
                      error={errors.contributionPeriod?.message}
                      helpText="Dotyczy osób urodzonych przed 1969 rokiem - wpływa na kapitał początkowy"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-3 p-4 bg-zus-gray-50 rounded-lg border border-zus-gray-200">
                      <input
                        type="checkbox"
                        id="includeSickLeave"
                        {...register('includeSickLeave')}
                        className="mt-1 h-4 w-4 text-zus-green-primary focus:ring-zus-green-primary/20 border-zus-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="includeSickLeave" className="block text-sm font-medium text-zus-gray-900">
                          Uwzględnij zwolnienia lekarskie w kalkulacji
                        </label>
                        <p className="mt-1 text-sm text-zus-gray-600">
                          Opcja uwzględnia statystyczny wpływ zwolnień lekarskich na wysokość emerytury 
                          (średnio 2-3% redukcji składek rocznie)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Context */}
            <div className="mb-6">
              <ProfessionalContext
                selectedGroupId={selectedProfessionalGroup}
                onGroupSelect={(groupId) => {
                  setSelectedProfessionalGroup(groupId);
                  setValue('professionalGroup', groupId);
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-zus-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Link to="/" className="sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="medium" 
                    className="w-full sm:w-auto border-zus-gray-300 text-zus-gray-700 hover:bg-zus-gray-100 hover:border-zus-gray-500 hover:text-zus-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                </Link>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="medium"
                  onClick={handleClearForm}
                  className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                >
                  Wyczyść formularz
                </Button>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[220px] bg-zus-green-primary hover:bg-zus-green-primary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Obliczanie...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5 mr-2" />
                    Oblicz prognozę emerytury
                  </>
                )}
              </Button>
            </div>
          </form>

          </CardContent>
        </Card>

        {/* Advanced Dashboard - poza główną kartą */}
        <div className="mt-8">
          <AdvancedDashboard
            onParameterChange={handleParameterChange}
            currentParameters={dashboardParameters}
          />
        </div>
      </div>
    </div>
  );
};

export default FormPage;