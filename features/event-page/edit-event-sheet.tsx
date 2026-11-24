"use client";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/features/ui/sheet";
import { Button } from "@/features/ui/button";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UpdateRequestEventSchemaType } from "./schema";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  EditPlanningEventForm,
  EditPublishedEventForm,
} from "./edit-event-form";

export function EditEventSheet({
  updateEvent,
  teams,
  categories,
  existingEvent,
  isPublished,
}: {
  updateEvent: (
    data: UpdateRequestEventSchemaType
  ) => Promise<{ eventId: number }>;
  teams: {
    id: number;
    name: string;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
  existingEvent: {
    id: number;
    eventName: string;
    startAt: string | null;
    endAt: string | null;
    categoryIds: number[];
    teamIds: number[];
  };
  isPublished: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: UpdateRequestEventSchemaType) => {
    return updateEvent({
      ...data,
      id: existingEvent.id,
    })
      .then(() => {
        toast("イベントを更新しました！");
        router.refresh();
        setIsOpen(false);
      })
      .catch((e) => {
        toast("エラーが発生しました", {
          description: e.message,
        });
      });
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-8 w-full">
          <Pencil2Icon className="h-4 w-4 mr-1"></Pencil2Icon>
          イベントを編集する
        </Button>
      </SheetTrigger>
      {isOpen && (
        <SheetContent side="right" className="flex flex-col">
          <div className="overflow-auto">
            <SheetHeader>
              <SheetTitle>イベント編集</SheetTitle>
            </SheetHeader>
            {isPublished ? (
              <EditPublishedEventForm
                onSubmit={onSubmit}
                categories={categories}
                teams={teams}
                existingEvent={existingEvent}
                Footer={SheetFooter}
              ></EditPublishedEventForm>
            ) : (
              <EditPlanningEventForm
                onSubmit={onSubmit}
                categories={categories}
                teams={teams}
                existingEvent={existingEvent}
                Footer={SheetFooter}
              ></EditPlanningEventForm>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
