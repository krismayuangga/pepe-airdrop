"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

// Higher Order Component to inject translations
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { translations: any }>
) {
  return function WithTranslation(props: P) {
    const { translations } = useLanguage();
    return <Component {...props} translations={translations} />;
  };
}
