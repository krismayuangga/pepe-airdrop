"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useLanguage } from "@/context/LanguageContext";

// Template untuk tweet
const tweetTemplates = {
  default: "https://twitter.com/intent/tweet?text=I'm%20participating%20in%20the%20%23PEPETUBES%20airdrop!%20Join%20now%20at%20https://airdrop.pepetubes.io",
  referral: (code: string) => `https://twitter.com/intent/tweet?text=I'm%20participating%20in%20the%20%23PEPETUBES%20airdrop!%20Join%20using%20my%20referral%20code%20${code}%20at%20https://airdrop.pepetubes.io/ref/${code}`
};

// Social media links
const socialLinks = {
  twitter: "https://twitter.com/PepeTubes",
  telegram: "https://t.me/pepetubes",
  discord: "https://discord.gg/pepetubes"
};

// App links
const appLinks = {
  staking: "https://app.pepetubes.io/stake"
};

// Simple logger
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}:`, error);
  },
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}:`, data);
  }
};

// Helper function untuk membuka social link
const openSocialLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Helper function untuk share di Twitter
const shareOnTwitter = (tweetUrl: string) => {
  window.open(tweetUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
};

// Dummy TaskVerification component
const TaskVerification = ({ taskId, walletAddress, onVerificationComplete, onCancel }: {
  taskId: string;
  walletAddress: string;
  onVerificationComplete: (result: VerificationResult) => void;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const handleVerify = () => {
    setVerifying(true);
    
    // Demo verification - in real app this would be API call
    setTimeout(() => {
      const taskConfig = taskConfigs.find(t => t.id === taskId);
      if (code === 'PEPETW2' || code === 'DEMO123') {
        onVerificationComplete({
          success: true,
          message: "Task verified successfully!",
          taskId,
          points: taskConfig?.points || 50
        });
      } else {
        onVerificationComplete({
          success: false,
          message: "Invalid verification code"
        });
      }
      setVerifying(false);
    }, 1500);
  };
  
  return (
    <div className="bg-[#232841] p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">Verify Task Completion</h3>
      <p className="mb-4 text-gray-400">Enter the verification code you received after completing the task.</p>
      
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter verification code"
        className="w-full px-4 py-2 bg-[#14192E] border border-[#5D4FFF]/30 rounded-lg mb-4"
      />
      
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-2 bg-[#14192E] text-gray-400 rounded-lg hover:bg-[#1B2136]"
        >
          Cancel
        </button>
        <button 
          onClick={handleVerify}
          disabled={!code || verifying}
          className="flex-1 py-2 bg-gradient-to-r from-[#5D4FFF] to-[#483CBB] text-white rounded-lg disabled:opacity-50"
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </div>
      
      <p className="mt-4 text-xs text-gray-400 text-center">
        For demo purposes, use code: <span className="text-[#FFC452]">PEPETW2</span>
      </p>
    </div>
  );
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

export default function TasksPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [currentVerifyingTask, setCurrentVerifyingTask] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Add language hook
  const { translations } = useLanguage();

  useEffect(() => {
    setMounted(true);
    
    if (isConnected && address) {
      fetchTasks();
    }
  }, [isConnected, address]);

  const fetchTasks = async () => {
    if (!address) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Simulasi API call untuk task listing
      setTimeout(() => {
        const demoTasks = [
          {
            id: "twitter-follow",
            title: "Follow PepeTubes on Twitter",
            description: "Follow our official Twitter account for the latest updates.",
            points: taskConfigs.find(t => t.id === "twitter-follow")?.points || 50,
            completed: false,
            icon: "🐦",
            actionType: 'link' as const,
            actionUrl: "https://twitter.com/PepeTubes",
            verificationRequired: true
          },
          {
            id: "twitter-post",
            title: "Share about PEPE Tubes on Twitter",
            description: "Share about PEPE Tubes Airdrop on your Twitter to earn points.",
            points: taskConfigs.find(t => t.id === "twitter-post")?.points || 100,
            completed: false,
            icon: "📢",
            actionType: 'tweet' as const,
            actionUrl: tweetTemplates.default,
            verificationRequired: true
          },
          {
            id: "telegram-join",
            title: "Join Telegram Group",
            description: "Join our active community on Telegram.",
            points: taskConfigs.find(t => t.id === "telegram-join")?.points || 50,
            completed: false,
            icon: "📱",
            actionType: 'link' as const,
            actionUrl: socialLinks.telegram,
            verificationRequired: true
          },
          {
            id: "discord-join",
            title: "Join Discord Server",
            description: "Join our Discord server to connect with other community members.",
            points: taskConfigs.find(t => t.id === "discord-join")?.points || 50,
            completed: false,
            icon: "💬",
            actionType: 'link' as const,
            actionUrl: socialLinks.discord,
            verificationRequired: true
          },
          {
            id: "staking-task",
            title: "Stake PEPE to Earn 2x Rewards",
            description: "Stake PEPE on our platform to receive 2x airdrop allocation plus fixed USDT rewards.",
            points: taskConfigs.find(t => t.id === "staking-task")?.points || 250,
            completed: false,
            icon: "🚀",
            actionType: 'link' as const,
            actionUrl: appLinks.staking,
            verificationRequired: true
          },
          {
            id: "referral",
            title: "Refer Friends",
            description: "Invite friends to join the airdrop program. Earn 20 points per referral.",
            points: 20,
            completed: false,
            icon: "👥",
            actionType: 'custom' as const,
            actionHandler: async () => handleReferralTask(),
            verificationRequired: false
          }
        ];
        
        // Cek localStorage untuk status tugas yang sudah diselesaikan
        if (typeof window !== 'undefined' && address) {
          const completedTasksKey = `completedTasks_${address.toLowerCase()}`;
          const savedTasks = localStorage.getItem(completedTasksKey);
          
          if (savedTasks) {
            try {
              const completedTaskIds = JSON.parse(savedTasks) as string[];
              demoTasks.forEach(task => {
                task.completed = completedTaskIds.includes(task.id);
              });
            } catch (e) {
              logger.error("Error parsing saved tasks", e);
            }
          }
        }
        
        // Alternatif: Gunakan type assertion pada array
        setTasks(demoTasks as Task[]);
        setLoading(false);
      }, 1000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load tasks";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleTaskAction = async (task: Task) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      // For Twitter post task, show verification modal directly
      if (task.id === 'twitter-post') {
        setVerifyingTaskId(task.id);
        return;
      }
      
      switch (task.actionType) {
        case 'link':
          if (task.actionUrl) {
            openSocialLink(task.actionUrl);
            
            if (task.verificationRequired) {
              // Show verification dialog after 1 second (giving time for user to open the link)
              setTimeout(() => {
                setVerifyingTaskId(task.id);
              }, 1000);
            } else {
              // Auto-complete tasks that don't need verification
              setTimeout(() => {
                completeTask(task.id);
              }, 2000);
            }
          }
          break;
          
        case 'tweet':
          if (task.actionUrl) {
            shareOnTwitter(task.actionUrl);
            
            if (task.verificationRequired) {
              setCurrentVerifyingTask(task.id);
              setShowVerification(true);
            } else {
              // Auto-complete tasks that don't need verification
              setTimeout(() => {
                completeTask(task.id);
              }, 2000);
            }
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
    setVerificationResult(result);
    
    if (result.success && verifyingTaskId) {
      completeTask(verifyingTaskId);
      
      // Show success notification
      const message = `${result.message} +${result.points} points`;
      setSuccessMessage(message);
      
      // Hide modal
      setVerifyingTaskId(null);
    } else if (!result.success) {
      setError(result.message || "Verification failed. Please try again.");
    }
  };

  const handleReferralTask = async () => {
    if (!address) return;
    
    // Generate referral link with user's address
    const referralCode = address.slice(2, 8);
    const referralLink = `${window.location.origin}/ref/${referralCode}`;
    
    // Create dialog to display referral link
    const referralMessage = `Your referral code: ${referralCode}\nLink: ${referralLink}\n\nShare this link with your friends to earn 20 points per referral!`;
    
    // Using native prompt for simplicity, in real implementation use a better UI modal
    alert(referralMessage);
    
    // Create tweet with referral
    const referralTweet = tweetTemplates.referral(referralCode);
    const shareTweet = confirm("Do you want to share your referral on Twitter?");
    
    if (shareTweet) {
      shareOnTwitter(referralTweet);
    }
    
    // Mark task as completed
    completeTask("referral");
  };

  const verifyTaskCompletion = () => {
    if (!currentVerifyingTask || !verificationCode) return;
    
    // In a real implementation, this would send verification code to API
    // to verify whether the user actually completed the task
    
    // For demo, we pretend to verify with a simple code "PEPE123"
    if (verificationCode === "PEPE123") {
      completeTask(currentVerifyingTask);
      setShowVerification(false);
      setVerificationCode("");
      setCurrentVerifyingTask(null);
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  const completeTask = async (taskId: string) => {
    if (!isConnected || !address) {
      setError("Connect your wallet first");
      return;
    }

    setCompletingTask(taskId);
    setError("");
    
    try {
      // Simulasi API call untuk menandai task sebagai selesai
      setTimeout(() => {
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === taskId ? {...task, completed: true} : task
          );
          
          // Simpan status ke localStorage
          if (typeof window !== 'undefined') {
            const completedTaskIds = updatedTasks
              .filter(task => task.completed)
              .map(task => task.id);
              
            
            const completedTasksKey = `completedTasks_${address.toLowerCase()}`;
            localStorage.setItem(completedTasksKey, JSON.stringify(completedTaskIds));
          }
          
          return updatedTasks;
        });
        
        setCompletingTask(null);
      }, 1000);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to complete task";
      setError(errorMessage);
      setCompletingTask(null);
    }
  };

  // Definisi style inline untuk emoji
  const emojiStyle = {
    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: '24px',
    fontStyle: 'normal',
    lineHeight: 1,
    display: 'inline-block'
  };

  // Definisi style untuk icon container
  const iconContainerStyle = {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Definisi style untuk task card
  const taskCardStyle = {
    backgroundColor: '#232841',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    border: '1px solid #232841',
    transition: 'all 0.2s ease',
    marginBottom: '1rem'
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
            walletAddress={address}
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
