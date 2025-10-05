import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, Database, Settings, Download, Upload, AlertTriangle } from 'lucide-react';
// import logoUrl from '/logo.png?url';
import { Bar, Line } from 'react-chartjs-2';
import { generateAdminXLSReport, generateSampleAdminData } from '../utils/reportGenerator';
import { AdminReporting } from '../components/ReportingSystem';
import { 
  getAdminStats, 
  getSimulationTrends, 
  getCountyStats,
  type AdminStats,
  type SimulationTrend,
  type CountyStats
} from '../utils/adminService';
import { logDashboardAccess } from '../utils/supabaseService';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [simulationTrends, setSimulationTrends] = useState<SimulationTrend[]>([]);
  const [countyStats, setCountyStats] = useState<CountyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ładowanie danych przy inicjalizacji
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Loguj dostęp do dashboardu
        await logDashboardAccess();

        // Pobierz wszystkie dane równolegle
        const [stats, trends, counties] = await Promise.all([
          getAdminStats(),
          getSimulationTrends(7),
          getCountyStats()
        ]);

        setAdminStats(stats);
        setSimulationTrends(trends);
        setCountyStats(counties);
      } catch (err) {
        console.error('Błąd ładowania danych admin:', err);
        setError('Nie udało się załadować danych administracyjnych');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  // Odświeżanie danych co 30 sekund
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stats = await getAdminStats();
        if (stats) {
          setAdminStats(stats);
        }
      } catch (err) {
        console.error('Błąd odświeżania danych:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Funkcja do generowania raportu XLS dla administratora
  const handleGenerateAdminReport = () => {
    if (adminStats && adminStats.recentSimulations.length > 0) {
      // Konwertuj dane AdminStats na format AdminReportEntry[]
      const reportData = adminStats.recentSimulations.map(sim => ({
        dateUsed: sim.createdAt.split(' ')[0] || new Date().toISOString().split('T')[0],
        timeUsed: sim.createdAt.split(' ')[1] || new Date().toTimeString().split(' ')[0],
        expectedPension: sim.pensionAmount,
        age: sim.age,
        gender: sim.gender === 'Mężczyzna' ? 'M' : 'K',
        salary: 0, // Nie mamy tej informacji w recentSimulations
        includedSickness: false, // Nie mamy tej informacji
        accumulatedFunds: 0, // Nie mamy tej informacji
        actualPension: sim.pensionAmount,
        realPension: sim.pensionAmount,
        postalCode: undefined
      }));
      generateAdminXLSReport(reportData);
    } else {
      // Fallback do przykładowych danych
      const sampleData = generateSampleAdminData();
      generateAdminXLSReport(sampleData);
    }
  };

  // Sample admin data (fallback)
  const systemStats = {
    totalUsers: adminStats?.totalSimulations || 15847,
    simulationsToday: adminStats?.todaySimulations || 0, // Zmieniono z 342 na 0 jako fallback
    simulationsThisMonth: adminStats?.totalSimulations || 8756, // Używamy totalSimulations zamiast monthSimulations
    avgResponseTime: 1.2,
    systemUptime: 99.8,
    dataLastUpdated: new Date().toLocaleString('pl-PL'), // Używamy aktualnej daty zamiast lastUpdated
  };

  // Przygotowanie danych dla wykresów
  const usageData = {
    labels: simulationTrends.length > 0 
      ? simulationTrends.map(trend => {
          const date = new Date(trend.date);
          return date.toLocaleDateString('pl-PL', { weekday: 'short' });
        })
      : ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'],
    datasets: [
      {
        label: 'Liczba symulacji',
        data: simulationTrends.length > 0 
          ? simulationTrends.map(trend => trend.count)
          : [245, 312, 289, 367, 423, 156, 98],
        backgroundColor: 'rgba(255, 179, 79, 0.8)',
        borderColor: 'rgb(255, 179, 79)',
        borderWidth: 2,
      },
    ],
  };

  const pensionTrendData = {
    labels: simulationTrends.length > 0
      ? simulationTrends.map(trend => {
          const date = new Date(trend.date);
          return date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' });
        })
      : ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: simulationTrends.length > 0 ? 'Średnia emerytura (zł)' : 'Błędy systemu',
        data: simulationTrends.length > 0
          ? simulationTrends.map(trend => trend.averagePension)
          : [2, 1, 5, 8, 12, 4],
        borderColor: simulationTrends.length > 0 ? 'rgb(0, 153, 63)' : 'rgb(220, 38, 127)',
        backgroundColor: simulationTrends.length > 0 ? 'rgba(0, 153, 63, 0.1)' : 'rgba(220, 38, 127, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const tabs = [
    { id: 'overview', name: 'Przegląd', icon: Shield },
    { id: 'users', name: 'Użytkownicy', icon: Users },
    { id: 'data', name: 'Dane', icon: Database },
    { id: 'reports', name: 'Raporty', icon: FileText },
    { id: 'settings', name: 'Ustawienia', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zus-orange/5 to-zus-green/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-orange mx-auto mb-4"></div>
          <p className="text-zus-gray-600">Ładowanie danych administracyjnych...</p>
        </div>
      </div>
    );
  }

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
                <Shield className="h-10 w-10 text-white" style={{ display: 'none' }} />
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
              <Link
                to="/formularz"
                className="px-4 py-2 text-zus-navy hover:text-zus-orange hover:bg-zus-orange/5 rounded-lg transition-all duration-200 font-medium"
              >
                Symulacja
              </Link>
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zus-navy mb-4">
            Panel Administracyjny
          </h2>
          <p className="text-zus-gray-600">
            Zarządzanie systemem Symulatora Emerytalnego ZUS
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-zus-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === tab.id
                        ? 'border-zus-orange text-zus-orange'
                        : 'border-transparent text-zus-gray-500 hover:text-zus-gray-700 hover:border-zus-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* System Status Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-zus-green/10 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zus-gray-600">Łączna liczba użytkowników</p>
                        <p className="text-2xl font-bold text-zus-navy">{systemStats.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="h-8 w-8 text-zus-green" />
                    </div>
                  </div>

                  <div className="bg-zus-orange/10 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zus-gray-600">Symulacje dzisiaj</p>
                        <p className="text-2xl font-bold text-zus-navy">{systemStats.simulationsToday}</p>
                      </div>
                      <FileText className="h-8 w-8 text-zus-orange" />
                    </div>
                  </div>

                  <div className="bg-zus-blue/10 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zus-gray-600">Czas odpowiedzi (s)</p>
                        <p className="text-2xl font-bold text-zus-navy">{systemStats.avgResponseTime}</p>
                      </div>
                      <Settings className="h-8 w-8 text-zus-blue" />
                    </div>
                  </div>

                  <div className="bg-zus-navy/10 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zus-gray-600">Dostępność systemu</p>
                        <p className="text-2xl font-bold text-zus-navy">{systemStats.systemUptime}%</p>
                      </div>
                      <Shield className="h-8 w-8 text-zus-navy" />
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-zus-navy mb-4">
                      Wykorzystanie systemu (ostatni tydzień)
                    </h3>
                    <Bar data={usageData} options={chartOptions} />
                  </div>

                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-zus-navy mb-4">
                      {simulationTrends.length > 0 ? 'Średnia wysokość emerytury' : 'Błędy systemu (ostatnie 24h)'}
                    </h3>
                    <Line data={pensionTrendData} options={chartOptions} />
                  </div>
                </div>

                {/* System Alerts */}
                {error && (
                  <div className="bg-zus-red/10 border border-zus-red/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-zus-red mr-2" />
                      <h3 className="text-lg font-semibold text-zus-red">Błąd systemu</h3>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-zus-red">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-zus-blue/10 border border-zus-blue/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-zus-blue mr-2" />
                    <h3 className="text-lg font-semibold text-zus-blue">Status systemu</h3>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-zus-blue">
                      • System działa w trybie produkcyjnym
                    </p>
                    <p className="text-sm text-zus-blue">
                      • Dane aktualizowane w czasie rzeczywistym
                    </p>
                    <p className="text-sm text-zus-blue">
                      • Ostatnia aktualizacja: {new Date().toLocaleString('pl-PL')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zus-navy">Ostatnie symulacje</h3>
                  <button 
                    onClick={handleGenerateAdminReport}
                    className="bg-zus-orange text-white px-4 py-2 rounded-md hover:bg-zus-orange/90 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Eksportuj raport
                  </button>
                </div>

                {/* Statystyki użytkowników */}
                {adminStats && (
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-zus-green/10 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-zus-gray-600">Rozkład płci</h4>
                      <div className="mt-2">
                        <p className="text-lg font-semibold text-zus-navy">
                          M: {adminStats.genderDistribution.male} | K: {adminStats.genderDistribution.female}
                        </p>
                      </div>
                    </div>
                    <div className="bg-zus-orange/10 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-zus-gray-600">Średni wiek</h4>
                      <div className="mt-2">
                        <p className="text-lg font-semibold text-zus-navy">{adminStats.averageAge} lat</p>
                      </div>
                    </div>
                    <div className="bg-zus-blue/10 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-zus-gray-600">Średnia emerytura</h4>
                      <div className="mt-2">
                        <p className="text-lg font-semibold text-zus-navy">{adminStats.averagePensionAmount.toLocaleString()} zł</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-zus-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-zus-gray-200">
                    <thead className="bg-zus-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Wiek
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Płeć
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Emerytura (zł)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zus-gray-200">
                      {adminStats?.recentSimulations.map((simulation) => (
                        <tr key={simulation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-900">
                            {simulation.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {simulation.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {simulation.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {simulation.pensionAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {simulation.createdAt}
                          </td>
                        </tr>
                      )) || (
                        // Fallback data jeśli brak rzeczywistych danych
                        [1, 2, 3, 4, 5].map((id) => (
                          <tr key={id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-900">
                              SIM-{String(id).padStart(6, '0')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                              {Math.floor(Math.random() * 30) + 25}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                              {Math.random() > 0.5 ? 'Mężczyzna' : 'Kobieta'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                              {(Math.floor(Math.random() * 2000) + 2000).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                              {new Date(Date.now() - Math.random() * 86400000).toLocaleString('pl-PL')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zus-navy">Zarządzanie danymi</h3>
                  <div className="flex space-x-2">
                    <button className="bg-zus-green text-white px-4 py-2 rounded-md hover:bg-zus-green/90 transition-colors flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Import danych
                    </button>
                    <button className="bg-zus-orange text-white px-4 py-2 rounded-md hover:bg-zus-orange/90 transition-colors flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Eksport danych
                    </button>
                  </div>
                </div>

                {/* Statystyki wariantów FUS20 */}
                {adminStats && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-zus-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-zus-navy mb-4">Warianty FUS20</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Pośredni:</span>
                          <span className="font-medium">{adminStats.fus20VariantDistribution.intermediate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Pesymistyczny:</span>
                          <span className="font-medium">{adminStats.fus20VariantDistribution.pessimistic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Optymistyczny:</span>
                          <span className="font-medium">{adminStats.fus20VariantDistribution.optimistic}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zus-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-zus-navy mb-4">Top powiaty</h4>
                      <div className="space-y-2">
                        {adminStats.topCounties.slice(0, 5).map((county, index) => (
                          <div key={county.county} className="flex justify-between">
                            <span className="text-sm text-zus-gray-600">{county.county}-xxx:</span>
                            <span className="font-medium">{county.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zus-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-zus-navy mb-4">Wydajność</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Śr. czas kalkulacji:</span>
                          <span className="font-medium">{adminStats.calculationTimes.average}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Min:</span>
                          <span className="font-medium">{adminStats.calculationTimes.min}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zus-gray-600">Max:</span>
                          <span className="font-medium">{adminStats.calculationTimes.max}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Aktualizacja danych FUS20</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zus-gray-600">Ostatnia aktualizacja:</span>
                        <span className="text-sm font-medium">{systemStats.dataLastUpdated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zus-gray-600">Wersja danych:</span>
                        <span className="text-sm font-medium">FUS20-2024.12</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-zus-orange text-white px-4 py-2 rounded-md hover:bg-zus-orange/90 transition-colors flex items-center justify-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Importuj
                        </button>
                        <button className="flex-1 bg-white text-zus-navy px-4 py-2 rounded-md border border-zus-navy hover:bg-zus-navy hover:text-white transition-colors flex items-center justify-center">
                          <Download className="h-4 w-4 mr-2" />
                          Eksportuj
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Tablice życia</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zus-gray-600">Źródło danych:</span>
                        <span className="text-sm font-medium">GUS 2023</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zus-gray-600">Zakres lat:</span>
                        <span className="text-sm font-medium">2023-2080</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-zus-green text-white px-4 py-2 rounded-md hover:bg-zus-green/90 transition-colors">
                          Aktualizuj
                        </button>
                        <button className="flex-1 bg-white text-zus-navy px-4 py-2 rounded-md border border-zus-navy hover:bg-zus-navy hover:text-white transition-colors">
                          Podgląd
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zus-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-zus-navy mb-4">Wskaźniki waloryzacji</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-zus-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Rok</th>
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Wskaźnik roczny</th>
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Q1</th>
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Q2</th>
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Q3</th>
                          <th className="text-left py-2 text-sm font-medium text-zus-gray-600">Q4</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-zus-gray-100">
                          <td className="py-2">2024</td>
                          <td className="py-2 font-medium">15.26%</td>
                          <td className="py-2">3.45%</td>
                          <td className="py-2">3.78%</td>
                          <td className="py-2">4.12%</td>
                          <td className="py-2">3.91%</td>
                        </tr>
                        <tr className="border-b border-zus-gray-100">
                          <td className="py-2">2023</td>
                          <td className="py-2 font-medium">11.89%</td>
                          <td className="py-2">2.87%</td>
                          <td className="py-2">3.12%</td>
                          <td className="py-2">2.95%</td>
                          <td className="py-2">2.95%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Nowy komponent raportowania */}
                <AdminReporting />
                
                <h3 className="text-lg font-semibold text-zus-navy">Raporty systemowe (Legacy)</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Raporty użytkowania</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={handleGenerateAdminReport}
                        className="w-full text-left p-3 bg-white rounded border hover:bg-zus-orange hover:text-white transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">Raport użycia systemu (XLS)</div>
                          <div className="text-sm text-zus-gray-600">Szczegółowe dane użytkowania z wymaganymi nagłówkami</div>
                        </div>
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded border hover:bg-zus-gray-50 transition-colors">
                        <div className="font-medium">Analiza demograficzna</div>
                        <div className="text-sm text-zus-gray-600">Rozkład użytkowników według wieku i płci</div>
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded border hover:bg-zus-gray-50 transition-colors">
                        <div className="font-medium">Raport wydajności</div>
                        <div className="text-sm text-zus-gray-600">Analiza czasów odpowiedzi i obciążenia</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Raporty aktuarialne</h4>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 bg-white rounded border hover:bg-zus-gray-50 transition-colors">
                        <div className="font-medium">Analiza FUS20</div>
                        <div className="text-sm text-zus-gray-600">Porównanie wariantów demograficznych</div>
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded border hover:bg-zus-gray-50 transition-colors">
                        <div className="font-medium">Prognozy emerytalne</div>
                        <div className="text-sm text-zus-gray-600">Trendy wysokości świadczeń</div>
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded border hover:bg-zus-gray-50 transition-colors">
                        <div className="font-medium">Analiza regionaln</div>
                        <div className="text-sm text-zus-gray-600">Różnice między województwami</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-zus-navy">Ustawienia systemu</h3>
                
                <div className="space-y-6">
                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Parametry kalkulacji</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zus-navy mb-2">
                          Domyślna stopa waloryzacji (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue="15.26"
                          className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zus-navy mb-2">
                          Maksymalny wiek symulacji
                        </label>
                        <input
                          type="number"
                          defaultValue="67"
                          className="w-full px-3 py-2 border border-zus-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zus-orange focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zus-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-zus-navy mb-4">Ustawienia interfejsu</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zus-navy">Tryb konserwacji</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-zus-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zus-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zus-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zus-orange"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zus-navy">Logowanie szczegółowe</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-zus-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zus-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zus-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zus-orange"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-zus-orange text-white px-6 py-2 rounded-md hover:bg-zus-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-zus-orange focus:ring-offset-2">
                      Zapisz ustawienia
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;