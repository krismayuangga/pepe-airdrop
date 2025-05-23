"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

// Tambahkan tipe spesifik
interface Config {
  airdropStart: string;
  airdropEnd: string;
  rewardPerReferral: number;
  rewardPerCheckin: number;
  tokenPerUsd: number;
}
interface Vesting {
  cliff: number;
  duration: number;
}
interface PendingClaim {
  id: string;
  wallet: string;
  amount: number;
}
interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string; // e.g. 'follow', 'share', 'custom'
  url?: string;
}
interface LatestParticipant {
  walletAddress: string;
  taskId: string;
  completed: boolean;
  completedAt: string;
}
interface Stats {
  totalUsers: number;
  totalTasks: number;
  totalRewards: number;
  totalReferrals?: number;
  totalCheckins?: number;
  totalClaims?: number;
  airdropStart?: string;
  airdropEnd?: string;
  latestParticipants?: LatestParticipant[];
  tasks?: Task[];
}
interface LogEntry {
  message: string;
  timestamp?: string;
}

const ADMIN_KEY = "pepe_admin_token";

// Ganti x-admin-key dengan Authorization Bearer token admin
// Ambil token dari localStorage (ADMIN_KEY) jika ada
// Helper untuk header Authorization admin
const getAdminAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pepe_admin_token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return undefined;
};

export default function AdminPage() {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");

  // --- EXISTING STATE ---
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [config, setConfig] = useState<Config | null>(null);
  const [vesting, setVesting] = useState<Vesting | null>(null);
  const [status, setStatus] = useState("active");
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksMessage, setTasksMessage] = useState("");
  const [referralData, setReferralData] = useState<Array<{ referrer: string, referred: string | string[], createdAt?: string, rewarded?: boolean }>>([]);
  const [broadcasts, setBroadcasts] = useState<string[]>([]);

  // --- Whitelist/Blacklist Form State ---
  const [newWhitelist, setNewWhitelist] = useState("");
  const [newBlacklist, setNewBlacklist] = useState("");
  const [wlLoading, setWlLoading] = useState(false);
  const [blLoading, setBlLoading] = useState(false);
  const [wlError, setWlError] = useState("");
  const [blError, setBlError] = useState("");

  // --- CRUD Task State ---
  const [newTask, setNewTask] = useState({ title: "", description: "", points: 0, type: "custom", url: "" });
  const [taskEditIdx, setTaskEditIdx] = useState<number | null>(null);
  const [taskEdit, setTaskEdit] = useState<Task | null>(null);
  const [taskCrudMsg, setTaskCrudMsg] = useState("");
  const [taskCrudLoading, setTaskCrudLoading] = useState(false);

  // --- SUBTAB STATE ---
  const [userSubTab, setUserSubTab] = useState<'whitelist' | 'blacklist' | 'referral'>('whitelist');
  const [rewardSubTab, setRewardSubTab] = useState<'manual' | 'export'>('manual');
  const [systemSubTab, setSystemSubTab] = useState<'broadcast' | 'logs'>('broadcast');

  // --- Approve/Reject Claim Handler ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApproveClaim = async (_claimId: string) => {
    if (!window.confirm("Approve this claim?")) return;
    // TODO: call backend endpoint
    setMessage("Claim approved (dummy, implement backend)");
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRejectClaim = async (_claimId: string) => {
    if (!window.confirm("Reject this claim?")) return;
    // TODO: call backend endpoint
    setMessage("Claim rejected (dummy, implement backend)");
  };

  // --- Whitelist/Blacklist Handler ---
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWlLoading(true); setWlError("");
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWhitelist)) {
      setWlError("Invalid wallet address"); setWlLoading(false); return;
    }
    // TODO: call backend endpoint
    setWhitelist(wl => [...wl, newWhitelist]);
    setNewWhitelist(""); setWlLoading(false);
  };
  const handleRemoveWhitelist = async (wallet: string) => {
    if (!window.confirm("Remove from whitelist?")) return;
    // TODO: call backend endpoint
    setWhitelist(wl => wl.filter(w => w !== wallet));
  };
  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlLoading(true); setBlError("");
    if (!/^0x[a-fA-F0-9]{40}$/.test(newBlacklist)) {
      setBlError("Invalid wallet address"); setBlLoading(false); return;
    }
    // TODO: call backend endpoint
    setBlacklist(bl => [...bl, newBlacklist]);
    setNewBlacklist(""); setBlLoading(false);
  };
  const handleRemoveBlacklist = async (wallet: string) => {
    if (!window.confirm("Remove from blacklist?")) return;
    // TODO: call backend endpoint
    setBlacklist(bl => bl.filter(b => b !== wallet));
  };

  // --- CRUD Task Handler ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskCrudLoading(true); setTaskCrudMsg("");
    if (!newTask.title || !newTask.description || newTask.points < 0 || !newTask.type || (['follow','share'].includes(newTask.type) && !/^https?:\/\/.+/.test(newTask.url))) {
      setTasksMessage("Lengkapi semua field dan pastikan link valid untuk tipe follow/share!");
      setTaskCrudLoading(false); return;
    }
    try {
      const res = await fetch("/api/tasks/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAdminAuthHeader() || {}) },
        body: JSON.stringify({ ...newTask, id: Date.now().toString() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to add task");
      setTasks(tsk => [...tsk, data.task]);
      setNewTask({ title: "", description: "", points: 0, type: "custom", url: "" });
      setTaskCrudMsg("Task added");
    } catch (err) {
      setTaskCrudMsg((err as Error).message);
    }
    setTaskCrudLoading(false);
  };
  const handleEditTask = (idx: number) => {
    setTaskEditIdx(idx);
    setTaskEdit(tasks[idx]);
  };
  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskEdit) return;
    setTaskCrudLoading(true); setTaskCrudMsg("");
    if (!taskEdit.title || !taskEdit.description || taskEdit.points < 0 || !taskEdit.type || (['follow','share'].includes(taskEdit.type) && !(taskEdit.url && /^https?:\/\/.+/.test(taskEdit.url)))) {
      setTasksMessage("Lengkapi semua field dan pastikan link valid untuk tipe follow/share!");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(getAdminAuthHeader() || {}) },
        body: JSON.stringify(taskEdit)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update task");
      setTasks(tsk => tsk.map((t, i) => i === taskEditIdx ? data.task : t));
      setTaskEditIdx(null); setTaskEdit(null);
      setTaskCrudMsg("Task updated");
    } catch (err) {
      setTaskCrudMsg((err as Error).message);
    }
    setTaskCrudLoading(false);
  };
  const handleDeleteTask = async (idx: number) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(getAdminAuthHeader() || {}) },
        body: JSON.stringify({ id: tasks[idx].id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete task");
      setTasks(tsk => tsk.filter((_, i) => i !== idx));
      setTaskCrudMsg("Task deleted");
    } catch (err) {
      setTaskCrudMsg((err as Error).message);
    }
  };

  // --- AUTH LOGIC ---
  useEffect(() => {
    // Cek token di localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ADMIN_KEY);
      if (token) setIsAuthenticated(true);
    }
  }, []);

  // Fetch all config on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    // fetch data admin hanya jika sudah login
    fetch("/api/admin/config", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(setConfig);
    fetch("/api/admin/vesting", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(setVesting);
    fetch("/api/admin/status", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(data => setStatus(data.status));
    fetch("/api/admin/whitelist", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(data => setWhitelist(Array.isArray(data) ? data : []));
    fetch("/api/admin/blacklist", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(data => setBlacklist(Array.isArray(data) ? data : []));
    fetch("/api/admin/claims", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(data => setPendingClaims(Array.isArray(data) ? data : []));
    fetch("/api/admin/stats", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(setStats);
    fetch("/api/admin/logs", { headers: getAdminAuthHeader() })
      .then(res => res.json()).then(setLogs);
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data || []);
        setTasksLoading(false);
      });
    fetch("/api/referral")
      .then(res => res.json())
      .then(data => setReferralData(data.referrals || []));
  }, [isAuthenticated]);

  // Fetch daftar broadcast saat tab System dibuka atau setelah kirim pesan
  useEffect(() => {
    if (activeTab === "System" && systemSubTab === "broadcast") {
      fetch("/api/admin/broadcast", { headers: getAdminAuthHeader() })
        .then(res => res.json())
        .then(data => setBroadcasts(data.broadcasts || []));
    }
  }, [activeTab, systemSubTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    // Kirim username dan password ke endpoint login admin
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUsername, password: loginPassword })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(ADMIN_KEY, data.token);
        setIsAuthenticated(true);
        setLoginPassword("");
        setLoginUsername("");
      } else {
        setLoginError("Login gagal: token tidak ditemukan");
      }
    } else {
      setLoginError("Invalid admin username or password");
    }
    setLoginLoading(false);
  };

  // Tombol logout
  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181C2F]">
        <form onSubmit={handleLogin} className="bg-[#232841] p-8 rounded-xl shadow-lg w-full max-w-xs">
          <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
          <input
            type="text"
            placeholder="Admin username"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
            className="w-full p-3 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-4"
            required
          />
          <input
            type="password"
            placeholder="Admin password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className="w-full p-3 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold"
            disabled={loginLoading}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
          {loginError && <div className="mt-3 text-red-400 text-center">{loginError}</div>}
        </form>
      </div>
    );
  }

  const handleConfigSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setMessage("Config updated!");
  };
  const handleVestingSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/admin/vesting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vesting) });
    setMessage("Vesting updated!");
  };
  const handleStatusChange = async (newStatus: string) => {
    await fetch("/api/admin/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    setStatus(newStatus);
    setMessage("Status updated!");
  };
  const handleBroadcast = async () => {
    await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(getAdminAuthHeader() || {}) },
      body: JSON.stringify({ message: broadcastMsg })
    });
    setBroadcastMsg("");
    setMessage("Broadcast sent!");
    // Refresh daftar broadcast setelah kirim
    fetch("/api/admin/broadcast", { headers: getAdminAuthHeader() })
      .then(res => res.json())
      .then(data => setBroadcasts(data.broadcasts || []));
  };
  const handleExport = async () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleTaskPointChange = (idx: number, value: number) => {
    setTasks(tasks =>
      tasks.map((task, i) =>
        i === idx ? { ...task, points: value } : task
      )
    );
  };
  const handleSaveTasks = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTasksMessage("");
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });
    if (res.ok) setTasksMessage("Task rewards updated!");
    else setTasksMessage("Failed to update task rewards.");
  }

  return (
    <div className="flex min-h-screen bg-[#181C2F]">
      <AdminSidebar active={activeTab} setActive={setActiveTab} />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition">Logout</button>
        </div>
        {message && <div className="mb-4 text-green-400">{message}</div>}
        {/* Tab Content */}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#232841] rounded-xl p-6 flex flex-col items-start">
              <div className="text-xs text-gray-400 mb-1">Total Peserta</div>
              <div className="text-3xl font-bold">{stats?.totalUsers ?? '-'}</div>
            </div>
            <div className="bg-[#232841] rounded-xl p-6 flex flex-col items-start">
              <div className="text-xs text-gray-400 mb-1">Total Reward</div>
              <div className="text-3xl font-bold">{stats?.totalRewards ?? '-'} PEPE</div>
            </div>
            <div className="bg-[#232841] rounded-xl p-6 flex flex-col items-start">
              <div className="text-xs text-gray-400 mb-1">Tugas Selesai</div>
              <div className="text-3xl font-bold">{stats?.totalTasks ?? '-'}</div>
            </div>
            <div className="bg-[#232841] rounded-xl p-6 flex flex-col items-start">
              <div className="text-xs text-gray-400 mb-1">Status Airdrop</div>
              <div className="text-3xl font-bold">{status}</div>
            </div>
          </div>
        )}
        {activeTab === "Config" && config && (
          <div className="bg-[#232841] p-4 sm:p-6 rounded-xl space-y-8 max-w-lg mx-auto w-full sm:w-[90vw] md:w-[80vw] lg:w-[600px] xl:w-[700px] 2xl:w-[800px]">
            {/* Form Konfigurasi Utama */}
            <form onSubmit={handleConfigSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Airdrop Start</label>
                <input
                  type="date"
                  name="airdropStart"
                  value={config.airdropStart || ""}
                  onChange={e => setConfig({ ...config, airdropStart: e.target.value })}
                  className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Airdrop End</label>
                <input
                  type="date"
                  name="airdropEnd"
                  value={config.airdropEnd || ""}
                  onChange={e => setConfig({ ...config, airdropEnd: e.target.value })}
                  className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Reward per Referral</label>
                <input
                  type="number"
                  name="rewardPerReferral"
                  value={config.rewardPerReferral}
                  onChange={e => setConfig({ ...config, rewardPerReferral: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Reward per Check-in</label>
                <input
                  type="number"
                  name="rewardPerCheckin"
                  value={config.rewardPerCheckin}
                  onChange={e => setConfig({ ...config, rewardPerCheckin: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Token per USD</label>
                <input
                  type="number"
                  name="tokenPerUsd"
                  value={config.tokenPerUsd}
                  onChange={e => setConfig({ ...config, tokenPerUsd: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                />
              </div>
              <button type="submit" className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold text-sm w-full">Save</button>
              {message && <div className="mt-2 text-green-400 text-sm">{message}</div>}
            </form>

            {/* Task Rewards Section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">Task Rewards</h2>
              {tasksLoading ? (
                <div className="text-sm">Loading tasks...</div>
              ) : (
                <form onSubmit={handleSaveTasks} className="space-y-3">
                  {tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full box-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{task.title}</div>
                        <div className="text-xs text-gray-400 truncate">{task.description}</div>
                      </div>
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <input
                          type="number"
                          value={task.points}
                          min={0}
                          onChange={e => handleTaskPointChange(idx, Number(e.target.value))}
                          className="w-16 p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm"
                        />
                        <span className="text-xs text-gray-300">points</span>
                      </div>
                      <button
                        type="button"
                        className="text-blue-400 text-xs font-bold whitespace-nowrap"
                        onClick={() => handleEditTask(idx)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-400 text-xs font-bold whitespace-nowrap"
                        onClick={() => handleDeleteTask(idx)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="bg-[#5D4FFF] text-white px-3 py-1 rounded font-bold text-sm w-full"
                  >
                    Save Task Rewards
                  </button>
                  {tasksMessage && <div className="mt-2 text-green-400 text-sm">{tasksMessage}</div>}
                </form>
              )}
              {/* Add Task Form */}
              <form
                onSubmit={handleAddTask}
                className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4 w-full box-border"
              >
                <select
                  value={newTask.type}
                  onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                  className="p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm w-full sm:w-auto min-w-[110px]"
                >
                  <option value="custom">Custom</option>
                  <option value="follow">Follow</option>
                  <option value="share">Share</option>
                </select>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Title"
                  className="p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 flex-1 text-sm w-full sm:w-auto min-w-[120px]"
                />
                <input
                  type="text"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description"
                  className="p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 flex-1 text-sm w-full sm:w-auto min-w-[120px]"
                />
                <input
                  type="number"
                  value={newTask.points}
                  min={0}
                  onChange={e => setNewTask({ ...newTask, points: Number(e.target.value) })}
                  placeholder="Points"
                  className="w-16 p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 text-sm w-full sm:w-auto min-w-[70px]"
                />
                <input
                  type="text"
                  value={newTask.url}
                  onChange={e => setNewTask({ ...newTask, url: e.target.value })}
                  placeholder="Task Link (optional)"
                  className="p-1 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 flex-1 text-sm w-full sm:w-auto min-w-[120px]"
                />
                <button
                  type="submit"
                  className="bg-[#5D4FFF] text-white px-2 py-1 rounded font-bold text-sm hover:bg-[#4a3fd1] transition w-full sm:w-auto min-w-[90px]"
                  disabled={taskCrudLoading}
                >
                  {taskCrudLoading ? "Adding..." : "Add Task"}
                </button>
              </form>
              {taskCrudMsg && <div className="text-green-400 mt-2 text-sm">{taskCrudMsg}</div>}
              {/* Edit Task Modal */}
              {taskEditIdx !== null && taskEdit && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-2">
                  <form
                    onSubmit={handleSaveEditTask}
                    className="bg-[#232841] p-8 rounded-xl shadow-lg w-full max-w-md"
                  >
                    <h2 className="text-xl font-bold mb-4">Edit Task</h2>
                    <input type="text" value={taskEdit.title} onChange={e => setTaskEdit({ ...taskEdit, title: e.target.value })} placeholder="Title" className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-2" />
                    <input type="text" value={taskEdit.description} onChange={e => setTaskEdit({ ...taskEdit, description: e.target.value })} placeholder="Description" className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-2" />
                    <input type="number" value={taskEdit.points} min={0} onChange={e => setTaskEdit({ ...taskEdit, points: Number(e.target.value) })} placeholder="Points" className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-2" />
                    <input type="text" value={taskEdit?.url || ""} onChange={e => setTaskEdit({ ...taskEdit, url: e.target.value })} placeholder="Task Link (optional)" className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-2" />
                    <select value={taskEdit?.type || "custom"} onChange={e => setTaskEdit({ ...taskEdit, type: e.target.value })} className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 mb-2">
                      <option value="custom">Custom</option>
                      <option value="follow">Follow</option>
                      <option value="share">Share</option>
                    </select>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold" disabled={taskCrudLoading}>{taskCrudLoading ? "Saving..." : "Save"}</button>
                      <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded font-bold" onClick={() => { setTaskEditIdx(null); setTaskEdit(null); }}>Cancel</button>
                    </div>
                    {taskCrudMsg && <div className="text-green-400 mt-2">{taskCrudMsg}</div>}
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "Vesting" && vesting && (
          <form onSubmit={handleVestingSave} className="space-y-4 bg-[#232841] p-6 rounded-xl">
            <div>
              <label className="block mb-1 font-medium">Cliff Period (days)</label>
              <input
                type="number"
                name="cliff"
                value={String(vesting.cliff ?? "")}
                onChange={e => setVesting({ ...vesting, cliff: Number(e.target.value) })}
                className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Vesting Duration (days)</label>
              <input
                type="number"
                name="duration"
                value={String(vesting.duration ?? "")}
                onChange={e => setVesting({ ...vesting, duration: Number(e.target.value) })}
                className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
              />
            </div>
            <button type="submit" className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold">Save</button>
          </form>
        )}
        {activeTab === "Airdrop Status" && (
          <div className="bg-[#232841] p-6 rounded-xl">
            <div className="mb-4">
              <span className="font-bold">Status: </span>
              <span className={`px-2 py-1 rounded ${status === "active" ? "bg-green-500/20 text-green-400" : status === "paused" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{status}</span>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleStatusChange("active")} className="bg-green-600 px-3 py-1 rounded text-white">Active</button>
              <button onClick={() => handleStatusChange("paused")} className="bg-yellow-600 px-3 py-1 rounded text-white">Pause</button>
              <button onClick={() => handleStatusChange("ended")} className="bg-red-600 px-3 py-1 rounded text-white">End</button>
            </div>
          </div>
        )}
        {activeTab === "User Management" && (
          <div className="bg-[#232841] p-6 rounded-xl">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setUserSubTab('whitelist')} className={`px-4 py-2 rounded font-bold ${userSubTab === 'whitelist' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Whitelist/Blacklist</button>
              <button onClick={() => setUserSubTab('referral')} className={`px-4 py-2 rounded font-bold ${userSubTab === 'referral' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Referral</button>
            </div>
            {userSubTab === 'whitelist' && (
              <>
                <h3 className="font-bold mb-2">Whitelist</h3>
                <form onSubmit={handleAddWhitelist} className="flex gap-2 mb-2">
                  <input type="text" value={newWhitelist} onChange={e => setNewWhitelist(e.target.value)} placeholder="0x..." className="p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 flex-1" />
                  <button type="submit" className="bg-[#5D4FFF] text-white px-3 py-1 rounded" disabled={wlLoading}>{wlLoading ? "Adding..." : "Add"}</button>
                </form>
                {wlError && <div className="text-red-400 text-xs mb-2">{wlError}</div>}
                <ul className="mb-4">{whitelist.map(w => <li key={w} className="flex justify-between items-center">{w} <button onClick={() => handleRemoveWhitelist(w)} className="text-red-400 text-xs">Remove</button></li>)}</ul>
                <h3 className="font-bold mb-2">Blacklist</h3>
                <form onSubmit={handleAddBlacklist} className="flex gap-2 mb-2">
                  <input type="text" value={newBlacklist} onChange={e => setNewBlacklist(e.target.value)} placeholder="0x..." className="p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30 flex-1" />
                  <button type="submit" className="bg-[#5D4FFF] text-white px-3 py-1 rounded" disabled={blLoading}>{blLoading ? "Adding..." : "Add"}</button>
                </form>
                {blError && <div className="text-red-400 text-xs mb-2">{blError}</div>}
                <ul>{blacklist.map(b => <li key={b} className="flex justify-between items-center">{b} <button onClick={() => handleRemoveBlacklist(b)} className="text-red-400 text-xs">Remove</button></li>)}</ul>
              </>
            )}
            {userSubTab === 'referral' && (
              <>
                <h2 className="text-xl font-bold mb-4">Referral Data</h2>
                {referralData.length === 0 ? (
                  <div>No referral data.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Referrer</th>
                        <th className="text-left py-2">Referred Users</th>
                        <th className="text-left py-2">Tanggal</th>
                        {/* <th className="text-left py-2">Rewarded</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{row.referrer}</td>
                          <td className="py-1">{Array.isArray(row.referred) ? row.referred.join(", ") : row.referred}</td>
                          <td className="py-1">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</td>
                          {/* <td className="py-1">{row.rewarded ? 'Yes' : 'No'}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}
        {activeTab === "Reward Management" && (
          <div className="bg-[#232841] p-6 rounded-xl">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setRewardSubTab('manual')} className={`px-4 py-2 rounded font-bold ${rewardSubTab === 'manual' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Manual Reward</button>
              <button onClick={() => setRewardSubTab('export')} className={`px-4 py-2 rounded font-bold ${rewardSubTab === 'export' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Export Data</button>
            </div>
            {rewardSubTab === 'manual' && (
              <>
                <h3 className="font-bold mb-2">Pending Claims</h3>
                <ul>
                  {pendingClaims.map(claim => (
                    <li key={claim.id} className="flex justify-between items-center mb-2">
                      <span>{claim.wallet} - {claim.amount} PEPE</span>
                      <span>
                        <button className="bg-green-600 px-2 py-1 rounded text-white mr-2" onClick={() => handleApproveClaim(claim.id)}>Approve</button>
                        <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={() => handleRejectClaim(claim.id)}>Reject</button>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {rewardSubTab === 'export' && (
              <>
                <button onClick={handleExport} className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold">Export CSV</button>
              </>
            )}
          </div>
        )}
        {activeTab === "Stats" && stats && (
          <div className="bg-[#232841] p-6 rounded-xl space-y-2">
            <div className="font-bold text-lg mb-2">Airdrop Overview</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400">Total Participants</div>
                <div className="text-xl font-bold">{stats.totalUsers}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Tasks Completed</div>
                <div className="text-xl font-bold">{stats.totalTasks}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Rewards Distributed</div>
                <div className="text-xl font-bold">{stats.totalRewards} PEPE</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Referrals</div>
                <div className="text-xl font-bold">{stats.totalReferrals ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Check-ins</div>
                <div className="text-xl font-bold">{stats.totalCheckins ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Claims</div>
                <div className="text-xl font-bold">{stats.totalClaims ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Airdrop Start</div>
                <div className="text-xl font-bold">{stats.airdropStart || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Airdrop End</div>
                <div className="text-xl font-bold">{stats.airdropEnd || '-'}</div>
              </div>
            </div>
            <div className="font-bold mt-4 mb-2">Latest Participants</div>
            <table className="w-full text-xs mb-4">
              <thead>
                <tr>
                  <th className="text-left py-1">Wallet</th>
                  <th className="text-left py-1">Task</th>
                  <th className="text-left py-1">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestParticipants && stats.latestParticipants.length > 0 ? stats.latestParticipants.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{p.walletAddress}</td>
                    <td className="py-1">{p.taskId}</td>
                    <td className="py-1">{p.completedAt ? new Date(p.completedAt).toLocaleString() : '-'}</td>
                  </tr>
                )) : <tr><td colSpan={3}>No recent participants.</td></tr>}
              </tbody>
            </table>
            <div className="font-bold mt-4 mb-2">Task List</div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1">Task</th>
                  <th className="text-left py-1">Description</th>
                  <th className="text-left py-1">Points</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasks && stats.tasks.length > 0 ? stats.tasks.map((t, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{t.title}</td>
                    <td className="py-1">{t.description}</td>
                    <td className="py-1">{t.points}</td>
                  </tr>
                )) : <tr><td colSpan={3}>No tasks found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "System" && (
          <div className="bg-[#232841] p-6 rounded-xl">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setSystemSubTab('broadcast')} className={`px-4 py-2 rounded font-bold ${systemSubTab === 'broadcast' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Broadcast</button>
              <button onClick={() => setSystemSubTab('logs')} className={`px-4 py-2 rounded font-bold ${systemSubTab === 'logs' ? 'bg-[#5D4FFF] text-white' : 'bg-[#181C2F] text-gray-300'}`}>Logs</button>
            </div>
            {systemSubTab === 'broadcast' && (
              <>
                <textarea
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="w-full p-2 rounded mb-2 bg-[#181C2F] text-white border border-[#5D4FFF]/30 resize-none"
                  placeholder="Type announcement..."
                  rows={4}
                />
                <button
                  onClick={handleBroadcast}
                  className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold"
                >
                  Send Broadcast
                </button>
                {/* Daftar pesan broadcast */}
                <div className="mt-6">
                  <div className="font-bold mb-2">Broadcast History</div>
                  {broadcasts.length === 0 ? (
                    <div className="text-xs text-gray-400">No broadcast messages yet.</div>
                  ) : (
                    <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                      {broadcasts.slice().reverse().map((msg: { message: string; createdAt?: string } | string, idx: number) => (
                        <li key={idx} className="bg-[#181C2F] p-2 rounded border border-[#5D4FFF]/10">
                          {typeof msg === 'string' ? msg : (
                            <>
                              <span>{msg.message}</span>
                              {msg.createdAt && (
                                <span className="ml-2 text-gray-500">({new Date(msg.createdAt).toLocaleString()})</span>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {systemSubTab === 'logs' && (
              <>
                <div className="bg-[#232841] p-2 rounded-xl max-h-96 overflow-y-auto">
                  <ul>
                    {logs.map((log, i) => (
                      <li key={i} className="text-xs mb-1">{log.message}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
