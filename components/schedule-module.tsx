"use client"

import { CalendarDays, ListTodo, Star, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { CalendarView } from "@/components/schedule/calendar-view"
import { TodoView } from "@/components/schedule/todo-view"
import { StarredView } from "@/components/schedule/starred-view"
import { WeeklyReportView } from "@/components/schedule/weekly-report-view"

const views = [
  { key: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { key: "todo" as const, label: "Todos", icon: ListTodo },
  { key: "starred" as const, label: "Starred", icon: Star },
  { key: "weekly" as const, label: "Weekly", icon: CalendarRange },
]

export function ScheduleModule() {
  const { activeScheduleView, setActiveScheduleView } = useAppStore()

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <aside className="hidden w-52 shrink-0 border-r border-border bg-card/50 md:block">
        <div className="p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schedule
          </h2>
          <nav className="space-y-1">
            {views.map((view) => (
              <Button
                key={view.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveScheduleView(view.key)}
                className={cn(
                  "w-full justify-start gap-2",
                  activeScheduleView === view.key && "bg-accent text-accent-foreground"
                )}
              >
                <view.icon className="size-4" />
                {view.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex w-full flex-col">
        <div className="flex border-b border-border bg-card/50 p-2 md:hidden">
          {views.map((view) => (
            <Button
              key={view.key}
              variant={activeScheduleView === view.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveScheduleView(view.key)}
              className="flex-1 gap-1 text-xs"
            >
              <view.icon className="size-3.5" />
              {view.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeScheduleView === "calendar" && <CalendarView />}
          {activeScheduleView === "todo" && <TodoView />}
          {activeScheduleView === "starred" && <StarredView />}
          {activeScheduleView === "weekly" && <WeeklyReportView />}
        </div>
      </div>
    </div>
  )
}
