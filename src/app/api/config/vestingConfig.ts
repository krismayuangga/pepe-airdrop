// Konfigurasi vesting dan reward airdrop
export const vestingConfig = {
  cliftPeriodDays: 30, // periode clift dalam hari
  vestingDurationDays: 60, // durasi vesting setelah clift (linear vesting)
  defaultAirdropRewardUSD: 20, // reward default dalam USD (ekuivalen PEPE)
  stakingBonusMultiplier: 2, // reward PEPE double jika staking
  usdtStakingReward: 10, // reward USDT fix jika staking (bisa diubah)
  // Anda bisa menambah parameter lain sesuai kebutuhan
};

// Fungsi untuk mengubah reward PEPE sesuai kurs
export function calculatePepeReward(usdAmount: number, pepePriceUSD: number) {
  return usdAmount / pepePriceUSD;
}
