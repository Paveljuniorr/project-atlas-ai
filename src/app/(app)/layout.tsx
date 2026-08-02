import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#060815] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-[#060815]">
          {children}
        </main>
      </div>
    </div>
  );
}

