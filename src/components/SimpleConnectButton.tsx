"use client";
import { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useLanguage } from "@/context/LanguageContext";

export default function SimpleConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { translations } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (isConnected) return null;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      setIsConnecting(true);
      console.log('Opening web3modal from SimpleConnectButton');

      await open();
    } catch (error) {
      console.error('Failed to open web3modal:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className="px-3 py-1 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-full shadow-md text-xs hover:opacity-90 disabled:opacity-50"
      type="button"
    >
      {isConnecting ? "..." : translations?.common?.connectWallet || "Connect Wallet"}
    </button>
  );
}
