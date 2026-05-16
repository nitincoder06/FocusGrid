"use client";

import { Task } from "@prisma/client";
import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit2Icon, Trash2Icon, ZapIcon, MoreVerticalIcon } from "lucide-react";

interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
}

interface TopicTreeProps {
  tasks: TaskWithChildren[];
  level?: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
}

const DIFFICULTY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  EASY: { color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  MEDIUM: { color: "text-amber-400", bgColor: "bg-amber-400/10" },
  HARD: { color: "text-red-400", bgColor: "bg-red-400/10" },
};

export function TopicTree({
  tasks,
  level = 0,
  onEdit,
  onDelete,
  onStartFocus,
}: TopicTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-4 border-l border-border/30 pl-4" : ""}`}>
      {tasks.map((task) => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expanded[task.id];
        const difficultyConfig =
          DIFFICULTY_CONFIG[task.difficulty] || DIFFICULTY_CONFIG.MEDIUM;

        return (
          <div key={task.id}>
            {/* Task Row */}
            <div
              className="group flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:bg-card hover:border-border/80"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(task.id)}
                  className="shrink-0 transition-transform"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-4 shrink-0" />
              )}

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Difficulty Badge */}
              <Badge
                className={`shrink-0 ${difficultyConfig.bgColor} ${difficultyConfig.color} border-0`}
              >
                {task.difficulty}
              </Badge>

              {/* Status Badge */}
              <Badge
                variant={task.status === "COMPLETED" ? "secondary" : "outline"}
                className="shrink-0"
              >
                {task.status === "COMPLETED" ? "✓" : "○"}
              </Badge>

              {/* Context Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => onStartFocus(task)}
                    className="cursor-pointer text-primary"
                  >
                    <ZapIcon className="mr-2 h-4 w-4" />
                    Start Focus
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onEdit(task)}
                    className="cursor-pointer"
                  >
                    <Edit2Icon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="cursor-pointer text-destructive"
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
              <TopicTree
                tasks={task.children!}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onStartFocus={onStartFocus}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
