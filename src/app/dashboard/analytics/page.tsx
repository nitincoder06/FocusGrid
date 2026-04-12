"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData, getPauseAnalytics } from "@/actions/session-actions";
import type { SubjectRadarData, HourlyFocusData, SubjectEntropy } from "@/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, Brain, Clock, AlertTriangle, Pause } from "lucide-react";
import { PAUSE_REASONS } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  const [radarData, setRadarData] = useState<SubjectRadarData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyFocusData[]>([]);
  const [entropyData, setEntropyData] = useState<SubjectEntropy[]>([]);
  const [burndown, setBurndown] = useState<{
    totalEstimated: number;
    totalActual: number;
    remaining: number;
  } | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [pauseStats, setPauseStats] = useState<any>(null);

  useEffect(() => {
    getAnalyticsData().then((data) => {
      setRadarData(data.radarData);
      setHourlyData(data.hourlyData);
      setEntropyData(data.entropyData);
      setBurndown(data.burndown);
      setTotalMinutes(data.totalFocusMinutes);
    });
    getPauseAnalytics().then(setPauseStats);
  }, []);

  // Format hour label
  const formatHour = (h: number) => {
    if (h === 0) return "12am";
    if (h < 12) return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  // Burndown chart data (simulated projection)
  const burndownData = (() => {
    if (!burndown || burndown.totalEstimated === 0) return [];
    const totalDays = 30;
    const dailyRate =
      burndown.totalActual > 0
        ? burndown.totalActual / Math.max(totalDays / 3, 1)
        : 0;
    const data = [];
    for (let i = 0; i <= totalDays; i++) {
      data.push({
        day: i,
        actual: Math.max(
          burndown.totalEstimated - burndown.totalActual * (i / (totalDays / 3)),
          0
        ),
        projected: Math.max(
          burndown.totalEstimated - dailyRate * i,
          0
        ),
        ideal: burndown.totalEstimated * (1 - i / totalDays),
      });
    }
    return data;
  })();

  const staleSubjects = entropyData.filter((e) => e.daysSinceStudy > 3);

  return (
    <div className="space-y-8">
      <motion.div {...fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Deep insights into your study patterns and balance
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Radar Chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Brain className="h-4 w-4 text-primary" />
                Subject Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(99,102,241,0.15)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                    />
                    <Radar
                      name="Hours"
                      dataKey="hours"
                      stroke="rgba(99,102,241,0.8)"
                      fill="rgba(99,102,241,0.25)"
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Study some subjects to see your balance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 24hr Focus Heatmap */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4 text-chart-2" />
                Peak Focus Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalMinutes > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={formatHour}
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                      tickFormatter={(v) => `${v}m`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "rgba(20,20,30,0.9)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={((value: any) => [`${value} min`, "Focus"]) as any}
                      labelFormatter={(label) => formatHour(Number(label))}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="rgba(99,102,241,0.7)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Complete sessions to see your rhythm</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Burndown Chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4 text-emerald-400" />
                Syllabus Burndown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {burndownData.length > 0 && burndown && burndown.totalEstimated > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={burndownData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                        label={{
                          value: "Days",
                          position: "bottom",
                          fill: "rgba(255,255,255,0.3)",
                          fontSize: 10,
                        }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                        label={{
                          value: "Pomos",
                          angle: -90,
                          position: "left",
                          fill: "rgba(255,255,255,0.3)",
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ideal"
                        stroke="rgba(255,255,255,0.2)"
                        fill="rgba(255,255,255,0.03)"
                        strokeDasharray="5 5"
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="rgba(34,197,94,0.7)"
                        fill="rgba(34,197,94,0.1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {burndown.remaining} pomos remaining ·{" "}
                    {burndown.totalActual}/{burndown.totalEstimated} completed
                  </p>
                </>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Add tasks with estimates to see burndown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Entropy Meter */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Subject Entropy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entropyData.length > 0 ? (
                entropyData.map((subject) => {
                  const isStale = subject.daysSinceStudy > 3;
                  const barWidth = Math.min(
                    (subject.totalMinutes / Math.max(...entropyData.map((e) => e.totalMinutes), 1)) * 100,
                    100
                  );

                  return (
                    <div
                      key={subject.id}
                      className={`rounded-xl p-3 transition-all ${
                        isStale
                          ? "animate-entropy-pulse bg-destructive/5 ring-1 ring-destructive/20"
                          : "bg-card/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-sm font-medium">
                            {subject.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isStale ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {subject.daysSinceStudy === 999
                            ? "Never studied"
                            : subject.daysSinceStudy === 0
                            ? "Today"
                            : `${subject.daysSinceStudy}d ago`}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-border/30">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: subject.color,
                            opacity: isStale ? 0.4 : 0.8,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {Math.round(subject.totalMinutes / 60 * 10) / 10}h total
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Add subjects to track entropy</p>
                </div>
              )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pause Reasons Distribution */}
        <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Pause className="h-4 w-4 text-amber-400" />
                Pause Reasons Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pauseStats && pauseStats.reasonStats.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pauseStats.reasonStats}
                        dataKey="count"
                        nameKey="reason"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ reason, count }) => `${reason}: ${count}`}
                      >
                        {pauseStats.reasonStats.map((entry: any, index: number) => {
                          const colors = [
                            "rgba(99,102,241,0.8)",
                            "rgba(168,85,247,0.8)",
                            "rgba(34,197,94,0.8)",
                            "rgba(239,68,68,0.8)",
                            "rgba(251,146,60,0.8)",
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        })}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          background: "rgba(20,20,30,0.9)",
                          border: "1px solid rgba(99,102,241,0.3)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                      Detailed Statistics
                    </h4>
                    {pauseStats.reasonStats.map((stat: any) => (
                      <div
                        key={stat.reason}
                        className="flex items-center justify-between rounded-lg bg-card/50 p-2 text-xs"
                      >
                        <span className="font-medium">
                          {PAUSE_REASONS.find((r) => r.value === stat.reason)?.label ||
                            stat.reason}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold">{stat.count}x</p>
                          <p className="text-muted-foreground">
                            {stat.totalDuration}m total
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">No pauses recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pause Statistics Summary */}
        <motion.div {...fadeUp} transition={{ delay: 0.6 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4 text-chart-2" />
                Pause Time Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pauseStats ? (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-card/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Pauses</p>
                      <p className="text-3xl font-bold">{pauseStats.totalPauses}</p>
                    </div>
                    <div className="rounded-xl bg-card/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Time Paused
                      </p>
                      <p className="text-3xl font-bold">{pauseStats.totalPauseTime}m</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-amber-400/5 border border-amber-400/20 p-4">
                    <p className="text-xs text-amber-600/60 mb-2">Average Pause Duration</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {pauseStats.averagePauseDuration} seconds
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                      Top Pause Reason
                    </h4>
                    {pauseStats.reasonStats.length > 0 && (
                      <div className="rounded-lg bg-card/50 border border-border p-3">
                        <p className="text-sm font-medium">
                          {
                            PAUSE_REASONS.find(
                              (r) =>
                                r.value ===
                                pauseStats.reasonStats.reduce((max: any, stat: any) =>
                                  stat.count > max.count ? stat : max
                                ).reason
                            )?.label
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pauseStats.reasonStats.reduce((max: any, stat: any) =>
                            stat.count > max.count ? stat : max
                          ).count}{" "}
                          times in the last 30 days
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Loading statistics...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Pause Pattern */}
        {pauseStats && pauseStats.dailyStats.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.7 }} className="lg:col-span-2">
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Pause className="h-4 w-4 text-amber-400" />
                  Daily Pause Pattern (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={pauseStats.dailyStats.map((day: any) => ({
                      date: new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }),
                      count: day.count,
                      duration: day.totalDuration,
                    }))}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "rgba(20,20,30,0.9)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}`, "Count/Duration(m)"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="rgba(99,102,241,0.6)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
