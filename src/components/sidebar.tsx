"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Inbox, 
  BarChart2, 
  Settings, 
  Bot, 
  ChevronDown, 
  Plus, 
  Check, 
  Sparkles,
  Globe,
  Bell,
  Calendar,
  Layers
} from "lucide-react";
import { clsx } from "clsx";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Lead Pipeline", href: "/leads", icon: Users, badge: "1,248" },
  { name: "AI Conversations", href: "/inbox", icon: Inbox, badge: "42" },
  { name: "Analytics & MRR", href: "/analytics", icon: BarChart2 },
  { name: "Workspace Settings", href: "/settings", icon: Settings },
];

const workspaces = [
  { id: "ws-1", name: "Atlas Revenue Hub", plan: "Enterprise", logo: "✦" },
  { id: "ws-2", name: "Global Sales Team", plan: "Pro", logo: "⚡" },
  { id: "ws-3", name: "Acme Corp Growth", plan: "Free Tier", logo: "🏢" }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [selectedWs, setSelectedWs] = useState(workspaces[0]);
  const [wsMenuOpen, setWsMenuOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-slate-200 bg-white text-slate-900 flex flex-col hidden md:flex h-screen shrink-0 select-none">
      {/* Workspace Switcher */}
      <div className="p-3.5 border-b border-slate-200/80 relative">
        <button
          onClick={() => setWsMenuOpen(!wsMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100/80 transition text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
              {selectedWs.logo}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate tracking-tight">{selectedWs.name}</div>
              <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{selectedWs.plan}</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {wsMenuOpen && (
          <div className="absolute top-full left-3.5 right-3.5 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-1.5 space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Workspace</div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setSelectedWs(ws);
                  setWsMenuOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition",
                  selectedWs.id === ws.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{ws.logo}</span>
                  <span>{ws.name}</span>
                </div>
                {selectedWs.id === ws.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </button>
            ))}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
                <Plus className="h-3.5 w-3.5" />
                Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Core Product</div>
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={clsx("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={clsx(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</div>
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition"
        >
          <Globe className="h-4 w-4 text-slate-400" />
          <span>Product Overview</span>
        </Link>
      </nav>

      {/* Footer Profile & Status */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-200/70 bg-white shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-7 w-7 rounded-full shrink-0 border border-indigo-200"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
                {session?.user?.name?.[0] || "A"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {session?.user?.name || "Atlas Operator"}
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate">
                {session?.user?.email || "admin@atlas.ai"}
              </div>
            </div>
          </div>
          <span className="size-2 rounded-full bg-emerald-500 shrink-0" title="AI Agent Active" />
        </div>
      </div>
    </aside>
  );
}
