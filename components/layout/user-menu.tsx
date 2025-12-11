"use client";

import { useUser } from "@auth0/nextjs-auth0";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user?: { name?: string; email?: string; picture?: string } | null;
}

export function UserMenu({ user: userProp }: UserMenuProps) {
  const { user } = useUser();
  const u = userProp ?? user ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-white/20 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/20"
          title={u?.name || "Account"}
        >
          <img
            src={u?.picture || "https://github.com/shadcn.png"}
            alt={u?.name || "User"}
            className="w-full h-full object-cover"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {u && (
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-popover-foreground truncate">{u.name}</div>
            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-popover/10">
            Settings
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/auth/logout" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-popover/10">
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
