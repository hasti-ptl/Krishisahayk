import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, Sprout, IndianRupee, CloudSun, Languages } from 'lucide-react';
import { APP_ROUTES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: t('navHome'), path: APP_ROUTES.HOME },
    { icon: Sprout, label: t('navWork'), path: APP_ROUTES.ACTIVITY },
    { icon: Mic, label: t('navSpeak'), path: APP_ROUTES.VOICE, isMain: true },
    { icon: IndianRupee, label: t('navMoney'), path: APP_ROUTES.FINANCE },
    { icon: CloudSun, label: t('navPlan'), path: APP_ROUTES.SCHEMES },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sprout className="w-8 h-8" />
          {t('appName')}
        </h1>
        
        {/* Language Switcher */}
        <div className="relative group">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-green-800 text-white text-sm rounded-lg px-2 py-1 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none pl-8 cursor-pointer"
          >
            <option value={Language.HINDI}>हिंदी</option>
            <option value={Language.MARATHI}>मराठी</option>
            <option value={Language.ENGLISH}>Eng</option>
          </select>
          <Languages className="w-4 h-4 absolute left-2 top-1.5 pointer-events-none text-green-200" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] h-20 flex justify-around items-center z-20">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full relative ${
              isActive(item.path) && !item.isMain ? 'text-green-700 font-bold' : 'text-gray-500'
            }`}
          >
            {item.isMain ? (
              <div className="absolute -top-8 bg-orange-500 p-4 rounded-full shadow-lg border-4 border-white text-white transform active:scale-95 transition-transform">
                <item.icon className="w-8 h-8" />
              </div>
            ) : (
              <item.icon className="w-6 h-6 mb-1" />
            )}
            <span className={`text-xs ${item.isMain ? 'mt-8 font-bold text-orange-600' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
