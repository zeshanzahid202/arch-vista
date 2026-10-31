import type { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "editor";
      sessionVersion: number;
    } & DefaultSession["user"];
  }
  interface User {
    role: "owner" | "editor";
    sessionVersion: number;
  }
}
