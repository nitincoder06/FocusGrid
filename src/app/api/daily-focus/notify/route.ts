import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkMissedTarget,
  markNotificationSent,
  getDailyFocusSettings,
  getTodayFocusProgress,
} from "@/actions/daily-focus-actions";
import { sendStreakWarningEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if notification should be sent
    const targetCheck = await checkMissedTarget();
    if (!targetCheck) {
      return NextResponse.json(
        { error: "Could not check target status" },
        { status: 500 }
      );
    }

    if (!targetCheck.shouldNotify) {
      return NextResponse.json({
        notified: false,
        reason: "User is on track or notification already sent",
        targetCheck,
      });
    }

    // Get user settings and progress
    const settings = await getDailyFocusSettings();
    const progress = await getTodayFocusProgress();

    if (!settings || !progress) {
      return NextResponse.json(
        { error: "Could not retrieve user data" },
        { status: 500 }
      );
    }

    // Send email notification
    try {
      await sendStreakWarningEmail({
        email: settings.email!,
        userName: session.user.name || "Study Buddy",
        minimumTime: progress.targetTime,
        actualTime: progress.actualFocusTime,
        remainingTime: progress.remainingTime,
        deadline: targetCheck.deadline,
      });

      // Mark notification as sent
      await markNotificationSent();

      return NextResponse.json({
        notified: true,
        message: "Notification sent successfully",
        details: {
          actualFocusTime: progress.actualFocusTime,
          remainingTime: progress.remainingTime,
          targetTime: progress.targetTime,
          deadline: targetCheck.deadline,
        },
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError instanceof Error ? emailError.message : String(emailError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in daily focus notification:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/monitoring
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const progress = await getTodayFocusProgress();
    const targetCheck = await checkMissedTarget();

    return NextResponse.json({
      progress,
      targetCheck,
      message: "Daily focus status retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching daily focus status:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
