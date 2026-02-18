"use client"

import { Star, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"

export function StarredView() {
  const { starred, deleteStarred, getNoteById, setActiveModule, setCurrentNoteId } =
    useAppStore()

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Starred</h2>
        <p className="text-sm text-muted-foreground">{starred.length} starred items</p>
      </div>

      {starred.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No starred items yet. Highlight text in a note and right-click to star it.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {starred.map((item) => {
            const note = getNoteById(item.noteId)
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <Star className="size-4 shrink-0 fill-primary/20 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.text}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{format(item.createdAt, "MMM d, yyyy")}</span>
                    {note && <span>from: {note.title}</span>}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModule("notes")
                    setCurrentNoteId(item.noteId)
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
                  onClick={() => deleteStarred(item.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
