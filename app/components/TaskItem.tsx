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

export default function TaskItem({ task, index, onEdit, onDelete }: TaskItemProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`p-2 rounded border-l-4 cursor-move bg-white shadow min-h-[80px] flex flex-col justify-between transition-shadow ${
            snapshot.isDragging ? 'opacity-70 ring-2 ring-blue-500 shadow-xl z-50' : 'hover:shadow-md'
          } ${priorityColors[task.priority]}`}
        >
          <div className="flex-1 overflow-hidden">
            <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
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
      )}
    </Draggable>
  );
}