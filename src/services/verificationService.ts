import logger from "@/utils/logger";

export type VerificationType = 
  | 'twitter-follow' 
  | 'twitter-post' 
  | 'telegram-join' 
  | 'discord-join'
  | 'referral'
  | 'swap-tokens';

export interface VerificationRequest {
  taskId: string;
  walletAddress: string;
  proofData?: {
    tweetUrl?: string;
    screenshot?: string;
    telegramUsername?: string;
    discordUsername?: string;
    transactionHash?: string;
    verificationCode?: string;
    referralCode?: string;
  };
}

export interface VerificationResult {
  success: boolean;
  message: string;
  points?: number;
  status?: 'pending' | 'verified' | 'rejected';
}

// Konfigurasi kode verifikasi statis untuk demo
// Dalam implementasi sebenarnya, ini akan disimpan di database
const verificationCodes = {
  'twitter-follow': 'PEPETWT',
  'twitter-post': 'PEPETW2',
  'telegram-join': 'PEPETG',
  'discord-join': 'PEPEDC',
  'swap-tokens': 'PEPESWAP',
  'staking-task': 'PEPESTK'
};

// Untuk demo, kita simpan status tugas di memori
// Sebenarnya ini akan disimpan di database
const completedTasks: Record<string, string[]> = {};

/**
 * Verifikasi tugas berdasarkan jenis tugas dan data bukti
 */
export async function verifyTask(request: VerificationRequest): Promise<VerificationResult> {
  const { taskId, walletAddress, proofData } = request;
  
  // Cek jika tugas sudah selesai
  if (completedTasks[walletAddress]?.includes(taskId)) {
    return {
      success: false,
      message: "Tugas ini sudah diselesaikan sebelumnya",
      status: 'verified'
    };
  }
  
  try {
    // Strategi verifikasi berbeda berdasarkan jenis tugas
    switch (taskId) {
      case 'twitter-follow':
      case 'twitter-post':
      case 'telegram-join':
      case 'discord-join':
      case 'swap-tokens':
        // Verifikasi dengan kode verifikasi
        if (proofData?.verificationCode === verificationCodes[taskId as keyof typeof verificationCodes]) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Verifikasi berhasil!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Kode verifikasi tidak valid",
            status: 'rejected'
          };
        }
      
      case 'referral':
        // Verifikasi referral
        if (proofData?.referralCode) {
          const referrerAddress = proofData.referralCode; // Dalam implementasi sebenarnya, akan mengambil dari database
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: `Kode referral dari ${referrerAddress.slice(0, 6)}... berhasil digunakan`,
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Kode referral tidak valid",
            status: 'rejected'
          };
        }
        
      default:
        return {
          success: false,
          message: "Jenis tugas tidak dikenali",
          status: 'rejected'
        };
    }
  } catch (error) {
    logger.error(`Error verifying task ${taskId} for address ${walletAddress}`, error);
    return {
      success: false,
      message: "Terjadi kesalahan saat verifikasi",
      status: 'rejected'
    };
  }
}

/**
 * Menyimpan status penyelesaian tugas
 */
function markTaskAsCompleted(walletAddress: string, taskId: string): void {
  if (!completedTasks[walletAddress]) {
    completedTasks[walletAddress] = [];
  }
  
  if (!completedTasks[walletAddress].includes(taskId)) {
    completedTasks[walletAddress].push(taskId);
  }
}

/**
 * Mendapatkan jumlah poin untuk tugas tertentu
 */
function getPointsForTask(taskId: string): number {
  const pointsMap: Record<string, number> = {
    'twitter-follow': 50,
    'twitter-post': 100,
    'telegram-join': 50,
    'discord-join': 50,
    'referral': 20,
    'swap-tokens': 100
  };
  
  return pointsMap[taskId] || 10;
}

/**
 * Mendapatkan daftar tugas yang sudah diselesaikan oleh alamat dompet tertentu
 */
export function getCompletedTasks(walletAddress: string): string[] {
  return completedTasks[walletAddress] || [];
}

/**
 * Mendapatkan total poin yang sudah dikumpulkan oleh alamat dompet tertentu
 */
export function getTotalPoints(walletAddress: string): number {
  const completed = completedTasks[walletAddress] || [];
  return completed.reduce((total, taskId) => total + getPointsForTask(taskId), 0);
}

/**
 * Mendapatkan kode verifikasi untuk tugas tertentu
 * Dalam implementasi nyata, ini akan generate kode unik per pengguna
 */
export function getVerificationCode(taskId: string): string {
  return verificationCodes[taskId as keyof typeof verificationCodes] || '';
}
