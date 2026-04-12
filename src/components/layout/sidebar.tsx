"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Timer,
  LayoutGrid,
  BookOpen,
  ListTodo,
  BarChart3,
  Vault,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/hooks/use-timer";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/timer", label: "Timer", icon: Timer },
  { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/vault", label: "Vault", icon: Vault },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const zenMode = useTimerStore((s) => s.zenMode);

  if (zenMode) return null;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-sidebar-border bg-sidebar md:flex"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 glow-primary">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight gradient-text">
            FocusGrid
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Consistency Engine
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                  )}
                />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
