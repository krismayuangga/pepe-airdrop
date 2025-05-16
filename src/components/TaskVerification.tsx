import React, { useState } from 'react';
import { tweetTemplates } from '@/config/socialLinks';
import Image from 'next/image';

export interface VerificationResult {
  success: boolean;
  message: string;
  points?: number;
  status?: 'pending' | 'verified' | 'rejected';
  proofUrl?: string; // Tambahkan ini agar bisa mengirim proof ke backend
}

interface TaskVerificationProps {
  taskId: string;
  onVerificationComplete: (result: VerificationResult) => void;
  onCancel: () => void;
}

export default function TaskVerification({
  taskId,
  onVerificationComplete,
  onCancel
}: TaskVerificationProps) {
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'initial' | 'completed' | 'verification'>('initial');
  
  // Tentukan jenis verifikasi berdasarkan taskId
  const isTwitterTask = taskId === 'twitter-follow' || taskId === 'twitter-post';
  const isTelegramTask = taskId === 'telegram-join';
  const isDiscordTask = taskId === 'discord-join';
  const isSwapTask = taskId === 'swap-tokens';
  const isTwitterPost = taskId === 'twitter-post';
  
  const handleAction = () => {
    if (isTwitterPost) {
      const tweetText = tweetTemplates.default;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      setStep('completed');
    } else {
      // Handle other actions...
      setStep('verification');
    }
  };
  
  const handleVerify = async () => {
    if (!proofUrl) {
      setError('Mohon masukkan URL atau username yang valid');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setTimeout(() => {
        let parsedProof = proofUrl;
        // Untuk twitter-follow, jika user memasukkan link profil, ambil username-nya
        if (taskId === 'twitter-follow') {
          // Support both twitter.com and x.com
          const match = proofUrl.match(/(?:twitter\.com|x\.com)\/(\w{1,15})/);
          if (match) parsedProof = match[1];
          // Jika ada @ di depan, hapus
          parsedProof = parsedProof.replace(/^@/, '');
        }
        if (isTwitterPost) {
          if (proofUrl.includes('twitter.com') || proofUrl.includes('x.com')) {
            onVerificationComplete({
              success: true,
              message: "Tweet berhasil diverifikasi!",
              points: 150,
              status: 'verified',
              proofUrl
            });
          } else {
            setError("URL tweet tidak valid. Pastikan URL berisi 'twitter.com' atau 'x.com'");
            setLoading(false);
          }
        } else if (isTelegramTask) {
          if (proofUrl && /^@?\w{5,}$/.test(proofUrl)) {
            onVerificationComplete({
              success: true,
              message: "Username Telegram valid!",
              points: 100,
              status: 'verified',
              proofUrl
            });
          } else {
            setError("Username Telegram tidak valid. Minimal 5 karakter, hanya huruf/angka/underscore.");
            setLoading(false);
          }
        } else if (isDiscordTask) {
          if (proofUrl && /^.{3,32}#[0-9]{4}$/.test(proofUrl)) {
            onVerificationComplete({
              success: true,
              message: "Username Discord valid!",
              points: 100,
              status: 'verified',
              proofUrl
            });
          } else {
            setError("Username Discord tidak valid. Format: username#1234");
            setLoading(false);
          }
        } else if (taskId === 'twitter-follow') {
          if (parsedProof && /^\w{3,15}$/.test(parsedProof)) {
            onVerificationComplete({
              success: true,
              message: "Username Twitter valid!",
              points: 100,
              status: 'verified',
              proofUrl: parsedProof
            });
          } else {
            setError("Username Twitter tidak valid.");
            setLoading(false);
          }
        } else {
          onVerificationComplete({
            success: true,
            message: "Tugas berhasil diverifikasi!",
            points: 100,
            status: 'verified',
            proofUrl
          });
        }
      }, 1500);
    } catch (err) {
      setError('Terjadi kesalahan saat verifikasi');
      console.error('Verification error:', err);
      setLoading(false);
    }
  };
  
  const getPlaceholderText = () => {
    if (isTwitterTask) return 'URL Tweet (contoh: https://twitter.com/... atau https://x.com/...)';
    if (isTelegramTask) return 'Username Telegram';
    if (isDiscordTask) return 'Username Discord';
    if (isSwapTask) return 'Transaction Hash';
    return 'Bukti penyelesaian tugas';
  };
  
  // Render komponen sesuai langkah yang sedang aktif
  if (step === 'initial' && isTwitterPost) {
    return (
      <div className="p-6 neon-card max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold mb-4">Bagikan di Twitter</h3>
        
        <div className="mb-6 p-3 bg-[#232841] rounded-lg">
          <p className="text-sm mb-2">Bagikan tentang PEPE Tubes di Twitter untuk mendapatkan poin:</p>
          <div className="p-3 border border-gray-700 rounded-lg bg-[#1c2032] text-sm">
            <p>{tweetTemplates.default}</p>
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <Image 
              src="/twitter-logo.png" 
              alt="Twitter" 
              width={64} 
              height={64} 
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/logopepetubes.png'; // Fallback image
              }}
            />
          </div>
        </div>
        
        <button
          onClick={handleAction}
          className="w-full py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a94da] mb-3"
        >
          Bagikan di Twitter
        </button>
        
        <button
          onClick={onCancel}
          className="w-full py-2 bg-[#232841] text-white rounded-lg hover:bg-[#2a304d]"
        >
          Batal
        </button>
      </div>
    );
  }
  
  if (step === 'completed' && isTwitterPost) {
    return (
      <div className="p-6 neon-card max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold mb-4">Tweet Dibagikan!</h3>
        
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p>Tweet telah dibagikan! Masukkan URL tweet untuk mengklaim poin Anda.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL Tweet</label>
            <input
              type="text"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full p-3 bg-[#232841] border border-gray-700 rounded-lg text-white"
              placeholder="contoh: https://twitter.com/... atau https://x.com/..."
            />
            <p className="mt-1 text-xs text-gray-400">Salin dan tempel URL tweet yang baru saja Anda posting</p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-[#232841] text-white rounded-lg hover:bg-[#2a304d]"
            >
              Batal
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || !proofUrl}
              className="flex-1 py-2 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Verifikasi...
                </span>
              ) : (
                "Verifikasi"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // UI default untuk langkah verifikasi atau tugas lainnya
  return (
    <div className="p-6 neon-card max-w-md w-full mx-auto">
      <h3 className="text-xl font-bold mb-4">Verifikasi Tugas</h3>
      
      {getTaskInstructions()}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{getPlaceholderText()}</label>
          <input
            type="text"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            className="w-full p-3 bg-[#232841] border border-gray-700 rounded-lg text-white"
            placeholder={getPlaceholderText()}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-[#232841] text-white rounded-lg hover:bg-[#2a304d]"
          >
            Batal
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 py-2 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Verifikasi...
              </span>
            ) : (
              "Verifikasi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
  
  function getTaskInstructions() {
    if (isTwitterTask && taskId === 'twitter-follow') {
      return (
        <div className="mb-4 p-3 bg-[#232841] rounded-lg text-sm">
          <p>Cara menyelesaikan tugas:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-400">
            <li>Kunjungi <a href="https://twitter.com/PepeTubes" target="_blank" rel="noopener noreferrer" className="text-[#FFC452] hover:underline">Twitter PepeTubes</a></li>
            <li>Follow akun tersebut</li>
            <li>Masukkan URL profil Twitter Anda di bawah ini</li>
          </ol>
        </div>
      );
    }
    
    if (isTelegramTask) {
      return (
        <div className="mb-4 p-3 bg-[#232841] rounded-lg text-sm">
          <p>Cara menyelesaikan tugas:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-400">
            <li>Kunjungi <a href="https://t.me/+3BONF0QHbr9iODU9" target="_blank" rel="noopener noreferrer" className="text-[#FFC452] hover:underline">Grup Telegram PepeTubes</a></li>
            <li>Gabung ke grup tersebut</li>
            <li>Masukkan username Telegram Anda di bawah ini</li>
          </ol>
        </div>
      );
    }
    
    if (isDiscordTask) {
      return (
        <div className="mb-4 p-3 bg-[#232841] rounded-lg text-sm">
          <p>Cara menyelesaikan tugas:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-400">
            <li>Kunjungi <a href="https://discord.gg/M3CcMr6NrG" target="_blank" rel="noopener noreferrer" className="text-[#FFC452] hover:underline">Discord PepeTubes</a></li>
            <li>Gabung ke server Discord</li>
            <li>Masukkan username Discord Anda di bawah ini</li>
          </ol>
        </div>
      );
    }
    
    return (
      <div className="mb-4 p-3 bg-[#232841] rounded-lg text-sm">
        <p>Masukkan URL atau username yang relevan setelah menyelesaikan tugas.</p>
      </div>
    );
  }
}
