"use client";

import { useUser } from "@auth0/nextjs-auth0";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "../ui/avatar";

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
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-border overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
          title={u?.name || "Account"}
        >
          <Avatar>
            <AvatarImage src={u?.picture || "https://github.com/shadcn.png"} alt={u?.name || "User"} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
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
          <a href="/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
            Settings
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/auth/logout" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
