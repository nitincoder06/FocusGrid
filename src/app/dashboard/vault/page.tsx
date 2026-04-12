"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAnalyticsData, useStreakFreeze, getStreakFreezeCount } from "@/actions/session-actions";
import { CINEMA_CREDIT_RATIO } from "@/lib/constants";
import {
  Film,
  Snowflake,
  Vault as VaultIcon,
  Ticket,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function VaultPage() {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [freezeData, setFreezeData] = useState({ used: 0, remaining: 2 });
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);

  useEffect(() => {
    getAnalyticsData().then((d) => setTotalMinutes(d.totalFocusMinutes));
    getStreakFreezeCount().then(setFreezeData);
  }, []);

  const cinemaCredits = Math.floor(totalMinutes / CINEMA_CREDIT_RATIO);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const nextCreditMinutes = CINEMA_CREDIT_RATIO - (totalMinutes % CINEMA_CREDIT_RATIO);
  const creditProgress = ((totalMinutes % CINEMA_CREDIT_RATIO) / CINEMA_CREDIT_RATIO) * 100;

  async function handleFreeze() {
    setFreezeLoading(true);
    const result = await useStreakFreeze();
    if (result.error) {
      alert(result.error);
    } else {
      setShowFreezeDialog(false);
      getStreakFreezeCount().then(setFreezeData);
    }
    setFreezeLoading(false);
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight">Vault</h1>
        <p className="mt-1 text-muted-foreground">
          Rewards earned through consistent study
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cinema Bank */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-border/30 overflow-hidden">
            {/* Decorative header */}
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-3/10 to-transparent" />
              <div className="absolute right-6 top-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Film className="h-16 w-16 text-primary/30" />
                </motion.div>
              </div>
              <div className="absolute bottom-4 left-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Cinema Bank
                </p>
                <p className="text-4xl font-bold gradient-text">
                  {cinemaCredits}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    credits
                  </span>
                </p>
              </div>
            </div>

            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Next credit in {nextCreditMinutes} min
                </span>
                <span className="font-mono text-xs text-primary">
                  {Math.round(creditProgress)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${creditProgress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total Focus",
                    value: `${totalHours}h`,
                    icon: VaultIcon,
                  },
                  {
                    label: "Credits Earned",
                    value: cinemaCredits,
                    icon: Ticket,
                  },
                  {
                    label: "Watch Time",
                    value: `${cinemaCredits * 2}h`,
                    icon: Film,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-card/50 p-3 text-center"
                  >
                    <stat.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                Every {CINEMA_CREDIT_RATIO} minutes of focus = 1 Cinema Credit
                (≈2h watch time)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Freeze */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Snowflake className="h-4 w-4 text-cyan-400" />
                Emergency Streak Freeze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-cyan-400">
                  {freezeData.remaining}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  freezes remaining this month
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                      i < freezeData.remaining
                        ? "bg-cyan-400/10 ring-1 ring-cyan-400/30"
                        : "bg-border/20"
                    }`}
                  >
                    <Snowflake
                      className={`h-7 w-7 ${
                        i < freezeData.remaining
                          ? "text-cyan-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-card/50 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="font-medium text-foreground">
                      Protect your streak
                    </p>
                    <p className="mt-1 text-xs">
                      Use a freeze on days you can&apos;t study due to emergencies.
                      Frozen days show ❄️ on your heatmap instead of breaking
                      your streak. Limited to 2 per month.
                    </p>
                  </div>
                </div>
              </div>

              <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
                <DialogTrigger>
                  <Button
                    className="w-full gap-2 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20"
                    disabled={freezeData.remaining === 0}
                  >
                    <Snowflake className="h-4 w-4" />
                    {freezeData.remaining > 0
                      ? "Use Streak Freeze"
                      : "No Freezes Left"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/50 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                      Confirm Streak Freeze
                    </DialogTitle>
                    <DialogDescription>
                      This will freeze today&apos;s date on your heatmap. You
                      have {freezeData.remaining} freeze{freezeData.remaining !== 1 ? "s" : ""}{" "}
                      remaining this month.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setShowFreezeDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
                      disabled={freezeLoading}
                      onClick={handleFreeze}
                    >
                      <Snowflake className="h-4 w-4" />
                      {freezeLoading ? "Freezing..." : "Confirm"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {freezeData.used > 0 && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {freezeData.used} freeze{freezeData.used !== 1 ? "s" : ""} used
                    this month
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
