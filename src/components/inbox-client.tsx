"use client";

import { useState, useTransition } from "react";
import { Search, Filter, MessageSquare, Bot, Send } from "lucide-react";
import { getConversationMessages, markConversationRead } from "@/actions/inbox";
import { generateAiDraft } from "@/actions/ai";

export function InboxClient({ initialConversations }: { initialConversations: any[] }) {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [draft, setDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    setDraft(null);
    startTransition(async () => {
      const msgs = await getConversationMessages(convId);
      setMessages(msgs);
      await markConversationRead(convId);
    });
  };

  const handleGenerateDraft = async () => {
    if (!selectedConv || messages.length === 0) return;
    setIsDrafting(true);
    try {
      const lastMsg = messages[messages.length - 1];
      const result = await generateAiDraft(selectedConv, lastMsg.id);
      if (result.success && result.draft) {
        setDraft(result.draft.draft_body);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  const activeConv = initialConversations.find(c => c.id === selectedConv);

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex overflow-hidden border-t border-gray-200 dark:border-zinc-800">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-sm outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {initialConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500">
              <MessageSquare className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            initialConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`p-4 border-b border-gray-100 dark:border-zinc-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors ${selectedConv === conv.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm">
                    {conv.lead?.first_name} {conv.lead?.last_name}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.last_message_preview || 'No messages yet'}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-zinc-900/20">
        {!selectedConv ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Select a conversation to view details
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center shadow-sm z-10">
              <div>
                <h3 className="font-medium">{activeConv?.lead?.first_name} {activeConv?.lead?.last_name}</h3>
                <p className="text-xs text-gray-500 capitalize">via {activeConv?.channel}</p>
              </div>
              <button 
                onClick={handleGenerateDraft}
                disabled={isDrafting}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
              >
                <Bot className="h-4 w-4" />
                {isDrafting ? "Drafting..." : "AI Assist"}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <p className="text-sm text-center text-gray-500">Loading messages...</p>
              ) : messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.direction === 'outbound' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800">
              {draft ? (
                <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-600">AI Draft Suggestion</span>
                  </div>
                  <textarea 
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full text-sm bg-transparent border-none focus:ring-0 resize-none outline-none h-24"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setDraft(null)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Discard</button>
                    <button className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Approve & Send</button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <textarea 
                    placeholder="Type a message..."
                    className="w-full border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 pr-12 text-sm bg-gray-50 dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                  />
                  <button className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lead Context Sidebar */}
      {selectedConv && activeConv && (
        <div className="w-80 border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h3 className="font-semibold text-lg mb-6">About Lead</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Company</p>
              <p>{activeConv.lead?.company_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Source</p>
              <p className="capitalize">{activeConv.lead?.source || 'Manual'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300">
                {activeConv.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
