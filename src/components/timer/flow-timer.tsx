"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTimerStore } from "@/hooks/use-timer";
import { startSession, completeSession } from "@/actions/session-actions";
import { Play, Pause, Square, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PauseModal } from "./pause-modal";
import { useState } from "react";

export function FlowTimer() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const {
    state,
    elapsed,
    activeSubjectId,
    activeTaskId,
    activeSessionId,
    zenMode,
  } = store;

  // Format time (HH:MM:SS)
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeDisplay = hours > 0
    ? `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

  // Timer tick
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        store.tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, store]);

  useEffect(() => {
    store.restoreFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(async () => {
    const result = await startSession({
      type: "FLOW",
      subjectId: activeSubjectId || undefined,
      taskId: activeTaskId || undefined,
    });
    if (result.success && result.session) {
      store.setActiveSessionId(result.session.id);
    }
    store.start();
  }, [store, activeSubjectId, activeTaskId]);

  const handlePause = useCallback(() => {
    store.pause();
    setShowPauseModal(true);
  }, [store]);

  const handleResume = useCallback(() => {
    store.resume();
  }, [store]);

  const handleComplete = useCallback(async () => {
    if (activeSessionId) {
      const focusMinutes = Math.floor(elapsed / 60);
      await completeSession(activeSessionId, Math.max(focusMinutes, 1));
    }
    store.reset();
  }, [store, activeSessionId, elapsed]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center"
      >
        {/* Ambient glow */}
        {state === "running" && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-20 rounded-full bg-primary/10 blur-[80px]"
          />
        )}

        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {state === "idle" ? "Ready to Flow" : "Deep Focus"}
        </p>

        <motion.p
          className="relative font-mono text-8xl font-bold tracking-tighter"
          animate={
            state === "running"
              ? { textShadow: ["0 0 20px rgba(99,102,241,0.3)", "0 0 40px rgba(99,102,241,0.1)"] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          {timeDisplay}
        </motion.p>

        {elapsed > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {Math.floor(elapsed / 60)} minute{Math.floor(elapsed / 60) !== 1 ? "s" : ""} of deep work
          </p>
        )}
      </motion.div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-3">
        {state === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="lg"
              onClick={handleStart}
              className="gap-2 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90 glow-hover"
            >
              <Play className="h-5 w-5" />
              Enter Flow
            </Button>
          </motion.div>
        )}

        {state === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handlePause}
            >
              <Pause className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={handleComplete}
              className="gap-2 rounded-full bg-destructive/20 px-6 text-destructive hover:bg-destructive/30"
            >
              <Square className="h-4 w-4" />
              End Session
            </Button>
          </motion.div>
        )}

        {state === "paused" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <Button
              size="lg"
              onClick={handleResume}
              className="gap-2 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90 glow-hover"
            >
              <Play className="h-5 w-5" />
              Resume
            </Button>
            <Button
              size="lg"
              onClick={handleComplete}
              className="gap-2 rounded-full bg-destructive/20 px-6 text-destructive hover:bg-destructive/30"
            >
              <Square className="h-4 w-4" />
              End
            </Button>
          </motion.div>
        )}
      </div>

      {/* Zen Mode Toggle */}
      {state !== "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => store.toggleZenMode()}
            className="gap-2 text-xs text-muted-foreground"
          >
            {zenMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Exit Zen Mode
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Zen Mode
              </>
            )}
          </Button>
        </motion.div>
      )}

      <PauseModal
        open={showPauseModal}
        onClose={() => setShowPauseModal(false)}
      />
    </div>
  );
}
