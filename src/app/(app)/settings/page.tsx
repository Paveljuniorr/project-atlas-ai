"use client";

import { Building, Users, Key, Webhook, Bot, CreditCard } from "lucide-react";

const SETTINGS_TABS = [
  { id: "general", label: "General", icon: Building },
  { id: "team", label: "Team & Roles", icon: Users },
  { id: "integrations", label: "Integrations", icon: Key },
  { id: "automations", label: "Automations", icon: Webhook },
  { id: "ai", label: "AI Configuration", icon: Bot },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your organization and platform preferences.</p>
      </div>

      <div className="flex flex-1 overflow-hidden border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
        <div className="w-64 border-r border-gray-200 dark:border-zinc-800 p-4 space-y-1 bg-gray-50/50 dark:bg-zinc-950/50">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors text-left"
            >
              <tab.icon className="h-4 w-4 text-gray-500" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Company Name</label>
                <input 
                  type="text" 
                  defaultValue="Acme Corp" 
                  className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Timezone</label>
                <select className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
