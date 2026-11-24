import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { SupabaseAdapter } from "@auth/supabase-adapter";

import { createAdminClient, createClient } from "../supabase/server";

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE!,
  }),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Name and Password",
      credentials: {
        name: {
          label: "name",
          type: "text",
          placeholder: "山田太郎",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { name, password } = credentials as {
          name: string;
          password: string;
        };

        const supabase = await createAdminClient({
          schema: "next_auth",
        });

        // Authenticate with Supabase
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("name", name)
          .single();

        // アーカイブ中のユーザーはログインさせない
        if (error || !user || user.archived_at) {
          throw new Error("名前またはパスワードが正しくありません");
        }

        // パスワードの検証
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("名前またはパスワードが正しくありません");
        }

        // Return the authenticated user
        return {
          id: user.id,
          name: user.name,
          isAdmin: user.is_admin,
          teamId: user.team_id,
        };
      },
    }),
  ],
});
