import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

type UserRole = "USER" | "ADMIN" | "CONTENT" | "CONTENT_ADMIN" | "DATIN" | "PELAYANAN"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      stationId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRole
    stationId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole
    stationId?: string
  }
}
