"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useLanguage } from "@/context/LanguageContext";
import TaskVerification from "@/components/TaskVerification";

// Helper function untuk membuka social link
const openSocialLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Interface untuk Task
interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  icon: string;
  actionType: 'link' | 'verify' | 'custom' | 'tweet';
  actionUrl?: string;
  verificationRequired: boolean;
  proofRequired?: boolean;
  actionHandler?: () => Promise<void>;
}

// Interface untuk VerificationResult
interface VerificationResult {
  success: boolean;
  message: string;
  taskId?: string;
  points?: number;
  proofUrl?: string;
  verificationCode?: string;
}

// Interface untuk TaskConfig
interface TaskConfig {
  id: string;
  points: number;
  verificationRequired: boolean;
  proofRequired?: boolean;
  actionUrl?: string;
}

// Array taskConfigs
const taskConfigs: TaskConfig[] = [
  {
    id: "twitter-follow",
    points: 50,
    verificationRequired: true,
    actionUrl: "https://twitter.com/PepeTubes"
  },
  {
    id: "twitter-post",
    points: 75,
    verificationRequired: true,
    proofRequired: true,
    actionUrl: "https://twitter.com/intent/tweet"
  },
  {
    id: "telegram-join",
    points: 50,
    verificationRequired: true,
    actionUrl: "https://t.me/pepetubes"
  },
  {
    id: "discord-join",
    points: 50,
    verificationRequired: true,
    actionUrl: "https://discord.gg/pepetubes"
  },
  {
    id: "referral",
    points: 100,
    verificationRequired: true,
    proofRequired: false
  },
  {
    id: "staking",
    points: 200,
    verificationRequired: false,
    actionUrl: "https://app.pepetubes.io/stake"
  }
];

type TaskMapped = Task & { icon: string; actionType: Task["actionType"]; verificationRequired: boolean; proofRequired?: boolean; actionUrl?: string };

export default function TasksPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [tasks, setTasks] = useState<TaskMapped[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Add language hook
  const { translations } = useLanguage();

  const fetchTasks = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError("");
    try {
      // Ambil tasks dari backend dengan walletAddress
      const res = await fetch(`/api/tasks?walletAddress=${address}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      // Mapping: tambahkan icon dan actionType dari taskConfigs
      const mappedTasks: TaskMapped[] = data.map((task: Record<string, unknown>) => {
        const config = taskConfigs.find(cfg => cfg.id === task.id);
        // Default icon dan actionType jika tidak ditemukan
        let icon = "📝";
        let actionType: Task["actionType"] = "link";
        if (task.id === "twitter-follow") icon = "🐦";
        if (task.id === "twitter-post") icon = "📢";
        if (task.id === "telegram-join") icon = "📱";
        if (task.id === "discord-join") icon = "💬";
        if (task.id === "staking") icon = "🚀";
        if (task.id === "referral") icon = "👥";
        if (task.id === "staking-task") icon = "🚀";
        if (task.id === "share") icon = "🔗";
        if (task.id === "swap") icon = "💱";
        if (task.id === "invite") icon = "👫";
        if (task.id === "checkin") icon = "✅";
        if (task.id === "verify") icon = "🔍";
        if (task.id === "custom") icon = "⚡";
        if (config && config.actionUrl?.includes("twitter.com/intent/tweet")) actionType = "tweet";
        else if (task.id === "referral") actionType = "custom";
        else actionType = "link";
        return {
          ...task,
          icon,
          actionType,
          verificationRequired: config?.verificationRequired ?? false,
          proofRequired: config?.proofRequired ?? false,
          actionUrl: config?.actionUrl,
        };
      });
      setTasks(mappedTasks);
      setLoading(false);
      setTotalPoints(mappedTasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    setMounted(true);
    if (isConnected && address) {
      fetchTasks();
    }
  }, [isConnected, address, fetchTasks]);

  const handleTaskAction = async (task: Task) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      // For Twitter post task, show verification modal directly
      if (task.id === 'twitter-post') {
        // Share ke Twitter dulu, baru buka modal verifikasi
        if (task.actionUrl) {
          window.open(task.actionUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
        }
        setTimeout(() => {
          setVerifyingTaskId(task.id);
        }, 1000);
        return;
      }
      
      switch (task.actionType) {
        case 'link':
          if (task.actionUrl) {
            openSocialLink(task.actionUrl);
            if (task.verificationRequired) {
              setTimeout(() => {
                setVerifyingTaskId(task.id);
              }, 1000);
            } else {
              setTimeout(() => {
                completeTask(task.id);
              }, 2000);
            }
          }
          break;
        case 'tweet':
          if (task.actionUrl) {
            window.open(task.actionUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
            setTimeout(() => {
              setVerifyingTaskId(task.id);
            }, 1000);
          }
          break;
        case 'custom':
          if (task.actionHandler) {
            await task.actionHandler();
          }
          break;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred while performing the task";
      setError(errorMessage);
    }
  };
  
  // Add handler for verification results
  const handleVerificationComplete = (result: VerificationResult) => {
    if (result.success && verifyingTaskId) {
      // Kirim proof ke backend
      completeTask(verifyingTaskId, result);
      const message = `${result.message} +${result.points} points`;
      setSuccessMessage(message);
      setVerifyingTaskId(null);
    } else if (!result.success) {
      setError(result.message || "Verification failed. Please try again.");
    }
  };

  const completeTask = async (taskId: string, verificationResult?: VerificationResult) => {
    if (!isConnected || !address) {
      setError("Connect your wallet first");
      return;
    }
    setCompletingTask(taskId);
    setError("");
    try {
      // Siapkan proof sesuai jenis task
      type Proof = { tweetUrl?: string; twitterUsername?: string; telegramUsername?: string; discordUsername?: string; transactionHash?: string };
      let proof: Proof = {};
      if (verificationResult) {
        const safeProofUrl = verificationResult.proofUrl || "";
        if (taskId === 'twitter-post') proof = { tweetUrl: safeProofUrl };
        else if (taskId === 'twitter-follow') proof = { twitterUsername: safeProofUrl };
        else if (taskId === 'telegram-join') proof = { telegramUsername: safeProofUrl };
        else if (taskId === 'discord-join') proof = { discordUsername: safeProofUrl };
        else if (taskId === 'swap-tokens') proof = { transactionHash: safeProofUrl };
      }
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, taskId, proof }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to complete task");
      await fetchTasks();
      setCompletingTask(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete task");
      setCompletingTask(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{translations.tasks.title}</h1>
      <p className="text-gray-300">{translations.tasks.description}</p>
      
      {/* Points Summary */}
      <div className="glassmorphism rounded-xl p-4 animate-fade-in" style={{animationDelay: "0.1s"}}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300">{translations.tasks.pointsEarned}</p>
            <p className="text-2xl font-bold text-[#FFC452]">{totalPoints}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <Image
                src="/logopepetubes.png"
                alt="PEPE"
                width={48}
                height={48}
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-300">{translations.tasks.estimatedReward}</p>
              <p className="text-sm font-medium">{totalPoints * 100} PEPE</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet connection */}
      {!isConnected && (
        <div className="glassmorphism rounded-xl p-6 text-center animate-fade-in" style={{animationDelay: "0.2s"}}>
          <p className="mb-4 text-gray-300">{translations.tasks.connectToStart}</p>
          <button 
            onClick={() => open()}
            className="connect-button px-6 py-3 hover:scale-105 transition-transform shadow-lg"
          >
            {translations.common.connectWallet}
          </button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 backdrop-blur-md animate-fade-in">
          <p className="text-center">{error}</p>
        </div>
      )}
      
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="glassmorphism bg-green-500/10 border border-green-500/50 rounded-lg p-4 shadow-lg max-w-xs animate-fade-in-scale">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Task Verification Dialog */}
      {verifyingTaskId && address && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <TaskVerification
            taskId={verifyingTaskId}
            onVerificationComplete={handleVerificationComplete}
            onCancel={() => setVerifyingTaskId(null)}
          />
        </div>
      )}
      
      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#5D4FFF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div 
              key={task.id} 
              className="glassmorphism rounded-xl p-5 space-y-4 card-hover animate-fade-in"
              style={{animationDelay: `${0.1 + index * 0.1}s`}}
            >
              <div className="flex items-start gap-4">
                <div 
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: task.completed 
                      ? 'linear-gradient(to bottom right, #483CBB, #5D4FFF)' 
                      : 'rgba(26, 31, 48, 0.6)',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    fontSize: '24px'
                  }}>
                    {task.completed ? "✓" : task.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                  <div className="text-[#FFC452] text-sm mt-2 font-medium">+{task.points} points</div>
                </div>
              </div>
              
              {task.completed ? (
                <div className="bg-[#1A1F30]/60 backdrop-blur-sm p-3 rounded-lg text-center text-sm mt-4">
                  <span className="text-green-400 font-medium">Task Completed! 🎉</span>
                </div>
              ) : (
                <button
                  onClick={() => handleTaskAction(task)}
                  disabled={!isConnected || completingTask === task.id}
                  className="w-full py-3 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white rounded-lg disabled:opacity-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                >
                  {completingTask === task.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Complete Task"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Reward Info */}
      <div className="glassmorphism rounded-xl p-4 text-center text-sm text-gray-300 animate-fade-in" style={{animationDelay: "0.6s"}}>
        <p>Points earned from completing tasks will determine your airdrop allocation.</p>
        <p className="mt-1">More points = More PEPE tokens!</p>
      </div>
    </div>
  );
}
