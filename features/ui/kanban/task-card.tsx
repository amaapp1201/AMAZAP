import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/features/ui/card";
import { Button } from "@/features/ui/button";
import { cva } from "class-variance-authority";
import { EllipsisVertical, GripVertical } from "lucide-react";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/features/helpers/utils";

export interface Task {
  id: UniqueIdentifier;
  columnId: UniqueIdentifier;
  content: ReactNode;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  // deleteTask?: (
  //   columnId: UniqueIdentifier,
  //   taskId: UniqueIdentifier
  // ) => Promise<void>;
  renderEditTask?: (task: Task) => ReactNode;
  isEditable?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export interface NewTaskCardProps {
  onClick: () => void;
}

export function TaskCard({
  task,
  isOverlay,
  renderEditTask,
  isEditable = true,
}: // deleteTask = () => Promise.resolve(),
TaskCardProps) {
  //
  const router = useRouter();
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  // const onDeleteTaskClick = useCallback(() => {
  //   deleteTask(task.columnId, task.id)
  //     .then(() => {
  //       router.refresh();
  //     })
  //     .catch((error) => {
  //       toast({
  //         title: "アーカイブ移動に失敗しました！",
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
      <div className="px-0 py-1.5 space-y-0 grid grid-cols-[min-content_auto_min-content] items-start border-b-2 border-secondary relative">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="px-1 py-0 text-secondary-foreground/50  h-auto cursor-grab self-center"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <div className="text-left whitespace-pre-wrap">{task.content}</div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-6 h-6 text-secondary-foreground/50",
              isEditable ? "visible" : "invisible"
            )}
            disabled={!isEditable}
          >
            <EllipsisVertical className="h-4 w-4"></EllipsisVertical>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col space-y-1">
            {renderEditTask && (
              <DropdownMenuItem asChild>
                {renderEditTask(task)}
              </DropdownMenuItem>
            )}
            {/* <DropdownMenuItem asChild>
              <DeleteWithAlert
                title="アーカイブへ移動する"
                buttonTitle="アーカイブへ移動する"
                description="このタスクをアーカイブへ移動します。"
                continueTitle="アーカイブへ移動"
                onDeleteContinue={() => onDeleteTaskClick()}
              ></DeleteWithAlert>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
