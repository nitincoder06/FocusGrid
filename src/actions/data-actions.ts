"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Subjects ────────────────────────────────────────────────────────

export async function createSubject(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;

  if (!name) return { error: "Subject name is required" };

  try {
    const subject = await prisma.subject.create({
      data: { name, color: color || "#6366f1", icon: icon || null, userId },
    });
    revalidatePath("/dashboard");
    return { success: true, subject };
  } catch {
    return { error: "Subject with this name already exists" };
  }
}

export async function updateSubject(id: string, formData: FormData) {
  const userId = await getUserId();
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;

  const subject = await prisma.subject.update({
    where: { id, userId },
    data: { name, color, icon: icon || null },
  });
  revalidatePath("/dashboard");
  return { success: true, subject };
}

export async function deleteSubject(id: string) {
  const userId = await getUserId();
  await prisma.subject.delete({ where: { id, userId } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getSubjects() {
  const userId = await getUserId();
  return prisma.subject.findMany({
    where: { userId },
    include: {
      _count: { select: { tasks: true, focusSessions: true } },
      tasks: {
        where: { parentId: null }, // Only get top-level tasks
        include: {
          children: {
            include: {
              children: true, // Up to 3 levels deep
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const subjectId = formData.get("subjectId") as string;
  const parentId = formData.get("parentId") as string;

  if (!title || !subjectId) return { error: "Title and subject are required" };

  // Verify subject belongs to user
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { error: "Subject not found" };

  // If parentId provided, verify it exists and belongs to same subject
  if (parentId) {
    const parentTask = await prisma.task.findFirst({
      where: { id: parentId, subjectId },
    });
    if (!parentTask) return { error: "Parent task not found" };
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      difficulty: difficulty || "MEDIUM",
      subjectId,
      parentId: parentId || null,
    },
    include: { children: true },
  });
  revalidatePath("/dashboard");
  return { success: true, task };
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  await getUserId();
  const task = await prisma.task.update({
    where: { id },
    data: data as Parameters<typeof prisma.task.update>[0]["data"],
  });
  revalidatePath("/dashboard");
  return { success: true, task };
}

export async function deleteTask(id: string) {
  await getUserId();
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTasks(subjectId?: string) {
  const userId = await getUserId();
  return prisma.task.findMany({
    where: {
      subject: { userId },
      parentId: null, // Only get top-level tasks for tasks page
      ...(subjectId ? { subjectId } : {}),
    },
    include: {
      subject: true,
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
