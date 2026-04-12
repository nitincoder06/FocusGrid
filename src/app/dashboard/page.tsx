"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/grid/heatmap";
import { getHeatmapData, getAnalyticsData } from "@/actions/session-actions";
import { getSubjects, getTasks } from "@/actions/data-actions";
import { getTodayFocusProgress } from "@/actions/daily-focus-actions";
import type { HeatmapDay } from "@/types";
import { getDailyFocusSettings } from "@/actions/daily-focus-actions";
import {
  Clock,
  Flame,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CINEMA_CREDIT_RATIO } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalFocusMinutes: number;
    burndown: { totalEstimated: number; totalActual: number; remaining: number };
    entropyData: { id: string; name: string; color: string; daysSinceStudy: number; totalMinutes: number }[];
  } | null>(null);
  const [subjects, setSubjects] = useState<{ id: string; name: string; color: string; _count: { tasks: number; focusSessions: number } }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; title: string; status: string; estimatedPomos: number; actualPomos: number; subject: { name: string; color: string } }[]>([]);
  const [dailyProgress, setDailyProgress] = useState<any>(null);
  const [dailySettings, setDailySettings] = useState<any>(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    getHeatmapData(year).then(setHeatmapData);
    getAnalyticsData().then(setAnalytics);
    getSubjects().then((s) => setSubjects(s as typeof subjects));
    getTasks().then((t) => setTasks(t as typeof tasks));
    getTodayFocusProgress().then(setDailyProgress);
    getDailyFocusSettings().then(setDailySettings);
  }, []);

  const totalHours = analytics
    ? Math.round((analytics.totalFocusMinutes / 60) * 10) / 10
    : 0;
  const cinemaCredits = analytics
    ? Math.floor(analytics.totalFocusMinutes / CINEMA_CREDIT_RATIO)
    : 0;

  // Calculate streak
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  const sortedDays = [...heatmapData].reverse();
  for (const day of sortedDays) {
    if (day.date > today) continue;
    if (day.total > 0 || day.isFrozen) {
      streak++;
    } else {
      break;
    }
  }

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ delay: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your consistency engine at a glance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: "Total Focus",
            value: `${totalHours}h`,
            icon: Clock,
            accent: "text-chart-1",
            bg: "bg-chart-1/10",
          },
          {
            label: "Current Streak",
            value: `${streak}`,
            icon: Flame,
            accent: "text-orange-400",
            bg: "bg-orange-400/10",
            sub: "days",
          },
          {
            label: "Tasks Done",
            value: `${completedTasks.length}`,
            icon: Target,
            accent: "text-emerald-400",
            bg: "bg-emerald-400/10",
            sub: `of ${tasks.length}`,
          },
          {
            label: "Cinema Credits",
            value: `${cinemaCredits}`,
            icon: Zap,
            accent: "text-amber-400",
            bg: "bg-amber-400/10",
            sub: "earned",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="glass-card border-border/30 glow-hover transition-all duration-300"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.accent}`} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.sub && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {stat.sub}
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Daily Focus Target Card */}
      {dailySettings && (
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <Card className="glass-card border-border/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Daily Focus Target</p>
                <p className="text-4xl font-bold tracking-tight mb-2">
                  {Math.floor(dailySettings.minimumDailyFocusTime / 60)}h {dailySettings.minimumDailyFocusTime % 60}m
                </p>
                <p className="text-xs text-muted-foreground">
                  Set in your preferences
                </p>
              </div>
              <div className="text-right">
                {dailyProgress ? (
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {Math.min(100, Math.round((dailyProgress.actualFocusTime / dailyProgress.targetTime) * 100))}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {dailyProgress.remainingTime > 0
                        ? `${Math.floor(dailyProgress.remainingTime / 60)}h ${dailyProgress.remainingTime % 60}m left`
                        : "✓ Completed!"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Focus Progress */}
      {dailyProgress && (
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className={`glass-card border-border/30 ${dailyProgress.remainingTime > 0 ? "ring-1 ring-amber-500/30" : "ring-1 ring-emerald-500/30"}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Daily Minimum Focus
                </CardTitle>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  dailyProgress.remainingTime > 0
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {dailyProgress.remainingTime > 0 ? "⏰ At Risk" : "✅ On Track"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Focused Today</p>
                  <p className="text-2xl font-bold">{Math.floor(dailyProgress.actualFocusTime / 60)}h {dailyProgress.actualFocusTime % 60}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Daily Target</p>
                  <p className="text-2xl font-bold">{Math.floor(dailyProgress.targetTime / 60)}h {dailyProgress.targetTime % 60}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                  <p className={`text-2xl font-bold ${dailyProgress.remainingTime > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {Math.floor(dailyProgress.remainingTime / 60)}h {dailyProgress.remainingTime % 60}m
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold">{Math.min(100, dailyProgress.progressPercentage)}%</span>
                </div>
                <Progress value={Math.min(100, dailyProgress.progressPercentage)} className="h-2" />
              </div>

              {dailyProgress.carryOverTime > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">Carry-over Active</p>
                    <p className="text-amber-800/70 dark:text-amber-200/70 text-xs">
                      {Math.floor(dailyProgress.carryOverTime / 60)}h {dailyProgress.carryOverTime % 60}m from yesterday
                    </p>
                  </div>
                </div>
              )}

              {dailyProgress.remainingTime > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">Focus Reminder</p>
                    <p className="text-amber-800/70 dark:text-amber-200/70 text-xs">
                      Complete {Math.floor(dailyProgress.remainingTime / 60)}h {dailyProgress.remainingTime % 60}m more before 10 PM to protect your streak. You'll receive an email reminder at 8 PM if you don't make progress.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Heatmap */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="glass-card border-border/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {new Date().getFullYear()} Contribution Grid
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <Heatmap data={heatmapData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Tasks */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tasks
              </CardTitle>
              <Link href="/dashboard/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  View All →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No active tasks</p>
                  <Link href="/dashboard/tasks" className="mt-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Create Task
                    </Button>
                  </Link>
                </div>
              ) : (
                activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl bg-card/50 p-3"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: task.subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.subject.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          task.actualPomos > 0? Math.min(100, task.actualPomos * 10) : 0
                        }
                        className="h-1.5 w-16"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {task.actualPomos}p
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subjects & Entropy */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subjects
              </CardTitle>
              <Link href="/dashboard/subjects">
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  Manage →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No subjects yet</p>
                  <Link href="/dashboard/subjects" className="mt-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Add Subject
                    </Button>
                  </Link>
                </div>
              ) : (
                subjects.map((subject) => {
                  const entropy = analytics?.entropyData?.find(
                    (e) => e.id === subject.id
                  );
                  const isStale = entropy && entropy.daysSinceStudy > 3;

                  return (
                    <div
                      key={subject.id}
                      className={`flex items-center gap-3 rounded-xl bg-card/50 p-3 ${
                        isStale ? "animate-entropy-pulse ring-1 ring-destructive/30" : ""
                      }`}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{subject.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {subject._count.tasks} tasks · {subject._count.focusSessions} sessions
                        </p>
                      </div>
                      {isStale && (
                        <span className="text-[10px] font-medium text-destructive">
                          ⚠ {entropy.daysSinceStudy}d ago
                        </span>
                      )}
                      {entropy && !isStale && entropy.totalMinutes > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          <TrendingUp className="mr-0.5 inline h-3 w-3" />
                          {Math.round(entropy.totalMinutes / 60)}h
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Action */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Link href="/dashboard/timer">
          <Button
            size="lg"
            className="gap-2 rounded-full bg-primary px-10 text-primary-foreground hover:bg-primary/90 glow-hover"
          >
            <Zap className="h-5 w-5" />
            Start Focusing
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
