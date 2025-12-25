import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS[Language.ENGLISH]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.HINDI);

  const t = (key: keyof typeof TRANSLATIONS[Language.ENGLISH]) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS[Language.ENGLISH][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
