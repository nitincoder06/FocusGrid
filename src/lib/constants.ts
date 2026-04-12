import type { TimerConfig, PauseReason, Difficulty } from "@/types";

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  pomosBeforeLongBreak: 4,
};

export const PAUSE_REASONS: { value: PauseReason; label: string; icon: string }[] = [
  { value: "DISTRACTION", label: "Distraction", icon: "📱" },
  { value: "HARD_TOPIC", label: "Hard Topic", icon: "🧠" },
  { value: "BIO_BREAK", label: "Bio Break", icon: "🚶" },
  { value: "URGENT_WORK", label: "Urgent Work", icon: "🚨" },
  { value: "OTHER", label: "Other", icon: "⋯" },
];

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  EASY: { label: "Easy", color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  MEDIUM: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-400/10" },
  HARD: { label: "Hard", color: "text-rose-400", bgColor: "bg-rose-400/10" },
};

export const SUBJECT_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

export const HEATMAP_LEVELS = [
  { min: 0, max: 0, opacity: 0.05, label: "No activity" },
  { min: 1, max: 30, opacity: 0.25, label: "1–30 min" },
  { min: 31, max: 60, opacity: 0.45, label: "31–60 min" },
  { min: 61, max: 120, opacity: 0.7, label: "1–2 hours" },
  { min: 121, max: Infinity, opacity: 1, label: "2+ hours" },
];

export const CINEMA_CREDIT_RATIO = 180; // minutes per credit

export const MAX_STREAK_FREEZES_PER_MONTH = 2;

export const DAILY_NUDGE_HOUR = 21; // 9 PM
