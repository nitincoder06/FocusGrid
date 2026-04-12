"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useTimerStore } from "@/hooks/use-timer";
import { useDailyCheck } from "@/hooks/use-daily-check";
import { AnimatePresence, motion } from "framer-motion";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const zenMode = useTimerStore((s) => s.zenMode);
  useDailyCheck(); // Initialize daily check on mount

  return (
    <div className="flex min-h-screen">
      <AnimatePresence>
        {!zenMode && <Sidebar />}
      </AnimatePresence>

      <div
        className={`flex flex-1 flex-col transition-all duration-500 ${
          zenMode ? "ml-0" : "ml-0 md:ml-[240px]"
        }`}
      >
        <AnimatePresence>
          {!zenMode && <Topbar />}
        </AnimatePresence>

        <motion.main
          layout
          className="flex-1 p-4 sm:p-6 lg:p-8"
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </div>

      <MobileNav />
    </div>
  );
}
