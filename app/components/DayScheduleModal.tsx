// app/components/DayScheduleModal.tsx
import React from 'react';
import { Task } from '@/app/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';

interface DayScheduleModalProps {
  date: string; // YYYY-MM-DD format
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function DayScheduleModal({ date, isOpen, onClose, tasks, onEdit, onDelete }: DayScheduleModalProps) {
  if (!isOpen) return null;

  // 日付を整形 (例: 2026-05-04 -> 2026年5月4日(月))
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // その日のタスクを抽出
  const dayTasks = tasks.filter((task) => task.scheduledDate === date);
  const unscheduledDayTasks = dayTasks.filter(t => !t.startTime); // 時間未設定
  const scheduledDayTasks = dayTasks.filter(t => !!t.startTime);   // 時間設定済み

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl h-3/4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {formattedDate} のスケジュール
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded bg-white shadow-inner">
          {/* 1. 固定エリア: 登録済みタスク (時間未設定) - ここは常に表示 */}
          <div className="p-4 border-b border-gray-200 bg-white z-20">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">未配置のタスク</h3>
            <div className="overflow-x-auto pb-2">
              <Droppable droppableId={`modal-top-${date}`} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex gap-2 h-full items-start min-h-[50px]"
                  >
                    {unscheduledDayTasks.map((task, index) => (
                      <div key={task.id} className="w-48 flex-shrink-0">
                        <TaskItem
                          task={task}
                          index={index}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          isCompact={true}
                        />
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* 2. スクロールエリア: タイムライン */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="min-w-[2400px] flex h-full">
              {Array.from({ length: 24 }).map((_, hour) => {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                const tasksInHour = scheduledDayTasks.filter(t => t.startTime === timeStr);

                return (
                  <div key={hour} className="w-24 flex-shrink-0 flex flex-col border-r border-gray-200">
                    <div className="py-3 bg-white border-b border-gray-300 text-center text-sm font-black text-gray-600 sticky top-0 z-10">
                      {timeStr}
                    </div>
                    
                    <Droppable droppableId={`modal-hour-${date}-${hour}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-2 flex flex-col gap-2 min-h-[200px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-100' : ''
                          }`}
                        >
                          {tasksInHour.map((task, index) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              index={index}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              isCompact={true}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}