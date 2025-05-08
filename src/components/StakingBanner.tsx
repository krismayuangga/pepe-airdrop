"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { getStakingDeepLink, estimateStakingRewards } from '@/services/stakingService';
import { vestingConfig } from '@/config/rewardConfig';
import { useLanguage } from '@/context/LanguageContext';
import { formatTranslation } from '@/utils/translationHelper';

interface StakingBannerProps {
  currentReward: number;
  isStaking: boolean;
}

export default function StakingBanner({ currentReward, isStaking }: StakingBannerProps) {
  const { address } = useAccount();
  const stakingUrl = address ? getStakingDeepLink(address) : process.env.NEXT_PUBLIC_STAKING_URL;
  const { translations } = useLanguage();
  
  const rewards = estimateStakingRewards(currentReward);
  
  return (
    <div className="glassmorphism rounded-xl p-4 sm:p-6 border border-[#5D4FFF]/30">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* Background pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-20 animate-pulse"></div>
          
          {/* Orbital animasi koin kecil */}
          <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '12s' }}>
            <div className="absolute -top-2 -left-2 w-5 h-5">
              <Image
                src="/logopepetubes.png"
                alt="Pepe Coin"
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
          </div>
          
          <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
            <div className="absolute -bottom-2 -right-2 w-5 h-5">
              <Image
                src="/logopepetubes.png"
                alt="Pepe Coin"
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
          </div>
          
          {/* Main Pepe Coin image */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] flex items-center justify-center">
            <div className="relative w-14 h-14 float-anim">
              <Image
                src="/logopepetubes.png"
                alt="Pepe Coin"
                width={56}
                height={56}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold mb-1">
            {isStaking 
              ? translations.staking.gettingBoost
              : translations.staking.boostRewards
            }
          </h3>
          
          <p className="text-sm text-gray-300 mb-3">
            {isStaking 
              ? formatTranslation(translations.staking.receivingRewards, { amount: vestingConfig.usdtStakingReward })
              : formatTranslation(translations.staking.stakeToReceive, { amount: vestingConfig.usdtStakingReward })
            }
          </p>
          
          <div className="glassmorphism rounded-lg p-3 mb-3 bg-[#14192E]/40">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-300">{translations.staking.standardReward}</p>
                <p className="font-medium">{rewards.pepeTokens.toLocaleString()} PEPE</p>
              </div>
              <div>
                <p className="text-gray-300">{translations.staking.withStaking}</p>
                <p className="font-bold text-[#FFC452] drop-shadow-[0_0_5px_#FFC45240]">{rewards.pepeTokensWithStaking.toLocaleString()} PEPE</p>
                <p className="text-xs text-[#5D4FFF] drop-shadow-[0_0_3px_#5D4FFF40]">+ {rewards.usdtReward} USDT</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isStaking && (
              <a 
                href={stakingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white text-center font-medium rounded-lg hover:scale-[1.02] transition-transform shadow-lg"
              >
                {translations.staking.stakeNow}
              </a>
            )}
            
            <a 
              href="https://app.pepetubes.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 glassmorphism bg-[#14192E]/50 text-white text-center font-medium rounded-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
            >
              <span>Platform Staking</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
