"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
// Menghapus import yang tidak digunakan
// import { http } from "wagmi";
import { bsc, mainnet } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";

// Project ID dari WalletConnect (harus valid untuk produksi)
const projectId = "52e6ed24ef2b6b9f9df7e7df2ef8f63f";

// Buat QueryClient dengan konfigurasi untuk produksi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

// Define task interface to fix type errors
interface Task {
  id: string | number;
  title: string;
  description: string;
  completed: boolean;
  points: number;
}

// Component state interfaces
interface ClientAppState {
  walletAddress: string | null;
  tasks: Task[];
  errorMessage: string | null;
  successMessage: string | null;
  activeTab: string;
  isConnecting: boolean;
  claimed: boolean;
  checkedIn: boolean;
  lastCheckIn: string | null;
}

// Define props for the ConnectButton component
interface ConnectButtonProps {
  onClick: () => void;
  isConnecting?: boolean;
}

// Custom Connect Wallet Button yang production-ready
const ConnectButton = ({ onClick, isConnecting = false }: ConnectButtonProps) => (
  <button
    className="px-4 py-2 bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-bold rounded-full shadow-md text-sm relative overflow-hidden"
    onClick={onClick}
    disabled={isConnecting}
  >
    {isConnecting ? (
      <>
        <span className="opacity-0">Connect Wallet</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
        </div>
      </>
    ) : (
      "Connect Wallet"
    )}
  </button>
);

export default function ClientApp({ children }: { children?: React.ReactNode }) {
  // State management with proper typing
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Ganti inisialisasi activeTab agar sinkron dengan pathname
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    if (pathname === "/referral") return "referral";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/tasks") return "tasks";
    if (pathname === "/checkin") return "checkin";
    if (pathname === "/claim") return "claim";
    if (pathname === "/leaderboard") return "leaderboard";
    return "dashboard";
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  // Add missing state variable for claim loading
  const [claimLoading, setClaimLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState<string[]>([]);
  const [rewardConfig, setRewardConfig] = useState<any>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [referralInput, setReferralInput] = useState(""); // Untuk input kode referral
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);

  const router = useRouter();
  // Tambahkan efek agar activeTab berubah saat pathname berubah (SPA navigation)
  useEffect(() => {
    if (pathname === "/referral") setActiveTab("referral");
    else if (pathname === "/dashboard") setActiveTab("dashboard");
    else if (pathname === "/tasks") setActiveTab("tasks");
    else if (pathname === "/checkin") setActiveTab("checkin");
    else if (pathname === "/claim") setActiveTab("claim");
    else if (pathname === "/leaderboard") setActiveTab("leaderboard");
    else setActiveTab("dashboard");
  }, [pathname]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Referensi slides yang sudah ada
  const slides = [
    {
      bgColor: "bg-gradient-to-r from-[#FFC452] to-[#FF7361]",
      title: "Pepe Tubes Airdrop",
      image: "/pepe-slider1.jpg",
    },
    {
      bgColor: "bg-gradient-to-r from-[#483CBB] to-[#5D4FFF]",
      title: "Complete Tasks & Earn",
      image: "/pepe-slider2.jpg",
    },
    {
      bgColor: "bg-gradient-to-r from-[#23B852] to-[#10A142]",
      title: "Daily Check-in Rewards",
      image: "/pepe-slider3.png",
    },
  ];

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true);

    // Auto-reconnect if wallet was previously connected
    const checkWalletConnection = async () => {
      try {
        // Check if any wallet is already connected
        const ethereum = window?.ethereum;
        if (ethereum && ethereum.selectedAddress) {
          setWalletAddress(ethereum.selectedAddress);
          setShowConnectWallet(false);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    checkWalletConnection();
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]); // Tambahkan slides.length ke dependency array

  // Fetch tasks data from API with proper error handling
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setErrorMessage("Failed to load tasks. Please try again later.");
      }
    };

    const fetchCheckin = async () => {
      try {
        if (!walletAddress) return;
        const res = await fetch(`/api/checkin?walletAddress=${walletAddress}`);
        if (!res.ok) throw new Error("Failed to fetch check-in data");
        const data = await res.json();
        setLastCheckIn(data.lastCheckIn);
        // JANGAN setCheckedIn di sini!
      } catch (error) {
        console.error("Error fetching check-in:", error);
      }
    };

    const fetchClaim = async () => {
      try {
        const res = await fetch("/api/claim");
        if (!res.ok) throw new Error("Failed to fetch claim data");
        const data = await res.json();
        setClaimed(data.rewardsClaimed);
      } catch (error) {
        console.error("Error fetching claim status:", error);
      }
    };

    const fetchBroadcasts = async () => {
      try {
        const res = await fetch("/api/admin/broadcast");
        if (!res.ok) return;
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      } catch {}
    };

    const fetchRewardConfig = async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (!res.ok) return;
        const data = await res.json();
        setRewardConfig(data);
      } catch {}
    };

    const fetchReferrals = async () => {
      if (!walletAddress) return;
      const res = await fetch(`/api/referral?wallet=${walletAddress}`);
      if (!res.ok) return;
      const data = await res.json();
      setReferralCount(data.referrals?.length || 0);
    };
    if (!showConnectWallet) {
      fetchCheckin();
      fetchTasks();
      fetchClaim();
      fetchBroadcasts();
      fetchRewardConfig();
      fetchReferrals();
      const interval = setInterval(fetchBroadcasts, 30000);
      return () => clearInterval(interval);
    }
  }, [showConnectWallet, walletAddress]);

  // Reset checkedIn jika wallet berubah atau hari berganti
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastCheckIn !== today) {
      setCheckedIn(false);
    }
  }, [walletAddress, lastCheckIn]);

  // Production-ready task completion handler
  const completeTask = async (id: string | number) => {
    try {
      if (!walletAddress) {
        setErrorMessage("Please connect your wallet first");
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, taskId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete task");
      }

      // Update tasks state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      );

      setSuccessMessage("Task completed successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: unknown) {
      console.error("Error completing task:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Production-ready check-in handler
  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${walletAddress}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to check in");
      }

      const data = await res.json();
      if (data.success) {
        setCheckedIn(true);
        setLastCheckIn(data.date);
      } else {
        setErrorMessage(
          data.message || "Check-in failed. Please try again later."
        );
      }
    } catch (error: unknown) {
      console.error("Error checking in:", error);
      setErrorMessage(error instanceof Error ? error.message : "Check-in failed. Please try again.");
    }
  };

  // Production-ready claim handler
  const handleClaim = async () => {
    // Remove the check for web3Modal and isConnected as they're not defined
    if (!walletAddress) return;

    try {
      setClaimLoading(true);
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress, // Use walletAddress instead of address
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Replace toast with setSuccessMessage
        setSuccessMessage(data.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Replace toast with setErrorMessage
        setErrorMessage(data.message);
      }
    } catch (error: unknown) {
      // Properly type the error
      // Replace toast with setErrorMessage
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setClaimLoading(false);
    }
  };

  // Enhanced wallet connection with support for multiple connectors
  const connectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage("");

    try {
      // Gunakan Web3Modal untuk koneksi wallet
      if (typeof window !== 'undefined') {
        try {
          // Gunakan useWeb3Modal hook
          const web3Modal = document.getElementById('web3-modal');
          if (web3Modal) {
            // Trigger click pada modal
            web3Modal.click();
          } else {
            // Fallback ke metode manual
            if (window?.ethereum) {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              const account = accounts[0];
              setWalletAddress(account);
              setShowConnectWallet(false);
            } else {
              setErrorMessage("Please install MetaMask or use WalletConnect");
            }
          }
        } catch (error) {
          console.error("Error connecting to wallet:", error);
          setErrorMessage("Failed to connect wallet. Please try again.");
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setErrorMessage("Error connecting wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet handler
  const disconnectWallet = () => {
    setWalletAddress(null);
    setShowConnectWallet(true);
  };

  // Function to navigate between tabs using Next.js router
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);

    // For production, use route navigation for better SEO and performance
    switch (tab) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "tasks":
        router.push("/tasks");
        break;
      case "checkin":
        router.push("/checkin");
        break;
      case "claim":
        router.push("/claim");
        break;
      case "leaderboard":
        router.push("/leaderboard");
        break;
      default:
        router.push("/dashboard");
    }
  };

  // Ketika komponen belum mount, tampilkan loading
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B101F] text-white">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-t-4 border-[#FFC452] mx-auto"></div>
          <p>Loading Pepe Tubes Airdrop...</p>
        </div>
      </div>
    );
  }

  // Display error message if any
  const ErrorNotification = () =>
    errorMessage ? (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md text-center">
        <p>{errorMessage}</p>
        <button
          className="absolute top-1 right-1 text-xs"
          onClick={() => setErrorMessage("")}
        >
          ✕
        </button>
      </div>
    ) : null;

  // Tentukan apakah bottom navbar harus ditampilkan berdasarkan pathname
  const shouldShowNavbar = !pathname.startsWith('/api/') && pathname !== '/';

  // Tambahkan fungsi handleSubmitReferral sebelum return
  const handleSubmitReferral = async () => {
    if (!walletAddress || !referralInput) return;
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrer: referralInput, referred: walletAddress }),
      });
      const data = await res.json();
      if (data.success) {
        setReferralSuccess("Referral submitted!");
      } else {
        setReferralSuccess(data.message || "Failed to submit referral.");
      }
      setTimeout(() => setReferralSuccess(null), 3000);
    } catch {
      setReferralSuccess("Failed to submit referral.");
      setTimeout(() => setReferralSuccess(null), 3000);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {showConnectWallet ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B101F] text-white p-4 relative overflow-hidden">
          <div className="max-w-md w-full bg-[#14192E] bg-opacity-90 rounded-3xl p-6 shadow-lg backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-[#FFC452] opacity-20 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 bg-[#14192E] rounded-full flex items-center justify-center">
                      <Image
                        src="/logopepetubes.png"
                        alt="Pepe Tubes Logo"
                        width={70}
                        height={70}
                        className="rounded-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2 text-center">
                Pepe Tubes Airdrop
              </h1>
              <p className="text-gray-400 text-sm mb-6 text-center">
                Complete tasks, check-in daily and earn PEPE token rewards
              </p>

              {/* Slider in rectangular format - Only shown in welcome page */}
              <div className="w-full h-80 mb-4 relative overflow-hidden rounded-xl">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      currentSlide === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Ganti img dengan Image dari next/image */}
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain"
                      style={{ backgroundColor: "#14192E" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-lg font-bold text-white">{slide.title}</h3>
                      <p className="text-xs text-white opacity-80">
                        {index === 0
                          ? "Join our airdrop program today!"
                          : index === 1
                          ? "Earn points by completing tasks"
                          : "Check in daily for extra rewards"}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Slider navigation dots */}
                <div className="absolute bottom-2 right-3 flex justify-end space-x-1">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentSlide === index ? "bg-white" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Connect Wallet Button - Production Ready */}
              <div className="w-full flex justify-center my-4">
                <ConnectButton
                  onClick={connectWallet}
                  isConnecting={isConnecting}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                <a
                  href="https://pepetubes.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 bg-[#232841] rounded-xl text-gray-300 hover:bg-[#2A304D] transition-all"
                >
                  <span>Website</span>
                </a>
                <a
                  href="https://t.me/pepetubes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 bg-[#232841] rounded-xl text-gray-300 hover:bg-[#2A304D] transition-all"
                >
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#0B101F] text-white relative pb-6">
          <div className="max-w-md mx-auto p-4 pb-20 relative z-10">
            {/* Broadcast Announcement - letakkan di sini AGAR SELALU TAMPIL */}
            {broadcasts.length > 0 && (
              <div className="mb-4">
                {broadcasts.slice(-1).map((msg, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-[#5D4FFF] to-[#FFC452] text-black font-semibold rounded-lg px-4 py-3 mb-2 shadow-lg border border-[#5D4FFF]/30"
                  >
                    <span className="mr-2">📢</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Header dengan efek glass dan neon */}
            <div
              className="flex justify-between items-center mb-4 glass-nav border border-[#232841] shadow-lg"
              style={{
                boxShadow:
                  "0 2px 24px 0 #FFC45233, 0 1.5px 0 #5D4FFF33",
              }}
            >
              <div className="flex items-center">
                <div
                  className="w-10 h-10 bg-[#232841] rounded-full flex items-center justify-center mr-3 glow-anim"
                  style={{ boxShadow: "0 0 12px #FFC45288" }}
                >
                  <Image
                    src="/logopepetubes.png"
                    alt="Pepe Tubes Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-[#FFC452]">
                    Pepe Tubes
                  </h1>
                  <p className="text-xs text-[#5D4FFF] font-semibold">
                    Airdrop Program
                  </p>
                </div>
              </div>
              <button
                className="px-3 py-1 bg-[#232841] rounded-full border border-[#5D4FFF] text-[#FFC452] font-bold shadow-md text-xs"
                onClick={disconnectWallet}
              >
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "0x123...ABC"}
              </button>
            </div>

            {/* Stats Cards dengan efek glass dan neon */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className="bg-[#181C2F]/80 glass-nav rounded-2xl p-4 border border-[#FFC452] shadow-lg"
                style={{ boxShadow: "0 0 16px #FFC45255" }}
              >
                <p className="text-xs text-[#FFC452] mb-1 font-semibold">
                  Total Points
                </p>
                <p className="font-bold text-2xl text-[#FFC452] drop-shadow-[0_0_8px_#FFC452]">
                  {tasks
                    .filter((t) => t.completed)
                    .reduce((sum, t) => sum + t.points, 0)}
                </p>
              </div>
              <div
                className="bg-[#181C2F]/80 glass-nav rounded-2xl p-4 border border-[#5D4FFF] shadow-lg"
                style={{ boxShadow: "0 0 16px #5D4FFF55" }}
              >
                <p className="text-xs text-[#5D4FFF] mb-1 font-semibold">
                  Your Rank
                </p>
                <p className="font-bold text-2xl text-[#5D4FFF] drop-shadow-[0_0_8px_#5D4FFF]">
                  #{lastCheckIn ? "12" : "0"}
                </p>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {/* Airdrop Status Card dengan glass dan neon */}
                <div className="glass-nav bg-[#181C2F]/80 rounded-2xl p-4 border border-[#FFC452] shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-36 h-36 bg-gradient-to-br from-[#FF7361] to-[#FFC452] opacity-20 rounded-full blur-2xl"></div>
                  <h2 className="text-lg font-bold mb-2 text-[#FFC452] drop-shadow-[0_0_8px_#FFC452]">
                    Airdrop Status
                  </h2>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-400">Tasks Completed</span>
                      <span className="text-sm font-medium">
                        {tasks.filter((t) => t.completed).length}/{tasks.length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#232841] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF7361] to-[#FFC452] animate-pulse"
                        style={{
                          width: `${
                            (tasks.filter((t) => t.completed).length /
                              tasks.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="flex-1 py-2 glass-nav border border-[#5D4FFF] rounded-xl text-sm text-[#5D4FFF] font-bold hover:bg-[#232841]/80 hover:text-white transition-all shadow-md"
                    >
                      View Tasks
                    </button>
                    <button
                      onClick={() => setActiveTab("claim")}
                      className="flex-1 py-2 glass-nav border border-[#FFC452] rounded-xl text-sm text-[#FFC452] font-bold hover:bg-[#232841]/80 hover:text-white transition-all shadow-md"
                    >
                      Claim
                    </button>
                  </div>
                </div>
                {/* Daily Check-in Card dengan logo Pepe neon */}
                <div className="glass-nav bg-[#181C2F]/80 rounded-2xl p-4 border border-[#5D4FFF] shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#5D4FFF] drop-shadow-[0_0_8px_#5D4FFF]">
                      Daily Check-in
                    </h2>
                    <span className="text-xs bg-[#232841] rounded-full px-3 py-1 border border-[#FFC452] text-[#FFC452] font-bold shadow-sm">
                      {lastCheckIn ? "Completed Today" : "Not Checked In"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#5D4FFF] opacity-40 animate-pulse blur-2xl"></div>
                      <Image
                        src="/logopepetubes.png"
                        alt="Pepe Logo"
                        width={64}
                        height={64}
                        className="float-anim glow-anim drop-shadow-[0_0_16px_#FFC452]"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Last Check-in</p>
                      <p className="text-sm font-medium text-[#FFC452] drop-shadow-[0_0_8px_#FFC452]">
                        {lastCheckIn || "Never"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("checkin")}
                      className="py-2 px-4 glass-nav border border-[#5D4FFF] rounded-xl text-sm text-[#5D4FFF] font-bold hover:bg-[#232841]/80 hover:text-white transition-all shadow-md"
                    >
                      Check In
                    </button>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#14192E] rounded-2xl p-4">
                  <h2 className="text-lg font-bold mb-4">Leaderboard</h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FF7361] to-[#FFC452] rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">1</span>
                        </div>
                        <span className="text-sm font-medium">User123</span>
                      </div>
                      <span className="text-sm font-bold">150 pts</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#483CBB] to-[#5D4FFF] rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">2</span>
                        </div>
                        <span className="text-sm font-medium">User456</span>
                      </div>
                      <span className="text-sm font-bold">120 pts</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#232841] rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">3</span>
                        </div>
                        <span className="text-sm font-medium">User789</span>
                      </div>
                      <span className="text-sm font-bold">100 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Content */}
            {activeTab === "tasks" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4">Complete Tasks</h2>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-[#1A2038] p-3 rounded-xl"
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                            task.completed
                              ? "bg-gradient-to-br from-[#483CBB] to-[#5D4FFF]"
                              : "bg-[#2A304D]"
                          }`}
                        >
                          {task.completed ? "✓" : task.id}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">
                            {task.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            Earn {task.points} points
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => completeTask(task.id)}
                        disabled={task.completed}
                        className={`px-3 py-1 rounded-lg text-xs ${
                          task.completed
                            ? "bg-[#2A304D] text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black font-medium hover:opacity-90"
                        }`}
                      >
                        {task.completed ? "Completed" : "Complete"}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    Complete all tasks to maximize your rewards
                  </p>
                </div>
              </div>
            )}

            {/* Check-in Content */}
            {activeTab === "checkin" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4">Daily Check-in</h2>

                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-6">
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC452] to-[#FF7361] opacity-30 animate-pulse glow-anim`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/logopepetubes.png"
                        alt="Pepe Logo"
                        width={100}
                        height={100}
                        className="float-anim pulse-anim"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">
                    {checkedIn || lastCheckIn === today
                      ? `You've checked in today! Come back tomorrow for more rewards.`
                      : "Check in daily to earn rewards and keep your streak alive!"}
                  </p>

                  {/* Fixed Check-in button with proper type handling */}
                  <button
                    onClick={handleCheckIn}
                    disabled={checkedIn || lastCheckIn === today}
                    className={`w-full py-3 rounded-xl text-sm font-medium ${
                      checkedIn || lastCheckIn === today
                        ? "bg-[#232841] text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#483CBB] to-[#5D4FFF] hover:opacity-90"
                    }`}
                  >
                    {checkedIn || lastCheckIn === today
                      ? "Already Checked In"
                      : "Check In Now"}
                  </button>

                  <div className="mt-6 w-full">
                    <h3 className="text-sm font-medium mb-2">Check-in Streak</h3>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div
                          key={day}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            day <= 2
                              ? "bg-gradient-to-br from-[#483CBB] to-[#5D4FFF]"
                              : "bg-[#232841]"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Content */}
            {activeTab === "claim" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4">Claim Rewards</h2>

                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-6">
                    <div
                      className={`absolute inset-0 rounded-full ${
                        claimed
                          ? "bg-gradient-to-br from-[#23B852] to-[#10A142]"
                          : "bg-gradient-to-br from-[#FF7361] to-[#FFC452]"
                      } opacity-20 ${!claimed ? "animate-pulse" : ""}`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {claimed ? (
                        <span className="text-5xl">🎉</span>
                      ) : (
                        <span className="text-5xl">💰</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#232841] rounded-xl p-4 w-full mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Tasks Completed</span>
                      <span className="text-sm font-medium">
                        {tasks.filter((t) => t.completed).length}/{tasks.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Total Points</span>
                      <span className="text-sm font-medium">
                        {tasks
                          .filter((t) => t.completed)
                          .reduce((sum, t) => sum + t.points, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Estimated Rewards</span>
                      <span className="text-sm font-medium">
                        {(tasks
                          .filter((t) => t.completed)
                          .reduce((sum, t) => sum + t.points, 0) *
                          100)
                          .toLocaleString()}{" "}
                        PEPE
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={claimed || !tasks.some((t) => t.completed)}
                    className={`w-full py-3 rounded-xl text-sm font-medium ${
                      claimed
                        ? "bg-[#23B852] text-white cursor-not-allowed"
                        : !tasks.some((t) => t.completed)
                        ? "bg-[#232841] text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FF7361] to-[#FFC452] text-black hover:opacity-90"
                    }`}
                  >
                    {claimed
                      ? "Rewards Claimed"
                      : !tasks.some((t) => t.completed)
                      ? "Complete Tasks First"
                      : "Claim Rewards"}
                  </button>

                  {claimed && (
                    <p className="text-sm text-gray-400 mt-4 text-center">
                      You&apos;ve successfully claimed your rewards! The tokens will be sent to
                      your wallet within 24 hours.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Leaderboard Content */}
            {activeTab === "leaderboard" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4">Leaderboard</h2>

                <div className="space-y-4">
                  {/* Top 3 */}
                  <div className="flex justify-center items-end space-x-4 mb-6">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#483CBB] to-[#5D4FFF] rounded-full flex items-center justify-center mb-2">
                        <span className="text-lg font-bold">2</span>
                      </div>
                      <div className="w-16 h-20 bg-[#232841] rounded-t-xl flex flex-col items-center justify-end p-2">
                        <p className="text-xs font-medium truncate w-full text-center">
                          User456
                        </p>
                        <p className="text-xs text-gray-400">120 pts</p>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FF7361] to-[#FFC452] rounded-full flex items-center justify-center mb-2 relative">
                        <span className="text-xl font-bold">1</span>
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                          <span className="text-xl">👑</span>
                        </div>
                      </div>
                      <div className="w-20 h-24 bg-[#232841] rounded-t-xl flex flex-col items-center justify-end p-2">
                        <p className="text-xs font-medium truncate w-full text-center">
                          User123
                        </p>
                        <p className="text-xs text-gray-400">150 pts</p>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-[#232841] rounded-full flex items-center justify-center mb-2">
                        <span className="text-lg font-bold">3</span>
                      </div>
                      <div className="w-16 h-16 bg-[#232841] rounded-t-xl flex flex-col items-center justify-end p-2">
                        <p className="text-xs font-medium truncate w-full text-center">
                          User789
                        </p>
                        <p className="text-xs text-gray-400">100 pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Others */}
                  <div className="space-y-2">
                    {[4, 5, 6, 7, 8].map((rank) => (
                      <div
                        key={rank}
                        className="flex items-center justify-between bg-[#232841] rounded-lg p-3"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#1B1F33] rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-bold">{rank}</span>
                          </div>
                          <span className="text-sm font-medium">User{rank * 100}</span>
                        </div>
                        <span className="text-sm font-bold">
                          {150 - rank * 10} pts
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Your Position */}
                  <div className="mt-4 bg-[#232841] rounded-xl p-3 border border-[#5D4FFF]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#483CBB] to-[#5D4FFF] rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">12</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">You</span>
                          <span className="text-xs text-gray-400 block">
                            0x123...ABC
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold">75 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Content */}
            {activeTab === "referral" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4">Referral Program</h2>
                <div className="mb-3">
                  <span className="text-xs text-gray-400">Your referral link:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== "undefined" && walletAddress
                          ? `${window.location.origin}/?ref=${walletAddress}`
                          : ""
                      }
                      className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-xs"
                    />
                    <button
                      type="button"
                      className="px-2 py-1 bg-[#5D4FFF] text-white rounded text-xs"
                      onClick={() => {
                        if (typeof window !== "undefined" && walletAddress) {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${walletAddress}`);
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-[#FFC452] font-semibold">
                    Referrals: {referralCount}
                  </p>
                  <p className="text-xs text-gray-400">
                    Referral reward: {rewardConfig?.rewardPerReferral ?? 0} points per referral
                  </p>
                  <p className="text-xs text-gray-400">
                    Total referral reward: {(referralCount * (rewardConfig?.rewardPerReferral ?? 0)).toLocaleString()} points
                  </p>
                </div>
                {/* Input kode referral (jika user datang dari link referral) */}
                {!localStorage.getItem("referral_submitted") && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-400 mb-1">Have a referral code?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralInput}
                        onChange={e => setReferralInput(e.target.value)}
                        placeholder="Referrer wallet address"
                        className="flex-1 p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-xs"
                      />
                      <button
                        type="button"
                        className="px-2 py-1 bg-[#FFC452] text-black rounded text-xs font-bold"
                        onClick={() => {
                          handleSubmitReferral();
                          localStorage.setItem("referral_submitted", "1");
                        }}
                        disabled={!referralInput}
                      >
                        Submit
                      </button>
                    </div>
                    {referralSuccess && (
                      <div className="text-xs mt-1 text-green-400">{referralSuccess}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Navigation - Glassmorphism & Animated Icons */}
          {shouldShowNavbar && (
            <div className="fixed bottom-0 left-0 right-0 glass-nav py-2 px-4 z-20 bg-[#101426]/80 border-t border-[#232841] backdrop-blur-md shadow-2xl">
              <div className="max-w-md mx-auto flex justify-between">
                {/* Home */}
                <button
                  aria-label="Home"
                  onClick={() => navigateToTab("dashboard")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#FFC452]/60 ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-br from-[#FFC452] to-[#FF7361] shadow-[0_0_12px_#FFC45299] scale-110 ring-2 ring-[#FFC452]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <Image
                      src="/globe.svg"
                      alt="Home"
                      width={22}
                      height={22}
                      className={
                        activeTab === "dashboard"
                          ? "drop-shadow-[0_0_8px_#FFC452]"
                          : "opacity-70"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "dashboard"
                        ? "text-[#FFC452] drop-shadow-[0_0_6px_#FFC452]"
                        : "text-gray-400"
                    }`}
                  >
                    Home
                  </span>
                </button>
                {/* Tasks */}
                <button
                  aria-label="Tasks"
                  onClick={() => navigateToTab("tasks")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#5D4FFF]/60 ${
                      activeTab === "tasks"
                        ? "bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] shadow-[0_0_12px_#5D4FFF99] scale-110 ring-2 ring-[#5D4FFF]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <Image
                      src="/file.svg"
                      alt="Tasks"
                      width={22}
                      height={22}
                      className={
                        activeTab === "tasks"
                          ? "drop-shadow-[0_0_8px_#5D4FFF]"
                          : "opacity-70"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "tasks"
                        ? "text-[#5D4FFF] drop-shadow-[0_0_6px_#5D4FFF]"
                        : "text-gray-400"
                    }`}
                  >
                    Tasks
                  </span>
                </button>
                {/* Check-in */}
                <button
                  aria-label="Check-in"
                  onClick={() => navigateToTab("checkin")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#FFC452]/60 ${
                      activeTab === "checkin"
                        ? "bg-gradient-to-br from-[#FFC452] to-[#5D4FFF] shadow-[0_0_12px_#FFC45299] scale-110 ring-2 ring-[#FFC452]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <Image
                      src="/logopepetubes.png"
                      alt="Check-in"
                      width={22}
                      height={22}
                      className={
                        activeTab === "checkin"
                          ? "drop-shadow-[0_0_8px_#FFC452]"
                          : "opacity-70"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "checkin"
                        ? "text-[#FFC452] drop-shadow-[0_0_6px_#FFC452]"
                        : "text-gray-400"
                    }`}
                  >
                    Check-in
                  </span>
                </button>
                {/* Claim */}
                <button
                  aria-label="Claim"
                  onClick={() => navigateToTab("claim")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#23B852]/60 ${
                      activeTab === "claim"
                        ? "bg-gradient-to-br from-[#23B852] to-[#10A142] shadow-[0_0_12px_#23B85299] scale-110 ring-2 ring-[#23B852]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <span
                      className={
                        activeTab === "claim"
                          ? "text-2xl drop-shadow-[0_0_8px_#23B852]"
                          : "text-2xl opacity-70"
                      }
                      role="img"
                      aria-label="Claim"
                    >
                      💰
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "claim"
                        ? "text-[#23B852] drop-shadow-[0_0_6px_#23B852]"
                        : "text-gray-400"
                    }`}
                  >
                    Claim
                  </span>
                </button>
                {/* Leaderboard */}
                <button
                  aria-label="Leaderboard"
                  onClick={() => navigateToTab("leaderboard")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#5D4FFF]/60 ${
                      activeTab === "leaderboard"
                        ? "bg-gradient-to-br from-[#5D4FFF] to-[#483CBB] shadow-[0_0_12px_#5D4FFF99] scale-110 ring-2 ring-[#5D4FFF]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <Image
                      src="/window.svg"
                      alt="Leaderboard"
                      width={22}
                      height={22}
                      className={
                        activeTab === "leaderboard"
                          ? "drop-shadow-[0_0_8px_#5D4FFF]"
                          : "opacity-70"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "leaderboard"
                        ? "text-[#5D4FFF] drop-shadow-[0_0_6px_#5D4FFF]"
                        : "text-gray-400"
                    }`}
                  >
                    Leaderboard
                  </span>
                </button>
                {/* Referral */}
                <button
                  aria-label="Referral"
                  onClick={() => navigateToTab("referral")}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#FFC452]/60 ${
                      activeTab === "referral"
                        ? "bg-gradient-to-br from-[#FFC452] to-[#5D4FFF] shadow-[0_0_12px_#FFC45299] scale-110 ring-2 ring-[#FFC452]/80"
                        : "bg-[#181C2F]"
                    }`}
                  >
                    <Image
                      src="/user-plus.svg"
                      alt="Referral"
                      width={22}
                      height={22}
                      className={
                        activeTab === "referral"
                          ? "drop-shadow-[0_0_8px_#FFC452]"
                          : "opacity-70"
                      }
                    />
                  </div>
                  <span
                    className={`text-xs font-bold transition-all ${
                      activeTab === "referral"
                        ? "text-[#FFC452] drop-shadow-[0_0_6px_#FFC452]"
                        : "text-gray-400"
                    }`}
                  >
                    Referral
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </QueryClientProvider>
  );
}
