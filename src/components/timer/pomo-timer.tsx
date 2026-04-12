"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/hooks/use-timer";
import { startSession, completeSession } from "@/actions/session-actions";
import { Play, Pause, RotateCcw, SkipForward, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PauseModal } from "./pause-modal";
import { useState } from "react";

export function PomoTimer() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const {
    state,
    elapsed,
    config,
    pomosCompleted,
    activeSubjectId,
    activeTaskId,
    activeSessionId,
    zenMode,
  } = store;

  // Calculate remaining time
  const isBreak = state === "break";
  const isLongBreak = pomosCompleted > 0 && pomosCompleted % config.pomosBeforeLongBreak === 0;
  const totalSeconds = isBreak
    ? (isLongBreak ? config.longBreakDuration : config.breakDuration) * 60
    : config.focusDuration * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  // Format time
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // SVG circle calculations
  const size = 320;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Timer tick
  useEffect(() => {
    if (state === "running" || state === "break") {
      intervalRef.current = setInterval(() => {
        store.tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, store]);

  // Restore from localStorage on mount
  useEffect(() => {
    store.restoreFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(async () => {
    // Create DB session
    const result = await startSession({
      type: "POMODORO",
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
    if (activeSessionId && (elapsed > 0 || store.totalFocusTime > 0)) {
      const focusMinutes = Math.floor((store.totalFocusTime + elapsed) / 60);
      await completeSession(activeSessionId, Math.max(1, focusMinutes)); // At least 1 minute
    }
    store.reset();
  }, [store, activeSessionId, elapsed, config.focusDuration]);

  // Save session if user leaves page or navigates away
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if ((state === "running" || state === "paused") && activeSessionId && elapsed > 0) {
        const focusMinutes = Math.floor((store.totalFocusTime + elapsed) / 60);
        await completeSession(activeSessionId, Math.max(1, focusMinutes));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, activeSessionId, elapsed, store.totalFocusTime]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Timer Ring */}
      <div className="relative">
        <motion.svg
          width={size}
          height={size}
          className={state === "running" ? "animate-timer-glow" : ""}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/30"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.18 270)" />
              <stop offset="100%" stopColor="oklch(0.70 0.15 300)" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isBreak ? "break" : "focus"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Focus"}
              </p>
              <p className="font-mono text-6xl font-bold tracking-tighter">
                {timeDisplay}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pomo {pomosCompleted + (isBreak ? 0 : 1)} / {config.pomosBeforeLongBreak}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3">
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
              Start Focus
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
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={() => store.addFiveMinutes()}
            >
              <Plus className="h-3.5 w-3.5" />
              5 min
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive"
              onClick={handleComplete}
            >
              <RotateCcw className="h-4 w-4" />
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
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive"
              onClick={handleComplete}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {state === "break" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => store.skipBreak()}
              className="gap-2 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <SkipForward className="h-5 w-5" />
              Skip Break
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

      {/* Pause Modal */}
      <PauseModal
        open={showPauseModal}
        onClose={() => setShowPauseModal(false)}
      />
    </div>
  );
}
