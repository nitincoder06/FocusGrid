"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { TopicTree } from "@/components/tree/topic-tree";
import { getSubjects, createSubject, deleteSubject, createTask, deleteTask } from "@/actions/data-actions";
import { startSession } from "@/actions/session-actions";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Plus, Trash2, BookOpen, Clock } from "lucide-react";
import { useTimerStore } from "@/hooks/use-timer";
import { Task } from "@prisma/client";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  _count: { tasks: number; focusSessions: number };
  tasks: (Task & { children?: Task[] })[];
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const store = useTimerStore();
  const router = useRouter();

  const loadSubjects = async () => {
    const data = await getSubjects();
    setSubjects(data as Subject[]);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleCreateSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);

    const result = await createSubject(formData);
    if (result.success) {
      setShowCreateSubject(false);
      await loadSubjects();
    }
    setLoading(false);
  }

  async function handleCreateTopic(subjectId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("subjectId", subjectId);
    formData.set("difficulty", selectedDifficulty);

    const result = await createTask(formData);
    if (result.success) {
      setShowCreateTopic(null);
      await loadSubjects();
    }
    setLoading(false);
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm("Delete this subject and all its topics?")) return;
    await deleteSubject(id);
    await loadSubjects();
  }

  async function handleDeleteTopic(id: string) {
    if (!confirm("Delete this topic and all its subtopics?")) return;
    await deleteTask(id);
    await loadSubjects();
  }

  async function handleEditTopic(task: Task) {
    // TODO: Show edit dialog
    console.log("Edit topic:", task);
  }

  async function handleStartFocus(task: Task) {
    setLoading(true);
    try {
      const result = await startSession({
        type: "POMODORO",
        subjectId: task.subjectId,
        taskId: task.id,
      });
      if (result.success) {
        store.setActiveTask(task.subjectId, task.id);
        store.setActiveSessionId(result.session.id);
        router.push("/dashboard/timer");
      }
    } finally {
      setLoading(false);
    }
}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="mt-1 text-muted-foreground">
            Organize your learning by subject with hierarchical topics
          </p>
        </div>
        <Dialog open={showCreateSubject} onOpenChange={setShowCreateSubject}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Subject
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Mathematics, History"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-lg border-2 ${
                        selectedColor === color
                          ? "border-white ring-2 ring-primary"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Subject"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="mb-2 text-lg font-medium">No subjects yet</p>
            <p className="text-sm text-muted-foreground">Create your first subject to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {subject.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {subject._count.tasks} topics · {subject._count.focusSessions} sessions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topics Tree */}
                {subject.tasks && subject.tasks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Topics</p>
                    <TopicTree
                      tasks={subject.tasks}
                      onEdit={handleEditTopic}
                      onDelete={handleDeleteTopic}
                      onStartFocus={handleStartFocus}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-muted-foreground">No topics yet</p>
                  </div>
                )}

                {/* Add Topic Dialog */}
                <Dialog
                  open={showCreateTopic === subject.id}
                  onOpenChange={(open) =>
                    setShowCreateTopic(open ? subject.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-border/50 py-2 text-sm text-muted-foreground hover:border-border hover:text-foreground transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                      Add Topic
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Topic to {subject.name}</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => handleCreateTopic(subject.id, e)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="title">Topic Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Algebra Basics"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                          id="description"
                          name="description"
                          placeholder="Add details..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={selectedDifficulty}
                          onValueChange={setSelectedDifficulty}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? "Adding..." : "Add Topic"}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
