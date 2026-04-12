"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateUserProfile, getDefaultTimerConfig } from "@/actions/settings-actions";
import { updateMinimumDailyFocusTime, getDailyFocusSettings } from "@/actions/daily-focus-actions";
import { DEFAULT_TIMER_CONFIG } from "@/lib/constants";
import { User, Clock, Save, Loader2, Target } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(120);
  const [minimumDailyFocusTime, setMinimumDailyFocusTime] = useState(120);

  // Timer config state
  const [focusDuration, setFocusDuration] = useState(DEFAULT_TIMER_CONFIG.focusDuration);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_TIMER_CONFIG.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(
    DEFAULT_TIMER_CONFIG.longBreakDuration
  );
  const [pomosBeforeLongBreak, setPomosBeforeLongBreak] = useState(
    DEFAULT_TIMER_CONFIG.pomosBeforeLongBreak
  );

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }

    // Load daily focus settings
    const loadSettings = async () => {
      const settings = await getDailyFocusSettings();
      if (settings?.minimumDailyFocusTime) {
        setMinimumDailyFocusTime(settings.minimumDailyFocusTime);
      }
    };

    loadSettings();
  }, [session]);

  async function handleSaveProfile() {
    setLoading(true);
    setSaved(false);

    try {
      const result = await updateUserProfile({
        name,
        dailyGoal: parseInt(dailyGoal.toString()),
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMinimumFocusTime() {
    setLoading(true);
    setSaved(false);

    try {
      await updateMinimumDailyFocusTime(parseInt(minimumDailyFocusTime.toString()));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving minimum daily focus time:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTimerConfig() {
    setLoading(true);
    setSaved(false);

    try {
      const result = await updateUserProfile({
        timerConfig: {
          focusDuration: parseInt(focusDuration.toString()),
          breakDuration: parseInt(breakDuration.toString()),
          longBreakDuration: parseInt(longBreakDuration.toString()),
          pomosBeforeLongBreak: parseInt(pomosBeforeLongBreak.toString()),
        },
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving timer config:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleResetTimerConfig = () => {
    setFocusDuration(DEFAULT_TIMER_CONFIG.focusDuration);
    setBreakDuration(DEFAULT_TIMER_CONFIG.breakDuration);
    setLongBreakDuration(DEFAULT_TIMER_CONFIG.longBreakDuration);
    setPomosBeforeLongBreak(DEFAULT_TIMER_CONFIG.pomosBeforeLongBreak);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Customize your profile and timer preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-border/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Goal (minutes)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="dailyGoal"
                  type="number"
                  min={15}
                  max={480}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 120)}
                  className="bg-background/50 max-w-xs"
                />
                <span className="text-sm text-muted-foreground">
                  {Math.round(dailyGoal / 60 * 10) / 10}h per day
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Set your target focus time each day to track consistency
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumDailyFocusTime">Minimum Daily Focus Time (minutes)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="minimumDailyFocusTime"
                  type="number"
                  min={15}
                  max={480}
                  value={minimumDailyFocusTime}
                  onChange={(e) => setMinimumDailyFocusTime(parseInt(e.target.value) || 120)}
                  className="bg-background/50 max-w-xs"
                />
                <span className="text-sm text-muted-foreground">
                  {Math.round(minimumDailyFocusTime / 60 * 10) / 10}h per day
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum focus time required to maintain your streak. You'll get a warning 2 hours before the 10 PM deadline if you haven't met this goal.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                💡 Tip: If you miss this target, the remaining time carries over to the next day.
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </Button>

            <Button
              onClick={handleSaveMinimumFocusTime}
              disabled={loading}
              className="w-full gap-2 bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              Save Minimum Focus Time
            </Button>

            {saved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400"
              >
                ✓ Profile updated successfully
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Timer Configuration Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="glass-card border-border/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-1" />
              <div>
                <CardTitle>Timer Configuration</CardTitle>
                <CardDescription>Customize your Pomodoro settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                <Input
                  id="focusDuration"
                  type="number"
                  min={5}
                  max={60}
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakDuration">Short Break (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min={1}
                  max={15}
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                <Input
                  id="longBreakDuration"
                  type="number"
                  min={5}
                  max={30}
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pomosBeforeLongBreak">Pomos Before Long Break</Label>
                <Input
                  id="pomosBeforeLongBreak"
                  type="number"
                  min={2}
                  max={8}
                  value={pomosBeforeLongBreak}
                  onChange={(e) => setPomosBeforeLongBreak(parseInt(e.target.value) || 4)}
                  className="bg-background/50"
                />
              </div>
            </div>

            {/* Current Schedule Preview */}
            <div className="rounded-lg bg-card/50 p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Schedule Preview</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Focus sessions:</span>
                  <Badge variant="outline">{focusDuration}m each</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Short breaks (after each pomo):</span>
                  <Badge variant="outline">{breakDuration}m each</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Long break (after every {pomosBeforeLongBreak} pomos):</span>
                  <Badge variant="outline">{longBreakDuration}m</Badge>
                </div>
                <div className="border-t border-border/30 pt-2">
                  <span className="text-muted-foreground">
                    Full cycle: ~{" "}
                    {Math.round(
                      focusDuration * pomosBeforeLongBreak +
                        (pomosBeforeLongBreak - 1) * breakDuration +
                        longBreakDuration
                    )}{" "}
                    minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveTimerConfig}
                disabled={loading}
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Configuration
              </Button>
              <Button
                onClick={handleResetTimerConfig}
                variant="outline"
                className="flex-1"
              >
                Reset to Default
              </Button>
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400"
              >
                ✓ Timer configuration updated successfully
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* About Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              About FocusGrid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              FocusGrid is your consistency engine for building unbreakable study habits through
              focused work sessions, analytics, and gamified rewards.
            </p>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Version</p>
              <p>0.1.0 Beta</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
