"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface TodoItem {
  id: string
  noteId: string
  text: string
  completed: boolean
  createdAt: Date
  deadline: Date | null
}

export interface StarredItem {
  id: string
  noteId: string
  text: string
  createdAt: Date
}

export interface IndexItem {
  id: string
  noteId: string
  text: string
  createdAt: Date
}

interface AppState {
  notes: Note[]
  todos: TodoItem[]
  starred: StarredItem[]
  indexItems: IndexItem[]
  activeModule: "notes" | "schedule"
  activeScheduleView: "calendar" | "todo" | "starred" | "weekly"
  currentNoteId: string | null
  searchQuery: string
}

interface AppContextType extends AppState {
  setActiveModule: (module: "notes" | "schedule") => void
  setActiveScheduleView: (view: "calendar" | "todo" | "starred" | "weekly") => void
  setCurrentNoteId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  createNote: () => Note
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => void
  deleteNote: (id: string) => void
  addTodo: (noteId: string, text: string, deadline?: Date | null) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  addStarred: (noteId: string, text: string) => void
  deleteStarred: (id: string) => void
  addIndexItem: (noteId: string, text: string) => void
  deleteIndexItem: (id: string) => void
  getNoteById: (id: string) => Note | undefined
}

const AppContext = createContext<AppContextType | null>(null)

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const sampleNotes: Note[] = [
  {
    id: "note-1",
    title: "Getting Started with Notecraft",
    content: "# Welcome to Notecraft\n\nThis is your first note. You can edit it, add todos, and star important content.\n\n## Features\n\n- Rich text editing\n- Table of contents\n- Todo management\n- Starred items\n\n## Getting Started\n\nClick on any note to open the editor. Use the context menu to add items to your todo list or starred collection.",
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "note-2",
    title: "Project Planning",
    content: "# Project Planning\n\n## Goals\n\nDefine project milestones and deliverables.\n\n## Timeline\n\nWeek 1: Research and discovery\nWeek 2: Design and prototyping\nWeek 3: Development sprint\nWeek 4: Testing and deployment",
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: "note-3",
    title: "Meeting Notes - Feb 2026",
    content: "# Meeting Notes\n\n## Attendees\n\nTeam leads, product manager, design team\n\n## Agenda\n\n1. Sprint review\n2. Backlog grooming\n3. Resource allocation\n\n## Action Items\n\n- Update documentation\n- Prepare demo for stakeholders\n- Review pull requests",
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 0.5),
  },
  {
    id: "note-4",
    title: "Design System Guidelines",
    content: "# Design System\n\n## Typography\n\nUse Inter for body text and headings.\n\n## Colors\n\nPrimary: Zinc/Slate palette\nAccent: Subtle blue highlights\n\n## Components\n\nButtons, Cards, Inputs, Dialogs follow a consistent pattern.",
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 3600000),
  },
]

const sampleTodos: TodoItem[] = [
  { id: "todo-1", noteId: "note-3", text: "Update documentation", completed: false, createdAt: new Date(Date.now() - 86400000 * 2), deadline: new Date(Date.now() + 86400000 * 3) },
  { id: "todo-2", noteId: "note-3", text: "Prepare demo for stakeholders", completed: false, createdAt: new Date(Date.now() - 86400000 * 2), deadline: new Date(Date.now() + 86400000 * 5) },
  { id: "todo-3", noteId: "note-3", text: "Review pull requests", completed: true, createdAt: new Date(Date.now() - 86400000 * 2), deadline: null },
  { id: "todo-4", noteId: "note-2", text: "Complete project research", completed: false, createdAt: new Date(Date.now() - 86400000 * 3), deadline: new Date(Date.now() + 86400000 * 1) },
]

const sampleStarred: StarredItem[] = [
  { id: "star-1", noteId: "note-1", text: "Rich text editing", createdAt: new Date(Date.now() - 86400000 * 4) },
  { id: "star-2", noteId: "note-4", text: "Primary: Zinc/Slate palette", createdAt: new Date(Date.now() - 86400000 * 1) },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(sampleNotes)
  const [todos, setTodos] = useState<TodoItem[]>(sampleTodos)
  const [starred, setStarred] = useState<StarredItem[]>(sampleStarred)
  const [indexItems, setIndexItems] = useState<IndexItem[]>([])
  const [activeModule, setActiveModule] = useState<"notes" | "schedule">("notes")
  const [activeScheduleView, setActiveScheduleView] = useState<"calendar" | "todo" | "starred" | "weekly">("calendar")
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
    return newNote
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, "title" | "content">>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    setTodos((prev) => prev.filter((t) => t.noteId !== id))
    setStarred((prev) => prev.filter((s) => s.noteId !== id))
    setIndexItems((prev) => prev.filter((i) => i.noteId !== id))
  }, [])

  const addTodo = useCallback((noteId: string, text: string, deadline?: Date | null) => {
    const newTodo: TodoItem = {
      id: generateId(),
      noteId,
      text,
      completed: false,
      createdAt: new Date(),
      deadline: deadline || null,
    }
    setTodos((prev) => [...prev, newTodo])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const addStarred = useCallback((noteId: string, text: string) => {
    const newStarred: StarredItem = {
      id: generateId(),
      noteId,
      text,
      createdAt: new Date(),
    }
    setStarred((prev) => [...prev, newStarred])
  }, [])

  const deleteStarred = useCallback((id: string) => {
    setStarred((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addIndexItem = useCallback((noteId: string, text: string) => {
    const newIndex: IndexItem = {
      id: generateId(),
      noteId,
      text,
      createdAt: new Date(),
    }
    setIndexItems((prev) => [...prev, newIndex])
  }, [])

  const deleteIndexItem = useCallback((id: string) => {
    setIndexItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const getNoteById = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  )

  return (
    <AppContext.Provider
      value={{
        notes,
        todos,
        starred,
        indexItems,
        activeModule,
        activeScheduleView,
        currentNoteId,
        searchQuery,
        setActiveModule,
        setActiveScheduleView,
        setCurrentNoteId,
        setSearchQuery,
        createNote,
        updateNote,
        deleteNote,
        addTodo,
        toggleTodo,
        deleteTodo,
        addStarred,
        deleteStarred,
        addIndexItem,
        deleteIndexItem,
        getNoteById,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppStore must be used within AppProvider")
  return ctx
}
