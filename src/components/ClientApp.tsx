"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import TaskNotification from "./TaskNotification";

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
  url?: string;
  type?: 'follow' | 'share' | 'custom';
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

export default function ClientApp() {
  // State management with proper typing
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    if (pathname === "/referral") return "referral";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/tasks") return "tasks";
    if (pathname === "/checkin") return "checkin";
    if (pathname === "/claim") return "claim";
    if (pathname === "/leaderboard") return "leaderboard";
    if (pathname === "/notification") return "notification";
    return "dashboard";
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [broadcasts, setBroadcasts] = useState<string[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referralInput, setReferralInput] = useState(""); // Untuk input kode referral
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    key: number;
  } | null>(null);

  // State untuk riwayat notifikasi personal user
  const [userNotifications, setUserNotifications] = useState<Array<{
    message: string;
    type: 'success' | 'error' | 'info';
    time: string;
  }>>([]);

  // Tambahkan efek agar activeTab berubah saat pathname berubah (SPA navigation)
  useEffect(() => {
    if (pathname === "/referral") setActiveTab("referral");
    else if (pathname === "/dashboard") setActiveTab("dashboard");
    else if (pathname === "/tasks") setActiveTab("tasks");
    else if (pathname === "/checkin") setActiveTab("checkin");
    else if (pathname === "/claim") setActiveTab("claim");
    else if (pathname === "/leaderboard") setActiveTab("leaderboard");
    else if (pathname === "/notification") setActiveTab("notification");
    else setActiveTab("dashboard");
  }, [pathname]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(true);

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
        const res = await fetch("/api/broadcast");
        if (!res.ok) return;
        const data = await res.json();
        setBroadcasts((data.broadcasts || []).map((b: { message: string } | string) => typeof b === 'string' ? b : b.message));
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
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      );
      setToast({ message: 'Task berhasil diselesaikan!', type: 'success', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Task berhasil diselesaikan!', type: 'success', time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setToast({ message: 'Gagal menyelesaikan task', type: 'error', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Gagal menyelesaikan task', type: 'error', time: new Date().toLocaleString() },
        ...prev
      ]);
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
        setToast({ message: 'Check-in berhasil!', type: 'success', key: Date.now() });
        setUserNotifications((prev) => [
          { message: 'Check-in berhasil!', type: 'success', time: new Date().toLocaleString() },
          ...prev
        ]);
      } else {
        setErrorMessage(
          data.message || "Check-in failed. Please try again later."
        );
        setToast({ message: 'Check-in gagal', type: 'error', key: Date.now() });
        setUserNotifications((prev) => [
          { message: 'Check-in gagal', type: 'error', time: new Date().toLocaleString() },
          ...prev
        ]);
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Check-in failed. Please try again.");
      setToast({ message: 'Check-in gagal', type: 'error', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Check-in gagal', type: 'error', time: new Date().toLocaleString() },
        ...prev
      ]);
    }
  };

  // Production-ready claim handler
  const handleClaim = async () => {
    if (!walletAddress) return;
    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.message);
        setToast({ message: 'Claim reward gagal', type: 'error', key: Date.now() });
        setUserNotifications((prev) => [
          { message: 'Claim reward gagal', type: 'error', time: new Date().toLocaleString() },
          ...prev
        ]);
        return;
      }
      setClaimed(true);
      setToast({ message: 'Reward berhasil diklaim!', type: 'success', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Reward berhasil diklaim!', type: 'success', time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setToast({ message: 'Claim reward gagal', type: 'error', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Claim reward gagal', type: 'error', time: new Date().toLocaleString() },
        ...prev
      ]);
    }
  };

  // Enhanced wallet connection with support for multiple connectors
  const connectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage("");

    try {
      if (typeof window !== 'undefined') {
        try {
          const web3Modal = document.getElementById('web3-modal');
          if (web3Modal) {
            web3Modal.click();
          } else {
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
        setToast({ message: 'Referral berhasil dikirim!', type: 'success', key: Date.now() });
        setUserNotifications((prev) => [
          { message: 'Referral berhasil dikirim!', type: 'success', time: new Date().toLocaleString() },
          ...prev
        ]);
        setReferralInput(""); // reset input jika sukses
      } else {
        setReferralSuccess(data.message || "Failed to submit referral.");
        setToast({ message: data.message || 'Referral gagal', type: 'error', key: Date.now() });
        setUserNotifications((prev) => [
          { message: data.message || 'Referral gagal', type: 'error', time: new Date().toLocaleString() },
          ...prev
        ]);
      }
      setTimeout(() => setReferralSuccess(null), 3000);
    } catch {
      setReferralSuccess("Failed to submit referral.");
      setToast({ message: 'Referral gagal', type: 'error', key: Date.now() });
      setUserNotifications((prev) => [
        { message: 'Referral gagal', type: 'error', time: new Date().toLocaleString() },
        ...prev
      ]);
      setTimeout(() => setReferralSuccess(null), 3000);
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

  return (
    <QueryClientProvider client={queryClient}>
      {toast && (
        <TaskNotification
          key={toast.key}
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md text-center">
          <p>{errorMessage}</p>
          <button
            className="absolute top-1 right-1 text-xs"
            onClick={() => setErrorMessage("")}
          >
            ✕
          </button>
        </div>
      )}
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
            {broadcasts.length > 0 && activeTab !== "notification" && (
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
            {/* Notification Tab Content */}
            {activeTab === "notification" && (
              <div className="bg-[#14192E] rounded-2xl p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛎️</span> Notification
                </h2>
                {/* Notifikasi personal user */}
                {userNotifications.length > 0 && (
                  <div className="mb-6">
                    <div className="font-bold mb-2">Aktivitas Anda</div>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {userNotifications.map((notif, idx) => (
                        <li key={idx} className={`rounded-lg px-4 py-2 flex items-center gap-2 border ${notif.type === 'success' ? 'border-green-500/40 bg-green-500/10' : notif.type === 'error' ? 'border-red-500/40 bg-red-500/10' : 'border-blue-500/40 bg-blue-500/10'}`}>
                          <span>{notif.type === 'success' ? '✅' : notif.type === 'error' ? '❌' : 'ℹ️'}</span>
                          <span className="flex-1">{notif.message}</span>
                          <span className="text-xs text-gray-400">{notif.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Notifikasi broadcast admin */}
                <div className="font-bold mb-2">Broadcast Admin</div>
                {broadcasts.length === 0 ? (
                  <div className="text-gray-400 text-sm">No notifications yet.</div>
                ) : (
                  <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {broadcasts.slice().reverse().map((msg, idx) => (
                      <li
                        key={idx}
                        className="bg-gradient-to-r from-[#5D4FFF] to-[#FFC452] text-black font-semibold rounded-lg px-4 py-3 shadow border border-[#5D4FFF]/30 flex items-center gap-2"
                      >
                        <span>📢</span>
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* Render konten tab utama (dashboard, tasks, checkin, claim, referral, leaderboard) agar semua state dan handler digunakan */}
            {activeTab === "dashboard" && (
              <>
                {/* Broadcast terbaru tampil di atas dashboard */}
                {broadcasts.length > 0 && (
                  <div className="mb-4">
                    <div className="bg-gradient-to-r from-[#5D4FFF] to-[#FFC452] text-black font-semibold rounded-lg px-4 py-3 shadow-lg border border-[#5D4FFF]/30 flex items-center gap-2">
                      <span>📢</span>
                      <span>{broadcasts[broadcasts.length - 1]}</span>
                    </div>
                  </div>
                )}
                <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                  <h2 className="text-lg font-bold mb-2">Dashboard</h2>
                  <div className="mb-2">Total Points: <span className="font-bold">{tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0)}</span></div>
                  <div className="mb-2">Claimed: <span className="font-bold">{claimed ? "Yes" : "No"}</span></div>
                  <div className="mb-2">Checked In Today: <span className="font-bold">{checkedIn ? "Yes" : "No"}</span></div>
                  <div className="mb-2">Referral Count: <span className="font-bold">{referralCount}</span></div>
                </div>
              </>
            )}
            {activeTab === "tasks" && (
              <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Tasks</h2>
                <ul className="space-y-2">
                  {tasks.map(task => (
                    <li key={task.id} className="flex flex-row items-center justify-between gap-6 py-2">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold break-words">{task.title}</span>
                        <span className="text-xs text-gray-400 break-words">{task.description}</span>
                        {task.url && (
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline text-xs mt-1 w-fit focus:outline focus:outline-2"
                            tabIndex={0}
                            role="button"
                            style={{ pointerEvents: 'auto', zIndex: 2, display: 'inline-block' }}
                          >
                            {task.type === 'follow' ? 'Go to Follow' : task.type === 'share' ? 'Go to Share' : (task.url.includes('discord.gg') ? 'Go to Discord' : 'Go to Task')}
                          </a>
                        )}
                      </div>
                      <button
                        className={`px-2 py-1 rounded shrink-0 ${task.completed ? 'bg-green-600 text-white' : 'bg-[#FFC452] text-black'}`}
                        onClick={e => { e.stopPropagation(); completeTask(task.id); }}
                        disabled={task.completed}
                        style={{ zIndex: 1 }}
                        tabIndex={0}
                      >
                        {task.completed ? 'Completed' : 'Complete'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "checkin" && (
              <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Check-in</h2>
                <div className="mb-2">Last Check-in: <span className="font-bold">{lastCheckIn || "Never"}</span></div>
                <button className="px-4 py-2 bg-[#FFC452] text-black rounded" onClick={handleCheckIn} disabled={checkedIn}>Check In</button>
              </div>
            )}
            {activeTab === "claim" && (
              <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Claim</h2>
                <button className="px-4 py-2 bg-[#FFC452] text-black rounded" onClick={handleClaim} disabled={claimed}>Claim Rewards</button>
                {claimed && <div className="mt-2 text-green-400">Rewards claimed! Token will be sent to your wallet.</div>}
              </div>
            )}
            {activeTab === "referral" && (
              <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Referral</h2>
                {/* Kode referral user */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-bold">Your Referral Code:</span>
                  <span className="bg-[#232841] px-2 py-1 rounded text-xs select-all">{walletAddress || '-'}</span>
                  {walletAddress && (
                    <button
                      className="px-2 py-1 bg-[#FFC452] text-black rounded text-xs font-bold"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        setToast({ message: 'Referral code copied!', type: 'success', key: Date.now() });
                      }}
                    >Copy</button>
                  )}
                </div>
                {/* Link referral */}
                {walletAddress && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold">Referral Link:</span>
                    <span className="bg-[#232841] px-2 py-1 rounded text-xs select-all">{`https://airdrop.pepetubes.io/referral?code=${walletAddress}`}</span>
                    <button
                      className="px-2 py-1 bg-[#FFC452] text-black rounded text-xs font-bold"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://airdrop.pepetubes.io/referral?code=${walletAddress}`);
                        setToast({ message: 'Referral link copied!', type: 'success', key: Date.now() });
                      }}
                    >Copy Link</button>
                  </div>
                )}
                <div className="mb-2">Referral Count: <span className="font-bold">{referralCount}</span></div>
                <input
                  type="text"
                  className="px-2 py-1 rounded border border-gray-600 bg-[#232841] text-white mb-2"
                  value={referralInput}
                  onChange={e => setReferralInput(e.target.value)}
                  placeholder="Enter referral code"
                />
                <button className="px-4 py-2 bg-[#FFC452] text-black rounded" onClick={handleSubmitReferral}>Submit Referral</button>
                {referralSuccess && <div className="mt-2 text-green-400">{referralSuccess}</div>}
              </div>
            )}
            {activeTab === "leaderboard" && (
              <div className="bg-[#14192E] rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Leaderboard</h2>
                <div className="text-gray-400">(Leaderboard content placeholder)</div>
              </div>
            )}
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}
