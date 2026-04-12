"use client";

import { Task } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit2Icon, Trash2Icon, ZapIcon } from "lucide-react";
import { ReactNode } from "react";

export interface ContextMenuActions {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
}

interface TaskContextMenuProps {
  task: Task;
  children: ReactNode;
  actions: ContextMenuActions;
}

export function TaskContextMenu({
  task,
  children,
  actions,
}: TaskContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onContextMenu={(e) => e.preventDefault()}>
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            // Trigger dropdown menu on right-click
          }}
        >
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => actions.onStartFocus(task)}
          className="cursor-pointer text-primary"
        >
          <ZapIcon className="mr-2 h-4 w-4" />
          Start Focus
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => actions.onEdit(task)}
          className="cursor-pointer"
        >
          <Edit2Icon className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.onDelete(task)}
          className="cursor-pointer text-destructive"
        >
          <Trash2Icon className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
