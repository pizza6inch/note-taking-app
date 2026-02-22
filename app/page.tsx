"use client";
// import { useEffect } from "react";
import { AppProvider, useAppStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { NotesDirectory } from "@/components/notes-directory";
import { NoteEditor } from "@/components/note-editor";
import { ScheduleModule } from "@/components/schedule-module";
// import { getPosts } from "@/actions/post-action";

function AppContent() {
  const { activeModule, currentNoteId } = useAppStore();

  // useEffect(() => {
  //   async function fetchPosts() {
  //     const result = await getPosts();
  //     if (result.success) {
  //       console.log("Posts:", result.data);
  //     } else {
  //       console.error(result.error);
  //     }
  //   }
  //   fetchPosts();
  // }, []);

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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
