import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-zus-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="bg-zus-green-primary p-2 rounded-lg mr-3">
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
              <p className="text-sm text-zus-gray-600"></p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-1" role="navigation" aria-label="Główna nawigacja">
            <Link
              to="/"
              className="px-4 py-2 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
            >
              Strona główna
            </Link>
            <Link
              to="/formularz"
              className="px-4 py-2 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
            >
              Symulacja
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
            >
              Dashboard
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
              aria-label="Panel administracyjny"
            >
              <Settings className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;