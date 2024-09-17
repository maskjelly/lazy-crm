import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/db";
import { User as NextAuthUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

// Remove the custom User interface

export const NEXT_AUTH = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Add this line to explicitly set the callback URL
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async signIn({ user }: { user: NextAuthUser | AdapterUser }) {
      if (!user.email) {
        return false; // Reject sign-in if email is missing
      }

      // Check if the user already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || "",
            image: user.image || null,
          },
        });
      }

      return true; // Allow sign-in
    },
    async session({ token, session }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};