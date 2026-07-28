import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { db } from "@mahatest/db";
import * as bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user || user.isBlocked) return null;
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        
        if (!isPasswordValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      }
    })
  ]
});
