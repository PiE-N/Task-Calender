'use client';

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
  // スケジュール済み（scheduledDateが設定されていない）タスクのみを表示
  const unscheduledTasks = tasks.filter((t) => !t.scheduledDate);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg shadow-md p-6 min-h-[500px] flex flex-col">
      {/* ヘッダー：タスク一覧のタイトルと新規タスク追加ボタン */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">タスク一覧</h2>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
        >
          + 新規
        </button>
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
