"use client";

import { AppProvider, useAppStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { NotesDirectory } from "@/components/notes-directory";
import { NoteEditor } from "@/components/note-editor";
import { ScheduleModule } from "@/components/schedule-module";
import prisma from "@/lib/prisma";

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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
