"use client";

import { Button } from "@/features/ui/button";
import { z } from "@/features/helpers/ja-zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

import { toast } from "sonner";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { REDIRECT_AFTER_LOGIN_PATH } from "../helpers/const";
import { useRouter } from "next/navigation";

const LocalShcmea = z.object({
  name: z.string().trim().min(1).max(25),
  password: z.string().trim().min(1),
});

type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function LoginHome() {
  const [isRevealPassword, setIsRevealPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
  });

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    setIsLoading(true);
    return signIn("credentials", {
      redirect: false,
      name: data.name,
      password: data.password,
    })
      .then((result) => {
        if (result?.error) {
          toast.error("名前またはパスワードが間違っています。");
        } else {
          toast.success("ログインしました");
          router.push(REDIRECT_AFTER_LOGIN_PATH);
        }
      })
      .catch((e) => {
        toast.error("エラーが発生しました", {
          description: e.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-sm"
      >
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl">ログイン</h3>
        </div>
        <div className="p-6 pt-0 grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="山田太郎"></Input>
                </FormControl>
                <FormMessage></FormMessage>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-1">
                  <span>パスワード</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRevealPassword((prev) => !prev)}
                  >
                    {isRevealPassword ? (
                      <EyeOpenIcon></EyeOpenIcon>
                    ) : (
                      <EyeClosedIcon></EyeClosedIcon>
                    )}{" "}
                  </Button>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={isRevealPassword ? "text" : "password"}
                    placeholder="****"
                  ></Input>
                </FormControl>
                <FormMessage></FormMessage>
              </FormItem>
            )}
          ></FormField>
        </div>
        <div className="flex items-center p-6 pt-0">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            ログイン
          </Button>
        </div>
      </form>
    </Form>
  );
}
