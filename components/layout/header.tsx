"use client";

import { Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import UserMenu from '@/components/layout/user-menu';

export function Header() {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname.includes('/connections')) return 'Connections';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/chat')) return 'Analysis Chat';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#0f1115] flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>

      <div className="flex items-center gap-6">
        {/* Project Selector */}
        <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
          <span>Project:</span>
          <span className="text-white font-medium">Project: Saturn</span>
          <ChevronDown size={16} />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
          <Bell size={20} />
        </Button>

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
