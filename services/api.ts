import { CURRENT_FARMER_ID } from '../constants';
import { Activity, Transaction, WeatherAlert, Scheme, WeatherData, ForecastDay, CropRecommendation } from '../types';

const WEATHER_API_KEY = '384593258ce34c8b945115047250112';

const STORAGE_KEYS = {
  ACTIVITIES: 'krishi_activities',
  TRANSACTIONS: 'krishi_transactions',
  WEATHER_CACHE: 'krishi_weather_cache',
  LOCATION_CACHE: 'krishi_location_cache'
};

const getLocalData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalData = <T>(key: string, data: T) => {
  const current = getLocalData<T>(key);
  const updated = [data, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
};

// Crop Recommendation Logic with strict thresholds
const CROP_METADATA = [
  { crop: 'Rice', min_temp: 20, max_temp: 38, min_humidity: 60, rain_needed: true },
  { crop: 'Wheat', min_temp: 10, max_temp: 25, min_humidity: 40, rain_needed: false },
  { crop: 'Maize', min_temp: 18, max_temp: 27, min_humidity: 50, rain_needed: true },
  { crop: 'Sugarcane', min_temp: 21, max_temp: 35, min_humidity: 60, rain_needed: true },
  { crop: 'Cotton', min_temp: 21, max_temp: 30, min_humidity: 40, rain_needed: false },
  { crop: 'Pulses', min_temp: 18, max_temp: 30, min_humidity: 30, rain_needed: false },
];

const calculateCropRecommendations = (temp: number, humidity: number, rain: number): CropRecommendation[] => {
  return CROP_METADATA.map(meta => {
    let suitability: 'High' | 'Medium' | 'Low' = 'Low';
    let reasons: string[] = [];

    const tempOk = temp >= meta.min_temp && temp <= meta.max_temp;
    const humidityOk = humidity >= meta.min_humidity;
    const rainOk = meta.rain_needed ? rain > 0.1 : true; 

    if (tempOk && humidityOk && rainOk) suitability = 'High';
    else if (tempOk || (humidityOk && rainOk)) suitability = 'Medium';
    
    if (!tempOk) reasons.push(temp < meta.min_temp ? "Temperature too low" : "Temperature too high");
    if (!humidityOk) reasons.push("Humidity too low");
    if (meta.rain_needed && !rainOk) reasons.push("Needs rain");

    return {
      crop: meta.crop,
      suitability,
      reason: reasons.length > 0 ? reasons.join(", ") : "Ideal conditions"
    };
  }).sort((a, b) => (a.suitability === 'High' ? -1 : a.suitability === 'Medium' && b.suitability === 'Low' ? -1 : 1));
};

export const api = {
  postActivity: async (data: Partial<Activity>) => {
    const newActivity: Activity = {
      id: Date.now(),
      farmer_id: CURRENT_FARMER_ID,
      date: new Date().toISOString().split('T')[0],
      activity_type: data.activity_type || 'General',
      crop: data.crop || 'N/A',
      ...data
    };
    saveLocalData(STORAGE_KEYS.ACTIVITIES, newActivity);
    return { message: "Saved locally" };
  },
  
  getActivities: async () => {
    return getLocalData<Activity>(STORAGE_KEYS.ACTIVITIES);
  },

  postTransaction: async (data: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: Date.now(),
      farmer_id: CURRENT_FARMER_ID,
      date: new Date().toISOString().split('T')[0],
      type: data.type || 'EXPENSE',
      category: data.category || 'General',
      amount: data.amount || 0,
      ...data
    };
    saveLocalData(STORAGE_KEYS.TRANSACTIONS, newTransaction);
    return { message: "Saved locally" };
  },
  
  getTransactionSummary: async () => {
    const transactions = getLocalData<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const summary = transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') acc.total_income += curr.amount;
      else acc.total_expense += curr.amount;
      return acc;
    }, { total_income: 0, total_expense: 0, net_profit: 0 });
    
    summary.net_profit = summary.total_income - summary.total_expense;
    return summary;
  },

  getWeatherData: async (): Promise<WeatherData> => {
    let lat = 20.5937;
    let lon = 78.9629;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      localStorage.setItem(STORAGE_KEYS.LOCATION_CACHE, JSON.stringify({ lat, lon }));
    } catch (e) {
      const cachedLoc = localStorage.getItem(STORAGE_KEYS.LOCATION_CACHE);
      if (cachedLoc) {
        const parsed = JSON.parse(cachedLoc);
        lat = parsed.lat;
        lon = parsed.lon;
      }
    }

    try {
      // Fetch specifically for 5 days
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=yes`);
      if (!response.ok) throw new Error("Weather API failed");
      
      const data = await response.json();
      
      // Alerts
      const alerts: WeatherAlert[] = [];
      if (data.alerts && data.alerts.alert) {
        data.alerts.alert.forEach((a: any, i: number) => {
          alerts.push({ id: i, date: 'Now', message: a.headline, severity: 'high' });
        });
      }

      // Forecast mapping (exactly 5 days)
      const forecast: ForecastDay[] = data.forecast.forecastday.map((d: any) => ({
        date: d.date,
        temp_c: d.day.avgtemp_c,
        condition: d.day.condition.text,
        icon: d.day.condition.icon,
        chance_of_rain: d.day.daily_chance_of_rain,
        humidity: d.day.avghumidity
      }));

      const result: WeatherData = {
        location_name: data.location.name,
        current_temp: data.current.temp_c,
        current_condition: data.current.condition.text,
        current_icon: data.current.condition.icon,
        alerts,
        forecast,
        recommendations: calculateCropRecommendations(
          data.current.temp_c,
          data.current.humidity,
          data.current.precip_mm
        )
      };
      
      localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(result));
      return result;

    } catch (e) {
      const cached = localStorage.getItem(STORAGE_KEYS.WEATHER_CACHE);
      if (cached) return JSON.parse(cached);
      throw e;
    }
  },
  
  getSchemes: async () => {
    return [
      { id: 1, name: 'PM Kisan Samman Nidhi', description: 'Financial benefit of Rs. 6,000/- per year in three equal installments to all landholding farmer families.' },
      { id: 2, name: 'Pradhan Mantri Fasal Bima Yojana', description: 'Comprehensive insurance cover against failure of the crop thus helping in stabilizing the income of the farmers.' },
      { id: 3, name: 'Soil Health Card Scheme', description: 'Testing soil for nutrients and recommending appropriate dosage of fertilizers for better crop yields.' },
      { id: 4, name: 'Kisan Credit Card (KCC)', description: 'Timely and adequate credit support to farmers for their cultivation and other needs in a flexible and cost effective manner.' },
    ];
  },
};
