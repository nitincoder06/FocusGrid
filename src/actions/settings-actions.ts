"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TimerConfig } from "@/types";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateUserProfile(data: {
  name?: string;
  dailyGoal?: number;
  timerConfig?: Partial<TimerConfig>;
}) {
  const userId = await getUserId();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dailyGoal && { dailyGoal: data.dailyGoal }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function getUserSettings() {
  const userId = await getUserId();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        dailyGoal: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return { error: "Failed to fetch settings" };
  }
}

export async function getDefaultTimerConfig() {
  // This would be used if we implement server-side timer config
  // For now, timer config is client-side with Zustand
  const userId = await getUserId();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });

    return { success: true, user };
  } catch (error) {
    return { error: "Failed to fetch timer config" };
  }
}
