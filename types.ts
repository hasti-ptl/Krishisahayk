export enum Language {
  HINDI = 'hi-IN',
  MARATHI = 'mr-IN',
  ENGLISH = 'en-US'
}

export interface Activity {
  id?: number;
  farmer_id: number;
  date: string;
  activity_type: string;
  crop: string;
  area_acres?: number;
  notes?: string;
}

export interface Transaction {
  id?: number;
  farmer_id: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  notes?: string;
}

export interface WeatherAlert {
  id: number;
  date: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ForecastDay {
  date: string;
  temp_c: number;
  condition: string;
  icon: string;
  chance_of_rain: number;
  humidity: number;
}

export interface CropRecommendation {
  crop: string;
  suitability: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface WeatherData {
  location_name: string;
  current_temp: number;
  current_condition: string;
  current_icon: string;
  alerts: WeatherAlert[];
  forecast: ForecastDay[];
  recommendations: CropRecommendation[];
}

export interface Scheme {
  id: number;
  name: string;
  description: string;
  deadline?: string;
}

export enum IntentType {
  ACTIVITY = 'ACTIVITY',
  TRANSACTION = 'TRANSACTION',
  SOIL_TEST = 'SOIL_TEST',
  QUERY = 'QUERY',
  UNKNOWN = 'UNKNOWN'
}

export interface ParsedIntent {
  intent: IntentType;
  confidence: number;
  data: {
    activity_type?: string;
    crop?: string;
    area?: number;
    amount?: number;
    transaction_type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: string;
    raw_text: string;
  };
  confirmation_message: string;
}
