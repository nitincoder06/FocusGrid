"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { HeatmapDay } from "@/types";
import { HEATMAP_LEVELS } from "@/lib/constants";

interface HeatmapProps {
  data: HeatmapDay[];
  year?: number;
  onDayClick?: (date: string) => void;
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getLevel(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "rgba(99, 102, 241, 0.05)",
  "rgba(99, 102, 241, 0.25)",
  "rgba(99, 102, 241, 0.45)",
  "rgba(99, 102, 241, 0.70)",
  "rgba(99, 102, 241, 1.0)",
];

export function Heatmap({ data, year, onDayClick }: HeatmapProps) {
  const currentYear = year || new Date().getFullYear();

  const { weeks, monthLabels } = useMemo(() => {
    const dayMap = new Map<string, HeatmapDay>();
    data.forEach((d) => dayMap.set(d.date, d));

    // Build weeks grid
    const startDate = new Date(currentYear, 0, 1);
    const startDay = startDate.getDay(); // 0=Sun, 1=Mon...
    // Adjust to start on Monday
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() + mondayOffset);

    const weeksArr: (HeatmapDay | null)[][] = [];
    const labels: { month: string; week: number }[] = [];
    let currentWeek: (HeatmapDay | null)[] = [];
    let lastMonth = -1;
    let weekIdx = 0;

    const endDate = new Date(currentYear, 11, 31);
    const cursor = new Date(gridStart);

    while (cursor <= endDate || currentWeek.length > 0) {
      const dateStr = cursor.toISOString().split("T")[0];
      const isInYear = cursor.getFullYear() === currentYear;

      if (isInYear) {
        const month = cursor.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], week: weekIdx });
          lastMonth = month;
        }
      }

      currentWeek.push(
        isInYear
          ? dayMap.get(dateStr) || {
              date: dateStr,
              total: 0,
              subjects: [],
            }
          : null
      );

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      cursor.setDate(cursor.getDate() + 1);

      if (cursor > endDate && currentWeek.length === 0) break;
      if (cursor.getFullYear() > currentYear && currentWeek.length === 7) break;
    }

    // Push remaining partial week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, monthLabels: labels };
  }, [data, currentYear]);

  const cellSize = 14;
  const cellGap = 3;
  const labelWidth = 32;
  const headerHeight = 20;
  const totalWidth = labelWidth + weeks.length * (cellSize + cellGap);
  const totalHeight = headerHeight + 7 * (cellSize + cellGap);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full overflow-x-auto"
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        className="mx-auto"
        style={{ minWidth: totalWidth }}
      >
        {/* Month labels */}
        {monthLabels.map((label) => (
          <text
            key={`${label.month}-${label.week}`}
            x={labelWidth + label.week * (cellSize + cellGap)}
            y={12}
            className="fill-muted-foreground"
            fontSize={10}
            fontFamily="Inter, sans-serif"
          >
            {label.month}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((day, i) => (
          <text
            key={`day-${i}`}
            x={0}
            y={headerHeight + i * (cellSize + cellGap) + cellSize - 2}
            className="fill-muted-foreground"
            fontSize={9}
            fontFamily="Inter, sans-serif"
          >
            {day}
          </text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return null;
            const x = labelWidth + wi * (cellSize + cellGap);
            const y = headerHeight + di * (cellSize + cellGap);
            const level = getLevel(day.total);
            const isToday =
              day.date === new Date().toISOString().split("T")[0];

            const tooltipText = day.total > 0
              ? `${new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}\n${day.subjects.map(s => `${s.name}: ${s.minutes >= 60 ? `${Math.floor(s.minutes / 60)}h ${s.minutes % 60}m` : `${s.minutes}m`}`).join("\n")}\nTotal: ${day.total >= 60 ? `${Math.floor(day.total / 60)}h ${day.total % 60}m` : `${day.total}m`}`
              : day.isFrozen
              ? `${new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}\n❄️ Streak Frozen`
              : `${new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}\nNo activity`;

            return (
              <motion.rect
                key={day.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={3}
                fill={
                  day.isFrozen
                    ? "rgba(56, 189, 248, 0.4)"
                    : LEVEL_COLORS[level]
                }
                stroke={isToday ? "rgba(99, 102, 241, 0.8)" : "none"}
                strokeWidth={isToday ? 1.5 : 0}
                className="cursor-pointer transition-all duration-200 hover:brightness-150"
                onClick={() => onDayClick?.(day.date)}
                whileHover={{ scale: 1.3 }}
              >
                <title>{tooltipText}</title>
              </motion.rect>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {HEATMAP_LEVELS.map((level, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: LEVEL_COLORS[i] }}
            title={level.label}
          />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
}
