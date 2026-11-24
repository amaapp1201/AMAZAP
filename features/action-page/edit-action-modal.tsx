"use client";

import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { ActionForm, LocalShcmeaType } from "./action-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function EditActionModal({
  category_id,
  categories,
  updateAction,
  action,
}: {
  category_id?: number;
  categories: {
    id: number;
    name: string;
  }[];
  updateAction: (data: {
    id: number;
    name: string;
    point: number;
    category_id: number;
  }) => Promise<any>;
  action: {
    id: number;
    name: string;
    point: number;
    category_id: number;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return updateAction({
      ...data,
      id: action.id,
    })
      .then(() => {
        toast("アクションを更新しました！");
        router.refresh();
        setIsOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast("アクションの更新に失敗しました！", {
          description: e.message,
        });
      });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full">
          <Pencil2Icon className="h-4 w-4 mr-1"></Pencil2Icon>
          アクションを編集
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>アクションを編集する</DialogTitle>
        </DialogHeader>
        <ActionForm
          categories={categories}
          category_id={category_id}
          existingAction={action}
          onSubmit={onSubmit}
          Footer={DialogFooter}
          onDismiss={() => setIsOpen(false)}
          flow="edit"
        ></ActionForm>
      </DialogContent>
    </Dialog>
  );
}
