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
    twitterUsername?: string;
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
  'twitter-post': 'PEPETW2',
  'telegram-join': 'PEPETG',
  'discord-join': 'PEPEDC',
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
      case 'twitter-post': {
        // Validasi URL tweet
        const tweetUrl = proofData?.tweetUrl || '';
        if (tweetUrl && (tweetUrl.includes('twitter.com') || tweetUrl.includes('x.com'))) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Tweet berhasil diverifikasi!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "URL tweet tidak valid. Harus mengandung 'twitter.com' atau 'x.com'",
            status: 'rejected'
          };
        }
      }
      case 'telegram-join': {
        // Validasi username telegram
        const username = proofData?.telegramUsername || '';
        if (username && /^@?\w{5,}$/.test(username)) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Username Telegram valid!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Username Telegram tidak valid.",
            status: 'rejected'
          };
        }
      }
      case 'discord-join': {
        // Validasi username discord
        const username = proofData?.discordUsername || '';
        if (username && /^.{3,32}#[0-9]{4}$/.test(username)) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Username Discord valid!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Username Discord tidak valid. Format: username#1234",
            status: 'rejected'
          };
        }
      }
      case 'twitter-follow': {
        // Validasi username Twitter (contoh: @username atau username)
        const username = proofData?.twitterUsername || '';
        if (username && /^@?\w{3,15}$/.test(username)) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Username Twitter valid!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Username Twitter tidak valid.",
            status: 'rejected'
          };
        }
      }
      case 'swap-tokens': {
        // Validasi hash transaksi (64 karakter heksadesimal)
        const txHash = proofData?.transactionHash || '';
        if (/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
          markTaskAsCompleted(walletAddress, taskId);
          return {
            success: true,
            message: "Transaksi swap valid!",
            points: getPointsForTask(taskId),
            status: 'verified'
          };
        } else {
          return {
            success: false,
            message: "Hash transaksi tidak valid.",
            status: 'rejected'
          };
        }
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
          message: "Jenis tugas tidak dikenali atau belum diimplementasi validasinya",
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
