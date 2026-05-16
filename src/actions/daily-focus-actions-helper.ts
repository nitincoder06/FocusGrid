const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetTodaysTrackingForNewGoal() {
  try {
    const session = await require("@/lib/auth").auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Get latest minimum focus time
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { minimumDailyFocusTime: true },
    });

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today's tracking exists and if its target differs from current minimum
    const todayTracking = await prisma.dailyFocusTracking.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (todayTracking && todayTracking.targetTime !== user.minimumDailyFocusTime) {
      // Update today's tracking to use new minimum (only if not completed yet)
      if (!todayTracking.completed) {
        const updated = await prisma.dailyFocusTracking.update({
          where: { id: todayTracking.id },
          data: {
            targetTime: user.minimumDailyFocusTime,
          },
        });
        return updated;
      }
    }

    return null;
  } catch (error) {
    console.error("Error resetting today's tracking:", error);
    return null;
  }
}

module.exports = { resetTodaysTrackingForNewGoal };
