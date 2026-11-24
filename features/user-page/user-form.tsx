"use client";

import { FC, ReactNode, use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/features/helpers/ja-zod";

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
import { Checkbox } from "../ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const LocalShcmea = z.object({
  name: z.string().trim().min(1).max(25),
  teamId: z.preprocess((raw) => {
    if (raw === "NO_TEAM") {
      return null;
    }
    return raw;
  }, z.coerce.number({ message: "チームを選択してください" }).nullable().optional()),
  password: z.string().trim().min(1).optional(),
  isAdmin: z.boolean(),
});
export type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function UserForm({
  teamId,
  teams,
  onDismiss,
  onSubmit,
  Footer,
  existingUser,
  flow,
}: {
  teamId?: number;
  teams: {
    id: number;
    name: string;
  }[];
  onDismiss?: () => void;
  onSubmit: (data: LocalShcmeaType) => Promise<void>;
  Footer: FC<{ children: ReactNode }>;
  existingUser?: Omit<LocalShcmeaType, "password">;
  flow: "create" | "edit";
}) {
  const [isPasswordRevailed, setIsPasswordRevailed] = useState(false);
  const form = useForm<LocalShcmeaType>({
    resolver: zodResolver(LocalShcmea),
    defaultValues: {
      teamId: (teamId ? teamId : "NO_TEAM") as number,
      isAdmin: false,
    },
  });

  useEffect(() => {
    if (existingUser) {
      form.reset(existingUser);
    }
  }, [existingUser]);

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
              <FormLabel>ユーザー名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus={!!teamId}
                  placeholder="山田太郎"
                ></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        {flow === "create" && (
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
                    autoFocus={!!teamId}
                    type={isPasswordRevailed ? "text" : "password"}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
        )}

        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>チーム選択</FormLabel>
              <FormControl>
                <Select {...field} value={field.value ?? "NO_TEAM"}>
                  <option value="NO_TEAM">チーム未定</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mr-2"
                  ></Checkbox>
                </FormControl>
                <FormLabel>管理者にする</FormLabel>
              </div>
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
