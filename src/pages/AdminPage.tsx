import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, Database, Settings, Download, Upload, AlertTriangle } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { generateAdminXLSReport, generateSampleAdminData } from '../utils/reportGenerator';
import { AdminReporting } from '../components/ReportingSystem';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Funkcja do generowania raportu XLS dla administratora
  const handleGenerateAdminReport = () => {
    const sampleData = generateSampleAdminData();
    generateAdminXLSReport(sampleData);
  };

  // Sample admin data
  const systemStats = {
    totalUsers: 15847,
    simulationsToday: 342,
    simulationsThisMonth: 8756,
    avgResponseTime: 1.2,
    systemUptime: 99.8,
    dataLastUpdated: '2025-01-15 08:30:00',
  };

  const usageData = {
    labels: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'],
    datasets: [
      {
        label: 'Liczba symulacji',
        data: [245, 312, 289, 367, 423, 156, 98],
        backgroundColor: 'rgba(255, 179, 79, 0.8)',
        borderColor: 'rgb(255, 179, 79)',
        borderWidth: 2,
      },
    ],
  };

  const errorData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Błędy systemu',
        data: [2, 1, 5, 8, 12, 4],
        borderColor: 'rgb(220, 38, 127)',
        backgroundColor: 'rgba(220, 38, 127, 0.1)',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zus-orange/5 to-zus-green/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-zus-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-zus-orange mr-3" />
              <h1 className="text-xl font-bold text-zus-navy">Panel Administracyjny</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-zus-navy hover:text-zus-orange transition-colors">
                Strona główna
              </Link>
              <Link to="/formularz" className="text-zus-navy hover:text-zus-orange transition-colors">
                Symulacja
              </Link>
              <Link to="/dashboard" className="text-zus-navy hover:text-zus-orange transition-colors">
                Dashboard
              </Link>
              <span className="text-zus-orange font-semibold">Admin</span>
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
                      Błędy systemu (ostatnie 24h)
                    </h3>
                    <Line data={errorData} options={chartOptions} />
                  </div>
                </div>

                {/* System Alerts */}
                <div className="bg-zus-red/10 border border-zus-red/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-zus-red mr-2" />
                    <h3 className="text-lg font-semibold text-zus-red">Alerty systemowe</h3>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-zus-red">
                      • Wysokie obciążenie serwera w godzinach 14:00-16:00
                    </p>
                    <p className="text-sm text-zus-red">
                      • Aktualizacja danych FUS20 zaplanowana na 20.01.2025
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zus-navy">Zarządzanie użytkownikami</h3>
                  <button className="bg-zus-orange text-white px-4 py-2 rounded-md hover:bg-zus-orange/90 transition-colors">
                    Eksportuj listę
                  </button>
                </div>

                <div className="bg-zus-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-zus-gray-200">
                    <thead className="bg-zus-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Ostatnia aktywność
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Liczba symulacji
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zus-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zus-gray-200">
                      {[1, 2, 3, 4, 5].map((id) => (
                        <tr key={id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-900">
                            USR-{String(id).padStart(6, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {new Date(Date.now() - Math.random() * 86400000).toLocaleString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zus-gray-500">
                            {Math.floor(Math.random() * 20) + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-zus-green/20 text-zus-green">
                              Aktywny
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-zus-navy">Zarządzanie danymi</h3>
                
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