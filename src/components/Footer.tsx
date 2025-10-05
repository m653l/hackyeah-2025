import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-zus-gray-900 py-8 px-4 sm:px-6 lg:px-8 border-t border-zus-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-2 text-zus-navy">ZUS na Plus</h4>
            <p className="text-zus-gray-600 text-sm">
              Narzędzie edukacyjne do prognozowania emerytury
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/formularz" className="text-zus-gray-600 hover:text-zus-green transition-colors">
              Symulacja
            </Link>
            <Link to="/dashboard" className="text-zus-gray-600 hover:text-zus-green transition-colors">
              Dashboard
            </Link>
            <Link to="/admin" className="text-zus-gray-600 hover:text-zus-green transition-colors">
              Admin
            </Link>
          </div>
        </div>
        
        <div className="border-t border-zus-gray-200 mt-6 pt-6 text-center text-xs text-zus-gray-600">
          <p>© 2025 ZUS na Plus - Projekt edukacyjny </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;