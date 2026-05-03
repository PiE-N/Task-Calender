'use client';

import { useState } from 'react';
import { Task } from '@/app/types';
import TaskItem from './TaskItem';
import { Droppable } from '@hello-pangea/dnd';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onAddNew }: TaskListProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority');

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const comparePriority = (a: Task, b: Task) => 
    priorityOrder[a.priority] - priorityOrder[b.priority];

  const compareDueDate = (a: Task, b: Task) => {
    const dateA = (a as any).dueDate;
    const dateB = (b as any).dueDate;
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // 期限なしは後に
    if (!dateB) return -1;
    
    return dateA.localeCompare(dateB);
  };

  const unscheduledTasks = tasks
    .filter((t) => !t.scheduledDate)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return comparePriority(a, b) || compareDueDate(a, b);
      } else {
        return compareDueDate(a, b) || comparePriority(a, b);
      }
    });

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg shadow-md p-6 min-h-[500px] flex flex-col">
      {/* ヘッダー：タスク一覧のタイトルと新規タスク追加ボタン */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">タスク一覧</h2>
        <div className="flex items-center justify-between w-full">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'dueDate')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">優先度順</option>
            <option value="dueDate">期限順</option>
          </select>
          <button
            onClick={onAddNew}
            className="whitespace-nowrap px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
          >
            + 新規
          </button>
        </div>
      </div>

      {/* ドラッグ＆ドロップ可能なエリア：タスクをここからカレンダーへドラッグ、または戻すことができる */}
      <Droppable droppableId="task-list">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 grid grid-cols-3 gap-2 p-2 rounded transition-colors content-start overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : ''
            }`}
          >
            {unscheduledTasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-gray-500 text-center py-8 col-span-3">タスクがありません</p>
            )}
            {unscheduledTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                isCompact={false}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
