"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function CardSkeleton() {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-border/50" />
          <div className="h-5 w-32 rounded bg-border/50" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 rounded bg-border/50" />
        <div className="h-3 w-5/6 rounded bg-border/50" />
        <div className="h-3 w-4/6 rounded bg-border/50" />
      </CardContent>
    </Card>
  );
}

export function StatsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="glass-card border-border/30">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-11 w-11 rounded-xl bg-border/50" />
            <div className="flex-1">
              <div className="mb-2 h-3 w-20 rounded bg-border/50" />
              <div className="h-5 w-16 rounded bg-border/50" />
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

export function HeatmapSkeleton() {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 rounded bg-border/50" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-border/20" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border/30 bg-card/50 p-4"
        >
          <div className="h-4 w-4 rounded bg-border/50" />
          <div className="flex-1">
            <div className="mb-2 h-3 w-40 rounded bg-border/50" />
            <div className="h-2 w-32 rounded bg-border/20" />
          </div>
          <div className="h-4 w-12 rounded bg-border/50" />
        </div>
      ))}
    </div>
  );
}

export function TimerSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 h-[320px] w-[320px] rounded-full border-8 border-border/20" />
      <div className="mt-8 h-12 w-48 rounded-full bg-border/50" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-border/50" />
        <div className="h-4 w-64 rounded bg-border/20" />
      </div>

      {/* Stats Grid */}
      <StatsSkeleton />

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
