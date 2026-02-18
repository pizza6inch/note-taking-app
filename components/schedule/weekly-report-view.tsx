"use client"

import { useMemo } from "react"
import { CheckCircle2, Circle, StickyNote, ExternalLink } from "lucide-react"
import { useAppStore } from "@/lib/store"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  format,
} from "date-fns"

export function WeeklyReportView() {
  const { todos, notes, getNoteById, setActiveModule, setCurrentNoteId } =
    useAppStore()

  const weekDays = useMemo(() => {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 0 }) // Sunday
    const end = endOfWeek(now, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [])

  const dayData = useMemo(() => {
    return weekDays.map((day) => {
      const dayTodos = todos.filter(
        (t) =>
          isSameDay(t.createdAt, day) ||
          (t.deadline && isSameDay(t.deadline, day))
      )
      const dayNotes = notes.filter(
        (n) => isSameDay(n.createdAt, day) || isSameDay(n.updatedAt, day)
      )
      return { day, todos: dayTodos, notes: dayNotes }
    })
  }, [weekDays, todos, notes])

  const isToday = (date: Date) => isSameDay(date, new Date())

  function navigateToNote(noteId: string) {
    setActiveModule("notes")
    setCurrentNoteId(noteId)
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Weekly Report
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
        </p>
      </div>

      <div className="space-y-6">
        {dayData.map(({ day, todos: dayTodos, notes: dayNotes }) => (
          <div key={day.toISOString()}>
            {/* Day Header */}
            <div className="mb-2 flex items-center gap-2">
              <h3
                className={`text-sm font-semibold ${
                  isToday(day) ? "text-primary" : "text-foreground"
                }`}
              >
                {format(day, "EEEE, MMM d")}
              </h3>
              {isToday(day) && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Today
                </span>
              )}
            </div>

            {dayTodos.length === 0 && dayNotes.length === 0 ? (
              <p className="ml-4 text-xs text-muted-foreground/60">
                No activity
              </p>
            ) : (
              <div className="space-y-1.5">
                {/* Todos */}
                {dayTodos.map((todo) => {
                  const note = getNoteById(todo.noteId)
                  return (
                    <button
                      key={todo.id}
                      onClick={() => navigateToNote(todo.noteId)}
                      className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-2.5 text-left transition-colors hover:bg-accent"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm ${
                            todo.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {todo.text}
                        </p>
                        {note && (
                          <p className="truncate text-xs text-muted-foreground">
                            {note.title}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}

                {/* Notes */}
                {dayNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => navigateToNote(note.id)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <StickyNote className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{note.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {note.content.replace(/^#+ /gm, "").slice(0, 60)}
                      </p>
                    </div>
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Separator */}
            <div className="mt-4 border-b border-border/50" />
          </div>
        ))}
      </div>
    </div>
  )
}
