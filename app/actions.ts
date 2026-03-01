"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// ==========================================
// 輔助函式：取得當前登入使用者
// ==========================================
async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  // 1. 直接檢查 session 裡有沒有我們剛剛設定的 id
  if (!session?.user?.id) {
    throw new Error("請先登入");
  }

  // 2. 直接回傳帶有 id 的 user 物件，完全不用呼叫 prisma！
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

// ==========================================
// 1. 筆記 (Notes) 相關 Actions
// ==========================================

export async function getNotes() {
  try {
    const user = await getCurrentUser();
    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, data: notes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createNoteAction() {
  try {
    const user = await getCurrentUser();
    const note = await prisma.note.create({
      data: {
        title: "Untitled",
        content: "",
        userId: user.id,
      },
    });
    return { success: true, data: note };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNoteAction(
  id: string,
  updates: { title?: string; content?: string },
) {
  try {
    const user = await getCurrentUser();
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== user.id) throw new Error("無權限或找不到筆記");

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: updates.title,
        content: updates.content,
      },
    });
    return { success: true, data: updatedNote };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    const user = await getCurrentUser();
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== user.id) throw new Error("無權限或找不到筆記");

    await prisma.note.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 2. 待辦事項 (Todos) 相關 Actions
// ==========================================

export async function getTodos() {
  try {
    const user = await getCurrentUser();
    const todos = await prisma.todoItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: todos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTodoAction(
  noteId: string,
  text: string,
  deadline?: Date | null,
) {
  try {
    const user = await getCurrentUser();
    const todo = await prisma.todoItem.create({
      data: {
        text,
        noteId,
        userId: user.id,
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return { success: true, data: todo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleTodoAction(id: string, completed: boolean) {
  try {
    const user = await getCurrentUser();
    // 更新前先確認所屬權（實務上安全考量）
    const existing = await prisma.todoItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("無權限操作");

    const updatedTodo = await prisma.todoItem.update({
      where: { id },
      data: { completed },
    });
    return { success: true, data: updatedTodo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTodoAction(id: string) {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.todoItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("無權限操作");

    await prisma.todoItem.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. 星號標記 (Starred) 相關 Actions
// ==========================================

export async function getStarred() {
  try {
    const user = await getCurrentUser();
    const starred = await prisma.starredItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: starred };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStarredAction(noteId: string, text: string) {
  try {
    const user = await getCurrentUser();
    const starred = await prisma.starredItem.create({
      data: {
        text,
        noteId,
        userId: user.id,
      },
    });
    return { success: true, data: starred };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStarredAction(id: string) {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.starredItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("無權限操作");

    await prisma.starredItem.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 4. 目錄索引 (IndexItems) 相關 Actions
// ==========================================

export async function getIndexItems() {
  try {
    const user = await getCurrentUser();
    const items = await prisma.indexItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: items };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createIndexItemAction(noteId: string, text: string) {
  try {
    const user = await getCurrentUser();
    const item = await prisma.indexItem.create({
      data: {
        text,
        noteId,
        userId: user.id,
      },
    });
    return { success: true, data: item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteIndexItemAction(id: string) {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.indexItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("無權限操作");

    await prisma.indexItem.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
