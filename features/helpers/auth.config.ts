import { SignJWT } from "jose"; // joseをインポート
import type { NextAuthConfig } from "next-auth";
import { REDIRECT_AFTER_LOGIN_PATH } from "./const";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      const user = token.user as any;
      session.user = user;

      const signingSecret = process.env.SUPABASE_JWT_SECRET;

      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: user.id,
          isAdmin: (user as any).isAdmin,
          teamId: (user as any).teamId,
          id: user.id,
          name: user.name,
          role: "authenticated",
        };

        // joseを使用してJWTを生成
        const token = await new SignJWT(payload)
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime(payload.exp)
          .sign(new TextEncoder().encode(signingSecret));

        session.supabaseAccessToken = token;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
