"use client";

import { FC, ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/features/helpers/ja-zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const LocalShcmea = z.object({
  password: z.string().trim().min(8),
});
export type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function UserPasswordForm({
  onDismiss,
  onSubmit,
  Footer,
}: {
  onDismiss?: () => void;
  onSubmit: (data: LocalShcmeaType) => Promise<void>;
  Footer: FC<{ children: ReactNode }>;
}) {
  const [isPasswordRevailed, setIsPasswordRevailed] = useState(false);
  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <span>パスワード</span>
                <Button
                  variant="ghost"
                  onClick={() => setIsPasswordRevailed((prev) => !prev)}
                  type="button"
                  className="text-slate-600"
                  size="icon"
                >
                  {isPasswordRevailed ? (
                    <EyeIcon className="w-4 h-4"></EyeIcon>
                  ) : (
                    <EyeOffIcon className="w-4 h-4"></EyeOffIcon>
                  )}
                </Button>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type={isPasswordRevailed ? "text" : "password"}
                ></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Footer>
          <Button type="button" variant="ghost" onClick={onDismiss}>
            キャンセル
          </Button>
          <Button type="submit">変更する</Button>
        </Footer>
      </form>
    </Form>
  );
}
