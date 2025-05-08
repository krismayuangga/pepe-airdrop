"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckinPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Add language hook
  const { translations } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
    if (isConnected && address) {
      checkLastCheckin();
    }
  }, [isConnected, address]);
  
  const checkLastCheckin = async () => {
    try {
      // Simulasi API call
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        const randomStreak = Math.floor(Math.random() * 5) + 1;
        
        setLastCheckIn(today);
        setCheckedIn(true);
        setStreak(randomStreak);
      }, 1000);
    } catch (error) {
      console.error("Error checking last check-in:", error);
    }
  };
  
  const handleCheckin = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // Simulasi API call
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        setCheckedIn(true);
        setLastCheckIn(today);
        setStreak(prev => prev + 1);
        setShowConfetti(true);
        setLoading(false);
        
        // Hide confetti after a few seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }, 1500);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
      <h1 className="text-2xl font-bold">{translations.checkin.title}</h1>
      <p className="text-gray-400">{translations.checkin.description}</p>
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Confetti animation could be added here with a library or custom CSS */}
              <div className="absolute top-1/4 left-1/4 text-6xl animate-bounce">🎉</div>
              <div className="absolute top-1/3 right-1/3 text-6xl animate-bounce animation-delay-200">🎊</div>
              <div className="absolute bottom-1/3 left-1/2 text-6xl animate-bounce animation-delay-400">🎉</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="neon-card neon-card-accent p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-6">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-30 ${checkedIn ? '' : 'animate-pulse'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/logopepetubes.png"
                alt="Pepe Logo"
                width={96}
                height={96}
                className="float-anim"
              />
            </div>
          </div>
          
          {!isConnected ? (
            <div className="text-center w-full">
              <p className="text-gray-400 mb-4">Connect your wallet to check in</p>
              <button
                onClick={() => open()}
                className="w-full py-3 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-medium rounded-lg hover:opacity-90"
              >
                Connect Wallet
              </button>
            </div>
          ) : checkedIn ? (
            <div className="text-center w-full">
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
                <span className="text-lg font-bold text-green-400">✓ Checked in today!</span>
                <p className="text-sm text-gray-400 mt-1">Come back tomorrow for more rewards</p>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-[#FFC452]">{streak} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last Check-in</p>
                  <p className="text-sm font-medium">{lastCheckIn || "Never"}</p>
                </div>
              </div>
              
              <div className="bg-[#232841] rounded-lg p-4">
                <p className="text-sm text-center mb-3">Streak Rewards</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded border border-[#232841] text-center">
                    <p className="text-xs text-gray-400">3 Days</p>
                    <p className="text-sm font-medium">+100 Points</p>
                  </div>
                  <div className="p-2 rounded border border-[#232841] text-center">
                    <p className="text-xs text-gray-400">7 Days</p>
                    <p className="text-sm font-medium">+300 Points</p>
                  </div>
                  <div className="p-2 rounded border border-[#232841] text-center">
                    <p className="text-xs text-gray-400">14 Days</p>
                    <p className="text-sm font-medium">+500 Points</p>
                  </div>
                  <div className="p-2 rounded border border-[#232841] text-center">
                    <p className="text-xs text-gray-400">30 Days</p>
                    <p className="text-sm font-medium">+1000 Points</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-center text-sm">{error}</p>
                </div>
              )}
              
              <p className="text-center text-gray-400 mb-6">
                Check in daily to earn points and keep your streak alive!
              </p>
              
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 relative"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Check in Now"
                )}
              </button>
              
              <div className="mt-6">
                <p className="text-sm font-medium mb-3 text-center">Check-in Streak</p>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div
                      key={day}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        day <= streak
                          ? "bg-gradient-to-br from-[#5D4FFF] to-[#483CBB]"
                          : "bg-[#232841]"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Extra Info */}
      <div className="neon-card p-4 text-center">
        <p className="text-sm text-gray-400">
          Daily check-ins increase your airdrop allocation. Don't break your streak!
        </p>
      </div>
    </div>
  );
}