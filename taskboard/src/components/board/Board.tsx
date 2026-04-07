"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { COLUMNS } from "@/types";
import type { Task, Status, Label } from "@/types";
import { Column } from "./Column";
import { TaskCard } from "../task/TaskCard";
import { TaskDetailModal } from "../task/TaskDetailModal";

interface BoardProps {
  tasks: Task[];
  allTasks: Task[];
  labels: Label[];
  loading: boolean;
  onMove: (id: string, status: Status) => Promise<void>;
  onUpdate: (
    id: string,
    updates: Partial<Task>,
    labelIds?: string[]
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (input: {
    title: string;
    description?: string;
    status?: Status;
    labelIds?: string[];
  }) => Promise<unknown>;
}

export function Board({
  tasks,
  allTasks,
  labels,
  loading,
  onMove,
  onUpdate,
  onDelete,
  onCreate,
}: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t.id === e.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(e: DragOverEvent) {
    const overId = e.over?.id as string | null;
    if (!overId) {
      setOverColumn(null);
      return;
    }
    const isColumn = COLUMNS.some((c) => c.id === overId);
    if (isColumn) {
      setOverColumn(overId as Status);
      return;
    }
    const overTask = tasks.find((t) => t.id === overId);
    setOverColumn(overTask?.status ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveTask(null);
    setOverColumn(null);
    if (!over) return;

    const overId = over.id as string;
    const isColumn = COLUMNS.some((c) => c.id === overId);
    const targetStatus = isColumn
      ? (overId as Status)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus) return;
    const draggedTask = tasks.find((t) => t.id === active.id);
    if (draggedTask && draggedTask.status !== targetStatus) {
      onMove(draggedTask.id, targetStatus);
    }
  }

  // Always use fresh task data for the detail modal
  const selectedTaskFresh = selectedTask
    ? (allTasks.find((t) => t.id === selectedTask.id) ?? selectedTask)
    : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 flex gap-4 px-6 py-6 overflow-x-auto pb-10">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <SortableContext
                key={col.id}
                id={col.id}
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  column={col}
                  tasks={colTasks}
                  loading={loading}
                  isOver={overColumn === col.id}
                  onTaskClick={(t) => setSelectedTask(t)}
                  onQuickAdd={(title) => onCreate({ title, status: col.id })}
                />
              </SortableContext>
            );
          })}
        </main>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeTask && (
            <div style={{ transform: "rotate(1.5deg)" }}>
              <TaskCard task={activeTask} onClick={() => {}} isDragOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTaskFresh && (
        <TaskDetailModal
          task={selectedTaskFresh}
          labels={labels}
          onClose={() => setSelectedTask(null)}
          onUpdate={onUpdate}
          onDelete={async (id) => {
            await onDelete(id);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
