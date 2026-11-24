"use client";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/features/helpers/ja-zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Category } from "../action-page/type";

const LocalShcmea = z.object({
  id: z.number(),
  name: z.string().trim().min(1).max(25),
});
type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function EditCategoryModal({
  updateCategory,
  category,
}: {
  updateCategory: (data: LocalShcmeaType) => Promise<void>;
  category: {
    id: number;
    name: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
  });

  useEffect(() => {
    form.reset(category);
  }, [category]);

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    updateCategory(data)
      .then(() => {
        setIsOpen(false);
        router.refresh();
        toast("カテゴリを編集しました");
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
          <PlusIcon className="h-4 w-4 mr-1"></PlusIcon>
          カテゴリを編集
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>カテゴリを編集</DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ名</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="運動, 栄養, etc."></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>

              <div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit">編集する</Button>
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
