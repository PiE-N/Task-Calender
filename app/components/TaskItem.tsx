// app/components/TaskItem.tsx
'use client';

import { Task } from '@/app/types';
import { Draggable } from '@hello-pangea/dnd';

interface TaskItemProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-blue-100 border-blue-300',
  medium: 'bg-yellow-100 border-yellow-300',
  high: 'bg-red-100 border-red-300',
};

// ドラッグ中のスタイルをマウス位置基準に補正
function getDraggingStyle(style: React.CSSProperties | undefined, snapshot: { isDragging: boolean }) {
  if (!snapshot.isDragging) return style;
  return {
    ...style,
    transform: style?.transform,
    // 左方向のオフセットをリセットしてマウス位置を中心にする
    left: 'auto',
    top: 'auto',
  };
}

export default function TaskItem({ task, index, onEdit, onDelete }: TaskItemProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getDraggingStyle(provided.draggableProps.style, snapshot)}
          className={`p-4 mb-2 rounded border-l-4 cursor-move transition ${
            snapshot.isDragging ? 'bg-gray-50 shadow-lg opacity-90' : 'bg-white shadow'
          } ${priorityColors[task.priority]}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
              {task.scheduledDate && (
                <p className="text-xs text-gray-500 mt-2">
                  📅 {new Date(task.scheduledDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => onEdit(task)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}