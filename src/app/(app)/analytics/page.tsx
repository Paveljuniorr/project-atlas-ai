export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Deep dive into your performance metrics.</p>
        </div>
        <select className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-md px-3 py-1.5 text-sm font-medium">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-sm text-gray-500">Leads by Channel</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
            <span className="text-sm text-gray-400">Chart rendering...</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-4 text-sm text-gray-500">AI Assist Rate</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
            <span className="text-sm text-gray-400">Chart rendering...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
