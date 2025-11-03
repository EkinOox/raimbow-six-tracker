import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import { loginSchema } from "@/schemas/auth.schema";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validation avec Zod
          const validatedFields = loginSchema.safeParse(credentials);
          
          if (!validatedFields.success) {
            console.log("Validation failed:", validatedFields.error);
            return null;
          }

          const { email, password } = validatedFields.data;

          await connectDB();
          
          // Trouver l'utilisateur
          const user = await User.findOne({ email: email.toLowerCase() });
          
          if (!user) {
            console.log("User not found");
            return null;
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          // Retourner les données utilisateur
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            image: user.avatar || null,
            uplayProfile: user.uplayProfile || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    signOut: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.uplayProfile = user.uplayProfile;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.uplayProfile = token.uplayProfile;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // Secure uniquement en production
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
