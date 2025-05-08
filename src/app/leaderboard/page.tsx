"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

interface LeaderboardEntry {
  address: string;
  points: number;
  rank: number;
  avatar?: string;
}

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Add language hook
  const { translations } = useLanguage();

  useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
    
    // Update countdown timer
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Example: 30 days from now
    
    const timer = setInterval(() => {
      const now = new Date();
      const distance = endDate.getTime() - now.getTime();
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (leaderboard.length > 0 && address) {
      const userPosition = leaderboard.find(entry => 
        entry.address.toLowerCase() === address.toLowerCase()
      );
      if (userPosition) {
        setUserRank(userPosition);
      } else {
        // If user not in top positions, create a mock entry
        setUserRank({
          address: address,
          points: Math.floor(Math.random() * 100) + 50,
          rank: Math.floor(Math.random() * 50) + 10
        });
      }
    }
  }, [leaderboard, address]);

  const fetchLeaderboard = async () => {
    try {
      // Simulasi fetch data
      setTimeout(() => {
        const mockData: LeaderboardEntry[] = [
          { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", points: 1450, rank: 1, avatar: "/avatar1.jpg" },
          { address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", points: 1380, rank: 2, avatar: "/avatar2.jpg" },
          { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", points: 1320, rank: 3, avatar: "/avatar3.jpg" },
          { address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", points: 1290, rank: 4 },
          { address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", points: 1240, rank: 5 },
          { address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", points: 1220, rank: 6 },
          { address: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372", points: 1190, rank: 7 },
          { address: "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678", points: 1180, rank: 8 },
          { address: "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7", points: 1160, rank: 9 },
          { address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C", points: 1140, rank: 10 },
        ];
        
        setLeaderboard(mockData);
        setLoading(false);
      }, 1000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load leaderboard";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Helper function to format wallet addresses
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
      <h1 className="text-2xl font-bold">{translations.leaderboard.title}</h1>
      <p className="text-gray-400">{translations.leaderboard.description}</p>
      
      {/* Countdown timer */}
      <div className="neon-card neon-card-accent p-4">
        <p className="text-sm text-center mb-2">Airdrop Round Ends In</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#232841] rounded-lg p-2 text-center">
            <p className="text-xl font-bold">{timeLeft.days}</p>
            <p className="text-xs text-gray-400">Days</p>
          </div>
          <div className="bg-[#232841] rounded-lg p-2 text-center">
            <p className="text-xl font-bold">{timeLeft.hours}</p>
            <p className="text-xs text-gray-400">Hours</p>
          </div>
          <div className="bg-[#232841] rounded-lg p-2 text-center">
            <p className="text-xl font-bold">{timeLeft.minutes}</p>
            <p className="text-xs text-gray-400">Min</p>
          </div>
          <div className="bg-[#232841] rounded-lg p-2 text-center">
            <p className="text-xl font-bold">{timeLeft.seconds}</p>
            <p className="text-xs text-gray-400">Sec</p>
          </div>
        </div>
      </div>
      
      {/* Top 3 */}
      {!loading && !error && (
        <div className="flex justify-around items-end pt-10 pb-6">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C0C0C0] to-[#E0E0E0] rounded-full flex items-center justify-center mb-2 border-4 border-[#232841]">
                <span className="text-lg font-bold text-gray-800">2</span>
              </div>
              <div className="w-20 h-24 bg-[#232841] rounded-t-xl flex flex-col items-center p-2">
                <p className="text-xs font-medium truncate w-full text-center">
                  {formatAddress(leaderboard[1].address)}
                </p>
                <p className="text-xl font-bold text-[#C0C0C0]">{leaderboard[1].points}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          )}
          
          {/* 1st Place */}
          {leaderboard[0] && (
            <div className="flex flex-col items-center -mt-8">
              <div className="absolute -mt-8 mb-2">
                <span className="text-2xl">👑</span>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mb-2 border-4 border-[#232841]">
                <span className="text-xl font-bold text-black">1</span>
              </div>
              <div className="w-24 h-28 bg-[#232841] rounded-t-xl flex flex-col items-center p-2">
                <p className="text-xs font-medium truncate w-full text-center">
                  {formatAddress(leaderboard[0].address)}
                </p>
                <p className="text-2xl font-bold text-[#FFD700]">{leaderboard[0].points}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          )}
          
          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#CD7F32] to-[#E8A44E] rounded-full flex items-center justify-center mb-2 border-4 border-[#232841]">
                <span className="text-lg font-bold text-gray-800">3</span>
              </div>
              <div className="w-20 h-24 bg-[#232841] rounded-t-xl flex flex-col items-center p-2">
                <p className="text-xs font-medium truncate w-full text-center">
                  {formatAddress(leaderboard[2].address)}
                </p>
                <p className="text-xl font-bold text-[#CD7F32]">{leaderboard[2].points}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#5D4FFF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p className="text-center">{error}</p>
        </div>
      ) : (
        <div className="neon-card p-4">
          <h2 className="font-medium mb-4">Rankings</h2>
          <div className="space-y-3">
            {leaderboard.slice(3).map((entry) => (
              <div 
                key={entry.address} 
                className="flex items-center justify-between p-3 bg-[#232841] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a304d] flex items-center justify-center font-medium">
                    {entry.rank}
                  </div>
                  <div>
                    <p className="text-sm">{formatAddress(entry.address)}</p>
                  </div>
                </div>
                <p className="font-bold">{entry.points}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* User's position */}
      {userRank && address && (
        <div className="neon-card p-4 border border-[#5D4FFF]">
          <h2 className="font-medium mb-3">Your Position</h2>
          <div className="flex items-center justify-between p-3 bg-[#232841] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] flex items-center justify-center font-medium">
                {userRank.rank}
              </div>
              <div>
                <p className="text-sm">You</p>
                <p className="text-xs text-gray-400">{formatAddress(userRank.address)}</p>
              </div>
            </div>
            <p className="font-bold">{userRank.points}</p>
          </div>
        </div>
      )}
      
      {/* Rewards info */}
      <div className="neon-card p-4">
        <h2 className="font-medium mb-3">Rewards Distribution</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Top 1-10</span>
            <span className="font-medium text-[#FFC452]">5,000 PEPE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Top 11-50</span>
            <span className="font-medium text-[#FFC452]">2,500 PEPE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Top 51-100</span>
            <span className="font-medium text-[#FFC452]">1,000 PEPE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Top 101-500</span>
            <span className="font-medium text-[#FFC452]">500 PEPE</span>
          </div>
        </div>
      </div>
    </div>
  );
}