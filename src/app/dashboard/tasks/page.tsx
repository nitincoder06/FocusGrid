"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubjects, getTasks, createTask, updateTask, deleteTask } from "@/actions/data-actions";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import type { Difficulty, TaskStatus } from "@/types";
import { Plus, Trash2, CheckCircle2, Circle, Timer } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  status: string;
  actualPomos: number;
  subjectId: string;
  subject: { name: string; color: string };
}

export default function TasksPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [s, t] = await Promise.all([getSubjects(), getTasks()]);
    setSubjects(s as Subject[]);
    setTasks(t as Task[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createTask(formData);
    if (result.success) {
      setShowCreate(false);
      loadData();
    }
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    await updateTask(id, { status });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    loadData();
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterSubject !== "all" && t.subjectId !== filterSubject) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "IN_PROGRESS":
        return <Timer className="h-4 w-4 text-amber-400" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Track your study tasks and pomodoro progress
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger>
            <Button className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Trigonometry Practice"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Chapter 5 - Sin, Cos, Tan identities"
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectId">Subject</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            {s.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select name="difficulty" defaultValue="MEDIUM">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">🟢 Easy</SelectItem>
                      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                      <SelectItem value="HARD">🔴 Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v ?? "all")}>
          <SelectTrigger className="w-40 bg-card/50 border-border/50">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-40 bg-card/50 border-border/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, i) => {
            const diff = DIFFICULTY_CONFIG[task.difficulty as Difficulty] || DIFFICULTY_CONFIG.MEDIUM;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="glass-card group border-border/30 glow-hover transition-all duration-300">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Status toggle */}
                    <button
                      onClick={() =>
                        handleStatusChange(
                          task.id,
                          task.status === "COMPLETED" ? "TODO" : "COMPLETED"
                        )
                      }
                      className="transition-transform hover:scale-110"
                    >
                      {statusIcon(task.status)}
                    </button>

                    {/* Subject color */}
                    <div
                      className="h-8 w-1 rounded-full"
                      style={{ backgroundColor: task.subject.color }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            task.status === "COMPLETED"
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${diff.color} ${diff.bgColor} border-0`}
                        >
                          {diff.label}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {task.subject.name}
                        {task.description && ` · ${task.description}`}
                      </p>
                    </div>

                    {/* Pomo Count */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer className="h-3.5 w-3.5" />
                        <span>{task.actualPomos} pomos</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Circle className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              No tasks found
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Create a task to start tracking your progress
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
