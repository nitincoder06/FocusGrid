"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper functions for date handling
// Store sessions with the date string to match stored data
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface DailyFocusProgress {
  actualFocusTime: number;
  targetTime: number;
  carryOverTime: number;
  completed: boolean;
  notificationSent: boolean;
  remainingTime: number;
  progressPercentage: number;
}

/**
 * Get today's focus progress (actual + target with carry-over)
 */
export async function getTodayFocusProgress(): Promise<DailyFocusProgress | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    if (!prisma) {
      console.error("Prisma client not initialized");
      return null;
    }

    const userId = session.user.id;
    const now = new Date();
    // Use UTC date for consistency with heatmap data (which uses toISOString().split("T")[0])
    const today = now.toISOString().split("T")[0];
    const dayStart = new Date(today + "T00:00:00Z");
    const dayEnd = new Date(today + "T23:59:59.999Z");

    // Get or create today's tracking record
    let tracking = await prisma.dailyFocusTracking.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(today),
        },
      },
    });

    // If not exists, need to check yesterday for carry-over
    if (!tracking) {
      const yesterdayDate = new Date(dayStart);
      yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
      const yesterday = yesterdayDate;
      const yesterdayTracking = await prisma.dailyFocusTracking.findUnique({
        where: {
          userId_date: {
            userId,
            date: yesterday,
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { minimumDailyFocusTime: true },
      });

      let carryOverTime = 0;
      if (yesterdayTracking && !yesterdayTracking.completed) {
        carryOverTime = Math.max(
          0,
          yesterdayTracking.targetTime - yesterdayTracking.actualFocusTime
        );
      }

      const targetTime =
        (user?.minimumDailyFocusTime || 120) + carryOverTime;

      tracking = await prisma.dailyFocusTracking.create({
        data: {
          userId,
          date: new Date(today),
          actualFocusTime: 0,
          carryOverTime,
          targetTime,
          completed: false,
          notificationSent: false,
        },
      });
    }

    // Calculate actual focus time from today's sessions
    const sessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: { duration: true, isCompleted: true },
    });

    const actualFocusTime = sessions
      .filter((s) => s.isCompleted)
      .reduce((sum, s) => sum + s.duration, 0);

    // Update the tracking record with actual time and mark completed if target reached
    const updated = await prisma.dailyFocusTracking.update({
      where: { id: tracking.id },
      data: { 
        actualFocusTime,
        completed: actualFocusTime >= tracking.targetTime,
      },
    });

    const remainingTime = Math.max(0, updated.targetTime - actualFocusTime);
    const progressPercentage = Math.round(
      (actualFocusTime / updated.targetTime) * 100
    );

    return {
      actualFocusTime,
      targetTime: updated.targetTime,
      carryOverTime: updated.carryOverTime,
      completed: updated.completed,
      notificationSent: updated.notificationSent,
      remainingTime,
      progressPercentage: Math.min(100, progressPercentage),
    };
  } catch (error) {
    console.error("Error getting daily focus progress:", error);
    return null;
  }
}

/**
 * Get this user's minimum daily focus time and current progress
 */
export async function getDailyFocusSettings() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { minimumDailyFocusTime: true, email: true },
    });

    return user;
  } catch (error) {
    console.error("Error getting daily focus settings:", error);
    return null;
  }
}

/**
 * Update user's minimum daily focus time
 */
export async function updateMinimumDailyFocusTime(minutes: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Validate input
    if (minutes < 15 || minutes > 480) {
      throw new Error("Minimum daily focus time must be between 15 and 480 minutes");
    }

    const userId = session.user.id;

    // First update the user's minimum
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { minimumDailyFocusTime: minutes },
      select: { minimumDailyFocusTime: true },
    });

    // Also update today's tracking if it exists and goal wasn't completed yet
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayDate = new Date(today);

    const todayTracking = await prisma.dailyFocusTracking.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayDate,
        },
      },
    });

    if (todayTracking && !todayTracking.completed) {
      // Update today's target to the new minimum value
      await prisma.dailyFocusTracking.update({
        where: { id: todayTracking.id },
        data: {
          targetTime: minutes,
          // Recalculate if now completed
          completed: todayTracking.actualFocusTime >= minutes,
        },
      });
    }

    // Invalidate cache on both dashboard and settings pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return updated;
  } catch (error) {
    console.error("Error updating minimum daily focus time:", error);
    throw error;
  }
}

/**
 * Check if user will miss target and should be notified
 * Returns remaining time if notification should be sent, null otherwise
 */
export async function checkMissedTarget(): Promise<{
  shouldNotify: boolean;
  remainingTime: number;
  targetTime: number;
  deadline: string;
} | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const progress = await getTodayFocusProgress();
    if (!progress) return null;

    // Should notify if:
    // 1. Not already notified
    // 2. Will not meet target
    // 3. Less than 2 hours away from deadline
    const willMissTarget = progress.remainingTime > 0;
    const deadlineHour = parseInt(process.env.DAILY_FOCUS_DEADLINE_HOUR || "22");
    const now = new Date();
    const hoursUntilDeadline =
      deadlineHour - now.getHours() + (now.getMinutes() > 0 ? 0 : 1);

    const shouldNotify =
      !progress.notificationSent &&
      willMissTarget &&
      hoursUntilDeadline <= 2 &&
      hoursUntilDeadline > 0;

    return {
      shouldNotify,
      remainingTime: progress.remainingTime,
      targetTime: progress.targetTime,
      deadline: `${deadlineHour}:00`,
    };
  } catch (error) {
    console.error("Error checking missed target:", error);
    return null;
  }
}

/**
 * Mark notification as sent for today
 */
export async function markNotificationSent() {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayDate = new Date(today);
    
    await prisma.dailyFocusTracking.update({
      where: {
        userId_date: {
          userId: session.user.id,
          date: todayDate,
        },
      },
      data: { notificationSent: true },
    });

    return true;
  } catch (error) {
    console.error("Error marking notification as sent:", error);
    return false;
  }
}

/**
 * Complete today's tracking - should be called at deadline (e.g., 10 PM)
 * Creates tomorrow's record with carry-over if needed
 */
export async function completeDailyTracking() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    const todayTracking = await prisma.dailyFocusTracking.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!todayTracking) return null;

    // Calculate if completed and carry-over for tomorrow
    const completed = todayTracking.actualFocusTime >= todayTracking.targetTime;
    const carryOver = completed
      ? 0
      : Math.max(0, todayTracking.targetTime - todayTracking.actualFocusTime);

    // Update today's record
    await prisma.dailyFocusTracking.update({
      where: { id: todayTracking.id },
      data: { completed },
    });

    // Create or update tomorrow's record with carry-over
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { minimumDailyFocusTime: true },
    });

    const tomorrowTarget = (user?.minimumDailyFocusTime || 120) + carryOver;

    const tomorrowTracking = await prisma.dailyFocusTracking.upsert({
      where: {
        userId_date: {
          userId,
          date: tomorrow,
        },
      },
      create: {
        userId,
        date: tomorrow,
        actualFocusTime: 0,
        carryOverTime: carryOver,
        targetTime: tomorrowTarget,
        completed: false,
        notificationSent: false,
      },
      update: {
        carryOverTime: carryOver,
        targetTime: tomorrowTarget,
      },
    });

    return {
      completed,
      carryOver,
      tomorrow: tomorrowTracking,
    };
  } catch (error) {
    console.error("Error completing daily tracking:", error);
    return null;
  }
}
