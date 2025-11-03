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
          console.log("🔐 [AUTH] Starting authentication process");
          console.log("🔐 [AUTH] Credentials received:", { 
            email: credentials?.email, 
            hasPassword: !!credentials?.password 
          });

          // Validation avec Zod
          const validatedFields = loginSchema.safeParse(credentials);
          
          if (!validatedFields.success) {
            console.error("❌ [AUTH] Validation failed:", validatedFields.error.flatten());
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;
          console.log("✅ [AUTH] Credentials validated");

          console.log("🔌 [AUTH] Connecting to database...");
          await connectDB();
          console.log("✅ [AUTH] Database connected");
          
          // Trouver l'utilisateur avec le password (select: false par défaut)
          console.log("🔍 [AUTH] Searching for user:", email.toLowerCase());
          const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
          
          if (!user) {
            console.error("❌ [AUTH] User not found:", email);
            throw new Error("Invalid email or password");
          }

          console.log("✅ [AUTH] User found:", { 
            id: user._id, 
            email: user.email,
            hasPassword: !!user.password 
          });

          // Vérifier le mot de passe
          console.log("🔑 [AUTH] Verifying password...");
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            console.error("❌ [AUTH] Invalid password for user:", email);
            throw new Error("Invalid email or password");
          }

          console.log("✅ [AUTH] Password valid, authentication successful");

          // Retourner les données utilisateur
          const userData = {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            image: user.avatar || null,
            uplayProfile: user.uplayProfile || null,
          };

          console.log("🎉 [AUTH] Returning user data:", { 
            id: userData.id, 
            email: userData.email,
            name: userData.name 
          });

          return userData;
        } catch (error) {
          console.error("💥 [AUTH] Authentication error:", error);
          // Retourner null pour que NextAuth affiche l'erreur CredentialsSignin
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
