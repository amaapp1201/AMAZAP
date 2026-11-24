"use client";

import { Pencil2Icon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { useCallback, useState } from "react";
import { CategoryForm, LocalShcmeaType } from "./category-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EditCategoryModal({
  updateCategory,
  category,
}: {
  updateCategory: (data: {
    id: number;
    name: string;
    isSingleSelection: boolean;
  }) => Promise<void>;
  category: {
    id: number;
    name: string;
    isSingleSelection: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    updateCategory({
      ...data,
      id: category.id,
    })
      .then(() => {
        router.refresh();
        toast("カテゴリを更新しました");
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
        <Button variant="outline" className="h-8 w-full">
          <Pencil2Icon className="h-4 w-4 mr-1"></Pencil2Icon>
          カテゴリを編集
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>カテゴリを編集</DialogTitle>
        </DialogHeader>
        <CategoryForm
          onSubmit={onSubmit}
          existingCategory={category}
          onDismiss={() => setIsOpen(false)}
          Footer={DialogFooter}
          mode="edit"
        ></CategoryForm>
      </DialogContent>
    </Dialog>
  );
}
