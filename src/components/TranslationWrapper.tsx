"use client";
import React, { ReactNode } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TranslationWrapperProps {
  children: (translations: any) => ReactNode;
}

export default function TranslationWrapper({ children }: TranslationWrapperProps) {
  const { translations } = useLanguage();
  return <>{children(translations)}</>;
}
