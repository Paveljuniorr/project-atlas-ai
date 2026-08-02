import { Users, MessagesSquare, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Leads</p>
              <h2 className="text-2xl font-bold text-white">1,248</h2>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <MessagesSquare className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Open Conversations</p>
              <h2 className="text-2xl font-bold text-white">42</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Avg. Response Time</p>
              <h2 className="text-2xl font-bold text-white">4m 12s</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Meetings Booked</p>
              <h2 className="text-2xl font-bold text-white">18</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm h-96">
          <h3 className="font-semibold text-white mb-4">Pipeline Overview</h3>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-lg">
            <p className="text-sm text-white/70">Chart visualization active</p>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-sm h-96">
          <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">New Lead captured via WhatsApp</p>
                  <p className="text-xs text-white/60">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

