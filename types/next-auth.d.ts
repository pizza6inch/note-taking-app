import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * 擴充 NextAuth 回傳的 Session 型別
   */
  interface Session {
    user: {
      /** 使用者的唯一 ID (對應資料庫的 Primary Key) */
      id: string;
    } & DefaultSession["user"];
  }
}
