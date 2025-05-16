// src/components/AdminSidebar.tsx
import React from "react";

interface SidebarProps {
  active: string;
  setActive: (tab: string) => void;
}

const SIDEBAR_SECTIONS = [
  {
    title: "AIRDROP",
    items: [
      { key: "Dashboard", label: "Dashboard", icon: "🏠" },
      { key: "Config", label: "Config", icon: "⚙️" },
    ],
  },
  {
    title: "USER",
    items: [
      { key: "User Management", label: "User Management", icon: "🔒" },
    ],
  },
  {
    title: "REWARD",
    items: [
      { key: "Reward Management", label: "Reward Management", icon: "💸" },
      { key: "Stats", label: "Statistik", icon: "📊" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { key: "System", label: "Broadcast & Logs", icon: "🛠️" },
    ],
  },
];

export default function AdminSidebar({ active, setActive }: SidebarProps) {
  return (
    <aside className="bg-[#181C2F] h-full min-h-screen w-56 flex flex-col py-6 px-2 border-r border-[#232841]">
      <div className="text-2xl font-bold text-center mb-8 text-[#5D4FFF]">Admin</div>
      <nav className="flex-1 flex flex-col gap-4">
        {SIDEBAR_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="text-xs text-gray-500 font-bold px-4 mb-1 mt-2 uppercase tracking-wider">{section.title}</div>
            <div>
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors duration-100 ${active === item.key ? "bg-[#5D4FFF] text-white" : "text-gray-300 hover:bg-[#232841]"}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
