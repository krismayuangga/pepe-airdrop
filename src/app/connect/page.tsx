"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function ConnectPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { translations } = useLanguage();

  useEffect(() => {
    setMounted(true);
    
    // Redirect to dashboard if already connected
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError("");
      await open();
      // The redirection happens automatically in the useEffect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      setError(errorMessage);
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#FFC452] mx-auto"></div>
          <p>{translations.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 mt-10">
      <div className="neon-card p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-[#FFC452] opacity-20 rounded-full animate-ping"></div>
            <div className="flex items-center justify-center h-full">
              <Image 
                src="/logopepetubes.png" 
                alt="Pepe Logo" 
                width={70} 
                height={70} 
                className="rounded-full"
              />
            </div>
          </div>
          
          <h1 className="text-xl font-bold mb-4 text-center">{translations.common.wallet}</h1>
          
          {error && (
            <div className="w-full p-3 mb-4 bg-red-500/20 border border-red-500 rounded-lg text-center">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {isConnected ? (
            <div className="w-full space-y-4">
              <div className="p-4 bg-[#232841] rounded-lg">
                <p className="text-sm text-gray-300 mb-1">{translations.common.wallet}:</p>
                <p className="font-medium text-[#FFC452] break-all">{address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => disconnect()}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  {translations.common.disconnect}
                </button>
                
                <Link href="/dashboard">
                  <button
                    className="w-full py-2 px-4 bg-[#5D4FFF] hover:bg-[#483CBB] text-white font-medium rounded-lg transition-colors"
                  >
                    {translations.common.home}
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <p className="text-sm text-gray-300 text-center mb-2">
                {translations.dashboard.connectToView}
              </p>
              
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-medium rounded-lg shadow-lg hover:opacity-90 relative"
              >
                {isConnecting ? (
                  <>
                    <span className="opacity-0">{translations.common.connectWallet}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  translations.common.connectWallet
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
