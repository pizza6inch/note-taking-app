"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react"; // 引入 SessionProvider
import { toast } from "sonner";
import { AppProvider, useAppStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { NotesDirectory } from "@/components/notes-directory";
import { NoteEditor } from "@/components/note-editor";
import { ScheduleModule } from "@/components/schedule-module";

// 處理 OAuth 錯誤的獨立元件
function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 檢查網址列是否有 error 參數
    const error = searchParams?.get("error");

    if (error) {
      // 跳出 Toast 提示
      toast.error("登入失敗", {
        description: "Google 授權發生錯誤，請稍後再試一次。",
      });

      // 清除網址列上的 ?error=... 參數，保持畫面乾淨
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}

function AppContent() {
  const { activeModule, currentNoteId } = useAppStore();

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        {activeModule === "notes" ? (
          currentNoteId ? (
            <NoteEditor />
          ) : (
            <NotesDirectory />
          )
        ) : (
          <ScheduleModule />
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    // 將 SessionProvider 加回最外層 (或 AppProvider 外層)
    <SessionProvider>
      <AppProvider>
        {/* 在 Next.js App Router 中使用 useSearchParams 的元件必須用 Suspense 包裹 */}
        <Suspense fallback={null}>
          <AuthErrorHandler />
        </Suspense>
        <AppContent />
      </AppProvider>
    </SessionProvider>
  );
}
