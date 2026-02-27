import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

const authConfig = {
  providers: [
    Credentials({
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
            loginType: { label: "Login Type", type: "text" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;
            
            try {
                const user = await prisma.user.findUnique({
                  where: {
                    email: credentials.email as string
                  }
                });

                if (!user) return null;

                const isPasswordValid = await compare(credentials.password as string, user.password);

                if (!isPasswordValid) return null;

                const loginType = credentials.loginType as string || "internal";

                // Internal login: only ADMIN, CONTENT, CONTENT_ADMIN, DATIN roles
                if (loginType === "internal") {
                  if (!["ADMIN", "CONTENT", "CONTENT_ADMIN", "DATIN"].includes(user.role)) {
                    return null;
                  }
                }

                // Pelayanan login: only PELAYANAN role, must be verified
                if (loginType === "pelayanan") {
                  if (user.role !== "PELAYANAN") {
                    return null;
                  }
                  if (!user.isVerified) {
                    // Return a special error indicator
                    throw new Error("UNVERIFIED:" + user.id);
                  }
                }

                // Log the login activity
                try {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      action: "LOGIN",
                      target: loginType === "internal" ? "Akses Internal" : "Portal Pelayanan Data",
                      details: `${user.name} (${user.email}) berhasil login via ${loginType}`,
                    },
                  });
                } catch (logError) {
                  console.error("Failed to log login activity:", logError);
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            } catch (error: any) {
                if (error?.message?.startsWith("UNVERIFIED:")) {
                  throw error;
                }
                console.error("Auth Error:", error);
                return null;
            }
        }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
