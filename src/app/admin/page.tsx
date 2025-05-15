"use client";
import { useState, useEffect } from "react";

const TABS = [
  "Config",
  "Vesting",
  "Airdrop Status",
  "Whitelist/Blacklist",
  "Manual Reward",
  "Export Data",
  "Stats",
  "Broadcast",
  "Logs",
  "Referral"
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Config");
  const [config, setConfig] = useState<any>(null);
  const [vesting, setVesting] = useState<any>(null);
  const [status, setStatus] = useState("active");
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksMessage, setTasksMessage] = useState("");
  const [referralData, setReferralData] = useState<{ referrer: string, referred: string[] }[]>([]);

  // Fetch all config on mount
  useEffect(() => {
    fetch("/api/admin/config").then(res => res.json()).then(setConfig);
    fetch("/api/admin/vesting").then(res => res.json()).then(setVesting);
    fetch("/api/admin/status").then(res => res.json()).then(data => setStatus(data.status));
    fetch("/api/admin/whitelist").then(res => res.json()).then(setWhitelist);
    fetch("/api/admin/blacklist").then(res => res.json()).then(setBlacklist);
    fetch("/api/admin/claims").then(res => res.json()).then(setPendingClaims);
    fetch("/api/admin/stats").then(res => res.json()).then(setStats);
    fetch("/api/admin/logs").then(res => res.json()).then(setLogs);
    // Fetch tasks
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data || []);
        setTasksLoading(false);
      });
    // Fetch referral data
    fetch("/api/referral")
      .then(res => res.json())
      .then(data => setReferralData(data.referrals || []));
  }, []);

  // Handler examples
  const handleConfigSave = async (e: any) => {
    e.preventDefault();
    await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setMessage("Config updated!");
  };
  const handleVestingSave = async (e: any) => {
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
    await fetch("/api/admin/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: broadcastMsg }) });
    setBroadcastMsg("");
    setMessage("Broadcast sent!");
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

  const handleSaveTasks = async (e: any) => {
    e.preventDefault();
    setTasksMessage("");
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });
    if (res.ok) setTasksMessage("Task rewards updated!");
    else setTasksMessage("Failed to update task rewards.");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded ${activeTab === tab ? "bg-[#5D4FFF] text-white" : "bg-[#232841] text-gray-300"}`}>{tab}</button>
        ))}
      </div>
      {message && <div className="mb-4 text-green-400">{message}</div>}

      {activeTab === "Config" && config && (
        <form onSubmit={handleConfigSave} className="space-y-4 bg-[#232841] p-6 rounded-xl">
          <div>
            <label className="block mb-1 font-medium">Airdrop Start</label>
            <input
              type="date"
              name="airdropStart"
              value={config.airdropStart || ""}
              onChange={e => setConfig({ ...config, airdropStart: e.target.value })}
              className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Airdrop End</label>
            <input
              type="date"
              name="airdropEnd"
              value={config.airdropEnd || ""}
              onChange={e => setConfig({ ...config, airdropEnd: e.target.value })}
              className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Reward per Referral</label>
            <input
              type="number"
              name="rewardPerReferral"
              value={config.rewardPerReferral}
              onChange={e => setConfig({ ...config, rewardPerReferral: Number(e.target.value) })}
              className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Reward per Check-in</label>
            <input
              type="number"
              name="rewardPerCheckin"
              value={config.rewardPerCheckin}
              onChange={e => setConfig({ ...config, rewardPerCheckin: Number(e.target.value) })}
              className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Token per USD</label>
            <input
              type="number"
              name="tokenPerUsd"
              value={config.tokenPerUsd}
              onChange={e => setConfig({ ...config, tokenPerUsd: Number(e.target.value) })}
              className="w-full p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
            />
          </div>
          <button type="submit" className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold">Save</button>
          {message && <div className="mt-2 text-green-400">{message}</div>}
        </form>
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

      {activeTab === "Whitelist/Blacklist" && (
        <div className="bg-[#232841] p-6 rounded-xl">
          <h3 className="font-bold mb-2">Whitelist</h3>
          <ul className="mb-4">{whitelist.map(w => <li key={w}>{w}</li>)}</ul>
          <h3 className="font-bold mb-2">Blacklist</h3>
          <ul>{blacklist.map(b => <li key={b}>{b}</li>)}</ul>
          {/* Tambahkan form untuk add/remove wallet jika perlu */}
        </div>
      )}

      {activeTab === "Manual Reward" && (
        <div className="bg-[#232841] p-6 rounded-xl">
          <h3 className="font-bold mb-2">Pending Claims</h3>
          <ul>
            {pendingClaims.map(claim => (
              <li key={claim.id} className="flex justify-between items-center mb-2">
                <span>{claim.wallet} - {claim.amount} PEPE</span>
                <span>
                  <button className="bg-green-600 px-2 py-1 rounded text-white mr-2">Approve</button>
                  <button className="bg-red-600 px-2 py-1 rounded text-white">Reject</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Export Data" && (
        <div className="bg-[#232841] p-6 rounded-xl">
          <button onClick={handleExport} className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold">Export CSV</button>
        </div>
      )}

      {activeTab === "Stats" && stats && (
        <div className="bg-[#232841] p-6 rounded-xl">
          <div>Total Participants: {stats.totalUsers}</div>
          <div>Total Tasks Completed: {stats.totalTasks}</div>
          <div>Total Rewards Distributed: {stats.totalRewards} PEPE</div>
          {/* Tambahkan statistik lain sesuai kebutuhan */}
        </div>
      )}

      {activeTab === "Broadcast" && (
        <div className="bg-[#232841] p-6 rounded-xl">
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
        </div>
      )}

      {activeTab === "Logs" && (
        <div className="bg-[#232841] p-6 rounded-xl max-h-96 overflow-y-auto">
          <ul>
            {logs.map((log, i) => (
              <li key={i} className="text-xs mb-1">{log}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Referral" && (
        <div className="bg-[#232841] p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Referral Data</h2>
          {referralData.length === 0 ? (
            <div>No referral data.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2">Referrer</th>
                  <th className="text-left py-2">Referred Users</th>
                </tr>
              </thead>
              <tbody>
                {referralData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{row.referrer}</td>
                    <td className="py-1">{row.referred.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tambahkan tab baru atau bagian di tab Config */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Task Rewards</h2>
        {tasksLoading ? (
          <div>Loading tasks...</div>
        ) : (
          <form onSubmit={handleSaveTasks} className="space-y-4 bg-[#232841] p-6 rounded-xl">
            {tasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-xs text-gray-400">{task.description}</div>
                </div>
                <input
                  type="number"
                  value={task.points}
                  min={0}
                  onChange={e => handleTaskPointChange(idx, Number(e.target.value))}
                  className="w-24 p-2 rounded bg-[#181C2F] text-white border border-[#5D4FFF]/30"
                />
                <span className="text-sm text-gray-300">points</span>
              </div>
            ))}
            <button type="submit" className="bg-[#5D4FFF] text-white px-4 py-2 rounded font-bold">Save Task Rewards</button>
            {tasksMessage && <div className="mt-2 text-green-400">{tasksMessage}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
