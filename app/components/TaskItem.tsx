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
  low: { border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-900', label: 'bg-green-100' }, // 薄い緑色
  medium: { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-900', label: 'bg-yellow-100' },
  high: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-900', label: 'bg-red-100' },
};

export default function TaskItem({ task, index, onEdit, onDelete, isCompact = false }: TaskItemProps) {
  const dueDate = (task as any).dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 期限までの残り日数を正確に計算（タイムゾーンの影響を排除）
  const getDiffDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day); // ローカル時刻として生成
    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const diffDays = dueDate ? getDiffDays(dueDate) : Infinity;

  // 優先度と期限を比較し、最も高い緊急度を選択 (赤 > 黄 > 緑)
  const getUrgencyLevel = (): 'high' | 'medium' | 'low' => {
    // 1. 赤 (最優先): 優先度が「高」または期限が7日以内
    if (task.priority === 'high' || diffDays <= 7) return 'high';
    // 2. 黄: 優先度が「中」または期限が30日以内
    if (task.priority === 'medium' || diffDays <= 30) return 'medium';
    // 3. 青 (低): それ以外
    return 'low';
  };

  const colors = priorityColors[getUrgencyLevel()];

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
              title={`${task.title}${dueDate ? ` (期限: ${dueDate})` : ''}`}
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
          className={`p-2 rounded border-l-4 cursor-move shadow min-h-[80px] flex flex-col justify-between transition-all ${
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
              <p className="text-[10px] text-gray-500 mt-1">
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