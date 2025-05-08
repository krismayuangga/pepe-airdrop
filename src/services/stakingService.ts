import { vestingConfig } from '@/config/rewardConfig';
import logger from '@/utils/logger';

export interface StakingStatus {
  isStaking: boolean;
  stakedAmount: number;
  stakingStartDate: Date | null;
  stakingEndDate: Date | null;
  stakingRewardUSDT: number;
  airdropMultiplier: number;
}

/**
 * Fungsi untuk mengecek status staking user dari platform staking
 */
export async function checkStakingStatus(walletAddress: string): Promise<StakingStatus> {
  try {
    // Ambil data dari API staking yang sudah ada
    const response = await fetch(`${process.env.NEXT_PUBLIC_STAKING_URL}/api/status?wallet=${walletAddress}`);
    
    // Jika response tidak ok, throw error
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      isStaking: data.isStaking || false,
      stakedAmount: data.stakedAmount || 0,
      stakingStartDate: data.stakingStartDate ? new Date(data.stakingStartDate) : null,
      stakingEndDate: data.stakingEndDate ? new Date(data.stakingEndDate) : null,
      stakingRewardUSDT: data.stakingRewardUSDT || vestingConfig.usdtStakingReward,
      airdropMultiplier: data.airdropMultiplier || vestingConfig.stakingMultiplier
    };
  } catch (error) {
    logger.error('Error checking staking status', error);
    
    // Return default values if API call fails
    return {
      isStaking: false,
      stakedAmount: 0,
      stakingStartDate: null,
      stakingEndDate: null,
      stakingRewardUSDT: 0,
      airdropMultiplier: 1
    };
  }
}

/**
 * Generate deep link ke platform staking untuk user
 */
export function getStakingDeepLink(walletAddress: string): string {
  const stakingUrl = process.env.NEXT_PUBLIC_STAKING_URL || 'https://app.pepetubes.io';
  return `${stakingUrl}/stake?address=${walletAddress}&source=airdrop`;
}

/**
 * Estimasi total reward untuk user yang melakukan staking
 */
export function estimateStakingRewards(baseRewardUSD: number): {
  standardReward: number;
  withStakingReward: number;
  usdtReward: number;
  pepeTokens: number;
  pepeTokensWithStaking: number;
} {
  const standardReward = baseRewardUSD;
  const withStakingReward = baseRewardUSD * vestingConfig.stakingMultiplier;
  const usdtReward = vestingConfig.usdtStakingReward;
  const pepeTokens = standardReward * vestingConfig.tokenPerUSD;
  const pepeTokensWithStaking = withStakingReward * vestingConfig.tokenPerUSD;
  
  return {
    standardReward,
    withStakingReward,
    usdtReward,
    pepeTokens,
    pepeTokensWithStaking
  };
}
