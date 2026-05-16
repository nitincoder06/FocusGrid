import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const sessionId = formData.get("sessionId")?.toString();
    const durationStr = formData.get("duration")?.toString();

    if (!sessionId || !durationStr) {
      return new Response("Missing parameters", { status: 400 });
    }

    const duration = parseInt(durationStr, 10);
    if (isNaN(duration) || duration < 1) {
      return new Response("Invalid duration", { status: 400 });
    }

    // Update session
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId, userId: session.user.id },
      data: {
        endTime: new Date(),
        duration,
        isCompleted: true,
      },
    });

    // If it was a pomodoro session linked to a task, increment actualPomos
    if (updatedSession.taskId && updatedSession.type === "POMODORO") {
      await prisma.task.update({
        where: { id: updatedSession.taskId },
        data: { actualPomos: { increment: 1 } },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/analytics");

    return new Response(
      JSON.stringify({ success: true, session: updatedSession }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
