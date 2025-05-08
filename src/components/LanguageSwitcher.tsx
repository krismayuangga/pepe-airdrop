"use client";
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages, translations } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get language display name
  const getLanguageName = (langCode: string): string => {
    switch(langCode) {
      case 'en': return 'English';
      case 'zh': return '中文';
      default: return langCode.toUpperCase();
    }
  };

  // Get flag emoji based on language
  const getLanguageFlag = (langCode: string): string => {
    switch(langCode) {
      case 'en': return '🇺🇸';
      case 'zh': return '🇨🇳';
      default: return '🌐';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#232841] transition-colors"
      >
        <span>{getLanguageFlag(language)}</span>
        <span className="text-xs font-medium">{getLanguageName(language)}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-[#232841] border border-[#5D4FFF]/30 rounded-md shadow-lg py-1 z-50 min-w-32">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2A304D] transition-colors ${
                language === lang ? 'bg-[#2A304D]/50 font-medium' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{getLanguageFlag(lang)}</span>
                <span>{getLanguageName(lang)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
