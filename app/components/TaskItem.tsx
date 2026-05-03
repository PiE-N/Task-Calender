// app/components/TaskItem.tsx
'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [clickOffset, setClickOffset] = useState({ x: 0, y: 0 }); // 要素の左上からクリック位置までのオフセットを保存
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const child = (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onPointerDown={(e) => {
            // 型定義に存在しない場合があるため any キャストでエラーを回避し、実行時のみ呼び出す
            (provided.dragHandleProps as any)?.onPointerDown?.(e);

            const rect = e.currentTarget.getBoundingClientRect();
            setClickOffset({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging ? {
              // Draggable要素自体を6x6pxのドットにします。
              // ライブラリは要素の中心をドロップ判定に使うため、これで判定とマウスが重なります。
              width: '6px',
              height: '6px',
              padding: 0,
              margin: 0,
              backgroundColor: '#3b82f6', // ドットの色
              borderRadius: '50%',
              border: 'none',
              boxShadow: 'none',
              // マウスポインタの先端（クリック位置）が6pxドットの中心（3px）に来るように補正します。
              transform: `${provided.draggableProps.style?.transform ?? ''} translate(${clickOffset.x - 3}px, ${clickOffset.y - 3}px)`,
            } : {})
          }}
          className={snapshot.isDragging
            ? "z-[9999] pointer-events-none" // z-indexを高くし、他の要素との干渉を防ぐ
            : `p-4 mb-2 rounded border-l-4 cursor-move transition bg-white shadow ${priorityColors[task.priority]}`
          }
        >
          {!snapshot.isDragging && (
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
          )}
        </div>
        );

        if (snapshot.isDragging && portalNode) {
          return createPortal(child, portalNode);
        }
        return child;
      }}
    </Draggable>
  );
}