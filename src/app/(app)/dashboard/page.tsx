"use client";

import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  MessagesSquare, 
  Calendar, 
  CheckSquare, 
  Bell, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal, 
  Bot, 
  PhoneCall, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // State for interactive tasks
  const [taskList, setTaskList] = useState([
    { id: 1, text: "Review AI draft for Cyberdyne Systems proposal", priority: "High font-bold text-red-600 bg-red-50", done: false, lead: "Cyberdyne Systems" },
    { id: 2, text: "Confirm Enterprise demo with Sarah Connor", priority: "High font-bold text-red-600 bg-red-50", done: true, lead: "Resistance Tech" },
    { id: 3, text: "Set up WhatsApp webhook for new regional campaign", priority: "Medium text-amber-700 bg-amber-50", done: false, lead: "Internal Operations" },
    { id: 4, text: "Follow up on invoice #1094 for Weyland-Yutani", priority: "Low text-slate-600 bg-slate-100", done: false, lead: "Weyland-Yutani" },
  ]);

  const toggleTask = (id: number) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const revenueData = [
    { month: "Jan", mrr: 84000, leads: 820 },
    { month: "Feb", mrr: 92000, leads: 910 },
    { month: "Mar", mrr: 98000, leads: 1040 },
    { month: "Apr", mrr: 105000, leads: 1120 },
    { month: "May", mrr: 116000, leads: 1180 },
    { month: "Jun", mrr: 128450, leads: 1248 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time overview of revenue performance, pipeline velocity, and autonomous AI agents.</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Last 30 Days</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs">
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export Report</span>
          </button>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Lead</span>
          </Link>
        </div>
      </div>

      {/* 1. Revenue Overview & Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">$128,450</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+14.2% vs last month</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pipeline Value</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">$412,000</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>56 Active Deals</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qualified Leads Captured</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">1,248</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              <span>89% Auto-Qualified</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. AI Response Speed</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">1.8s</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>24/7 Autonomous SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Revenue Trend & Pipeline Stage Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Growth Visualizer */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue & Lead Growth Trend</h2>
              <p className="text-xs text-slate-500">Monthly recurring revenue trajectory (H1 2026)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-indigo-600"><span className="size-2 rounded-full bg-indigo-600" /> MRR ($)</span>
              <span className="flex items-center gap-1 text-slate-400"><span className="size-2 rounded-full bg-slate-300" /> Leads</span>
            </div>
          </div>

          {/* Custom SVG Bar & Trend Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {revenueData.map((d, i) => {
              const heightPct = (d.mrr / 140000) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    ${(d.mrr / 1000).toFixed(0)}k
                  </div>
                  <div 
                    className="w-full max-w-[42px] bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg group-hover:from-indigo-700 group-hover:to-indigo-600 transition-all duration-300 relative shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Target: $150k MRR Q3</span>
            <span className="font-semibold text-slate-900">85.6% achieved</span>
          </div>
        </div>

        {/* 3. Lead Pipeline Stage Summary */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Pipeline Stages</h2>
              <Link href="/leads" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View CRM <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { stage: "New Inbound Leads", count: 342, value: "$85,000", color: "bg-slate-200 text-slate-800" },
                { stage: "AI Qualified", count: 184, value: "$120,000", color: "bg-blue-100 text-blue-800" },
                { stage: "Demo Scheduled", count: 56, value: "$95,000", color: "bg-indigo-100 text-indigo-800" },
                { stage: "Proposal Sent", count: 28, value: "$68,000", color: "bg-amber-100 text-amber-800" },
                { stage: "Closed Won", count: 42, value: "$128,450", color: "bg-emerald-100 text-emerald-800" },
              ].map((s) => (
                <div key={s.stage} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${s.color}`}>{s.count}</span>
                    <span className="text-xs font-semibold text-slate-800">{s.stage}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pipeline Conversion Rate</span>
            <span className="font-bold text-emerald-600">28.4% Average</span>
          </div>
        </div>
      </div>

      {/* 4. AI Conversations & 5. Upcoming Meetings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live AI Conversations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Active AI Threads</h2>
            </div>
            <Link href="/inbox" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Open Inbox →</Link>
          </div>

          <div className="space-y-3">
            {[
              { lead: "Sarah Connor", company: "Cyberdyne Systems", channel: "WhatsApp", time: "2m ago", lastMsg: "Can you confirm pricing for 50 autonomous seats?", status: "AI Draft Ready" },
              { lead: "John Miller", company: "Weyland Tech", channel: "Webchat", time: "14m ago", lastMsg: "We want to start pilot testing next Monday.", status: "Auto-Replied" },
              { lead: "Elena Rostova", company: "Aperture Labs", channel: "Email", time: "45m ago", lastMsg: "Sending over technical requirements document.", status: "Pending Review" },
            ].map((t) => (
              <div key={t.lead} className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{t.lead}</span>
                    <span className="text-[10px] font-medium text-slate-400">• {t.company}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/50">
                    {t.channel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 truncate">"{t.lastMsg}"</p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.time}</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Meetings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Demos & Calls</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Today & Tomorrow</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Enterprise Platform Walkthrough", with: "Marcus Vance (Stark Industries)", time: "2:00 PM - 2:45 PM", platform: "Google Meet", date: "Today" },
              { title: "Technical Security & Privacy Review", with: "Dr. Arnim Zola (Shield Corp)", time: "4:30 PM - 5:00 PM", platform: "Zoom", date: "Today" },
              { title: "Contract Finalization Call", with: "Rachel Tyrell (Tyrell Corp)", time: "10:00 AM - 10:30 AM", platform: "Google Meet", date: "Tomorrow" },
            ].map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded">{m.date}</span>
                    <span className="text-xs font-bold text-slate-900">{m.title}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">With {m.with}</div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">{m.time} ({m.platform})</div>
                </div>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition shrink-0" title="Join Meeting">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Tasks Management & 7. Recent Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Tasks List */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Workspace Tasks</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">{taskList.filter(t => !t.done).length} Pending</span>
          </div>

          <div className="space-y-2.5">
            {taskList.map((task) => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  task.done ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-indigo-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${task.done ? "line-through text-slate-400" : "text-slate-900"}`}>
                    {task.text}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{task.lead}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority}`}>
                      {task.priority.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Live Recent Activity Feed & 8. System Status */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Live Activity Audit Stream</h2>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Real-Time Sync
            </span>
          </div>

          <div className="space-y-4">
            {[
              { action: "Lead Converted", detail: "Cyberdyne Systems moved to Closed Won ($128.4k)", time: "12m ago", user: "Atlas AI Auto-pilot" },
              { action: "AI Draft Generated", detail: "Personalized sales draft created for Sarah Connor", time: "24m ago", user: "Gemini Engine" },
              { action: "New Meeting Scheduled", detail: "Demo booked with Resistance Tech for tomorrow", time: "1h ago", user: "Calendly Webhook" },
              { action: "Lead Captured", detail: "Inbound lead via WhatsApp (+1 415 890 2341)", time: "2h ago", user: "Twilio Gateway" },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="mt-1 size-2 rounded-full bg-indigo-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{act.detail}</p>
                  <span className="text-[10px] font-medium text-slate-400">Triggered by: {act.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


