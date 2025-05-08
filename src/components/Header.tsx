"use client";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import dynamic from 'next/dynamic';

// Import tanpa SSR
const SimpleConnectButton = dynamic(() => import('./SimpleConnectButton'), {
  ssr: false,
});

export default function Header() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { translations } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#14192E]/80 border-b border-[#232841]/50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={isConnected ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-10 h-10 relative glow-anim">
            <Image 
              src="/logopepetubes.png" 
              alt="Pepe Tubes" 
              width={40} 
              height={40} 
              className="object-contain rounded-full"
              priority
            />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-[#FF7361] to-[#FFC452] bg-clip-text text-transparent">
              {translations.header.title}
            </h1>
            <p className="text-xs text-[#5D4FFF] -mt-1">{translations.header.subtitle}</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#232841] rounded-full border border-[#5D4FFF] text-[#FFC452] font-medium text-xs">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
            </div>
          ) : (
            <SimpleConnectButton />
          )}
        </div>
      </div>
    </header>
  );
}
