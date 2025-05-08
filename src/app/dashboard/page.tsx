"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import StakingBanner from "@/components/StakingBanner";
import { useLanguage } from "@/context/LanguageContext";

// Define interfaces
interface VestingStatus {
  airdropAmount: number;
  claimedAmount: number;
  claimable: number;
  vestingStart: string | number | Date;
  cliftEnd: string | number | Date;
  vestingEnd: string | number | Date;
  staking?: boolean;
  stakingRewardUSDT?: number;
  usdtReward?: number;
}

interface StakingStatus {
  isStaking: boolean;
  stakedAmount: number;
  stakingStartDate: Date | null;
  stakingEndDate: Date | null;
  stakingRewardUSDT: number;
  airdropMultiplier: number;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [status, setStatus] = useState<VestingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalTasks, setTotalTasks] = useState(5);
  const [completedTasks, setCompletedTasks] = useState(2);
  const [mounted, setMounted] = useState(false);
  const [stakingStatus, setStakingStatus] = useState<StakingStatus | null>(null);
  const [estimatedReward, setEstimatedReward] = useState(0);
  const { translations } = useLanguage();

  useEffect(() => {
    setMounted(true);
    
    // Fetch status when connected
    if (isConnected && address) {
      fetchStatus(address);
      fetchStakingStatus(address);
    }
  }, [isConnected, address]);

  const fetchStatus = async (addr: string | undefined) => {
    if (!addr) {
      setError("Wallet address not found");
      setLoading(false);
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        setStatus({
          airdropAmount: 100000,
          claimedAmount: 10000,
          claimable: 5000,
          vestingStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          cliftEnd: new Date(Date.now()).toISOString(),
          vestingEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),  
          staking: true,
          usdtReward: 10,
          stakingRewardUSDT: 10,
        });
        setLoading(false);
      }, 1000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to fetch status";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchStakingStatus = async (addr: string | undefined) => {
    if (!addr) return;
    
    try {
      // Simulate API call to staking platform
      setTimeout(() => {
        setStakingStatus({
          isStaking: true,
          stakedAmount: 50000,
          stakingStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          stakingEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          stakingRewardUSDT: 10,
          airdropMultiplier: 2
        });
      }, 1200);
    } catch (e) {
      console.error("Failed to fetch staking status:", e);
    }
  };

  const handleClaim = async () => {
    if (!status || status.claimable <= 0) return;
    
    setClaiming(true);
    setError("");
    setSuccess("");
    
    try {
      // Simulate API call for claim
      setTimeout(() => {
        setSuccess(`Successfully claimed ${status.claimable} PEPE!`);
        setStatus(prev => {
          if (!prev) return null;
          return {
            ...prev,
            claimedAmount: prev.claimedAmount + prev.claimable,
            claimable: 0
          };
        });
        setClaiming(false);
      }, 2000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to claim tokens";
      setError(errorMessage);
      setClaiming(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {/* Staking Banner */}
      {isConnected && stakingStatus && (
        <div className="animate-fade-in" style={{animationDelay: "0.1s"}}>
          <StakingBanner 
            currentReward={estimatedReward} 
            isStaking={stakingStatus.isStaking} 
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{animationDelay: "0.2s"}}>
        <div className="glassmorphism rounded-xl p-4 card-hover">
          <p className="text-xs text-[#FFC452] mb-1 font-semibold">{translations.dashboard.totalPoints}</p>
          <p className="font-bold text-2xl text-[#FFC452] drop-shadow-[0_0_8px_#FFC452]">
            {completedTasks * 50}
          </p>
        </div>
        <div className="glassmorphism rounded-xl p-4 card-hover">
          <p className="text-xs text-[#5D4FFF] mb-1 font-semibold">{translations.dashboard.tasksCompleted}</p>
          <p className="font-bold text-2xl text-[#5D4FFF] drop-shadow-[0_0_8px_#5D4FFF]">
            {completedTasks}/{totalTasks}
          </p>
        </div>
      </div>

      {/* Airdrop Status */}
      <div className="glassmorphism rounded-xl p-6 animate-fade-in" style={{animationDelay: "0.3s"}}>
        <h2 className="text-xl font-bold mb-4">{translations.dashboard.airdropStatus}</h2>
        
        {!isConnected ? (
          <div className="text-center py-6">
            <p className="text-gray-300 mb-4">{translations.dashboard.connectToView}</p>
            <button
              onClick={() => open()}
              className="connect-button px-6 py-3 hover:scale-105 transition-transform shadow-lg"
            >
              {translations.common.connectWallet}
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-[#5D4FFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center backdrop-blur-md">
            <p>{error}</p>
            <button
              onClick={() => address && fetchStatus(address)}
              className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              {translations.common.tryAgain ?? "Try Again"}
            </button>
          </div>
        ) : status ? (
          <div className="space-y-4">
            {success && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 mb-4 backdrop-blur-md animate-fade-in-scale">
                <p className="text-green-400 text-center">{success}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glassmorphism rounded-lg p-3 card-hover">
                <p className="text-xs text-gray-300">{translations.dashboard.totalAllocation}</p>
                <p className="text-xl font-bold text-white">
                  {status.airdropAmount} PEPE
                  {stakingStatus?.isStaking && (
                    <span className="text-xs text-[#5D4FFF] ml-1">(2x Boost)</span>
                  )}
                </p>
              </div>
              <div className="glassmorphism rounded-lg p-3 card-hover">
                <p className="text-xs text-gray-300">{translations.dashboard.claimed}</p>
                <p className="text-xl font-bold text-white">{status.claimedAmount} PEPE</p>
              </div>
            </div>
            
            <div className="glassmorphism rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-300">{translations.dashboard.vestingProgress}</p>
                <p className="text-sm font-medium">
                  {Math.round((status.claimedAmount / status.airdropAmount) * 100)}%
                </p>
              </div>
              <div className="w-full h-2 bg-[#14192E]/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF7361] to-[#FFC452]"
                  style={{ width: `${(status.claimedAmount / status.airdropAmount) * 100}%` }}
                ></div>
              </div>
              
              <div className="mt-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{translations.dashboard.vestingStart}</span>
                  <span>{new Date(status.vestingStart).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{translations.dashboard.cliffEnd}</span>
                  <span>{new Date(status.cliftEnd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{translations.dashboard.vestingEnd}</span>
                  <span>{new Date(status.vestingEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {status.staking && (
              <div className="glassmorphism rounded-lg p-4 border border-[#5D4FFF]/50 bg-[#14192E]/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#5D4FFF]">{translations.dashboard.stakingBonus}</p>
                    <p className="text-sm font-medium">+{status.usdtReward || status.stakingRewardUSDT} USDT Rewards</p>
                  </div>
                  <div className="w-8 h-8 bg-[#5D4FFF]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#5D4FFF] text-xl">✓</span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleClaim}
              disabled={claiming || status.claimable <= 0}
              className="w-full py-3 rounded-lg text-center font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
              style={{
                background: status.claimable > 0 
                  ? "linear-gradient(90deg, #FF7361 0%, #FFC452 100%)" 
                  : "rgba(26, 31, 48, 0.6)",
                backdropFilter: status.claimable <= 0 ? "blur(5px)" : "none",
                color: status.claimable > 0 ? "black" : "rgb(156, 163, 175)"
              }}
            >
              {claiming 
                ? <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                    {translations.dashboard.processing}
                  </span>
                : status.claimable > 0 
                  ? (translations.dashboard.claimNow || "Claim {0} PEPE").replace('{0}', status.claimable.toString())
                  : translations.dashboard.nothingToClaim
              }
            </button>
          </div>
        ) : null}
      </div>

      {/* Task Progress */}
      <div className="glassmorphism rounded-xl p-6 animate-fade-in" style={{animationDelay: "0.4s"}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{translations.dashboard.taskProgress}</h2>
          <Link href="/tasks" className="text-sm text-[#FFC452] hover:underline">{translations.dashboard.viewAll}</Link>
        </div>
        
        {/* Task list content would be here */}
        <div className="space-y-2">
          {/* Example task item - you can map through actual tasks here */}
          <div className="flex items-center justify-between p-3 bg-[#14192E]/50 backdrop-blur-sm rounded-lg hover:bg-[#14192E]/70 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1A1F30]/70 backdrop-blur-sm rounded-full flex items-center justify-center text-lg">
                🐦
              </div>
              <span className="text-sm">{translations.tasks.taskTypes.twitterFollow}</span>
            </div>
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{animationDelay: "0.5s"}}>
        <Link href="/checkin" className="glassmorphism rounded-xl p-4 flex flex-col items-center justify-center card-hover">
          <div className="w-10 h-10 mb-2 rounded-full bg-[#14192E]/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <p className="text-sm font-medium">{translations.dashboard.dailyCheckIn}</p>
        </Link>
        
        <a 
          href={process.env.NEXT_PUBLIC_STAKING_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="glassmorphism rounded-xl p-4 flex flex-col items-center justify-center card-hover"
        >
          <div className="w-10 h-10 mb-2 rounded-full bg-[#14192E]/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <p className="text-sm font-medium">{translations.dashboard.stakeEarn}</p>
        </a>
      </div>
    </div>
  );
}
