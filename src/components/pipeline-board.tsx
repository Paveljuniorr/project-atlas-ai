"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { updateLeadStage, createLead } from "@/actions/leads";

const STAGES = [
  { id: "new", name: "New Lead", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  { id: "contacted", name: "Contacted", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  { id: "qualified", name: "Qualified", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
  { id: "proposal", name: "Proposal", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" },
  { id: "won", name: "Won", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" }
];

export function PipelineBoard({ initialLeads }: { initialLeads: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    
    // Optimistically update UI could be added here, for now just relying on server action revalidation
    startTransition(async () => {
      await updateLeadStage(leadId, stageId);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your contacts and track them through the sales process.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = initialLeads.filter(l => l.stage_id === stage.id);
          
          return (
            <div 
              key={stage.id} 
              className={`w-80 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${stage.color}`}>
                  {stage.name}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {stageLeads.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg h-24 flex items-center justify-center">
                    <p className="text-sm text-gray-400 dark:text-zinc-500">Drop leads here</p>
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <p className="font-medium text-sm">{lead.first_name} {lead.last_name}</p>
                      {lead.company_name && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{lead.company_name}</p>}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/50">
                        <span className="text-xs text-gray-400">{lead.source}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Create New Lead</h2>
            <form action={async (formData) => {
              await createLead(formData);
              setIsCreateModalOpen(false);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">First Name</label>
                  <input name="first_name" required className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">Last Name</label>
                  <input name="last_name" required className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">Email Address</label>
                <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">Company Name</label>
                <input name="company_name" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
