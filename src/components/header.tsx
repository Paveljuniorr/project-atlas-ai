"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Search, Sparkles, Check, Clock, Bot, X } from "lucide-react";

export function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useUser();

  const notifications = [
    { id: 1, title: "New Qualified Lead", desc: "Sarah Connor scored 94/100 via WhatsApp", time: "5m ago", icon: Sparkles, color: "text-indigo-600 bg-indigo-50" },
    { id: 2, title: "AI Response Drafted", desc: "Response queued for Acme Corp inquiry", time: "18m ago", icon: Bot, color: "text-emerald-600 bg-emerald-50" },
    { id: 3, title: "Demo Booked", desc: "Enterprise demo scheduled for tomorrow 2:00 PM", time: "1h ago", icon: Clock, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-40">
      {/* Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, conversations, AI actions... (Press Cmd + K)"
            className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative rounded-xl border border-slate-200 bg-white shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">3 New</span>
                </div>
                <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clerk User Button & Profile */}
        <div className="pl-1 flex items-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-full ring-2 ring-indigo-500/20 shadow-xs",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
