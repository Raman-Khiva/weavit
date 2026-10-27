

export * from './generated/zod';

import type { components } from "./generated/types";

export type { components };

type Schemas = components["schemas"];

// Base types
export type USER = Schemas["User"];
export type PROJECT = Schemas["Project"];
export type PHASE = Schemas["ProjectPhase"];
export type TASK = Schemas["ProjectTask"];
export type TASK_LOG_NOTE = Schemas["TaskLogNote"];
export type HABIT = Schemas["Habit"];
export type TODO = Schemas["Todo"];
export type DEADLINE = Schemas["Deadline"];
export type ACTIVITY = Schemas["Activity"];
export type NOTIFICATION = Schemas["Notification"];
export type DRAFT = Schemas["Draft"];

// Input types
export type CreateProjectInput = Schemas["CreateProjectInput"];
export type UpdateProjectInput = Schemas["UpdateProjectInput"];

export type CreatePhaseInput = Schemas["CreatePhaseInput"];

export type CreateTaskInput = Schemas["CreateTaskInput"];
export type UpdateTaskInput = Schemas["UpdateTaskInput"];
export type CreateTaskNoteInput = Schemas["CreateTaskNoteInput"];

export type CreateHabitInput = Schemas["CreateHabitInput"];
export type CreateHabitLogInput = Schemas["CreateHabitLogInput"];
export type HABIT_LOG = Schemas["HabitLog"];

export type CreateTodoInput = Schemas["CreateTodoInput"];
export type UpdateTodoInput = Schemas["UpdateTodoInput"];

export type CreateDeadlineInput = Schemas["CreateDeadlineInput"];

export type CreateDraftInput = Schemas["CreateDraftInput"];
