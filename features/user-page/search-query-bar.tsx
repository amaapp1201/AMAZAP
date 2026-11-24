"use client";

import { RefreshCcw, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

const LocalSchema = z.object({
  searchTerm: z.string().min(1),
});

type LocalSchemaType = z.infer<typeof LocalSchema>;

export function SearchQueryBar({
  defaultSearchTerm,
  placeholder = "チーム名orユーザー名...",
}: {
  defaultSearchTerm?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<LocalSchemaType>({
    resolver: zodResolver(LocalSchema),
    defaultValues: {
      searchTerm: defaultSearchTerm ?? "",
    },
  });

  const onSubmit = useCallback((value: LocalSchemaType) => {
    // Encode the query to make it URL-safe
    const encodedValue = encodeURIComponent(value.searchTerm.trim());

    const url = new URL(window.location.href);
    url.searchParams.set("searchTerm", encodedValue);
    url.searchParams.delete("page");
    router.push(url.toString());
  }, []);

  const onResetClick = useCallback(() => {
    // アーカイブ一覧を見ているときは、その表示のまま検索だけを解除する
    const isArchived =
      new URL(window.location.href).searchParams.get("archived") === "1";
    router.push(isArchived ? `${pathname}?archived=1` : pathname);
    form.reset();
  }, [pathname]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-[auto_max-content] gap-3 items-center"
      >
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
            <SearchIcon className="h-4 w-4 text-muted-foreground"></SearchIcon>
          </div>
          <FormField
            name="searchTerm"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="px-8"
                    placeholder={placeholder}
                  ></Input>
                </FormControl>
              </FormItem>
            )}
          ></FormField>

          <Button
            variant="ghost"
            size="xs"
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2"
            onClick={onResetClick}
            type="button"
          >
            <RefreshCcw className="h-4 w-4 mr-1"></RefreshCcw>
            リセット
          </Button>
        </div>
        <Button type="submit" className="h-8">
          検索
        </Button>
      </form>
    </Form>
  );
}
