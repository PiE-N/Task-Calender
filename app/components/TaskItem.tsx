// app/components/TaskItem.tsx
'use client';

import { Task } from '@/app/types';
import { Draggable } from '@hello-pangea/dnd';

interface TaskItemProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isCompact?: boolean;
}

const priorityColors = {
  low: { border: 'border-blue-300', bg: 'bg-blue-100/80', text: 'text-blue-900', label: 'bg-blue-200' }, // 青色
  medium: { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-900', label: 'bg-yellow-100' },
  high: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-900', label: 'bg-red-100' }, 
};

export default function TaskItem({ task, index, onEdit, onDelete, isCompact = false }: TaskItemProps) {
  const { dueDate, startTime, duration } = task;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 期限までの残り日数を正確に計算（タイムゾーンの影響を排除）
  const getDiffDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day); // ローカル時刻として生成
    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const diffDays = dueDate ? getDiffDays(dueDate) : Infinity;

  // 色分けは純粋に優先度のみに基づき、期限が近い（7日以内）場合はフラグを立てる
  const isNearDeadline = diffDays <= 7;
  const colors = priorityColors[task.priority];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        if (isCompact) {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={provided.draggableProps.style}
              className={`text-[10px] p-1 mb-1 rounded border-l-2 truncate cursor-move transition-shadow ${
                colors.label
              } ${colors.border} ${colors.text} ${
                snapshot.isDragging ? 'shadow-lg ring-1 ring-blue-400 z-50 opacity-90' : 'hover:brightness-95'
              }`}
              title={`${task.title}${dueDate ? ` (期限: ${dueDate})` : ''}${
                startTime ? ` (${startTime}${duration ? ` ${duration}分` : ''})` : ''
              }`}
            >
              {task.title}
            </div>
          );
        }

        return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`p-2 rounded border-l-4 cursor-move shadow min-h-[80px] flex flex-col justify-between transition-all border-y border-r border-black/10 ${
            snapshot.isDragging ? 'opacity-70 ring-2 ring-blue-500 shadow-xl z-50' : 'hover:shadow-md'
          } ${colors.bg} ${colors.border}`}
        >
          <div className="flex-1 overflow-hidden">
            <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            {dueDate && (
              <p className={`text-[10px] mt-1 ${isNearDeadline ? 'font-bold text-red-600' : 'text-gray-500'}`}>
                  期限: {new Date(dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="text-blue-500 text-[10px] font-medium hover:underline"
            >
              編集
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-red-500 text-[10px] font-medium hover:underline"
            >
              削除
            </button>
          </div>
        </div>
        );
      }}
    </Draggable>
  );
}