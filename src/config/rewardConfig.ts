/**
 * Konfigurasi sistem reward dan vesting untuk airdrop PepeTubes
 */

export interface VestingConfig {
  vestingDurationDays: number;
  cliffPeriodDays: number;
  stakingMultiplier: number;
  standardRewardUSD: number;
  usdtStakingReward: number;
  referralRewardUSD: number;
  minTokenClaimUSD: number;
  tokenPerUSD: number;
}

export const vestingConfig: VestingConfig = {
  vestingDurationDays: 90, // 3 bulan
  cliffPeriodDays: 30, // 1 bulan
  stakingMultiplier: 2, // 2x reward untuk staker
  standardRewardUSD: 10, // $10 standard reward
  usdtStakingReward: 10, // $10 USDT reward tambahan untuk staker
  referralRewardUSD: 2, // $2 reward per referral
  minTokenClaimUSD: 5, // Minimum $5 untuk claim
  tokenPerUSD: 1000 // 1000 PEPE = $1 (contoh)
};

/**
 * Task types dan reward points
 */
export interface TaskConfig {
  id: string;
  title: string;
  description: string;
  points: number;
  usdValue: number;
  required: boolean;
}

export const taskConfigs: TaskConfig[] = [
  {
    id: "twitter-follow",
    title: "Follow PEPETubes on Twitter",
    description: "Follow our official Twitter account for the latest updates.",
    points: 100,
    usdValue: 2,
    required: true
  },
  {
    id: "twitter-post",
    title: "Share about PEPE Tubes on Twitter",
    description: "Share about PEPE Tubes Airdrop on your Twitter to earn points.",
    points: 150,
    usdValue: 3,
    required: false
  },
  {
    id: "telegram-join",
    title: "Join Telegram Group",
    description: "Join our active community on Telegram.",
    points: 100,
    usdValue: 2,
    required: true
  },
  {
    id: "discord-join",
    title: "Join Discord Server",
    description: "Join our Discord server to connect with other community members.",
    points: 100,
    usdValue: 2,
    required: true
  },
  {
    id: "staking-task",
    title: "Stake PEPE on Our Platform",
    description: "Stake PEPE on our platform to earn 2x airdrop rewards + USDT rewards.",
    points: 250,
    usdValue: 5,
    required: false
  }
];

/**
 * Fungsi untuk menghitung total nilai reward berdasarkan poin
 */
export function calculateRewardValue(points: number): number {
  // $1 per 50 points (contoh)
  return points / 50;
}

/**
 * Fungsi untuk menghitung jumlah token berdasarkan nilai USD
 */
export function calculateTokenAmount(usdValue: number): number {
  return usdValue * vestingConfig.tokenPerUSD;
}

/**
 * Fungsi untuk mengecek apakah user memenuhi syarat minimum
 */
export function isEligibleForAirdrop(completedTasks: string[]): boolean {
  const requiredTasks = taskConfigs.filter(task => task.required);
  return requiredTasks.every(task => completedTasks.includes(task.id));
}
