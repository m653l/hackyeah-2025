import { supabase } from './supabaseClient'

export interface SimulationData {
  // Dane wejściowe
  age: number
  gender: 'M' | 'F'
  salary: number
  workStartYear: number
  workEndYear: number
  currentSavings?: number
  workExperience1998?: number
  includeSickness?: boolean
  expectedPension?: number
  postalCode?: string
  
  // Parametry FUS20
  fus20Variant: number
  unemploymentRate?: number
  realWageGrowth?: number
  inflationRate?: number
  contributionCollection?: number
  
  // Wyniki
  pensionAmount: number
  pensionAmountReal?: number
  replacementRate?: number
  withSickness?: number
  withoutSickness?: number
  initialCapital?: number
  estimatedSavings?: number
  totalContributions?: number
  
  // Metadane
  sessionId?: string
  calculationDurationMs?: number
}

export interface DelayBenefit {
  delayYears: number
  delayedPensionAmount: number
  benefitIncreasePercent: number
}

export interface CountyContext {
  countyName: string
  highestPension: number
  lowestPension: number
  averagePension: number
  userVsAveragePercent: number
}

export interface ProfessionalContext {
  insuranceTitleCode: string
  professionName: string
  averagePension: number
  userVsProfessionPercent: number
}

// Generowanie unikalnego ID sesji
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Pobieranie ID sesji z sessionStorage
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('zus_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('zus_session_id', sessionId)
  }
  return sessionId
}

// Sprawdzenie czy Supabase jest dostępny
const isSupabaseAvailable = (): boolean => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

// Zapisanie głównej symulacji
export const saveSimulation = async (data: SimulationData): Promise<any> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured - simulation data not saved')
    return null
  }

  try {
    const { data: simulation, error } = await supabase
      .from('user_simulations')
      .insert({
        age: data.age,
        gender: data.gender,
        salary: data.salary,
        work_start_year: data.workStartYear,
        work_end_year: data.workEndYear,
        current_savings: data.currentSavings,
        work_experience_1998: data.workExperience1998,
        include_sickness: data.includeSickness || false,
        expected_pension: data.expectedPension,
        postal_code: data.postalCode,
        fus20_variant: data.fus20Variant,
        unemployment_rate: data.unemploymentRate,
        real_wage_growth: data.realWageGrowth,
        inflation_rate: data.inflationRate,
        contribution_collection: data.contributionCollection,
        pension_amount: data.pensionAmount,
        pension_amount_real: data.pensionAmountReal,
        replacement_rate: data.replacementRate,
        with_sickness: data.withSickness,
        without_sickness: data.withoutSickness,
        initial_capital: data.initialCapital,
        estimated_savings: data.estimatedSavings,
        total_contributions: data.totalContributions,
        session_id: data.sessionId || getSessionId(),
        user_agent: navigator.userAgent,
        calculation_duration_ms: data.calculationDurationMs
      })
      .select()
      .single()

    if (error) {
      console.error('Błąd zapisywania symulacji:', error)
      return null
    }

    console.log('Symulacja zapisana pomyślnie:', simulation.id)
    return simulation
  } catch (error) {
    console.error('Błąd zapisywania symulacji:', error)
    return null
  }
}

// Zapisanie korzyści z odroczenia emerytury
export const saveDelayBenefits = async (simulationId: string, delays: DelayBenefit[]): Promise<boolean> => {
  if (!isSupabaseAvailable() || !simulationId || !delays.length) {
    return false
  }

  try {
    const delayData = delays.map(delay => ({
      simulation_id: simulationId,
      delay_years: delay.delayYears,
      delayed_pension_amount: delay.delayedPensionAmount,
      benefit_increase_percent: delay.benefitIncreasePercent
    }))

    const { error } = await supabase
      .from('simulation_delays')
      .insert(delayData)

    if (error) {
      console.error('Błąd zapisywania korzyści z odroczenia:', error)
      return false
    }

    console.log('Korzyści z odroczenia zapisane pomyślnie')
    return true
  } catch (error) {
    console.error('Błąd zapisywania korzyści z odroczenia:', error)
    return false
  }
}

// Zapisanie kontekstu powiatowego
export const saveCountyContext = async (simulationId: string, context: CountyContext): Promise<boolean> => {
  if (!isSupabaseAvailable() || !simulationId) {
    return false
  }

  try {
    const { error } = await supabase
      .from('county_context')
      .insert({
        simulation_id: simulationId,
        county_name: context.countyName,
        highest_pension: context.highestPension,
        lowest_pension: context.lowestPension,
        average_pension: context.averagePension,
        user_vs_average_percent: context.userVsAveragePercent
      })

    if (error) {
      console.error('Błąd zapisywania kontekstu powiatowego:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Błąd zapisywania kontekstu powiatowego:', error)
    return false
  }
}

// Zapisanie kontekstu zawodowego
export const saveProfessionalContext = async (simulationId: string, context: ProfessionalContext): Promise<boolean> => {
  if (!isSupabaseAvailable() || !simulationId) {
    return false
  }

  try {
    const { error } = await supabase
      .from('professional_context')
      .insert({
        simulation_id: simulationId,
        insurance_title_code: context.insuranceTitleCode,
        profession_name: context.professionName,
        average_pension: context.averagePension,
        user_vs_profession_percent: context.userVsProfessionPercent
      })

    if (error) {
      console.error('Błąd zapisywania kontekstu zawodowego:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Błąd zapisywania kontekstu zawodowego:', error)
    return false
  }
}

// Logowanie użycia systemu
export const logSystemUsage = async (eventType: string, eventData?: any): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return
  }

  try {
    await supabase
      .from('system_usage_logs')
      .insert({
        event_type: eventType,
        page_path: window.location.pathname,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        event_data: eventData
      })
  } catch (error) {
    console.error('Błąd logowania użycia:', error)
  }
}

// Funkcje pomocnicze do logowania konkretnych wydarzeń
export const logFormStart = () => logSystemUsage('form_start')
export const logCalculationStart = (formData: any) => logSystemUsage('calculation_start', { formData })
export const logCalculationComplete = (simulationId: string, pensionAmount: number) => 
  logSystemUsage('calculation_complete', { simulationId, pensionAmount })
export const logCalculationError = (error: string) => logSystemUsage('calculation_error', { error })
export const logReportDownload = (simulationId?: string) => logSystemUsage('report_download', { simulationId })
export const logDashboardAccess = () => logSystemUsage('dashboard_access')
export const logPageView = (pageName: string) => logSystemUsage('page_view', { pageName })