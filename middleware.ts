import NextAuth from "next-auth";
import { authConfig } from "@/features/helpers/auth.config";

import {
  REDIRECT_AFTER_LOGIN_PATH,
  REDIRECT_LOGININ_PATH,
} from "./features/helpers/const";

// NOTE: next: v14.2.5, next-auth: ^5.0.0-beta.25では以下のサンプルコードが動かない
// export const { auth: middleware } = NextAuth(authConfig);

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // next-auth v5-beta.25のバグで、callbackUrlがよばれない
  // https://github.com/nextauthjs/next-auth/issues/10016
  // そこで仕方ないが、ログインしているのに/auth/loginにアクセスしようとした場合、ルートパスにリダイレクトする
  if (nextUrl.pathname === "/auth/login" && isLoggedIn) {
    return Response.redirect(new URL(REDIRECT_AFTER_LOGIN_PATH, nextUrl));
  }

  // authページはログインしていなくてもアクセスできるようにする
  if (nextUrl.pathname.startsWith("/auth")) {
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL(REDIRECT_LOGININ_PATH, nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
