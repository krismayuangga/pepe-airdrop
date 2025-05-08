"use client";
import { useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useLanguage } from "@/context/LanguageContext";

export default function HeaderConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { translations } = useLanguage();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      console.log('Opening web3modal from header...');
      await open();
    } catch (error) {
      console.error('Failed to open web3modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-3 py-1 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-full shadow-md text-xs cursor-pointer"
      type="button"
    >
      {isLoading ? "..." : translations.common.connectWallet}
    </button>
  );
}
