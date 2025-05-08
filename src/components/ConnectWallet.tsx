"use client";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [isLoading, setIsLoading] = useState(false);
  const { translations } = useLanguage();
  const router = useRouter();
  
  // Effect to redirect to dashboard when connected
  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      console.log("Opening web3modal from ConnectWallet component");
      await open();
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {isConnected ? (
        <button
          className="px-3 py-1 bg-[#232841] rounded-full border border-[#5D4FFF] text-[#FFC452] font-bold shadow-md text-xs"
          onClick={handleDisconnect}
          type="button"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : translations.common.disconnect}
        </button>
      ) : (
        <button
          className="px-3 py-1 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-full shadow-md text-xs relative cursor-pointer"
          onClick={handleConnect}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <span className="opacity-0">{translations.common.connectWallet}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            translations.common.connectWallet
          )}
        </button>
      )}
    </div>
  );
}
