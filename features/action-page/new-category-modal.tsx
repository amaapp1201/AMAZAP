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
import { useCallback, useState } from "react";
import { CategoryForm, LocalShcmeaType } from "./category-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewCategoryModal({
  createNewCategory,
  disabled = false,
}: {
  createNewCategory: (data: LocalShcmeaType) => Promise<void>;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    createNewCategory(data)
      .then(() => {
        router.refresh();
        toast("カテゴリを作成しました");
        setIsOpen(false);
      })
      .catch((e) => {
        toast("エラーが発生しました", {
          description: e.message,
        });
      });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full" disabled={disabled}>
          <PlusIcon className="h-4 w-4 mr-1"></PlusIcon>
          カテゴリを追加
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>カテゴリを追加</DialogTitle>
        </DialogHeader>
        <CategoryForm
          onSubmit={onSubmit}
          onDismiss={() => setIsOpen(false)}
          Footer={DialogFooter}
        ></CategoryForm>
      </DialogContent>
    </Dialog>
  );
}
