"server only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/features/helpers/database.types";
import { match } from "ts-pattern";

import { auth } from "../helpers/auth";

export async function createClient<
  SchemaName extends keyof Database = "public"
>(args?: { schema?: SchemaName; withoutSession?: boolean }) {
  const withoutSession = args?.withoutSession ?? false;

  const token = await match(withoutSession)
    .with(true, () => "")
    .with(false, async () => {
      const session = await auth();

      if (!session) {
        throw new Error("Session is not found");
      }

      return session.supabaseAccessToken;
    })
    .exhaustive();

  const schema = args?.schema ?? "public";

  return createSupabaseClient<Database, SchemaName, Database[SchemaName]>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      db: {
        schema: schema as string as SchemaName,
      },
    }
  );
}

export async function createAdminClient<
  SchemaName extends keyof Database
>(args?: { schema?: SchemaName }) {
  const schema = args?.schema ?? "public";
  return createSupabaseClient<Database, SchemaName, Database[SchemaName]>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      db: {
        schema: schema as string as SchemaName,
      },
      auth: { persistSession: false },
    }
  );
}
