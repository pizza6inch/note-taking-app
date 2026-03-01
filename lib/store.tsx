"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  getNotes,
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  getTodos,
  createTodoAction,
  toggleTodoAction,
  deleteTodoAction,
  getStarred,
  createStarredAction,
  deleteStarredAction,
  getIndexItems,
  createIndexItemAction,
  deleteIndexItemAction,
} from "@/app/actions";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoItem {
  id: string;
  noteId: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  deadline: Date | null;
}

export interface StarredItem {
  id: string;
  noteId: string;
  text: string;
  createdAt: Date;
}

export interface IndexItem {
  id: string;
  noteId: string;
  text: string;
  createdAt: Date;
}

interface AppState {
  notes: Note[];
  todos: TodoItem[];
  starred: StarredItem[];
  indexItems: IndexItem[];
  activeModule: "notes" | "schedule";
  activeScheduleView: "calendar" | "todo" | "starred" | "weekly";
  currentNoteId: string | null;
  searchQuery: string;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setActiveModule: (module: "notes" | "schedule") => void;
  setActiveScheduleView: (
    view: "calendar" | "todo" | "starred" | "weekly",
  ) => void;
  setCurrentNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  createNote: () => Promise<Note | undefined>;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTodo: (
    noteId: string,
    text: string,
    deadline?: Date | null,
  ) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addStarred: (noteId: string, text: string) => Promise<void>;
  deleteStarred: (id: string) => Promise<void>;
  addIndexItem: (noteId: string, text: string) => Promise<void>;
  deleteIndexItem: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [starred, setStarred] = useState<StarredItem[]>([]);
  const [indexItems, setIndexItems] = useState<IndexItem[]>([]);
  const [activeModule, setActiveModule] = useState<"notes" | "schedule">(
    "notes",
  );
  const [activeScheduleView, setActiveScheduleView] = useState<
    "calendar" | "todo" | "starred" | "weekly"
  >("calendar");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. 初始資料載入 (監聽登入狀態)
  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    } else if (status === "unauthenticated") {
      // 登出時清空資料並解除 loading
      setNotes([]);
      setTodos([]);
      setStarred([]);
      setIndexItems([]);
      setCurrentNoteId(null);
      setIsLoading(false); // 確定未登入，不用 loading
    } else if (status === "loading") {
      setIsLoading(true); // Session 還在檢查中，保持 loading
    }
  }, [status]);

  const loadData = async () => {
    setIsLoading(true); // 開始載入
    try {
      const [notesRes, todosRes, starredRes, indexRes] = await Promise.all([
        getNotes(),
        getTodos(),
        getStarred(),
        getIndexItems(),
      ]);

      if (notesRes.success && notesRes.data) setNotes(notesRes.data);
      if (todosRes.success && todosRes.data) setTodos(todosRes.data);
      if (starredRes.success && starredRes.data) setStarred(starredRes.data);
      if (indexRes.success && indexRes.data) setIndexItems(indexRes.data);
    } catch (error) {
      toast.error("載入資料失敗");
    } finally {
      setIsLoading(false); // 載入結束 (不論成功失敗)
    }
  };

  // =====================================
  // 2. CRUD 動作 (串接 Server Actions)
  // =====================================

  const createNote = useCallback(async () => {
    const res = await createNoteAction();
    if (res.success && res.data) {
      setNotes((prev) => [res.data, ...prev]);
      return res.data;
    } else {
      toast.error(res.error || "新增筆記失敗");
    }
  }, []);

  const updateNote = useCallback(
    async (id: string, updates: Partial<Pick<Note, "title" | "content">>) => {
      // 【樂觀更新】：直接先改前端畫面，讓打字不會卡頓，背景再慢慢存資料庫
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date() }
            : note,
        ),
      );
      const res = await updateNoteAction(id, updates);
      if (!res.success) {
        toast.error(res.error || "自動存檔失敗，請檢查網路");
      }
    },
    [],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      // 【樂觀更新】：瞬間從畫面移除
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setTodos((prev) => prev.filter((t) => t.noteId !== id));
      setStarred((prev) => prev.filter((s) => s.noteId !== id));
      setIndexItems((prev) => prev.filter((i) => i.noteId !== id));
      if (currentNoteId === id) setCurrentNoteId(null); // 如果正在編輯該筆記，把它關掉

      const res = await deleteNoteAction(id);
      if (!res.success) toast.error(res.error || "刪除筆記失敗");
    },
    [currentNoteId],
  );

  const addTodo = useCallback(
    async (noteId: string, text: string, deadline?: Date | null) => {
      const res = await createTodoAction(noteId, text, deadline);
      if (res.success && res.data) {
        setTodos((prev) => [...prev, res.data]);
        toast.success("已加入待辦清單");
      } else {
        toast.error(res.error || "新增待辦失敗");
      }
    },
    [],
  );

  const toggleTodo = useCallback(async (id: string) => {
    let currentStatus = false;

    // 【樂觀更新】：先瞬間切換勾選狀態
    setTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      if (todo) currentStatus = todo.completed;
      return prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      );
    });

    const res = await toggleTodoAction(id, !currentStatus);
    if (!res.success) {
      toast.error(res.error || "更新待辦狀態失敗");
      // 失敗的話退回原本的狀態
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: currentStatus } : todo,
        ),
      );
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    const res = await deleteTodoAction(id);
    if (!res.success) toast.error(res.error || "刪除待辦失敗");
  }, []);

  const addStarred = useCallback(async (noteId: string, text: string) => {
    const res = await createStarredAction(noteId, text);
    if (res.success && res.data) {
      setStarred((prev) => [...prev, res.data]);
      toast.success("已加入星號標記");
    } else {
      toast.error(res.error || "新增星號失敗");
    }
  }, []);

  const deleteStarred = useCallback(async (id: string) => {
    setStarred((prev) => prev.filter((s) => s.id !== id));
    const res = await deleteStarredAction(id);
    if (!res.success) toast.error(res.error || "刪除星號失敗");
  }, []);

  const addIndexItem = useCallback(async (noteId: string, text: string) => {
    const res = await createIndexItemAction(noteId, text);
    if (res.success && res.data) {
      setIndexItems((prev) => [...prev, res.data]);
      toast.success("已加入目錄索引");
    } else {
      toast.error(res.error || "新增目錄失敗");
    }
  }, []);

  const deleteIndexItem = useCallback(async (id: string) => {
    setIndexItems((prev) => prev.filter((i) => i.id !== id));
    const res = await deleteIndexItemAction(id);
    if (!res.success) toast.error(res.error || "刪除目錄失敗");
  }, []);

  const getNoteById = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes],
  );

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
        isLoading,
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
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
