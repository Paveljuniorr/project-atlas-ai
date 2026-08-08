"use client";

import { useState, useTransition } from "react";
import { Plus, X, Sparkles, User, Building, Mail, ArrowRight } from "lucide-react";
import { updateLeadStage, createLead } from "@/actions/leads";

const STAGES = [
  { id: "new", name: "New Lead", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "contacted", name: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "qualified", name: "Qualified", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "proposal", name: "Proposal", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "won", name: "Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
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
    
    startTransition(async () => {
      await updateLeadStage(leadId, stageId);
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Pipeline CRM</h1>
          <p className="text-xs text-slate-500 mt-1">Manage contacts, drag deals across pipeline stages, and trigger AI workflows.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </button>
      </div>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = initialLeads.filter(l => l.stage_id === stage.id);
          
          return (
            <div 
              key={stage.id} 
              className={`w-72 flex-shrink-0 flex flex-col bg-slate-100/60 rounded-2xl p-3.5 border border-slate-200 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-3.5 px-1">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${stage.color}`}>
                  {stage.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {stageLeads.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-28 flex items-center justify-center bg-white/50">
                    <p className="text-xs font-semibold text-slate-400">Drag lead cards here</p>
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900">{lead.first_name} {lead.last_name}</p>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {lead.source || "inbound"}
                        </span>
                      </div>
                      {lead.company_name && (
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <Building className="h-3 w-3 text-slate-400" /> {lead.company_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 truncate max-w-[140px]">{lead.email}</span>
                        <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition">View →</span>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create New Lead</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={async (formData) => {
              await createLead(formData);
              setIsCreateModalOpen(false);
            }} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input name="first_name" required className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input name="last_name" required className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input name="email" type="email" required className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input name="company_name" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

