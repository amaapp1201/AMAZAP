"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { ActionForm, LocalShcmeaType } from "./action-form";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewActionModal({
  category_id,
  categories,
  createNewAction,
  disabled = false,
}: {
  category_id?: number;
  categories: {
    id: number;
    name: string;
  }[];
  createNewAction: (data: LocalShcmeaType) => Promise<void>;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return createNewAction(data)
      .then(() => {
        toast("アクションを作成しました！");
        router.refresh();
        setIsOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast("アクションの作成に失敗しました！", {
          description: e.message,
        });
      });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full" disabled={disabled}>
          <PlusIcon className="h-4 w-4 mr-1"></PlusIcon>
          アクションを追加
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>アクションを追加</DialogTitle>
        </DialogHeader>
        <ActionForm
          categories={categories}
          category_id={category_id}
          onSubmit={onSubmit}
          onDismiss={() => setIsOpen(false)}
          Footer={DialogFooter}
          flow="create"
        ></ActionForm>
      </DialogContent>
    </Dialog>
  );
}
