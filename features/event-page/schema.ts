import { differenceInDays } from "date-fns";
import { z } from "@/features/helpers/ja-zod";

export const CreateRequestEventSchema = z
  .object({
    eventName: z.string().trim().min(1).max(20),
    startAt: z.string().trim().datetime().nullable(),
    endAt: z.string().trim().datetime().nullable(),
    categoryIds: z.array(z.number()),
    teamIds: z.array(z.number()),
  })
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        const startDate = new Date(data.startAt);
        const endDate = new Date(data.endAt);
        return differenceInDays(endDate, startDate) >= 1;
      }
      return true; // どちらかが null の場合はバリデーションをスキップ
    },
    {
      message: "startAt は endAt よりも1日以上前でなければなりません。",
      path: ["startAt"], // エラーメッセージを表示するフィールド
    }
  );

export type CreateRequestEventSchemaType = z.infer<
  typeof CreateRequestEventSchema
>;

export const UpdateRequestEventSchema = z
  .object({
    id: z.number(),
    eventName: z.string().trim().min(1).max(20).optional(),
    startAt: z.string().trim().datetime().nullable().optional(),
    endAt: z.string().trim().datetime().nullable().optional(),
    categoryIds: z.array(z.number()).optional(),
    teamIds: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        const startDate = new Date(data.startAt);
        const endDate = new Date(data.endAt);
        return differenceInDays(endDate, startDate) >= 1;
      }
      return true; // どちらかが null の場合はバリデーションをスキップ
    },
    {
      message: "開始日 は 終了日 よりも1日以上前でなければなりません。",
      path: ["startAt"], // エラーメッセージを表示するフィールド
    }
  );

export type UpdateRequestEventSchemaType = z.infer<
  typeof UpdateRequestEventSchema
>;
