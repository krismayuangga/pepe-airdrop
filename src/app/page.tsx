"use client";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./home.module.css";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const router = useRouter();
  const { translations } = useLanguage();
  
  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  const features = [
    {
      title: "Complete Tasks",
      description: "Earn points by completing simple tasks",
      icon: "🎯"
    },
    {
      title: "Claim Rewards",
      description: "Collect points and earn PEPE tokens",
      icon: "💰"
    },
    {
      title: "Join Community",
      description: "Interact with the PEPE Tubes community",
      icon: "👥"
    },
    {
      title: "Bonus Rewards",
      description: "Get bonuses by referring your friends",
      icon: "🚀"
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/wallpepe.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-[#14192E]/60"></div>
      
      {/* Content container - centered vertically and horizontally */}
      <div className="relative z-10 text-center w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section - with responsive typography */}
        <div className="text-center space-y-4 md:space-y-6 w-full mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white drop-shadow-lg px-2">
            Welcome to PEPE Tubes Airdrop
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-lg mx-auto px-2">
            Complete tasks and earn PEPE tokens as airdrop rewards
          </p>
          
          <div className="mt-6 md:mt-8">
            {!isConnected ? (
              <button
                onClick={() => open()}
                className="connect-button px-6 py-3 md:px-8 md:py-4 text-base md:text-lg shadow-xl hover:scale-105 transition-transform"
                type="button"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => router.push('/tasks')}
                className="primary-button px-6 py-3 md:px-8 md:py-4 text-base md:text-lg shadow-xl hover:scale-105 transition-transform"
              >
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Features Section - Cards with better animations and transparency */}
        <div className="w-full px-2 md:px-4 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="hover:scale-[1.03] transition-all duration-300 border border-[#5D4FFF]/20 shadow-xl rounded-lg p-4 md:p-5 animate-fade-in"
                style={{ 
                  background: 'rgba(35, 40, 65, 0.25)',
                  backdropFilter: 'blur(8px)',
                  animation: `fadeIn 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                <div className="flex gap-4 items-start">
                  <div 
                    className="icon-container hover:scale-110 transition-transform duration-300"
                    style={{
                      background: 'rgba(20, 25, 46, 0.4)',
                      backdropFilter: 'blur(5px)',
                      boxShadow: '0 0 15px rgba(93, 79, 255, 0.2)'
                    }}
                  >
                    <span className="emoji">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2 text-white">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-gray-200">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add global keyframes for fadeIn animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
