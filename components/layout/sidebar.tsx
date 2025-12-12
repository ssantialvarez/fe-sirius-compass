'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, MessageSquare, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '../mode-toggle';

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
    <div className="w-64 sticky top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-sidebar-primary-foreground rounded-full" />
        </div>
        <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Sirius Compass</span>
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
