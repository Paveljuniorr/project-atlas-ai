"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Inbox, BarChart, Settings, Bot, Home } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Website Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#060815] text-white flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 font-bold text-[#ffffff] hover:text-blue-400 transition">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Project Atlas AI
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-white" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

