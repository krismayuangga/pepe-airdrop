"use client";
import { useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation';

export default function Web3ModalButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { translations } = useLanguage();
  const router = useRouter();

  // Redirect jika sudah terkoneksi
  if (isConnected) {
    router.push('/dashboard');
    return null;
  }

  const handleClick = async () => {
    try {
      setIsLoading(true);
      console.log('Opening web3modal...');
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
      className="px-5 py-2 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
      type="button"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
          Loading...
        </span>
      ) : (
        translations.common.connectWallet
      )}
    </button>
  );
}
