"use client";

import { create } from "zustand";
import type { TimerStore, TimerMode, TimerState } from "@/types";
import { DEFAULT_TIMER_CONFIG } from "@/lib/constants";

const STORAGE_KEY = "focusgrid-timer";

interface StoredTimerState {
  mode: TimerMode;
  state: TimerState;
  elapsed: number;
  totalFocusTime: number;
  pomosCompleted: number;
  activeSubjectId: string | null;
  activeTaskId: string | null;
  activeSessionId: string | null;
  config: typeof DEFAULT_TIMER_CONFIG;
  savedAt: number;
}

function saveToStorage(store: TimerStore) {
  if (typeof window === "undefined") return;
  const data: StoredTimerState = {
    mode: store.mode,
    state: store.state,
    elapsed: store.elapsed,
    totalFocusTime: store.totalFocusTime,
    pomosCompleted: store.pomosCompleted,
    activeSubjectId: store.activeSubjectId,
    activeTaskId: store.activeTaskId,
    activeSessionId: store.activeSessionId,
    config: store.config,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage(): Partial<StoredTimerState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  mode: "pomodoro",
  state: "idle",
  elapsed: 0,
  totalFocusTime: 0,
  pomosCompleted: 0,
  config: DEFAULT_TIMER_CONFIG,
  activeSubjectId: null,
  activeTaskId: null,
  activeSessionId: null,
  zenMode: false,

  // Actions
  setMode: (mode) => {
    const s = get();
    if (s.state !== "idle") return; // Can't switch mid-session
    set({ mode });
    saveToStorage({ ...get() });
  },

  start: () => {
    set({ state: "running", elapsed: 0 });
    saveToStorage({ ...get() });
  },

  pause: () => {
    set({ state: "paused" });
    saveToStorage({ ...get() });
  },

  resume: () => {
    set({ state: "running" });
    saveToStorage({ ...get() });
  },

  reset: () => {
    set({
      state: "idle",
      elapsed: 0,
      totalFocusTime: 0,
      pomosCompleted: 0,
      activeSessionId: null,
    });
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  },

  complete: () => {
    const s = get();
    if (s.mode === "pomodoro") {
      const newPomos = s.pomosCompleted + 1;
      const isLongBreak =
        newPomos % s.config.pomosBeforeLongBreak === 0;
      set({
        state: "break",
        pomosCompleted: newPomos,
        elapsed: 0,
        totalFocusTime:
          s.totalFocusTime + s.config.focusDuration * 60,
      });

      // Auto-transition to break — but store will track breakDuration
      void isLongBreak; // Used for determining break length in UI
    } else {
      // Flow mode — session is fully done
      set({
        state: "idle",
        totalFocusTime: s.totalFocusTime + s.elapsed,
      });
    }
    saveToStorage({ ...get() });
  },

  skipBreak: () => {
    set({ state: "running", elapsed: 0 });
    saveToStorage({ ...get() });
  },

  addFiveMinutes: () => {
    const s = get();
    set({
      config: {
        ...s.config,
        focusDuration: s.config.focusDuration + 5,
      },
    });
    saveToStorage({ ...get() });
  },

  setActiveTask: (subjectId, taskId) => {
    set({ activeSubjectId: subjectId, activeTaskId: taskId });
    saveToStorage({ ...get() });
  },

  setActiveSessionId: (id) => {
    set({ activeSessionId: id });
    saveToStorage({ ...get() });
  },

  toggleZenMode: () => {
    set((s) => ({ zenMode: !s.zenMode }));
  },

  tick: () => {
    const s = get();
    if (s.state !== "running" && s.state !== "break") return;

    const newElapsed = s.elapsed + 1;

    if (s.mode === "pomodoro" && s.state === "running") {
      const target = s.config.focusDuration * 60;
      if (newElapsed >= target) {
        // Pomo complete
        get().complete();
        return;
      }
    }

    if (s.state === "break") {
      const isLongBreak =
        s.pomosCompleted % s.config.pomosBeforeLongBreak === 0;
      const breakTarget = isLongBreak
        ? s.config.longBreakDuration * 60
        : s.config.breakDuration * 60;
      if (newElapsed >= breakTarget) {
        // Break complete — back to focus
        set({ state: "running", elapsed: 0 });
        saveToStorage({ ...get() });
        return;
      }
    }

    set({ elapsed: newElapsed });

    // Save to storage every 5 seconds  to reduce writes
    if (newElapsed % 5 === 0) {
      saveToStorage({ ...get() });
    }
  },

  updateConfig: (config) => {
    set((s) => ({ config: { ...s.config, ...config } }));
    saveToStorage({ ...get() });
  },

  restoreFromStorage: () => {
    const stored = loadFromStorage();
    if (!stored) return;

    // If was running, calculate time drift
    if (stored.state === "running" && stored.savedAt) {
      const driftSeconds = Math.floor((Date.now() - stored.savedAt) / 1000);
      set({
        ...stored,
        elapsed: (stored.elapsed || 0) + driftSeconds,
      } as Partial<TimerStore>);
    } else if (stored.state === "paused" || stored.state === "break") {
      set(stored as Partial<TimerStore>);
    }
    // If idle, don't restore
  },
}));
