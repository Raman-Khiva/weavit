import type { components } from "./generated/types.js"

export type { components }

type Schemas = components["schemas"]

// Base types
export type USER = Schemas["User"]
export type PROJECT = Schemas["Project"]
export type PHASE = Schemas["ProjectPhase"]
export type TASK = Schemas["ProjectTask"]
export type TASK_LOG_NOTE = Schemas["TaskLogNote"]
export type HABIT = Schemas["Habit"]
export type TODO = Schemas["Todo"]
export type DEADLINE = Schemas["Deadline"]

// Input types
export type CreateProjectInput = Schemas["CreateProjectInput"]
export type UpdateProjectInput = Schemas["UpdateProjectInput"]

export type CreatePhaseInput = Schemas["CreatePhaseInput"]

export type CreateTaskInput = Schemas["CreateTaskInput"]
export type UpdateTaskInput = Schemas["UpdateTaskInput"]
export type CreateTaskNoteInput = Schemas["CreateTaskNoteInput"]

export type CreateHabitInput = Schemas["CreateHabitInput"]
export type CreateHabitLogInput = Schemas["CreateHabitLogInput"]
export type HABIT_LOG = Schemas["HabitLog"]

export type CreateTodoInput = Schemas["CreateTodoInput"]
export type UpdateTodoInput = Schemas["UpdateTodoInput"]

export type CreateDeadlineInput = Schemas["CreateDeadlineInput"]
export type UpdateDeadlineInput = Schemas["UpdateDeadlineInput"]

export type CalendarTone = Schemas["CalendarTone"]
export type CalendarSource = Schemas["CalendarSource"]
export type CalendarEvent = Schemas["CalendarEvent"]
export type Timeline = Schemas["Timeline"]
export type CreateCalendarSourceInput = Schemas["CreateCalendarSourceInput"]
export type UpdateCalendarSourceInput = Schemas["UpdateCalendarSourceInput"]
export type CreateCalendarEventInput = Schemas["CreateCalendarEventInput"]
export type UpdateCalendarEventInput = Schemas["UpdateCalendarEventInput"]
