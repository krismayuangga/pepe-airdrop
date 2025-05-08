"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enUS, zhCN } from '@/locales';

// Define available languages
export type Language = 'en' | 'zh';

// Define translations type structure
export type Translations = typeof enUS;

// Map of language codes to translation objects
const languageMap: Record<Language, Translations> = {
  'en': enUS,
  'zh': zhCN
};

// Define the context interface
interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  translations: enUS,
  setLanguage: () => {},
  availableLanguages: ['en', 'zh']
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get saved language from localStorage or use English as default
  const getSavedLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('pepe-tubes-language') as Language;
      if (savedLang && Object.keys(languageMap).includes(savedLang)) {
        return savedLang;
      }
    }
    
    return 'en'; // Default to English always
  };
  
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setLanguageState(getSavedLanguage());
    setMounted(true);
  }, []);
  
  // Update language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pepe-tubes-language', lang);
    }
  };
  
  // Get translations for current language
  const translations = languageMap[language];
  
  // List of available languages - Only English and Chinese
  const availableLanguages: Language[] = ['en', 'zh'];
  
  const value = {
    language,
    translations,
    setLanguage,
    availableLanguages
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
