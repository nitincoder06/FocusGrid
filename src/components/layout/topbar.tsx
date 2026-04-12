"use client";

import { useSession } from "next-auth/react";
import { useTimerStore } from "@/hooks/use-timer";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const { data: session } = useSession();
  const zenMode = useTimerStore((s) => s.zenMode);
  const timerState = useTimerStore((s) => s.state);

  if (zenMode) return null;

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        {timerState === "running" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Focus Active
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Pro</span>
        </div>
        <UserMenu />
      </div>
    </motion.header>
  );
}
