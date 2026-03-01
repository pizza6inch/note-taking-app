"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAppStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

const ITEMS_PER_PAGE = 6;

export function NotesDirectory() {
  const { notes, createNote, deleteNote, setCurrentNoteId, searchQuery } =
    useAppStore();
  const [page, setPage] = useState(1);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [notes, searchQuery]);

  const sorted = useMemo(
    () =>
      [...filteredNotes].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    [filteredNotes],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  async function handleNew() {
    const note = await createNote();
    // 等資料庫建立好並回傳了，才幫使用者跳轉到那篇筆記
    if (note) setCurrentNoteId(note.id);
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notes
          </h1>
          <p className="text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <Button onClick={handleNew} size="sm" className="gap-2">
          <Plus className="size-4" />
          New Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 space-y-2">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No notes match your search"
                : "No notes yet. Create your first one!"}
            </p>
          </div>
        ) : (
          paginated.map((note) => (
            <div
              key={note.id}
              onClick={() => setCurrentNoteId(note.id)}
              className="group flex w-full items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-ring/30 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {note.title || "Untitled"}
                </h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {note.content
                    ? note.content.replace(/^#+ /gm, "").slice(0, 100)
                    : "Empty note"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label={`Delete ${note.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setPage(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
