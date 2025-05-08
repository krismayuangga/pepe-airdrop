"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { translations } = useLanguage();

  // Fungsi untuk menentukan apakah navigasi aktif
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-nav py-2 px-4 border-t border-[#232841] backdrop-blur-lg shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between">
        <Link href="/dashboard" className="flex flex-col items-center group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
            isActive('/dashboard') 
              ? "bg-gradient-to-br from-[#FFC452] to-[#FF7361] shadow-[0_0_12px_#FFC45299]" 
              : "bg-[#232841]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive('/dashboard') ? 'text-black' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-xs font-medium ${isActive('/dashboard') ? 'text-[#FFC452]' : 'text-gray-400'}`}>
            {translations.common.home}
          </span>
        </Link>

        <Link href="/tasks" className="flex flex-col items-center group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
            isActive('/tasks') 
              ? "bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] shadow-[0_0_12px_#5D4FFF99]" 
              : "bg-[#232841]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive('/tasks') ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span className={`text-xs font-medium ${isActive('/tasks') ? 'text-[#5D4FFF]' : 'text-gray-400'}`}>
            {translations.common.tasks}
          </span>
        </Link>

        <Link href="/checkin" className="flex flex-col items-center group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
            isActive('/checkin') 
              ? "bg-gradient-to-br from-[#FFC452] to-[#5D4FFF] shadow-[0_0_12px_#FFC45299]" 
              : "bg-[#232841]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive('/checkin') ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className={`text-xs font-medium ${isActive('/checkin') ? 'text-[#FFC452]' : 'text-gray-400'}`}>
            {translations.common.checkin}
          </span>
        </Link>

        <Link href="/claim" className="flex flex-col items-center group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
            isActive('/claim') 
              ? "bg-gradient-to-br from-[#23B852] to-[#10A142] shadow-[0_0_12px_#23B85299]" 
              : "bg-[#232841]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive('/claim') ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className={`text-xs font-medium ${isActive('/claim') ? 'text-[#23B852]' : 'text-gray-400'}`}>
            {translations.common.claim}
          </span>
        </Link>

        <Link href="/leaderboard" className="flex flex-col items-center group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
            isActive('/leaderboard') 
              ? "bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] shadow-[0_0_12px_#5D4FFF99]" 
              : "bg-[#232841]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive('/leaderboard') ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className={`text-xs font-medium ${isActive('/leaderboard') ? 'text-[#5D4FFF]' : 'text-gray-400'}`}>
            {translations.common.leaderboard}
          </span>
        </Link>
      </div>
    </div>
  );
}