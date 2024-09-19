"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function CustomSessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
