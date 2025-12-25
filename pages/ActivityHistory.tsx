import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Activity } from '../types';
import { Calendar, Sprout, Droplets, Scissors } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getActivities();
        // Sort by date desc
        setActivities(data.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('water') || t.includes('irrig')) return <Droplets className="text-blue-500" />;
    if (t.includes('cut') || t.includes('harvest')) return <Scissors className="text-orange-500" />;
    return <Sprout className="text-green-500" />;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{t('diary')}</h2>
      
      {loading ? (
        <div className="text-center py-10 text-gray-500">{t('loading')}</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-10 text-gray-400">{t('noData')}</div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-full">
                {getIcon(act.activity_type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-lg">{act.crop}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {act.date}
                  </span>
                </div>
                <p className="text-green-700 font-medium">{act.activity_type}</p>
                {act.area_acres && <p className="text-sm text-gray-500">{act.area_acres} {t('acres')}</p>}
                {act.notes && <p className="text-sm text-gray-400 mt-1 italic">"{act.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
