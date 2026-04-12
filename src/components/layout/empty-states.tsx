"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ListTodo,
  Clock,
  BarChart3,
  Plus,
  LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}

export function NoSubjects() {
  return (
    <EmptyState
      icon={BookOpen}
      title="No subjects yet"
      description="Create your first subject to start organizing your study"
      action={{ label: "Add Subject", href: "/dashboard/subjects" }}
    />
  );
}

export function NoTasks() {
  return (
    <EmptyState
      icon={ListTodo}
      title="No tasks found"
      description="Create a task to start tracking your progress"
      action={{ label: "Create Task", href: "/dashboard/tasks" }}
    />
  );
}

export function NoSessions() {
  return (
    <EmptyState
      icon={Clock}
      title="No focus sessions yet"
      description="Start your first focus session to see analytics"
      action={{ label: "Start Timer", href: "/dashboard/timer" }}
    />
  );
}

export function NoData() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No data available"
      description="Complete some study sessions to see your analytics"
    />
  );
}
