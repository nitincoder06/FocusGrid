"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTimerStore } from "@/hooks/use-timer";
import { PomoTimer } from "@/components/timer/pomo-timer";
import { FlowTimer } from "@/components/timer/flow-timer";
import { getSubjects, getTasks } from "@/actions/data-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Waves, BookOpen, ListTodo } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  subjectId: string;
  difficulty: string;
  actualPomos: number;
}

export default function TimerPage() {
  const { mode, setMode, state, setActiveTask } = useTimerStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  useEffect(() => {
    getSubjects().then((s) => setSubjects(s));
    getTasks().then((t) => setTasks(t));
  }, []);

  useEffect(() => {
    setActiveTask(selectedSubject || null, selectedTask || null);
  }, [selectedSubject, selectedTask, setActiveTask]);

  const filteredTasks = selectedSubject
    ? tasks.filter((t) => t.subjectId === selectedSubject)
    : tasks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-2xl flex-col items-center gap-8"
    >
      {/* Mode Selector - Only when idle */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "pomodoro" | "flow")}
            className="w-auto"
          >
            <TabsList className="bg-card/50 backdrop-blur">
              <TabsTrigger value="pomodoro" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                <Timer className="h-4 w-4" />
                Pomodoro
              </TabsTrigger>
              <TabsTrigger value="flow" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                <Waves className="h-4 w-4" />
                Flow Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      {/* Context Selection - Only when idle */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex w-full max-w-md gap-3"
        >
          <Select
            value={selectedSubject}
            onValueChange={(v) => {
              setSelectedSubject(v || "");
              setSelectedTask("");
            }}
          >
            <SelectTrigger className="flex-1 bg-card/50 border-border/50">
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select subject" />
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

          <Select value={selectedTask} onValueChange={(v) => setSelectedTask(v ?? "")}>
            <SelectTrigger className="flex-1 bg-card/50 border-border/50">
              <ListTodo className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select task" />
            </SelectTrigger>
            <SelectContent>
              {filteredTasks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Timer */}
      <div className="py-8">
        {mode === "pomodoro" ? <PomoTimer /> : <FlowTimer />}
      </div>

      {/* Quick Stats */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid w-full max-w-md grid-cols-3 gap-3"
        >
          {[
            { label: "Today", value: "0h", sub: "Focus time" },
            { label: "Streak", value: "0", sub: "Days" },
            { label: "Pomos", value: "0", sub: "Completed" },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card border-border/30">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
