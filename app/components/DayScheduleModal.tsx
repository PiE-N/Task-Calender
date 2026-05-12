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

        {/* Main content area: Left for unscheduled tasks, Right for vertical timeline */}
        <div className="flex-1 flex overflow-hidden border border-gray-200 rounded bg-white shadow-inner">
          {/* 左側: 未配置のタスク (縦方向に表示) */}
          <div className="w-1/4 p-4 border-r border-gray-200 bg-white flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">未配置のタスク</h3>
            <Droppable droppableId={`modal-top-${date}`} direction="vertical">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2 flex-1 overflow-y-auto"
                >
                  {unscheduledDayTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={onEdit} // クリックで編集モーダルを開く
                      onDelete={onDelete}
                      isCompact={true}
                      isDraggable={false}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 右側: タイムライン (縦方向) */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
              {Array.from({ length: 24 }).map((_, hour) => {
                const hourString = String(hour).padStart(2, '0');
                const droppableId = `modal-hour-${date}-${hour}`;
                const tasksInHour = scheduledDayTasks.filter(t => {
                  // startTimeが設定されており、かつその時間のタスクをフィルタリング
                  const taskHour = t.startTime ? parseInt(t.startTime.split(':')[0], 10) : -1;
                  return taskHour === hour;
                });

                return (
                  <div key={hour} className="flex border-b border-gray-100 min-h-[64px] group">
                    {/* 左側：時刻ラベル */}
                    <div className="w-16 flex-shrink-0 py-2 pr-4 text-right bg-white border-r border-gray-100 sticky left-0 z-10">
                      <span className="text-xs font-medium text-gray-400">
                        {hourString}:00
                      </span>
                    </div>
                    
                    {/* 右側：タスクをドロップできるエリア (ドラッグでの配置は無効) */}
                    <Droppable droppableId={droppableId} isDropDisabled={true}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-1 flex flex-col gap-1 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
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
                              isDraggable={false}
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
  );
}