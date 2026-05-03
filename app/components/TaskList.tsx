'use client';

import { Task } from '@/app/types';
import TaskItem from './TaskItem';
import { Droppable } from 'react-beautiful-dnd';

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
    <div className="w-full max-w-md bg-gray-50 rounded-lg shadow-md p-6 overflow-y-auto">
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

      {/* タスクが無い場合はメッセージを表示、有る場合はリスト表示 */}
      {unscheduledTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">タスクがありません</p>
      ) : (
        // ドラッグ＆ドロップ可能なエリア：タスクをここからカレンダーへドラッグできる
        <Droppable droppableId="task-list">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 p-2 rounded ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
            >
              {unscheduledTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
