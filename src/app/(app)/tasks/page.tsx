"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building,
  User,
  Search
} from "lucide-react";

export default function TasksPage() {
  const [filter, setFilter] = useState("all");
  const [newTaskText, setNewTaskText] = useState("");
  const [taskList, setTaskList] = useState([
    { id: 1, text: "Review AI draft for Cyberdyne Systems proposal", priority: "High", done: false, lead: "Cyberdyne Systems", dueDate: "Today" },
    { id: 2, text: "Confirm Enterprise demo with Sarah Connor", priority: "High", done: true, lead: "Resistance Tech", dueDate: "Today" },
    { id: 3, text: "Set up WhatsApp webhook for new regional campaign", priority: "Medium", done: false, lead: "Internal Operations", dueDate: "Tomorrow" },
    { id: 4, text: "Follow up on invoice #1094 for Weyland-Yutani", priority: "Low", done: false, lead: "Weyland-Yutani", dueDate: "Aug 15" },
    { id: 5, text: "Send security whitepaper to Shield Corp security lead", priority: "High", done: false, lead: "Shield Corp", dueDate: "Aug 14" }
  ]);

  const toggleTask = (id: number) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTaskList([
      { id: Date.now(), text: newTaskText, priority: "Medium", done: false, lead: "Manual Task", dueDate: "Today" },
      ...taskList
    ]);
    setNewTaskText("");
  };

  const filtered = filter === "all" ? taskList : filter === "pending" ? taskList.filter(t => !t.done) : taskList.filter(t => t.done);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Tasks</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
              {taskList.filter(t => !t.done).length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track sales actions, AI-suggested follow-ups, and operational tasks across your organization.
          </p>
        </div>

        <form onSubmit={handleAddTask} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add new task..."
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none flex-1"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {["all", "pending", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-1 capitalize border-b-2 transition ${
              filter === tab ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab} Tasks ({tab === "all" ? taskList.length : tab === "pending" ? taskList.filter(t => !t.done).length : taskList.filter(t => t.done).length})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
              task.done ? "bg-slate-50 border-slate-200 opacity-65" : "bg-white border-slate-200 hover:border-indigo-300 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => {}}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
              />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${task.done ? "line-through text-slate-400" : "text-slate-900"}`}>
                  {task.text}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building className="h-3 w-3 text-slate-400" /> {task.lead}
                  </span>
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                task.priority === "High" ? "bg-red-50 text-red-600 border border-red-200" : task.priority === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600"
              }`}>
                {task.priority} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
