// app/actions/note-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany();
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: "讀取失敗" };
  }
}
