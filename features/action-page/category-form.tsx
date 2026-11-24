"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/features/helpers/ja-zod";
import { useForm } from "react-hook-form";
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

const LocalShcmea = z.object({
  name: z.string().trim().min(1),
  isSingleSelection: z.boolean(),
});
export type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function CategoryForm({
  onSubmit,
  onDismiss = () => {},
  existingCategory,
  Footer,
  mode = "create",
}: {
  onSubmit: (data: LocalShcmeaType) => void;
  onDismiss?: () => void;
  existingCategory?: LocalShcmeaType;
  Footer: FC<{ children: ReactNode }>;
  mode?: "create" | "edit";
}) {
  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
    defaultValues: {
      isSingleSelection: false,
    },
  });

  useEffect(() => {
    if (existingCategory) {
      form.reset(existingCategory);
    }
  }, [existingCategory]);

  return (
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
        <FormField
          control={form.control}
          name="isSingleSelection"
          render={({ field }) => (
            <FormItem className="space-y-0 flex items-center">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mr-2"
                ></Checkbox>
              </FormControl>
              <FormLabel>アクションを１つしか選択できなくする</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Footer>
          <Button variant="ghost" type="button" onClick={onDismiss}>
            キャンセル
          </Button>
          <Button type="submit">
            {mode === "create" ? "作成する" : "更新する"}
          </Button>
        </Footer>
      </form>
    </Form>
  );
}
