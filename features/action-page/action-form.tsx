"use client";

import { z } from "@/features/helpers/ja-zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, ReactNode, useEffect, useRef } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Select } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const LocalShcmea = z.object({
  name: z.string().trim().min(1),
  point: z.coerce.number().min(0),
  category_id: z.coerce.number({ message: "カテゴリを選択してください" }),
});
export type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function ActionForm({
  category_id,
  categories,
  onSubmit,
  existingAction,
  onDismiss,
  Footer,
  flow,
}: {
  category_id?: number;
  categories: {
    id: number;
    name: string;
  }[];
  onDismiss?: () => void;
  onSubmit: (data: LocalShcmeaType) => Promise<void>;
  existingAction?: LocalShcmeaType;
  Footer: FC<{ children: ReactNode }>;
  flow: "create" | "edit";
}) {
  const secondRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
    defaultValues: {
      point: 5,
      category_id: (category_id ? category_id : "NO_CATEGORY") as number,
    },
  });

  useEffect(() => {
    if (existingAction) {
      form.reset(existingAction);
    }
  }, [existingAction]);

  useEffect(() => {
    if (category_id) {
      secondRef.current?.focus();
    }
  }, []);

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
              <FormLabel>アクション名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus={!!category_id}
                  placeholder="運動した, 本を読んだ, etc."
                ></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="point"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ポイント</FormLabel>
              <FormControl>
                <Input {...field} type="number"></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリ選択</FormLabel>
              <FormControl>
                <Select {...field} value={field.value ?? "NO_CATEGORY"}>
                  <option value="NO_CATEGORY">カテゴリ未定</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Footer>
          <Button variant="ghost" type="button" onClick={onDismiss}>
            キャンセル
          </Button>
          <Button type="submit">
            {flow === "edit" ? "編集する" : "作成する"}
          </Button>
        </Footer>
      </form>
    </Form>
  );
}
