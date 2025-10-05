import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';


const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { to: '/', label: 'Strona główna' },
    { to: '/formularz', label: 'Symulacja' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/alternatywne-oszczedzanie', label: 'Oszczędzanie' },
    { to: '/admin', label: 'Admin', icon: Settings, ariaLabel: 'Panel administracyjny' }
  ];

  return (
    <>
      <header className="bg-white border-b border-zus-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/" 
              className="flex items-center hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              aria-label="Przejdź do strony głównej"
            >
              <div className="p-2 rounded-lg mr-3 border border-gray-200 shadow-sm flex items-center justify-center">
                <img 
                  src={logoImg} 
                  alt="ZUS Logo" 
                  className="h-12 w-12 object-contain" 
                  onLoad={(e) => {
                    console.log('✅ Logo loaded successfully!', e.currentTarget.src);
                  }}
                  onError={(e) => {
                    console.error('❌ Logo loading failed:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'block';
                      console.log('Showing fallback Shield icon');
                    }
                  }}
                />
                <Shield className="h-12 w-12 text-zus-navy" style={{ display: 'none' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zus-navy">
                  ZUS na Plus
                </h1>
                <p className="text-sm text-zus-gray-600"></p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1" role="navigation" aria-label="Główna nawigacja">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-2 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
                    aria-label={link.ariaLabel}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale transition-all duration-200"
              aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="fixed top-[88px] left-0 right-0 bg-white border-b border-zus-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out"
            style={{
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)'
            }}
          >
            <nav className="px-4 py-6 space-y-2" role="navigation" aria-label="Menu mobilne">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className="flex items-center px-4 py-3 text-zus-gray-900 hover:text-zus-green-primary hover:bg-zus-green-pale rounded-lg transition-all duration-200 font-semibold"
                    aria-label={link.ariaLabel}
                  >
                    {IconComponent && <IconComponent className="h-5 w-5 mr-3" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;