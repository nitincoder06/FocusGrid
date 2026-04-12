import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook to check and send daily focus notification reminder
 * Triggers automatically on app load and again at 8 PM (2 hours before 10 PM deadline)
 */
export function useDailyCheck() {
  const { data: session } = useSession();

  const checkAndNotify = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Check if we've already notified today
      const lastNotifyTime = localStorage.getItem(
        `daily-notify-${new Date().toISOString().split("T")[0]}`
      );
      if (lastNotifyTime) {
        // Already notified today, skip
        return;
      }

      // Call the notification API
      const response = await fetch("/api/daily-focus/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notified) {
          // Mark that we've notified today
          localStorage.setItem(
            `daily-notify-${new Date().toISOString().split("T")[0]}`,
            new Date().toISOString()
          );
          console.log("✉️ Daily focus reminder sent");
        }
      }
    } catch (error) {
      console.error("Error checking daily focus:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Check on app load
    checkAndNotify();

    // Schedule check for 8 PM (2 hours before 10 PM deadline)
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM today, schedule for tomorrow
    if (now > deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }

    const timeUntilDeadline = deadline.getTime() - now.getTime();

    const timer = setTimeout(checkAndNotify, timeUntilDeadline);

    return () => clearTimeout(timer);
  }, [session?.user?.id, checkAndNotify]);
}
