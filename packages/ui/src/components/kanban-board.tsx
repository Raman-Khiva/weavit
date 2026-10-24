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

export function Pattern({
  plannedData,
  buildingData,
  shippedData,
}: PatternProps) {
  const [columns, setColumns] = useState<Columns>(() =>
    groupTodos([...plannedData, ...buildingData, ...shippedData])
  );

  // Refresh when API data changes.
  useEffect(() => {
    setColumns(
      groupTodos([...plannedData, ...buildingData, ...shippedData])
    );
  }, [plannedData, buildingData, shippedData]);

  return (
    <Kanban
      value={columns}
      onValueChange={(value) =>
        setColumns({
          planned: value.planned ?? [],
          building: value.building ?? [],
          shipped: value.shipped ?? [],
        })
      }
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid grid-cols-3 gap-3">
        {(Object.keys(COLUMNS) as ColumnId[]).map((columnId) => {
          const column = COLUMNS[columnId];
          const todos = columns[columnId];

          return (
            <KanbanColumn key={columnId} value={columnId}>
              <Frame spacing="sm" className="h-full">
                <FrameHeader className="flex flex-row items-center gap-2">
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
                  className="flex flex-col gap-2 p-0.5"
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