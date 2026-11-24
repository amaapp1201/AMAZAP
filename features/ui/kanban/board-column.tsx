"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode, useCallback, useMemo } from "react";
import { Task, TaskCard } from "./task-card";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "@/features/ui/card";
import { Button } from "@/features/ui/button";
import { EllipsisVertical, GripVertical } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/features/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/features/helpers/utils";

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
  renderNewTask?: (renderProps: {
    columnId: UniqueIdentifier;
    isDisabled: boolean;
  }) => ReactNode;
  // deleteTask?: (
  //   columnId: UniqueIdentifier,
  //   taskId: UniqueIdentifier
  // ) => Promise<void>;
  // deleteColumn?: (columnId: UniqueIdentifier) => Promise<void>;
  renderEditColumn?: (column: Column) => ReactNode;
  renderEditTask?: (task: Task) => ReactNode;
  isEditable?: boolean;
}

export function BoardColumn({
  column,
  tasks,
  isOverlay,
  renderNewTask = () => null,
  // deleteTask = () => Promise.resolve(),
  // deleteColumn = () => Promise.resolve(),
  renderEditColumn,
  renderEditTask,
  isEditable = true,
}: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const router = useRouter();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "h-[500px] max-h-[500px] w-[250px] max-w-full  flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  // const onDeleteColumnClick = useCallback(() => {
  //   if (tasks.length > 0) {
  //     toast({
  //       title: "カラム内にタスクが存在するため削除できません！",
  //     });
  //     return;
  //   }

  //   deleteColumn(column.id)
  //     .then(() => {
  //       router.refresh();
  //     })
  //     .catch((error) => {
  //       toast({
  //         title: "アイテムの削除に失敗しました！",
  //         description: error.message,
  //       });
  //     });
  // }, []);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="px-4 py-2 font-semibold border-b-2 text-left flex flex-row space-between items-center space-y-0">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className=" p-1 text-slate-600 -ml-2 h-auto cursor-grab relative"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <div className="ml-auto flex items-center">
          <span className="font-bold text-slate-600">{column.title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "w-6 h-6 text-secondary-foreground/50 flex justify-center items-center -mr-2 self-start",
                isEditable ? "visible" : "invisible"
              )}
              disabled={!isEditable}
            >
              <EllipsisVertical className="h-4 w-4"></EllipsisVertical>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col space-y-1">
              {renderEditColumn && (
                <DropdownMenuItem asChild>
                  {renderEditColumn(column)}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          {renderNewTask({ columnId: column.id, isDisabled: !isEditable })}
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                // deleteTask={deleteTask}
                renderEditTask={renderEditTask}
                isEditable={isEditable}
              />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-start pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-start">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
