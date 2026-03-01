import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// 1. 將設定抽離出來，並 export
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/",
    error: "/", // 這樣發生 Callback 或其他錯誤時，會導回 /?error=Callback
  },
  callbacks: {
    session({ session, user }) {
      // 這裡的 user，就是 Prisma 從資料庫撈出來的那筆真實資料！
      // 所以 user.id 絕對 100% 跟資料庫的 Primary Key 一模一樣。

      if (session.user && user) {
        // 這一步是我們「手動」把資料庫的 ID，硬塞進準備要發給前端的 session 裡
        session.user.id = user.id;
      }
      return session;
    },
  },
};

// 3. 把 authOptions 傳給 NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
