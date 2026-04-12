"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Target,
  TrendingUp,
  Flame,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Play,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { data: session } = useSession();

  if (session?.user) {
    // Redirect to dashboard if already logged in
    return null;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 glow-primary">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold gradient-text">FocusGrid</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-chart-2/5 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20"
            >
              <Flame className="h-4 w-4" />
              Build Unstoppable Study Habits
            </motion.div>

            <h1 className="mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Your Consistency Engine
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Master the Pomodoro technique, track your focus sessions, and earn rewards for
              consistent study habits. FocusGrid turns productivity into a game you actually win.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90 glow-hover sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  Start Free Today
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative mt-20"
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-gradient-to-br from-card/50 to-card/20 p-2 backdrop-blur-xl">
              <div className="rounded-xl bg-background/80 p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      Focus Session
                    </span>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-6xl font-bold tracking-tighter">24:53</p>
                    <p className="mt-2 text-sm text-muted-foreground">Mathematics • Trigonometry</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2 bg-primary/20 text-primary hover:bg-primary/30">
                      <Zap className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button variant="outline" className="flex-1">
                      +5 min
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to build lasting study habits
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Clock,
                title: "Pomodoro & Flow Modes",
                description: "Switch between traditional Pomodoro and free-flowing deep work sessions",
                color: "text-chart-1",
              },
              {
                icon: Target,
                title: "Task Management",
                description: "Organize subjects, tasks, and track progress with estimated vs actual",
                color: "text-emerald-400",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Visualize your study patterns with heatmaps, radar charts, and burndown",
                color: "text-chart-2",
              },
              {
                icon: Flame,
                title: "Streak Tracking",
                description: "Build consistency streaks with emergency freeze protection",
                color: "text-orange-400",
              },
              {
                icon: TrendingUp,
                title: "Subject Entropy",
                description: "Get alerts when subjects go stale, maintain balanced study",
                color: "text-amber-400",
              },
              {
                icon: Zap,
                title: "Cinema Bank",
                description: "Earn rewards through focused work and redeem for entertainment",
                color: "text-primary",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card glow-hover"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 to-card/20 p-8 backdrop-blur-xl sm:p-12">
          <motion.div
            {...staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 sm:grid-cols-3"
          >
            {[
              { label: "Active Users", value: "1.2K+" },
              { label: "Focus Hours Tracked", value: "50K+" },
              { label: "Reward Credits Earned", value: "15K+" },
            ].map((stat, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="mb-2 text-4xl font-bold gradient-text sm:text-5xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Start free, upgrade when you need advanced features
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 sm:grid-cols-2"
          >
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "Unlimited focus sessions",
                  "Pomodoro & Flow modes",
                  "Task management",
                  "Basic analytics",
                  "2 streak freezes/month",
                ],
              },
              {
                name: "Pro",
                price: "$9.99",
                description: "For serious students",
                features: [
                  "Everything in Free",
                  "Advanced analytics",
                  "Custom timer settings",
                  "Email notifications",
                  "Unlimited streak freezes",
                  "Priority support",
                ],
                highlighted: true,
              },
            ].map((tier, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5"
                    : "border-border/50 bg-card/50"
                }`}
              >
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="mb-6 mt-2 text-sm text-muted-foreground">{tier.description}</p>
                <p className="mb-6 text-4xl font-bold">
                  {tier.price}
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <Button
                  className="w-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90"
                  {...(tier.highlighted ? {} : { variant: "outline" })}
                >
                  Get Started
                </Button>
                <div className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center backdrop-blur-xl sm:p-12">
          <motion.div {...fadeUp}>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Start building consistency today
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of students mastering their study habits with FocusGrid
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90 glow-hover"
              >
                <Zap className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-4 sm:gap-12">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-bold">FocusGrid</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your consistency engine for building unbreakable study habits.
              </p>
            </div>
            <div>
              <p className="font-semibold">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Legal</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 FocusGrid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
