"use client";
import { useState, useCallback } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useLanguage } from "@/context/LanguageContext";

interface ConnectButtonProps {
  className?: string;
  variant?: 'default' | 'small' | 'large';
}

export default function ConnectButton({ className = "", variant = "default" }: ConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { open } = useWeb3Modal();
  const { translations } = useLanguage();

  // Styling variants
  const styles = {
    default: "px-5 py-2 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-lg",
    small: "px-3 py-1 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-full text-xs",
    large: "px-6 py-3 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-lg text-lg"
  };

  const handleConnectClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Connect button clicked");
    setIsConnecting(true);
    
    try {
      // Force window focus to make sure the modal appears
      if (typeof window !== 'undefined') {
        window.focus();
      }
      
      // Use setTimeout to ensure UI updates before web3modal opens
      setTimeout(async () => {
        try {
          await open();
        } catch (error) {
          console.error("Failed to open web3modal:", error);
        } finally {
          setIsConnecting(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error preparing to connect:", error);
      setIsConnecting(false);
    }
  }, [open]);

  return (
    <button
      onClick={handleConnectClick}
      disabled={isConnecting}
      className={`${styles[variant]} hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md ${className}`}
      type="button"
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
          <span>{translations?.common?.loading || "Loading..."}</span>
        </span>
      ) : (
        translations?.common?.connectWallet || "Connect Wallet"
      )}
    </button>
  );
}
