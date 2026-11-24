"use client";

import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/features/helpers/ja-zod";
import { useForm } from "react-hook-form";
import { FC, ReactNode, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const LocalShcmea = z.object({
  name: z.string().trim().min(1),
});
export type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function TeamForm({
  onDismiss,
  onSubmit,
  Footer,
  existingTeam,
  flow,
}: {
  onDismiss?: () => void;
  onSubmit: (data: LocalShcmeaType) => Promise<void>;
  Footer: FC<{ children: ReactNode }>;
  existingTeam?: LocalShcmeaType;
  flow: "create" | "edit";
}) {
  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
  });

  useEffect(() => {
    if (existingTeam) {
      form.reset(existingTeam);
    }
  }, [existingTeam]);

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
              <FormLabel>チーム名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="元気100倍チーム"></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Footer>
          <Button type="button" variant="ghost" onClick={onDismiss}>
            キャンセル
          </Button>
          <Button type="submit">
            {flow === "create" ? "作成する" : "編集する"}
          </Button>
        </Footer>
      </form>
    </Form>
  );
}
