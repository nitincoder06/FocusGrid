"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User, HelpCircle } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name || "User";
  const userEmail = session.user.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/30 hover:border-primary/50 transition-colors">
          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
        <DropdownMenuLabel>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard/settings">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <User className="h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="cursor-pointer gap-2">
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
