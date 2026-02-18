"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Clock, User, StickyNote, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" />
      <span className="font-mono tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
      <span className="hidden sm:inline text-border">|</span>
      <span className="hidden sm:inline">
        {time.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
      </span>
    </div>
  )
}

export function AppHeader() {
  const { activeModule, setActiveModule, searchQuery, setSearchQuery, setCurrentNoteId, notes } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
        setLocalSearch(searchQuery)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchQuery])

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value)
      setSearchQuery(value)
    },
    [setSearchQuery]
  )

  const filteredNotes = notes.filter(
    (n) =>
      localSearch.length > 0 &&
      (n.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        n.content.toLowerCase().includes(localSearch.toLowerCase()))
  )

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4 gap-4">
      {/* Left: Module Tabs */}
      <nav className="flex items-center gap-1">
        <Button
          variant={activeModule === "notes" ? "default" : "ghost"}
          size="sm"
          className={cn("gap-2", activeModule === "notes" && "shadow-sm")}
          onClick={() => {
            setActiveModule("notes")
            setCurrentNoteId(null)
          }}
        >
          <StickyNote className="size-4" />
          <span className="hidden sm:inline">Notes</span>
        </Button>
        <Button
          variant={activeModule === "schedule" ? "default" : "ghost"}
          size="sm"
          className={cn("gap-2", activeModule === "schedule" && "shadow-sm")}
          onClick={() => setActiveModule("schedule")}
        >
          <CalendarDays className="size-4" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>
      </nav>

      {/* Center: Search */}
      <button
        onClick={() => {
          setSearchOpen(true)
          setLocalSearch(searchQuery)
        }}
        className="flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search notes...</span>
        <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs sm:inline-block">
          {"Ctrl+K"}
        </kbd>
      </button>

      {/* Right: Clock + Profile */}
      <div className="flex items-center gap-4">
        <LiveClock />
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogTitle className="sr-only">Search Notes</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {localSearch.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Start typing to search your notes
              </p>
            ) : filteredNotes.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No notes found
              </p>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setActiveModule("notes")
                    setCurrentNoteId(note.id)
                    setSearchOpen(false)
                    setLocalSearch("")
                    setSearchQuery("")
                  }}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <StickyNote className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {note.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {note.content.slice(0, 80)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
