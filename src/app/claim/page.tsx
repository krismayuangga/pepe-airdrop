"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { formatTranslation } from "@/utils/translationHelper";

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [claimableReward, setClaimableReward] = useState(0);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Add language hook
  const { translations } = useLanguage();

  useEffect(() => {
    setMounted(true);
    
    // Check if user has already claimed or is eligible
    if (isConnected && address) {
      checkEligibility();
    }
  }, [isConnected, address]);

  const checkEligibility = async () => {
    if (!address) return;
    
    setIsChecking(true);
    setError("");
    
    try {
      // Simulasi API call
      setTimeout(() => {
        // Random value between 1000 and 5000
        const amount = Math.floor(Math.random() * 4000) + 1000;
        setClaimableReward(amount);
        setEligibilityChecked(true);
        setIsChecking(false);
      }, 1500);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to check eligibility";
      setError(errorMessage);
      setIsChecking(false);
    }
  };

  const handleClaim = async () => {
    if (!address || !claimableReward) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Simulasi API call
      setTimeout(() => {
        setRewardAmount(claimableReward);
        setClaimed(true);
        setLoading(false);
      }, 2000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to claim rewards";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{translations.claim.title}</h1>
      <p className="text-gray-300">{translations.claim.description}</p>
      
      <div className="glassmorphism rounded-xl p-6 animate-fade-in" style={{animationDelay: "0.1s"}}>
        {claimed ? (
          <div className="text-center space-y-6 animate-fade-in-scale">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#23B852] to-[#10A142] opacity-20"></div>
              <div className="flex items-center justify-center h-full">
                <span className="text-6xl animate-bounce">🎉</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2 text-green-400">{translations.claim.claimedSuccessfully}</h2>
              <p className="text-gray-300 mb-4">
                {formatTranslation(translations.claim.claimDesc, {amount: rewardAmount.toLocaleString()})}
              </p>
              
              <div className="glassmorphism rounded-lg p-4 border border-[#5D4FFF]/20">
                <p className="text-sm text-center mb-2">{translations.claim.tokensSentTo}</p>
                <p className="font-medium text-center break-all">{address}</p>
                <p className="text-xs text-gray-300 text-center mt-2">
                  {translations.claim.distributionNote}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <a 
                href={`https://bscscan.com/address/${address}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#FFC452] text-sm hover:underline"
              >
                {translations.claim.viewOnExplorer}
              </a>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-20 animate-pulse"></div>
              <div className="flex items-center justify-center h-full">
                <Image 
                  src="/logopepetubes.png" 
                  alt="PEPE" 
                  width={100} 
                  height={100}
                  className="rounded-full"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">{translations.claim.connectToClaim}</h2>
              <p className="text-gray-300 mb-4">
                {translations.claim.connectWalletDesc}
              </p>
              
              <button
                onClick={() => open()}
                className="w-full py-3 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-medium rounded-lg hover:opacity-90 hover:scale-[1.02] transition-transform shadow-lg"
              >
                {translations.common.connectWallet}
              </button>
            </div>
          </div>
        ) : isChecking ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center py-8">
              <div className="w-16 h-16 border-4 border-[#5D4FFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p>{translations.claim.checkingEligibility}</p>
          </div>
        ) : eligibilityChecked ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 backdrop-blur-md">
                <p className="text-center">{error}</p>
              </div>
            )}
            
            <div className="flex items-start gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-20"></div>
                <div className="flex items-center justify-center h-full">
                  <Image 
                    src="/logopepetubes.png" 
                    alt="PEPE" 
                    width={80} 
                    height={80}
                    className="rounded-full"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{translations.claim.yourRewards}</h2>
                <div className="glassmorphism rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{translations.claim.claimableAmount}</span>
                    <span className="font-bold text-xl text-[#FFC452]">
                      {claimableReward.toLocaleString()} PEPE
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-4">
                  {translations.claim.claimingWillTransfer}
                  <span className="block font-medium mt-1 text-white break-all">{address}</span>
                </p>
                
                <button
                  onClick={handleClaim}
                  disabled={loading || claimableReward <= 0}
                  className="w-full py-3 bg-gradient-to-r from-[#23B852] to-[#10A142] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 relative shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform disabled:hover:scale-100 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      {translations.claim.processingClaim}
                    </span>
                  ) : (
                    `${translations.common.claim} ${claimableReward.toLocaleString()} PEPE`
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-20 animate-pulse"></div>
              <div className="flex items-center justify-center h-full">
                <Image 
                  src="/logopepetubes.png" 
                  alt="PEPE" 
                  width={100} 
                  height={100}
                  className="rounded-full"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">{translations.claim.checkRewards}</h2>
              <p className="text-gray-300 mb-4">
                {translations.claim.checkEligibility}
              </p>
              
              <button
                onClick={checkEligibility}
                className="w-full py-3 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white font-medium rounded-lg hover:opacity-90 hover:scale-[1.02] transition-transform shadow-lg"
              >
                {translations.claim.checkEligibility}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Reward Info */}
      <div className="glassmorphism rounded-xl p-4 text-center animate-fade-in" style={{animationDelay: "0.3s"}}>
        <h3 className="font-medium mb-4">{translations.claim.earnMoreRewards}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="glassmorphism rounded-lg p-3 flex flex-col items-center card-hover">
            <span className="text-2xl mb-2">✅</span>
            <p>{translations.claim.completeTasks}</p>
          </div>
          <div className="glassmorphism rounded-lg p-3 flex flex-col items-center card-hover">
            <span className="text-2xl mb-2">📅</span>
            <p>{translations.claim.dailyCheckins}</p>
          </div>
          <div className="glassmorphism rounded-lg p-3 flex flex-col items-center card-hover">
            <span className="text-2xl mb-2">🏆</span>
            <p>{translations.claim.rankHigh}</p>
          </div>
        </div>
      </div>
    </div>
  );
}