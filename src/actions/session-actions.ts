"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { PauseReason} from "@/types";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function startSession(data: {
  type: "POMODORO" | "FLOW";
  subjectId?: string;
  taskId?: string;
}) {
  const userId = await getUserId();
  const session = await prisma.focusSession.create({
    data: {
      type: data.type,
      userId,
      subjectId: data.subjectId || null,
      taskId: data.taskId || null,
    },
  });
  return { success: true, session };
}

export async function completeSession(
  sessionId: string,
  duration: number // total focus minutes
) {
  const userId = await getUserId();

  const session = await prisma.focusSession.update({
    where: { id: sessionId, userId },
    data: {
      endTime: new Date(),
      duration,
      isCompleted: true,
    },
  });

  // If it was a pomodoro session linked to a task, increment actualPomos
  if (session.taskId && session.type === "POMODORO") {
    await prisma.task.update({
      where: { id: session.taskId },
      data: { actualPomos: { increment: 1 } },
    });
  }

  revalidatePath("/dashboard");
  return { success: true, session };
}

export async function logPause(
  sessionId: string,
  reason: PauseReason
) {
  const userId = await getUserId();
  const pauseLog = await prisma.pauseLog.create({
    data: { reason, sessionId, userId },
  });
  return { success: true, pauseLog };
}

export async function resumeFromPause(pauseLogId: string) {
  const pauseLog = await prisma.pauseLog.findUnique({
    where: { id: pauseLogId },
  });
  if (!pauseLog) return { error: "Pause log not found" };

  const duration = Math.floor(
    (Date.now() - pauseLog.pausedAt.getTime()) / 1000
  );

  await prisma.pauseLog.update({
    where: { id: pauseLogId },
    data: { resumedAt: new Date(), duration },
  });

  return { success: true };
}

// ─── Analytics Data ──────────────────────────────────────────────────

export async function getHeatmapData(year: number) {
  const userId = await getUserId();

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      isCompleted: true,
      startTime: { gte: startDate, lte: endDate },
    },
    include: { subject: true },
    orderBy: { startTime: "asc" },
  });

  // Also get streak freezes
  const freezes = await prisma.streakFreeze.findMany({
    where: {
      userId,
      forDate: { gte: startDate, lte: endDate },
    },
  });

  const frozenDates = new Set(
    freezes.map((f) => f.forDate.toISOString().split("T")[0])
  );

  // Group sessions by date
  const dayMap = new Map<
    string,
    { total: number; subjects: Map<string, { name: string; color: string; minutes: number }> }
  >();

  for (const s of sessions) {
    const date = s.startTime.toISOString().split("T")[0];
    if (!dayMap.has(date)) {
      dayMap.set(date, { total: 0, subjects: new Map() });
    }
    const day = dayMap.get(date)!;
    day.total += s.duration;

    if (s.subject) {
      const existing = day.subjects.get(s.subject.id);
      if (existing) {
        existing.minutes += s.duration;
      } else {
        day.subjects.set(s.subject.id, {
          name: s.subject.name,
          color: s.subject.color,
          minutes: s.duration,
        });
      }
    }
  }

  // Build full year data
  const result = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const day = dayMap.get(dateStr);
    result.push({
      date: dateStr,
      total: day?.total || 0,
      subjects: day ? Array.from(day.subjects.values()) : [],
      isFrozen: frozenDates.has(dateStr),
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function getAnalyticsData() {
  const userId = await getUserId();

  // Subject hours for radar chart
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      focusSessions: {
        where: { isCompleted: true },
        select: { duration: true },
      },
    },
  });

  const radarData = subjects.map((s) => ({
    subject: s.name,
    hours: Math.round(
      s.focusSessions.reduce((acc, fs) => acc + fs.duration, 0) / 60 * 10
    ) / 10,
    fullMark: Math.max(
      ...subjects.map((sub) =>
        Math.ceil(
          sub.focusSessions.reduce((acc, fs) => acc + fs.duration, 0) / 60
        )
      ),
      10
    ),
  }));

  // Hourly distribution
  const allSessions = await prisma.focusSession.findMany({
    where: { userId, isCompleted: true },
    select: { startTime: true, duration: true },
  });

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    minutes: 0,
  }));

  for (const s of allSessions) {
    const hour = s.startTime.getHours();
    hourlyData[hour].minutes += s.duration;
  }

  // Subject entropy (days since last study)
  const entropyData = await Promise.all(
    subjects.map(async (s) => {
      const lastSession = await prisma.focusSession.findFirst({
        where: { subjectId: s.id, isCompleted: true },
        orderBy: { startTime: "desc" },
        select: { startTime: true },
      });

      const daysSince = lastSession
        ? Math.floor(
            (Date.now() - lastSession.startTime.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 999;

      return {
        id: s.id,
        name: s.name,
        color: s.color,
        lastStudied: lastSession?.startTime.toISOString() || null,
        daysSinceStudy: daysSince,
        totalMinutes: s.focusSessions.reduce((acc, fs) => acc + fs.duration, 0),
      };
    })
  );

  // Total focus minutes for cinema bank
  const totalFocusMinutes = allSessions.reduce(
    (acc, s) => acc + s.duration,
    0
  );

  // Burndown data
  const tasks = await prisma.task.findMany({
    where: { subject: { userId } },
    select: { actualPomos: true },
  });
  const totalActual = tasks.reduce((a, t) => a + t.actualPomos, 0);

  return {
    radarData,
    hourlyData,
    entropyData,
    totalFocusMinutes,
    burndown: { totalEstimated: 0, totalActual, remaining: 0 },
  };
}

// ─── Streak Freeze ──────────────────────────────────────────────────

export async function useStreakFreeze() {
  const userId = await getUserId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const usedThisMonth = await prisma.streakFreeze.count({
    where: {
      userId,
      usedAt: { gte: monthStart, lte: monthEnd },
    },
  });

  if (usedThisMonth >= 2) {
    return { error: "You've used both streak freezes for this month" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already frozen today
  const alreadyFrozen = await prisma.streakFreeze.findFirst({
    where: { userId, forDate: today },
  });
  if (alreadyFrozen) {
    return { error: "Today is already frozen" };
  }

  await prisma.streakFreeze.create({
    data: { userId, forDate: today },
  });

  revalidatePath("/dashboard");
  return { success: true, remaining: 1 - usedThisMonth };
}

export async function getStreakFreezeCount() {
  const userId = await getUserId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const used = await prisma.streakFreeze.count({
    where: {
      userId,
      usedAt: { gte: monthStart, lte: monthEnd },
    },
  });

  return { used, remaining: 2 - used };
}

// ─── Pause Analytics ────────────────────────────────────────────────

export async function getPauseAnalytics(startDate?: Date, endDate?: Date) {
  const userId = await getUserId();

  const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate || new Date();

  // Get all pause logs in the date range
  const pauseLogs = await prisma.pauseLog.findMany({
    where: {
      userId,
      pausedAt: { gte: start, lte: end },
    },
    include: { session: true },
  });

  // Group by reason and calculate statistics
  const reasonStats: Record<string, { count: number; totalDuration: number; sessions: Set<string> }> = {};
  const dailyStats: Record<string, { count: number; totalDuration: number; reasons: Record<string, number> }> = {};

  for (const log of pauseLogs) {
    const reason = log.reason;
    const duration = log.duration || 0;
    const dateStr = log.pausedAt.toISOString().split('T')[0];

    // Update reason stats
    if (!reasonStats[reason]) {
      reasonStats[reason] = { count: 0, totalDuration: 0, sessions: new Set() };
    }
    reasonStats[reason].count += 1;
    reasonStats[reason].totalDuration += duration;
    reasonStats[reason].sessions.add(log.sessionId);

    // Update daily stats
    if (!dailyStats[dateStr]) {
      dailyStats[dateStr] = { count: 0, totalDuration: 0, reasons: {} };
    }
    dailyStats[dateStr].count += 1;
    dailyStats[dateStr].totalDuration += duration;
    if (!dailyStats[dateStr].reasons[reason]) {
      dailyStats[dateStr].reasons[reason] = 0;
    }
    dailyStats[dateStr].reasons[reason] += 1;
  }

  // Convert sets to numbers for serialization
  const reasonStatsFormatted = Object.entries(reasonStats).map(([reason, stats]) => ({
    reason,
    count: stats.count,
    totalDuration: stats.totalDuration,
    averageDuration: Math.round(stats.totalDuration / stats.count),
    sessionsAffected: stats.sessions.size,
  }));

  const totalPauses = pauseLogs.length;
  const totalPauseTime = pauseLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const averagePauseDuration = totalPauses > 0 ? Math.round(totalPauseTime / totalPauses) : 0;

  return {
    totalPauses,
    totalPauseTime,
    averagePauseDuration,
    reasonStats: reasonStatsFormatted,
    dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      count: stats.count,
      totalDuration: stats.totalDuration,
      reasons: stats.reasons,
    })),
  };
}
