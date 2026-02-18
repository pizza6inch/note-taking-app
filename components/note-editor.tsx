"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ArrowLeft, Undo2, Redo2, Check, ListTodo, Star, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface HistoryEntry {
  content: string
  cursor: number
}

export function NoteEditor() {
  const {
    currentNoteId,
    setCurrentNoteId,
    getNoteById,
    updateNote,
    addTodo,
    addStarred,
    addIndexItem,
  } = useAppStore()

  const note = currentNoteId ? getNoteById(currentNoteId) : null

  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [saved, setSaved] = useState(true)

  const [history, setHistory] = useState<HistoryEntry[]>([{ content: note?.content ?? "", cursor: 0 }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Reset state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setHistory([{ content: note.content, cursor: 0 }])
      setHistoryIndex(0)
      setSaved(true)
    }
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save
  const autoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (!currentNoteId) return
      setSaved(false)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        updateNote(currentNoteId, { title: newTitle, content: newContent })
        setSaved(true)
      }, 600)
    },
    [currentNoteId, updateNote]
  )

  function handleTitleChange(value: string) {
    setTitle(value)
    autoSave(value, content)
  }

  function handleContentChange(value: string) {
    setContent(value)
    autoSave(title, value)

    const cursor = textareaRef.current?.selectionStart ?? 0
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ content: value, cursor })
      return newHistory.slice(-50) // keep last 50 entries
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }

  function undo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const entry = history[newIndex]
      setContent(entry.content)
      autoSave(title, entry.content)
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(entry.cursor, entry.cursor)
      })
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const entry = history[newIndex]
      setContent(entry.content)
      autoSave(title, entry.content)
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(entry.cursor, entry.cursor)
      })
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }) // intentionally no deps - uses latest undo/redo

  // Table of Contents from headings
  const headings = useMemo(() => {
    const lines = content.split("\n")
    const result: { level: number; text: string; line: number }[] = []
    lines.forEach((line, i) => {
      const match = line.match(/^(#{1,6})\s+(.+)/)
      if (match) {
        result.push({ level: match[1].length, text: match[2], line: i })
      }
    })
    return result
  }, [content])

  function getSelectedText(): string {
    const ta = textareaRef.current
    if (!ta) return ""
    return ta.value.substring(ta.selectionStart, ta.selectionEnd)
  }

  function handleContextAction(action: "todo" | "star" | "index") {
    const text = getSelectedText()
    if (!text || !currentNoteId) return
    if (action === "todo") addTodo(currentNoteId, text)
    else if (action === "star") addStarred(currentNoteId, text)
    else if (action === "index") addIndexItem(currentNoteId, text)
  }

  function scrollToHeading(line: number) {
    const ta = textareaRef.current
    if (!ta) return
    const lines = ta.value.split("\n")
    let pos = 0
    for (let i = 0; i < line; i++) {
      pos += lines[i].length + 1
    }
    ta.focus()
    ta.setSelectionRange(pos, pos)
    // Scroll textarea to approximate position
    const lineHeight = 24
    ta.scrollTop = Math.max(0, line * lineHeight - 100)
  }

  if (!note) return null

  return (
    <div className="flex h-full">
      {/* Left: Table of Contents */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 lg:block">
        <div className="sticky top-0 p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outline
          </h2>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            {headings.length === 0 ? (
              <p className="text-xs text-muted-foreground/60">
                Add headings with # to see outline
              </p>
            ) : (
              <nav className="space-y-0.5">
                {headings.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToHeading(h.line)}
                    className={cn(
                      "block w-full truncate rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
                      h.level === 1 && "font-semibold text-foreground",
                      h.level === 2 && "pl-4 text-foreground/90",
                      h.level >= 3 && "pl-6 text-muted-foreground"
                    )}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Right: Editor */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentNoteId(null)}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 text-xs transition-opacity",
                saved ? "text-muted-foreground" : "text-muted-foreground/50"
              )}
            >
              {saved && <Check className="size-3" />}
              {saved ? "Saved" : "Saving..."}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Editor Canvas */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex-1 overflow-y-auto p-6 md:px-12 md:py-8">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled"
                className="mb-4 border-0 bg-transparent text-2xl font-bold shadow-none ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 px-0 h-auto"
              />
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing..."
                className="min-h-[60vh] w-full resize-none border-0 bg-transparent text-sm leading-relaxed shadow-none ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 px-0 font-mono"
              />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleContextAction("todo")} className="gap-2">
              <ListTodo className="size-4" />
              Add to Todo
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleContextAction("star")} className="gap-2">
              <Star className="size-4" />
              Add to Starred
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleContextAction("index")} className="gap-2">
              <BookMarked className="size-4" />
              Add to Index
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  )
}
