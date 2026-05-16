"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/hooks/use-timer";
import { logPause } from "@/actions/session-actions";
import { PAUSE_REASONS } from "@/lib/constants";
import type { PauseReason } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PauseModalProps {
  open: boolean;
  onClose: () => void;
}

export function PauseModal({ open, onClose }: PauseModalProps) {
  const [selected, setSelected] = useState<PauseReason | null>(null);
  const [loading, setLoading] = useState(false);
  const activeSessionId = useTimerStore((s) => s.activeSessionId);

  async function handleSubmit() {
    if (!selected || !activeSessionId) return;
    setLoading(true);

    try {
      console.log("Logging pause reason:", selected);
      await logPause(activeSessionId, selected);
      console.log("Pause reason logged successfully");
    } catch (error) {
      console.error("Error logging pause:", error);
    }
    
    setLoading(false);
    setSelected(null);
    onClose();
  }

  function handleSkip() {
    setSelected(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card max-w-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Why did you pause?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Help us understand your focus patterns
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <AnimatePresence>
            {PAUSE_REASONS.map((reason, i) => (
              <motion.button
                key={reason.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(reason.value)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  selected === reason.value
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "bg-card hover:bg-accent"
                }`}
              >
                <span className="text-lg">{reason.icon}</span>
                {reason.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!selected || loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Log & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
