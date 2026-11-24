"use client";

import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/ui/form";
import Select from "react-select";
import { PopoverTrigger, Popover, PopoverContent } from "@/features/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/features/ui/calendar";
import { ja } from "date-fns/locale";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import {
  CreateRequestEventSchema,
  CreateRequestEventSchemaType,
} from "./schema";
import { useForm } from "react-hook-form";
import { cn, formatToJst } from "../helpers/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RemainingChars } from "../ui/remaining-charts";

export function EventForm({
  teams,
  categories,
  onSubmit,
  existingEvent,
  Footer,
}: {
  teams: {
    id: number;
    name: string;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
  onSubmit: (data: CreateRequestEventSchemaType) => void;
  existingEvent?: {
    id: number;
    eventName: string;
    startAt: string;
    endAt: string;
    date: string;
    categoryIds: number[];
    teamIds: number[];
  };
  Footer: FC<{ children: ReactNode }>;
}) {
  const [isStartAtPikerOpen, setIsStartAtPikerOpen] = useState(false);
  const [isEndAtPikerOpen, seEIsendAtPikerOpen] = useState(false);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
      })),
    []
  );

  const teamsOptions = useMemo(
    () =>
      teams.map((team) => ({
        label: team.name,
        value: team.id.toString(),
      })),
    []
  );

  const form = useForm<CreateRequestEventSchemaType>({
    resolver: zodResolver(CreateRequestEventSchema),
    defaultValues: {
      eventName: "",
      startAt: "",
      endAt: "",
      categoryIds: [],
      teamIds: [],
    },
  });

  useEffect(() => {
    if (existingEvent) {
      form.reset({
        ...existingEvent,
        startAt: existingEvent.startAt
          ? new Date(existingEvent.startAt).toISOString()
          : undefined,
        endAt: existingEvent.endAt
          ? new Date(existingEvent.endAt).toISOString()
          : undefined,
      });
    }
  }, [existingEvent]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  イベント名
                </FormLabel>
                <FormControl>
                  <Input id="eventName" {...field} />
                </FormControl>
                <RemainingChars
                  maxLength={20}
                  name="eventName"
                  control={form.control}
                ></RemainingChars>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            イベント期間
          </Label>
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mr-3">
                  始まり
                </FormLabel>
                <Popover
                  open={isStartAtPikerOpen}
                  onOpenChange={setIsStartAtPikerOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatToJst(field.value, "PPP", {
                            locale: ja,
                          })
                        ) : (
                          <span>日付を選択</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(val) => {
                        field.onChange(val?.toISOString());
                        setIsStartAtPikerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mr-3">
                  終わり
                </FormLabel>
                <Popover
                  open={isEndAtPikerOpen}
                  onOpenChange={seEIsendAtPikerOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatToJst(field.value, "PPP", {
                            locale: ja,
                          })
                        ) : (
                          <span>日付を選択</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(val) => {
                        field.onChange(val?.toISOString());
                        seEIsendAtPikerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  イベントで扱うカテゴリ
                </FormLabel>
                <FormControl>
                  <Select
                    value={categoryOptions.filter((x) =>
                      field.value.includes(Number(x.value))
                    )}
                    onChange={(newValue) => {
                      field.onChange(newValue.map((x) => Number(x.value)));
                    }}
                    options={categoryOptions}
                    isMulti
                    placeholder="カテゴリを選択"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="teamIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  参加チーム
                </FormLabel>
                <FormControl>
                  <Select
                    value={teamsOptions.filter((x) =>
                      field.value.includes(Number(x.value))
                    )}
                    onChange={(newValue) => {
                      field.onChange(newValue.map((x) => Number(x.value)));
                    }}
                    options={teamsOptions}
                    isMulti
                    placeholder="チームを選択"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Footer>
          <Button type="submit" className="w-full mt-4 py-2  rounded-md ">
            この内容で保存
          </Button>
        </Footer>
      </form>
    </Form>
  );
}
