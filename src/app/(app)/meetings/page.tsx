"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Video, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Building, 
  Search, 
  Filter 
} from "lucide-react";

export default function MeetingsPage() {
  const [filter, setFilter] = useState("all");

  const meetings = [
    {
      id: 1,
      title: "Enterprise Platform Walkthrough & Pricing",
      lead: "Marcus Vance",
      company: "Stark Industries",
      time: "2:00 PM - 2:45 PM",
      date: "Today",
      platform: "Google Meet",
      link: "https://meet.google.com/abc-defg-hij",
      status: "Upcoming",
      summary: "AI pre-meeting brief prepared: Lead expressed interest in 50 seats with SLA guarantees."
    },
    {
      id: 2,
      title: "Technical Security & Privacy Architecture Review",
      lead: "Dr. Arnim Zola",
      company: "Shield Corp",
      time: "4:30 PM - 5:00 PM",
      date: "Today",
      platform: "Zoom",
      link: "https://zoom.us/j/987654321",
      status: "Upcoming",
      summary: "SOC2 compliance sheet & data residency doc attached by AI copilot."
    },
    {
      id: 3,
      title: "Contract Finalization & Billing Terms",
      lead: "Rachel Tyrell",
      company: "Tyrell Corp",
      time: "10:00 AM - 10:30 AM",
      date: "Tomorrow",
      platform: "Google Meet",
      link: "https://meet.google.com/xyz-uvwx-rst",
      status: "Upcoming",
      summary: "Legal team reviewed redlines. AI generated custom discount approval."
    },
    {
      id: 4,
      title: "Inbound Discovery Call",
      lead: "Ellen Ripley",
      company: "Weyland-Yutani",
      time: "Yesterday, 3:00 PM",
      date: "Completed",
      platform: "Google Meet",
      link: "#",
      status: "Completed",
      summary: "Action items: Send customized proposal by Friday. Scored 92/100."
    }
  ];

  const filtered = filter === "all" ? meetings : meetings.filter(m => m.status.toLowerCase() === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meetings & Demo Calls</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
              3 Scheduled Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage upcoming video demos, view AI-generated call summaries, and launch virtual rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter Platform</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {["all", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-1 capitalize border-b-2 transition ${
              filter === tab ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab} Meetings
          </button>
        ))}
      </div>

      {/* Meetings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-200 transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-700'}`}>
                    {item.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{item.time}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{item.title}</h3>
              </div>

              {item.status !== "Completed" && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs shrink-0"
                >
                  <Video className="h-3.5 w-3.5" /> Join Room
                </a>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <User className="h-3.5 w-3.5 text-slate-400" /> {item.lead}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {item.company}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600">{item.platform}</span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{item.summary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
