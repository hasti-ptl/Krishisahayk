import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ClipboardList, TrendingUp, CloudRain } from 'lucide-react';
import { APP_ROUTES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
        <h2 className="text-xl font-bold text-orange-900 mb-2">{t('greeting')}</h2>
        <p className="text-orange-800">{t('prompt')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Main Action - Voice */}
        <button
          onClick={() => navigate(APP_ROUTES.VOICE)}
          className="col-span-2 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="bg-white/20 p-4 rounded-full">
            <Mic className="w-12 h-12" />
          </div>
          <span className="text-2xl font-bold">{t('voiceBtn')}</span>
          <span className="text-sm opacity-90">{t('voiceSub')}</span>
        </button>

        {/* Secondary Actions */}
        <DashboardCard 
          icon={<ClipboardList className="w-8 h-8 text-green-600" />} 
          title={t('diary')} 
          sub={t('diarySub')}
          onClick={() => navigate(APP_ROUTES.ACTIVITY)}
          color="bg-green-50"
        />
        
        <DashboardCard 
          icon={<TrendingUp className="w-8 h-8 text-blue-600" />} 
          title={t('finance')} 
          sub={t('financeSub')}
          onClick={() => navigate(APP_ROUTES.FINANCE)}
          color="bg-blue-50"
        />

        <DashboardCard 
          icon={<CloudRain className="w-8 h-8 text-indigo-600" />} 
          title={t('schemes')} 
          sub={t('schemesSub')}
          onClick={() => navigate(APP_ROUTES.SCHEMES)}
          color="bg-indigo-50"
          fullWidth
        />
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  sub: string;
  onClick: () => void;
  color: string;
  fullWidth?: boolean;
}> = ({ icon, title, sub, onClick, color, fullWidth }) => (
  <button 
    onClick={onClick}
    className={`${fullWidth ? 'col-span-2' : 'col-span-1'} ${color} p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-2 active:scale-95 transition-transform`}
  >
    {icon}
    <span className="font-bold text-lg text-gray-800">{title}</span>
    <span className="text-xs text-gray-500">{sub}</span>
  </button>
);

export default Home;
