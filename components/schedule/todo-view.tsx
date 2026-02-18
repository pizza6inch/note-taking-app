"use client"

import { useState, useMemo } from "react"
import { Trash2, CheckCircle2, Circle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"

const ITEMS_PER_PAGE = 8

export function TodoView() {
  const { todos, toggleTodo, deleteTodo, getNoteById, setActiveModule, setCurrentNoteId } =
    useAppStore()
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return b.createdAt.getTime() - a.createdAt.getTime()
      }),
    [todos]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Todos</h2>
        <p className="text-sm text-muted-foreground">
          {todos.filter((t) => !t.completed).length} pending,{" "}
          {todos.filter((t) => t.completed).length} completed
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No todos yet. Highlight text in a note and right-click to add a todo.
        </p>
      ) : (
        <div className="space-y-2">
          {paginated.map((todo) => {
            const note = getNoteById(todo.noteId)
            return (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      todo.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {todo.text}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{format(todo.createdAt, "MMM d, yyyy")}</span>
                    {todo.deadline && (
                      <span>Due: {format(todo.deadline, "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModule("notes")
                    setCurrentNoteId(todo.noteId)
                  }}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title={note ? `Go to: ${note.title}` : "Go to note"}
                >
                  <ExternalLink className="size-3.5" />
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
