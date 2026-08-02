"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-white/10 bg-[#060815]/90 backdrop-blur-md flex items-center justify-between px-6 text-white">
      <div className="flex items-center gap-4">
        <OrganizationSwitcher 
          appearance={{
            elements: {
              organizationSwitcherTrigger: "py-2 px-4 rounded-xl hover:bg-white/10 text-white transition-colors border border-white/10",
            }
          }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-white/80 hover:text-white transition-colors relative rounded-xl hover:bg-white/10">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 border-2 border-[#060815]"></span>
        </button>
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8",
            }
          }}
        />
      </div>
    </header>
  );
}

