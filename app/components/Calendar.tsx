'use client';

import { useState } from 'react';
import { Task } from '@/app/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';

interface CalendarProps {
  tasks: Task[];
  onTaskScheduled: (taskId: string, date: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDayClick: (date: string) => void; // 日付クリック時のハンドラを追加
}

export default function Calendar({ tasks, onTaskScheduled, onEdit, onDelete, onDayClick }: CalendarProps) {
  // 現在表示している月の状態管理
  const [currentDate, setCurrentDate] = useState(new Date());

  // 指定された月の日数を取得（例：5月 → 31日）
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 月の最初の日が何曜日であるかを取得（日=0、月=1、...、土=6）
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 指定された日付のタスク一覧を取得
  const getTasksByDate = (date: string) => {
    return tasks.filter((task) => task.scheduledDate === date);
  };

  // YYYY-MM-DD形式で日付をフォーマット
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 前月に移動
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // 翌月に移動
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('ja-JP', { month: 'long' });
  const today = new Date();

  // カレンダーグリッド用の日付配列を構築
  // 月始まり前の空白セル + その月の全ての日付を含む
  const days = [];
  
  // 月始まり前の空白セルを追加（例：5月1日が木曜=4なら、日〜水の4セルを空白にする）
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // その月の全ての日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 overflow-y-auto relative">
      {/* 今日の日付を表示 */}
      <div className="absolute top-2 right-6 text-xs text-gray-400 font-semibold tracking-wider">
        今日: {today.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
      </div>

      {/* ヘッダー：月の切り替えボタンと月名 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          ←
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {year}年 {monthName}
        </h2>
        <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, dayIndex) => (
          <div 
            key={day} 
            className={`text-center font-bold py-2 ${
              dayIndex === 0 ? 'text-red-600' : dayIndex === 6 ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド：空白セル + 日付セルを表示 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          // dayがnullの場合は空白セル、そうでなければ日付セル
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;
          const weekendBg = isSunday ? 'bg-red-50' : isSaturday ? 'bg-blue-50' : '';
          
          const dateStr = day ? formatDate(year, month, day) : '';
          const dayTasks = day ? getTasksByDate(dateStr) : [];

          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className={`min-h-24 p-2 rounded border-2 border-transparent ${weekendBg || 'bg-gray-100'}`}
              />
            );
          }

          return (
            <Droppable key={dateStr} droppableId={dateStr}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  onClick={() => day && onDayClick(dateStr)} // 日付クリックでモーダルを開く
                  className={`min-h-24 p-2 rounded border-2 transition cursor-pointer ${
                    snapshot.isDraggingOver 
                      ? 'border-blue-500 bg-blue-100' 
                      : `border-gray-200 ${weekendBg || 'bg-white'}`
                  }`}
                >
                  <div className={`font-bold text-lg mb-1 ${isSunday ? 'text-red-600' : isSaturday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day}
                  </div>
                  {/* その日のタスク一覧を表示 */}
                  <div className="space-y-1">
                    {dayTasks.map((task, taskIndex) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        index={taskIndex}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isCompact={true}
                      />
                    ))}
                  </div>
                  {/* @hello-pangea/dnd がドラッグ時に必要とするプレースホルダー */}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
}
