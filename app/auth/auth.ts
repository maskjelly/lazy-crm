import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const NEXT_AUTH = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Managing the sign-in process
    async signIn({ user, account, profile }: any) {
      // Check if the user already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // If user does not exist, create a new user in the database
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });
      }
      return true; // Continue with the sign-in
    },

    // Handling JWT tokens
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.uid = user.id; // Store user ID in the token
      }
      return token;
    },

    // Handling session object
    session: async ({ session, token }: any) => {
      if (session.user) {
        session.user.id = token.uid; // Add user ID to the session
      }
      return session;
    },
  },
};
