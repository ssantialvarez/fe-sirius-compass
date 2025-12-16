"use client";

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import UserMenu from '@/components/layout/user-menu';
import { ModeToggle } from '../mode-toggle';
import { ProjectSelector } from '@/components/ui/project-selector';

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
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-foreground">{getTitle()}</h1>

      <div className="flex items-center gap-6">
        {/* Project Selector */}
        <ProjectSelector />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
          <Bell size={20} />
        </Button>

        <ModeToggle/>

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
