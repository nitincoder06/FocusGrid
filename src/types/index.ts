// ─── Enums (mirrored from Prisma string fields) ─────────────────────

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type SessionType = "POMODORO" | "FLOW";
export type PauseReason =
  | "DISTRACTION"
  | "HARD_TOPIC"
  | "BIO_BREAK"
  | "URGENT_WORK"
  | "OTHER";

// ─── Timer State ─────────────────────────────────────────────────────

export type TimerMode = "pomodoro" | "flow";
export type TimerState = "idle" | "running" | "paused" | "break";

export interface TimerConfig {
  focusDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  pomosBeforeLongBreak: number;
}

export interface TimerStore {
  // State
  mode: TimerMode;
  state: TimerState;
  elapsed: number; // seconds elapsed in current segment
  totalFocusTime: number; // total focus seconds this session
  pomosCompleted: number;
  config: TimerConfig;

  // Context
  activeSubjectId: string | null;
  activeTaskId: string | null;
  activeSessionId: string | null;

  // Zen mode
  zenMode: boolean;

  // Actions
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;
  skipBreak: () => void;
  addFiveMinutes: () => void;
  setActiveTask: (subjectId: string | null, taskId: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
  toggleZenMode: () => void;
  tick: () => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  restoreFromStorage: () => void;
}

// ─── Heatmap ─────────────────────────────────────────────────────────

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  total: number; // total focus minutes
  subjects: {
    name: string;
    color: string;
    minutes: number;
  }[];
  isFrozen?: boolean;
}

// ─── Analytics ───────────────────────────────────────────────────────

export interface SubjectRadarData {
  subject: string;
  hours: number;
  fullMark: number;
}

export interface HourlyFocusData {
  hour: number;
  minutes: number;
}

export interface BurndownPoint {
  date: string;
  remaining: number;
  projected: number;
}

export interface SubjectEntropy {
  id: string;
  name: string;
  color: string;
  lastStudied: string | null;
  daysSinceStudy: number;
  totalMinutes: number;
}

// ─── Cinema Bank ─────────────────────────────────────────────────────

export interface CinemaBankData {
  totalFocusMinutes: number;
  cinemaCredits: number;
  creditsUsed: number;
  creditsAvailable: number;
}
