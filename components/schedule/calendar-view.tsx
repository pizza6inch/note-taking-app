"use client"

import { useState, useMemo } from "react"
import { Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import { format, isSameMonth, isSameDay } from "date-fns"

export function CalendarView() {
  const {
    todos,
    starred,
    notes,
    deleteTodo,
    setActiveModule,
    setCurrentNoteId,
    getNoteById,
  } = useAppStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  const monthTodos = useMemo(
    () =>
      todos.filter(
        (t) =>
          isSameMonth(t.createdAt, calendarMonth) ||
          (t.deadline && isSameMonth(t.deadline, calendarMonth))
      ),
    [todos, calendarMonth]
  )

  const dailyTodos = useMemo(
    () =>
      todos.filter(
        (t) =>
          isSameDay(t.createdAt, selectedDate) ||
          (t.deadline && isSameDay(t.deadline, selectedDate))
      ),
    [todos, selectedDate]
  )

  const dailyNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          isSameDay(n.createdAt, selectedDate) ||
          isSameDay(n.updatedAt, selectedDate)
      ),
    [notes, selectedDate]
  )

  function navigateToNote(noteId: string) {
    setActiveModule("notes")
    setCurrentNoteId(noteId)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Mini Calendar */}
        <div className="shrink-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            onMonthChange={setCalendarMonth}
            className="rounded-lg border border-border"
          />
        </div>

        {/* Right: Tabs */}
        <div className="flex-1">
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Daily Todos</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="notes">Daily Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-2">
              {dailyTodos.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No todos for {format(selectedDate, "MMM d, yyyy")}
                </p>
              ) : (
                dailyTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => navigateToNote(todo.noteId)}
                    >
                      <p className="truncate text-sm font-medium text-foreground">
                        {todo.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getNoteById(todo.noteId)?.title || "Unknown note"}
                      </p>
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
                ))
              )}
            </TabsContent>

            <TabsContent value="reminders" className="space-y-2">
              {todos.filter((t) => t.deadline && !t.completed).length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming reminders
                </p>
              ) : (
                todos
                  .filter((t) => t.deadline && !t.completed)
                  .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => navigateToNote(todo.noteId)}
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {todo.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(todo.deadline!, "MMM d, yyyy")}
                        </p>
                      </button>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-2">
              {dailyNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No notes for {format(selectedDate, "MMM d, yyyy")}
                </p>
              ) : (
                dailyNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => navigateToNote(note.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {note.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Updated {format(note.updatedAt, "h:mm a")}
                      </p>
                    </div>
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Month Tasks List */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Tasks for {format(calendarMonth, "MMMM yyyy")}
        </h3>
        {monthTodos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks this month</p>
        ) : (
          <div className="space-y-2">
            {monthTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => navigateToNote(todo.noteId)}
                >
                  <p className="truncate text-sm font-medium text-foreground">{todo.text}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Created: {format(todo.createdAt, "MMM d")}</span>
                    {todo.deadline && (
                      <span>Deadline: {format(todo.deadline, "MMM d")}</span>
                    )}
                  </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
