// In-memory store untuk data vesting user (mock)
export type UserVesting = {
  userAddress: string;
  tasksCompleted: boolean;
  checkinDays: number;
  airdropEligible: boolean;
  airdropAmount: number; // dalam PEPE
  vestingStart: Date | null;
  cliftEnd: Date | null;
  vestingEnd: Date | null;
  claimedAmount: number;
  staking: boolean;
  stakingAmount: number;
  usdtReward: number;
};

// Simpan data user vesting di memory
const userVestingStore: Record<string, UserVesting> = {};

export function getUserVesting(address: string): UserVesting | undefined {
  return userVestingStore[address.toLowerCase()];
}

export function setUserVesting(address: string, data: UserVesting) {
  userVestingStore[address.toLowerCase()] = data;
}

export function updateUserVesting(address: string, update: Partial<UserVesting>) {
  const user = getUserVesting(address);
  if (user) {
    userVestingStore[address.toLowerCase()] = { ...user, ...update };
  }
}

export function getAllUserVestings(): UserVesting[] {
  return Object.values(userVestingStore);
}
