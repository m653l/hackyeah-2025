import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, User, Calendar, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculatePension, type FUS20Parameters, type PersonData } from '../utils/actuarialCalculations';

const formSchema = z.object({
  age: z.number().min(18, 'Wiek musi być większy niż 18 lat').max(67, 'Wiek nie może przekraczać 67 lat'),
  gender: z.enum(['male', 'female'], 'Wybierz płeć'),
  salary: z.number().min(1000, 'Wynagrodzenie musi być większe niż 1000 zł').max(50000, 'Wynagrodzenie nie może przekraczać 50000 zł'),
  workStartYear: z.number().min(1980, 'Rok rozpoczęcia pracy nie może być wcześniejszy niż 1980').max(2025, 'Rok rozpoczęcia pracy nie może być późniejszy niż 2025'),
  retirementYear: z.number().min(2025, 'Planowany rok emerytury nie może być wcześniejszy niż 2025').max(2080, 'Planowany rok emerytury nie może być późniejszy niż 2080'),
  currentSavings: z.number().min(0, 'Zgromadzone środki nie mogą być ujemne').optional(),
  contributionPeriod: z.number().min(0, 'Staż składkowy nie może być ujemny').max(50, 'Staż składkowy nie może przekraczać 50 lat').optional(),
  includeSickLeave: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
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

  const age = watch('age');
  // const workStartYear = watch('workStartYear');

  // Calculate suggested retirement year based on age and gender
  const getSuggestedRetirementYear = (currentAge: number, gender: string) => {
    const retirementAge = gender === 'female' ? 60 : 65;
    const currentYear = new Date().getFullYear();
    return currentYear + (retirementAge - currentAge);
  };

  const onSubmit = (data: FormData) => {
    console.log('Dane formularza:', data);
    
    try {
      // Przygotowanie danych dla kalkulacji aktuarialnej
      const personData: PersonData = {
        age: data.age,
        gender: data.gender,
        salary: data.salary,
        workStartYear: data.workStartYear,
        retirementYear: data.retirementYear,
        currentSavings: data.currentSavings || 0,
        contributionPeriod: data.contributionPeriod || 0,
        includeSickLeave: data.includeSickLeave || false
      };

      // Parametry FUS20 - wariant pośredni jako domyślny
      const fus20Params: FUS20Parameters = {
        scenario: 'intermediate',
        unemploymentRate: 5.2,
        wageGrowth: 3.5,
        inflation: 2.5,
        contributionCollection: 95.0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zus-orange/5 to-zus-green/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-zus-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Calculator className="h-8 w-8 text-zus-orange mr-3" />
              <h1 className="text-xl font-bold text-zus-navy">Symulator Emerytalny ZUS</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-zus-navy hover:text-zus-orange transition-colors">
                Strona główna
              </Link>
              <span className="text-zus-orange font-semibold">Symulacja</span>
              <Link to="/dashboard" className="text-zus-navy hover:text-zus-orange transition-colors">
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

            {/* Submit Button */}
            <div className="flex justify-center space-x-4">
              <Link
                to="/"
                className="px-6 py-3 border border-zus-gray-300 rounded-md text-zus-navy hover:bg-zus-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zus-gray-500 focus:ring-offset-2"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-zus-orange text-white rounded-md font-semibold hover:bg-zus-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-zus-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Obliczanie...' : 'Oblicz prognozę emerytury'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPage;