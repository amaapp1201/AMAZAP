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
import { CreateRequestEventSchemaType } from "./schema";
import { PlusIcon } from "@radix-ui/react-icons";
import { EventForm } from "./event-form";

export function NewEventSheet({
  createEvent,
  teams,
  categories,
}: {
  createEvent: (data: CreateRequestEventSchemaType) => Promise<{
    eventId: number;
  }>;
  teams: {
    id: number;
    name: string;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: CreateRequestEventSchemaType) => {
    return createEvent(data)
      .then(() => {
        toast("イベントが作成されました！");
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
          <PlusIcon className="h-4 w-4 mr-1"></PlusIcon>
          イベントを追加
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>新規イベント作成</SheetTitle>
        </SheetHeader>
        <EventForm
          onSubmit={onSubmit}
          categories={categories}
          teams={teams}
          Footer={SheetFooter}
        ></EventForm>
      </SheetContent>
    </Sheet>
  );
}
