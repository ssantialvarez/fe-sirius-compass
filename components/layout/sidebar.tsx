'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, MessageSquare, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  /*{
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },*/
  {
    title: 'Connections',
    href: '/connections',
    icon: Globe,
  },
  {
    title: 'Analysis Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 sticky top-0 h-screen bg-[#0f1115] border-r border-white/10 flex flex-col text-white">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
        </div>
        <span className="font-bold text-lg tracking-tight text-cyan-400">Sirius Compass</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1e293b] text-cyan-400 border-l-2 border-cyan-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
