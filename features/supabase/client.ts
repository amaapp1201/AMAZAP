import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/features/helpers/database.types";

export function createClient(args?: { token?: string }) {
  const token = args?.token ?? "";

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}
