import { supabase } from './supabaseClient'

export interface AdminStats {
  totalSimulations: number
  todaySimulations: number
  averagePensionAmount: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
  }
  fus20VariantDistribution: {
    intermediate: number
    pessimistic: number
    optimistic: number
  }
  topCounties: Array<{
    county: string
    count: number
  }>
  recentSimulations: Array<{
    id: string
    age: number
    gender: string
    pensionAmount: number
    createdAt: string
  }>
  calculationTimes: {
    average: number
    min: number
    max: number
  }
  systemUsage: {
    pageViews: number
    calculationErrors: number
    reportDownloads: number
  }
}

export interface SimulationTrend {
  date: string
  count: number
  averagePension: number
}

export interface CountyStats {
  county: string
  simulationCount: number
  averagePension: number
  averageAge: number
}

// Sprawdzenie czy Supabase jest dostępny
const isSupabaseAvailable = (): boolean => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

// Pobieranie podstawowych statystyk administracyjnych
export const getAdminStats = async (): Promise<AdminStats | null> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured - returning mock data')
    return getMockAdminStats()
  }

  try {
    // Pobierz wszystkie symulacje
    const { data: simulations, error: simulationsError } = await supabase
      .from('user_simulations')
      .select('*')
      .order('created_at', { ascending: false })

    if (simulationsError) {
      console.error('Błąd pobierania symulacji:', simulationsError)
      return getMockAdminStats()
    }

    // Pobierz logi systemowe
    const { data: systemLogs, error: logsError } = await supabase
      .from('system_usage_logs')
      .select('*')

    if (logsError) {
      console.error('Błąd pobierania logów:', logsError)
    }

    // Oblicz statystyki
    const today = new Date()
    
    // Filtrowanie symulacji z dzisiaj - sprawdzamy czy symulacja była dzisiaj w lokalnej strefie czasowej
    // To rozwiązuje problem z różnicami stref czasowych między UTC (baza danych) a lokalną strefą
    const todaySimulations = simulations?.filter(s => {
      const simulationDate = new Date(s.created_at)
      const localDateString = simulationDate.toLocaleDateString('pl-PL')
      const todayLocalString = today.toLocaleDateString('pl-PL')
      
      return localDateString === todayLocalString
    }).length || 0

    const totalSimulations = simulations?.length || 0
    
    const averagePensionAmount = simulations?.length 
      ? simulations.reduce((sum, s) => sum + (s.pension_amount || 0), 0) / simulations.length
      : 0

    const averageAge = simulations?.length
      ? simulations.reduce((sum, s) => sum + (s.age || 0), 0) / simulations.length
      : 0

    // Rozkład płci
    const maleCount = simulations?.filter(s => s.gender === 'M').length || 0
    const femaleCount = simulations?.filter(s => s.gender === 'F').length || 0

    // Rozkład wariantów FUS20
    const intermediateCount = simulations?.filter(s => s.fus20_variant === 1).length || 0
    const pessimisticCount = simulations?.filter(s => s.fus20_variant === 2).length || 0
    const optimisticCount = simulations?.filter(s => s.fus20_variant === 3).length || 0

    // Top powiaty (jeśli są dane)
    const countiesMap = new Map<string, number>()
    simulations?.forEach(s => {
      if (s.postal_code) {
        const county = s.postal_code.substring(0, 2) // Pierwsze 2 cyfry kodu pocztowego
        countiesMap.set(county, (countiesMap.get(county) || 0) + 1)
      }
    })
    
    const topCounties = Array.from(countiesMap.entries())
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Ostatnie symulacje
    const recentSimulations = simulations?.slice(0, 10).map(s => ({
      id: s.id,
      age: s.age,
      gender: s.gender === 'M' ? 'Mężczyzna' : 'Kobieta',
      pensionAmount: s.pension_amount,
      createdAt: new Date(s.created_at).toLocaleString('pl-PL')
    })) || []

    // Czasy kalkulacji
    const calculationTimes = simulations?.filter(s => s.calculation_duration_ms)
    const avgTime = calculationTimes?.length 
      ? calculationTimes.reduce((sum, s) => sum + s.calculation_duration_ms, 0) / calculationTimes.length
      : 0
    const minTime = calculationTimes?.length 
      ? Math.min(...calculationTimes.map(s => s.calculation_duration_ms))
      : 0
    const maxTime = calculationTimes?.length 
      ? Math.max(...calculationTimes.map(s => s.calculation_duration_ms))
      : 0

    // Statystyki użycia systemu
    const pageViews = systemLogs?.filter(log => log.event_type === 'page_view').length || 0
    const calculationErrors = systemLogs?.filter(log => log.event_type === 'calculation_error').length || 0
    const reportDownloads = systemLogs?.filter(log => log.event_type === 'report_download').length || 0

    return {
      totalSimulations,
      todaySimulations,
      averagePensionAmount: Math.round(averagePensionAmount),
      averageAge: Math.round(averageAge * 10) / 10,
      genderDistribution: {
        male: maleCount,
        female: femaleCount
      },
      fus20VariantDistribution: {
        intermediate: intermediateCount,
        pessimistic: pessimisticCount,
        optimistic: optimisticCount
      },
      topCounties,
      recentSimulations,
      calculationTimes: {
        average: Math.round(avgTime),
        min: minTime,
        max: maxTime
      },
      systemUsage: {
        pageViews,
        calculationErrors,
        reportDownloads
      }
    }
  } catch (error) {
    console.error('Błąd pobierania statystyk admin:', error)
    return getMockAdminStats()
  }
}

// Pobieranie trendów symulacji w czasie
export const getSimulationTrends = async (days: number = 7): Promise<SimulationTrend[]> => {
  if (!isSupabaseAvailable()) {
    return getMockTrends(days)
  }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: simulations, error } = await supabase
      .from('user_simulations')
      .select('created_at, pension_amount')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Błąd pobierania trendów:', error)
      return getMockTrends(days)
    }

    // Grupuj symulacje według dni
    const trendsMap = new Map<string, { count: number; totalPension: number }>()
    
    simulations?.forEach(simulation => {
      const date = simulation.created_at.split('T')[0]
      const existing = trendsMap.get(date) || { count: 0, totalPension: 0 }
      trendsMap.set(date, {
        count: existing.count + 1,
        totalPension: existing.totalPension + (simulation.pension_amount || 0)
      })
    })

    // Konwertuj na array z średnimi
    return Array.from(trendsMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      averagePension: data.count > 0 ? Math.round(data.totalPension / data.count) : 0
    }))
  } catch (error) {
    console.error('Błąd pobierania trendów:', error)
    return getMockTrends(days)
  }
}

// Pobieranie statystyk według powiatów
export const getCountyStats = async (): Promise<CountyStats[]> => {
  if (!isSupabaseAvailable()) {
    return getMockCountyStats()
  }

  try {
    const { data: simulations, error } = await supabase
      .from('user_simulations')
      .select('postal_code, pension_amount, age')
      .not('postal_code', 'is', null)

    if (error) {
      console.error('Błąd pobierania statystyk powiatów:', error)
      return getMockCountyStats()
    }

    // Grupuj według pierwszych 2 cyfr kodu pocztowego
    const countiesMap = new Map<string, { count: number; totalPension: number; totalAge: number }>()
    
    simulations?.forEach(simulation => {
      if (simulation.postal_code) {
        const county = simulation.postal_code.substring(0, 2)
        const existing = countiesMap.get(county) || { count: 0, totalPension: 0, totalAge: 0 }
        countiesMap.set(county, {
          count: existing.count + 1,
          totalPension: existing.totalPension + (simulation.pension_amount || 0),
          totalAge: existing.totalAge + (simulation.age || 0)
        })
      }
    })

    return Array.from(countiesMap.entries())
      .map(([county, data]) => ({
        county,
        simulationCount: data.count,
        averagePension: data.count > 0 ? Math.round(data.totalPension / data.count) : 0,
        averageAge: data.count > 0 ? Math.round((data.totalAge / data.count) * 10) / 10 : 0
      }))
      .sort((a, b) => b.simulationCount - a.simulationCount)
  } catch (error) {
    console.error('Błąd pobierania statystyk powiatów:', error)
    return getMockCountyStats()
  }
}

// Mock data dla przypadku gdy Supabase nie jest dostępny
const getMockAdminStats = (): AdminStats => ({
  totalSimulations: 1247,
  todaySimulations: 23,
  averagePensionAmount: 2850,
  averageAge: 42.5,
  genderDistribution: {
    male: 687,
    female: 560
  },
  fus20VariantDistribution: {
    intermediate: 823,
    pessimistic: 312,
    optimistic: 112
  },
  topCounties: [
    { county: '00', count: 156 },
    { county: '01', count: 134 },
    { county: '02', count: 98 },
    { county: '03', count: 87 },
    { county: '04', count: 76 }
  ],
  recentSimulations: [
    { id: '1', age: 35, gender: 'Mężczyzna', pensionAmount: 3200, createdAt: '2025-01-27 14:30' },
    { id: '2', age: 42, gender: 'Kobieta', pensionAmount: 2800, createdAt: '2025-01-27 14:15' },
    { id: '3', age: 28, gender: 'Mężczyzna', pensionAmount: 2400, createdAt: '2025-01-27 13:45' }
  ],
  calculationTimes: {
    average: 1250,
    min: 450,
    max: 3200
  },
  systemUsage: {
    pageViews: 3456,
    calculationErrors: 12,
    reportDownloads: 234
  }
})

const getMockTrends = (days: number): SimulationTrend[] => {
  const trends: SimulationTrend[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    trends.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
      averagePension: Math.floor(Math.random() * 1000) + 2000
    })
  }
  return trends
}

const getMockCountyStats = (): CountyStats[] => [
  { county: '00', simulationCount: 156, averagePension: 2950, averageAge: 41.2 },
  { county: '01', simulationCount: 134, averagePension: 2780, averageAge: 43.8 },
  { county: '02', simulationCount: 98, averagePension: 3100, averageAge: 39.5 },
  { county: '03', simulationCount: 87, averagePension: 2650, averageAge: 45.1 },
  { county: '04', simulationCount: 76, averagePension: 2890, averageAge: 40.7 }
]