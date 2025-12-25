import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WeatherData, Scheme } from '../types';
import { CloudRain, Info, Sprout, MapPin, Loader2, ChevronRight, Droplets, Thermometer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SchemesWeather: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weather' | 'schemes'>('weather');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [wData, sData] = await Promise.all([api.getWeatherData(), api.getSchemes()]);
        setWeatherData(wData);
        setSchemes(sData);
      } catch (e) {
        console.error("Data load failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getTranslatedCrop = (cropName: string) => {
    const key = `crop_${cropName}` as any;
    return t(key);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -mx-4 -mt-4 bg-gray-50">
      {/* Tab Header - Fixed at Top */}
      <div className="flex bg-white shadow-sm border-b sticky top-0 z-20">
        <button 
          onClick={() => setActiveTab('weather')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-4 ${activeTab === 'weather' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'}`}
        >
          {t('tabWeather')}
        </button>
        <button 
          onClick={() => setActiveTab('schemes')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-4 ${activeTab === 'schemes' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'}`}
        >
          {t('tabSchemes')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
        {activeTab === 'weather' ? (
          <>
            {/* Real-time Weather Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-1 text-blue-100 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{weatherData?.location_name || t('currentLocation')}</span>
                  </div>
                  <h2 className="text-6xl font-black flex items-start">
                    {weatherData?.current_temp}
                    <span className="text-3xl mt-2 font-light">°C</span>
                  </h2>
                </div>
                {weatherData?.current_icon && (
                  <div className="bg-white/10 p-2 rounded-3xl backdrop-blur-md shadow-inner">
                    <img src={weatherData.current_icon} alt="Weather" className="w-20 h-20" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-blue-50 capitalize">{weatherData?.current_condition}</p>
                <div className="flex gap-4">
                   <div className="text-center">
                     <span className="text-[10px] text-blue-200 block uppercase">Feels Like</span>
                     <span className="font-bold">{weatherData?.current_temp}°</span>
                   </div>
                </div>
              </div>
              
              {weatherData?.alerts.length ? (
                <div className="mt-6 bg-red-500/20 p-4 rounded-2xl border border-red-400/30 backdrop-blur-lg flex gap-3 items-center">
                  <div className="bg-red-500 p-2 rounded-xl">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium leading-tight">{weatherData.alerts[0].message}</p>
                </div>
              ) : null}
            </section>

            {/* 5-Day Horizontal Forecast */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  {t('fiveDayForecast')}
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Scroll Left ⮕</span>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                {weatherData?.forecast.map((day, idx) => (
                  <div key={idx} className={`min-w-[110px] p-5 rounded-3xl border shadow-sm flex flex-col items-center snap-start transition-all ${idx === 0 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-tighter mb-2 ${idx === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <img src={day.icon} alt="icon" className="w-12 h-12 mb-2" />
                    <span className="text-xl font-bold text-gray-800">{Math.round(day.temp_c)}°</span>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-500">
                      <Droplets className="w-3 h-3" /> {day.chance_of_rain}%
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Crop Recommendations - Translated */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-600" />
                {t('cropRec')}
              </h3>
              <div className="space-y-4">
                {weatherData?.recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98] ${
                    rec.suitability === 'High' ? 'bg-green-50/50 border-green-100' : 
                    rec.suitability === 'Medium' ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}>
                    <div className={`p-3 rounded-2xl ${
                      rec.suitability === 'High' ? 'bg-green-100 text-green-600' : 
                      rec.suitability === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-base">{getTranslatedCrop(rec.crop)}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                           rec.suitability === 'High' ? 'bg-green-600 text-white' : 
                           rec.suitability === 'Medium' ? 'bg-orange-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {rec.suitability === 'High' ? t('suitabilityHigh') : 
                           rec.suitability === 'Medium' ? t('suitabilityMed') : t('suitabilityLow')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic font-medium">"{rec.reason}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Schemes Tab Content */
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-1">
              <Info className="w-6 h-6 text-orange-500" />
              {t('tabSchemes')}
            </h3>
            <div className="space-y-4">
              {schemes.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group active:bg-gray-50 transition-all">
                  <div className="absolute -top-4 -right-4 p-6 text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
                    <Info className="w-24 h-24 rotate-12" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-3 pr-4 leading-tight">{s.name}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-1.5 text-green-700 font-extrabold text-xs uppercase tracking-widest group-hover:gap-2.5 transition-all">
                      More Info <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemesWeather;
