import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models";
import { audit, clientIp, rateLimit } from "@/lib/security";
const loginSchema = z.object({
  email: z.email().max(200),
  password: z
    .string()
    .min(1)
    .refine((value) => new TextEncoder().encode(value).length <= 72),
});
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        await rateLimit(`login-ip:${clientIp(request)}`, 20);
        await rateLimit(`login-email:${parsed.data.email.toLowerCase()}`, 8);
        await connectDB();
        const admin = await Admin.findOne({
          email: parsed.data.email.toLowerCase(),
          active: true,
        }).select("+passwordHash");
        const hash =
          admin?.passwordHash ||
          "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
        const valid = await compare(parsed.data.password, hash);
        if (!admin || !valid) {
          await audit(undefined, "login.failed", "security");
          return null;
        }
        await audit(String(admin._id), "login.success", "security");
        return {
          id: String(admin._id),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          sessionVersion: admin.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as "owner" | "editor";
      session.user.sessionVersion = token.sessionVersion as number;
      return session;
    },
  },
});
