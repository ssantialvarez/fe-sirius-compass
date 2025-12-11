'use client';

import { Bell, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

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
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-white/20 overflow-hidden cursor-pointer">
            <img src="https://github.com/shadcn.png" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
