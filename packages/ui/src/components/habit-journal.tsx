"use client";

import * as React from "react";
import {
  Check,
  CircleDashed,
  MessageSquareText,
  NotebookPen,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  X,
  Minus,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type LogStatus = "done" | "skipped" | "missed";
export type Mood = 1 | 2 | 3 | 4 | 5;

export interface DailyLog {
  id: string;
  date: string;
  status: LogStatus;
  mood?: Mood;
  remark?: string;
}

export interface Note {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitJournalProps {
  logs: DailyLog[];
  notes: Note[];
  onSaveLog?: (log: DailyLog) => void | Promise<void>;
  onDeleteLog?: (id: string) => void | Promise<void>;
  onSaveNote?: (note: Note) => void | Promise<void>;
  onDeleteNote?: (id: string) => void | Promise<void>;
}

const REMARK_MAX = 280;
const NOTE_MAX = 1000;

const STATUS_META: Record<
  LogStatus,
  { label: string; icon: React.ElementType; chip: string; dot: string }
> = {
  done: {
    label: "Done",
    icon: Check,
    chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/40",
  },
  skipped: {
    label: "Skipped",
    icon: Minus,
    chip: "border-amber-500/40 bg-amber-500/15 text-amber-400",
    dot: "bg-amber-500/20 text-amber-400 ring-amber-500/40",
  },
  missed: {
    label: "Missed",
    icon: X,
    chip: "border-rose-500/40 bg-rose-500/15 text-rose-400",
    dot: "bg-rose-500/20 text-rose-400 ring-rose-500/40",
  },
};

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 1, emoji: "😣", label: "Rough" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDateStr = (s: string) => new Date(`${s}T12:00:00`);

function dayLabel(dateStr: string, today: string) {
  const d = parseDateStr(dateStr);
  const diff = Math.round(
    (parseDateStr(today).getTime() - d.getTime()) / 86_400_000
  );
  const base = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
  if (diff === 0) return { primary: "Today", secondary: base };
  if (diff === 1) return { primary: "Yesterday", secondary: base };
  return { primary: base, secondary: "" };
}

const monthLabel = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    parseDateStr(dateStr)
  );

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

function IconButton({
  label,
  onClick,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10",
        danger ? "hover:text-rose-400" : "hover:text-white",
        focusRing
      )}
    >
      {children}
    </button>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  const near = value > max * 0.9;
  return (
    <span className={cn("text-xs tabular-nums", near ? "text-amber-400" : "text-white/40")}>
      {value}/{max}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
      <div className="text-white/30" aria-hidden>
        {icon}
      </div>
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="max-w-xs text-sm text-white/50">{hint}</p>
    </div>
  );
}

function DeleteButton({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  if (armed) {
    return (
      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          "h-8 rounded-lg bg-rose-500/15 px-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/25",
          focusRing
        )}
      >
        Confirm delete
      </button>
    );
  }
  return (
    <IconButton label={label} onClick={() => setArmed(true)} danger>
      <Trash2 className="size-4" aria-hidden />
    </IconButton>
  );
}

interface LogComposerProps {
  today: string;
  existing: Map<string, DailyLog>;
  editingDate: string | null;
  onSave: (log: Omit<DailyLog, "id">) => void;
  onCancelEdit: () => void;
}

function LogComposer({
  today,
  existing,
  editingDate,
  onSave,
  onCancelEdit,
}: LogComposerProps) {
  const [date, setDate] = React.useState(today);
  const [status, setStatus] = React.useState<LogStatus>("done");
  const [mood, setMood] = React.useState<Mood | undefined>();
  const [remark, setRemark] = React.useState("");

  const load = React.useCallback(
    (d: string) => {
      const found = existing.get(d);
      setStatus(found?.status ?? "done");
      setMood(found?.mood);
      setRemark(found?.remark ?? "");
    },
    [existing]
  );

  React.useEffect(() => {
    if (editingDate) {
      setDate(editingDate);
      load(editingDate);
    }
  }, [editingDate, load]);

  const isUpdate = existing.has(date);

  const submit = () => {
    onSave({
      date,
      status,
      mood,
      remark: remark.trim() || undefined,
    });
    if (!isUpdate) {
      setRemark("");
      setMood(undefined);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="log-date" className="sr-only">
            Log date
          </label>
          <input
            id="log-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => {
              setDate(e.target.value);
              load(e.target.value);
            }}
            className={cn(
              "h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white [color-scheme:dark]",
              focusRing
            )}
          />
          {isUpdate && (
            <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-medium text-sky-400">
              Editing existing entry
            </span>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label="Status"
          className="inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5"
        >
          {(Object.keys(STATUS_META) as LogStatus[]).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStatus(s)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
                  active
                    ? meta.chip
                    : "border-transparent text-white/50 hover:text-white",
                  focusRing
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-white/50">
          How did it feel?
        </span>
        <div role="radiogroup" aria-label="Mood" className="flex gap-1">
          {MOODS.map((m) => {
            const active = mood === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={m.label}
                title={m.label}
                onClick={() => setMood(active ? undefined : m.value)}
                className={cn(
                  "size-9 rounded-lg border text-lg transition-all",
                  active
                    ? "scale-105 border-white/30 bg-white/15"
                    : "border-transparent opacity-60 hover:bg-white/10 hover:opacity-100",
                  focusRing
                )}
              >
                {m.emoji}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="log-remark" className="sr-only">
          Remark
        </label>
        <textarea
          id="log-remark"
          value={remark}
          maxLength={REMARK_MAX}
          rows={3}
          placeholder="Add a remark – what went well, what got in the way?"
          onChange={(e) => setRemark(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          className={cn(
            "w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30",
            focusRing
          )}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">
            <kbd className="rounded border border-white/15 px-1 font-sans">⌘</kbd> +{" "}
            <kbd className="rounded border border-white/15 px-1 font-sans">Enter</kbd> to save
          </span>
          <Counter value={remark.length} max={REMARK_MAX} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {editingDate && (
          <button
            type="button"
            onClick={() => {
              onCancelEdit();
              setDate(today);
              load(today);
            }}
            className={cn(
              "h-9 rounded-lg px-4 text-sm font-medium text-white/60 hover:text-white",
              focusRing
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90",
            focusRing
          )}
        >
          {isUpdate ? "Update entry" : "Save entry"}
        </button>
      </div>
    </form>
  );
}

type LogFilter = "all" | LogStatus | "remarks";

function LogTimeline({
  logs,
  today,
  onEdit,
  onDelete,
}: {
  logs: DailyLog[];
  today: string;
  onEdit: (date: string) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = React.useState<LogFilter>("all");

  const filtered = React.useMemo(() => {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === "all") return sorted;
    if (filter === "remarks") return sorted.filter((l) => !!l.remark);
    return sorted.filter((l) => l.status === filter);
  }, [logs, filter]);

  const groups = React.useMemo(() => {
    const map = new Map<string, DailyLog[]>();
    filtered.forEach((l) => {
      const key = monthLabel(l.date);
      map.set(key, [...(map.get(key) ?? []), l]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const filters: { id: LogFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "done", label: "Done" },
    { id: "skipped", label: "Skipped" },
    { id: "missed", label: "Missed" },
    { id: "remarks", label: "With remarks" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter entries">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-white/30 bg-white/15 text-white"
                : "border-white/10 text-white/50 hover:text-white",
              focusRing
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<CircleDashed className="size-8" />}
          title={logs.length === 0 ? "No entries yet" : "Nothing matches this filter"}
          hint={
            logs.length === 0
              ? "Log today to start building your history."
              : "Try a different filter to see more entries."
          }
        />
      ) : (
        <div aria-live="polite" className="space-y-6">
          {groups.map(([month, items]) => (
            <section key={month} aria-label={month}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                {month}
              </h3>
              <ol className="relative space-y-1 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-white/10">
                {items.map((log) => {
                  const meta = STATUS_META[log.status];
                  const Icon = meta.icon;
                  const mood = MOODS.find((m) => m.value === log.mood);
                  const label = dayLabel(log.date, today);
                  return (
                    <li
                      key={log.id}
                      className="group relative flex gap-4 rounded-xl py-2 pr-2 transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className={cn(
                          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ring-1",
                          meta.dot
                        )}
                        title={meta.label}
                      >
                        <Icon className="size-4" aria-hidden />
                        <span className="sr-only">{meta.label}</span>
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium text-white">
                            {label.primary}
                          </span>
                          {label.secondary && (
                            <span className="text-xs text-white/40">{label.secondary}</span>
                          )}
                          {mood && (
                            <span
                              className="text-base"
                              role="img"
                              aria-label={`Mood: ${mood.label}`}
                              title={mood.label}
                            >
                              {mood.emoji}
                            </span>
                          )}
                        </div>
                        {log.remark ? (
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/70">
                            {log.remark}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm italic text-white/30">No remark</p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-start gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                        <IconButton
                          label={`Edit entry for ${label.secondary || label.primary}`}
                          onClick={() => onEdit(log.date)}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </IconButton>
                        <DeleteButton
                          label={`Delete entry for ${label.secondary || label.primary}`}
                          onConfirm={() => onDelete(log.id)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesPanel({
  notes,
  onSave,
  onDelete,
}: {
  notes: Note[];
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");

  const sorted = React.useMemo(
    () =>
      [...notes].sort((a, b) =>
        a.pinned === b.pinned ? b.updatedAt.localeCompare(a.updatedAt) : a.pinned ? -1 : 1
      ),
    [notes]
  );

  const add = () => {
    const content = draft.trim();
    if (!content) return;
    const now = new Date().toISOString();
    onSave({ id: uid(), content, pinned: false, createdAt: now, updatedAt: now });
    setDraft("");
  };

  const commitEdit = (note: Note) => {
    const content = editText.trim();
    if (content && content !== note.content) {
      onSave({ ...note, content, updatedAt: new Date().toISOString() });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label htmlFor="note-draft" className="sr-only">
          New note
        </label>
        <textarea
          id="note-draft"
          value={draft}
          rows={3}
          maxLength={NOTE_MAX}
          placeholder="Jot down a tip, a strategy, or a reminder for future you…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") add();
          }}
          className={cn(
            "w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30",
            focusRing
          )}
        />
        <div className="flex items-center justify-between">
          <Counter value={draft.length} max={NOTE_MAX} />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className={cn(
              "h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40",
              focusRing
            )}
          >
            Add note
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="size-8" />}
          title="No notes yet"
          hint="Notes are for things that outlive a single day – pin the ones you want to see first."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          {sorted.map((note) => {
            const editing = editingId === note.id;
            return (
              <li
                key={note.id}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border p-4 transition-colors",
                  note.pinned
                    ? "border-amber-500/30 bg-amber-500/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
                )}
              >
                {editing ? (
                  <>
                    <label htmlFor={`edit-${note.id}`} className="sr-only">
                      Edit note
                    </label>
                    <textarea
                      id={`edit-${note.id}`}
                      autoFocus
                      value={editText}
                      rows={4}
                      maxLength={NOTE_MAX}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingId(null);
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") commitEdit(note);
                      }}
                      className={cn(
                        "w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white",
                        focusRing
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className={cn(
                          "h-8 rounded-lg px-3 text-xs font-medium text-white/60 hover:text-white",
                          focusRing
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => commitEdit(note)}
                        className={cn(
                          "h-8 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-white/90",
                          focusRing
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="flex-1 whitespace-pre-wrap break-words text-sm text-white/80">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {note.updatedAt !== note.createdAt ? "Edited " : ""}
                        {timeAgo(note.updatedAt)}
                      </span>
                      <div className="flex gap-0.5">
                        <IconButton
                          label={note.pinned ? "Unpin note" : "Pin note"}
                          onClick={() => onSave({ ...note, pinned: !note.pinned })}
                        >
                          {note.pinned ? (
                            <PinOff className="size-4" aria-hidden />
                          ) : (
                            <Pin className="size-4" aria-hidden />
                          )}
                        </IconButton>
                        <IconButton
                          label="Edit note"
                          onClick={() => {
                            setEditingId(note.id);
                            setEditText(note.content);
                          }}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </IconButton>
                        <DeleteButton label="Delete note" onConfirm={() => onDelete(note.id)} />
                      </div>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type Tab = "logs" | "notes";

export function HabitJournal({
  logs: initialLogs,
  notes: initialNotes,
  onSaveLog,
  onDeleteLog,
  onSaveNote,
  onDeleteNote,
}: HabitJournalProps) {
  const [tab, setTab] = React.useState<Tab>("logs");
  const [logs, setLogs] = React.useState(initialLogs);
  const [notes, setNotes] = React.useState(initialNotes);
  const [editingDate, setEditingDate] = React.useState<string | null>(null);

  const today = React.useMemo(() => toDateStr(new Date()), []);
  const logsByDate = React.useMemo(() => new Map(logs.map((l) => [l.date, l])), [logs]);

  const saveLog = (draft: Omit<DailyLog, "id">) => {
    const prev = logsByDate.get(draft.date);
    const next: DailyLog = { ...draft, id: prev?.id ?? uid() };
    setLogs((all) => (prev ? all.map((l) => (l.id === prev.id ? next : l)) : [...all, next]));
    setEditingDate(null);
    void onSaveLog?.(next);
  };

  const deleteLog = (id: string) => {
    setLogs((all) => all.filter((l) => l.id !== id));
    void onDeleteLog?.(id);
  };

  const saveNote = (note: Note) => {
    setNotes((all) =>
      all.some((n) => n.id === note.id)
        ? all.map((n) => (n.id === note.id ? note : n))
        : [...all, note]
    );
    void onSaveNote?.(note);
  };

  const deleteNote = (id: string) => {
    setNotes((all) => all.filter((n) => n.id !== id));
    void onDeleteNote?.(id);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "logs", label: "Daily log", icon: MessageSquareText, count: logs.length },
    { id: "notes", label: "Notes", icon: NotebookPen, count: notes.length },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      setTab((t) => (t === "logs" ? "notes" : "logs"));
    }
  };

  return (
    <section aria-labelledby="journal-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="journal-title" className="text-lg font-semibold text-white">
            Journal
          </h2>
          <p className="text-sm text-white/50">
            Log how each day went and keep notes that help you stay consistent.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Journal sections"
          onKeyDown={onTabKeyDown}
          className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/50 hover:text-white",
                  focusRing
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t.label}
                <span className="rounded-full bg-white/10 px-1.5 text-xs tabular-nums text-white/60">
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-6">
        {tab === "logs" ? (
          <>
            <LogComposer
              today={today}
              existing={logsByDate}
              editingDate={editingDate}
              onSave={saveLog}
              onCancelEdit={() => setEditingDate(null)}
            />
            <LogTimeline
              logs={logs}
              today={today}
              onEdit={(d) => {
                setEditingDate(d);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDelete={deleteLog}
            />
          </>
        ) : (
          <NotesPanel notes={notes} onSave={saveNote} onDelete={deleteNote} />
        )}
      </div>
    </section>
  );
}

export default HabitJournal;
