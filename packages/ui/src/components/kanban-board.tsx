"use client";

import { useEffect, useState } from "react";
import type { components } from "@weavit/api-types";

import { Badge } from "@workspace/ui/components/reui/badge";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@workspace/ui/components/reui/frame";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@workspace/ui/components/reui/kanban";
import { cn } from "@workspace/ui/lib/utils";

type TODO = components["schemas"]["Todo"];

interface PatternProps {
  plannedData: TODO[];
  buildingData: TODO[];
  shippedData: TODO[];
  onStatusChange?: (id: string, status: TODO["status"]) => void;
  className?: string;
}

type ColumnId = "planned" | "building" | "shipped";

type Columns = Record<ColumnId, TODO[]>;

const COLUMNS: Record<ColumnId, { title: string; color: string }> = {
  planned: { title: "Planned", color: "bg-blue-500" },
  building: { title: "Building", color: "bg-yellow-500" },
  shipped: { title: "Shipped", color: "bg-green-500" },
};

const STATUS_TO_COLUMN = {
  PENDING: "planned",
  IN_PROGRESS: "building",
  COMPLETED: "shipped",
} as const;

function getColumnId(todo: TODO): ColumnId {
  if (todo.status && todo.status in STATUS_TO_COLUMN) {
    return STATUS_TO_COLUMN[
      todo.status as keyof typeof STATUS_TO_COLUMN
    ];
  }

  return "planned";
}

function groupTodos(todos: TODO[]): Columns {
  const columns: Columns = {
    planned: [],
    building: [],
    shipped: [],
  };

  for (const todo of todos) {
    columns[getColumnId(todo)].push(todo);
  }

  return columns;
}

function TodoCard({ todo }: { todo: TODO }) {
  return (
    <KanbanItem value={todo.id}>
      <KanbanItemHandle>
        <Frame variant="ghost" spacing="sm" className="p-0">
          <FramePanel className="p-3">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{todo.title}</span>

              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {todo.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {todo.priority ?? "No priority"}
                </span>

                <span className="text-xs text-muted-foreground">
                  {todo.status ?? "PENDING"}
                </span>
              </div>
            </div>
          </FramePanel>
        </Frame>
      </KanbanItemHandle>
    </KanbanItem>
  );
}

const COLUMN_TO_STATUS = {
  planned: "PENDING",
  building: "IN_PROGRESS",
  shipped: "COMPLETED",
} as const;

function columnFingerprint(cols: Columns) {
  return (Object.keys(COLUMNS) as ColumnId[])
    .map((col) => `${col}:${cols[col].map((t) => t.id).join(",")}`)
    .join("|");
}

export function Pattern({
  plannedData,
  buildingData,
  shippedData,
  onStatusChange,
  className,
}: PatternProps) {
  const [columns, setColumns] = useState<Columns>(() =>
    groupTodos([...plannedData, ...buildingData, ...shippedData])
  );

  // Refresh when API todo ids/statuses change (ignore new array refs each render).
  const apiKey = columnFingerprint(
    groupTodos([...plannedData, ...buildingData, ...shippedData])
  );
  useEffect(() => {
    setColumns(
      groupTodos([...plannedData, ...buildingData, ...shippedData])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when apiKey changes
  }, [apiKey]);

  return (
    <Kanban
      value={columns}
      onValueChange={(value) => {
        const next: Columns = {
          planned: (value.planned ?? []).map((t) => ({
            ...t,
            status: "PENDING",
          })),
          building: (value.building ?? []).map((t) => ({
            ...t,
            status: "IN_PROGRESS",
          })),
          shipped: (value.shipped ?? []).map((t) => ({
            ...t,
            status: "COMPLETED",
          })),
        };

        // Avoid controlled-Kanban setState ↔ onValueChange loops
        if (columnFingerprint(next) === columnFingerprint(columns)) return;

        const prevColumn = new Map<string, ColumnId>();
        for (const col of Object.keys(COLUMNS) as ColumnId[]) {
          for (const todo of columns[col]) prevColumn.set(todo.id, col);
        }

        setColumns(next);

        for (const col of Object.keys(COLUMNS) as ColumnId[]) {
          for (const todo of next[col]) {
            if (todo.id.startsWith("demo-")) continue;
            if (prevColumn.get(todo.id) === col) continue;
            onStatusChange?.(todo.id, COLUMN_TO_STATUS[col]);
          }
        }
      }}
      getItemValue={(item) => item.id}
      className={cn("flex h-full min-h-0 flex-col", className)}
    >
      <KanbanBoard className="grid h-full min-h-0 grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(COLUMNS) as ColumnId[]).map((columnId) => {
          const column = COLUMNS[columnId];
          const todos = columns[columnId];

          return (
            <KanbanColumn
              key={columnId}
              value={columnId}
              className="min-h-0 h-full"
            >
              <Frame spacing="sm" className="flex h-full min-h-0 flex-col">
                <FrameHeader className="flex shrink-0 flex-row items-center gap-2">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      column.color
                    )}
                  />

                  <FrameTitle>{column.title}</FrameTitle>

                  <Badge variant="outline" size="sm" className="ml-auto">
                    {todos.length}
                  </Badge>
                </FrameHeader>

                <KanbanColumnContent
                  value={columnId}
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-0.5"
                >
                  {todos.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} />
                  ))}
                </KanbanColumnContent>
              </Frame>
            </KanbanColumn>
          );
        })}
      </KanbanBoard>

      <KanbanOverlay className="rounded-md border-2 border-dashed bg-muted/10" />
    </Kanban>
  );
}