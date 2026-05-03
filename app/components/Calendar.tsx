'use client';

import { useState } from 'react';
import { Task } from '@/app/types';
import { Droppable } from '@hello-pangea/dnd';

interface CalendarProps {
  tasks: Task[];
  onTaskScheduled: (taskId: string, date: string) => void;
}

export default function Calendar({ tasks, onTaskScheduled }: CalendarProps) {
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
    <div className="w-full bg-white rounded-lg shadow-md p-6 overflow-y-auto">
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
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド：空白セル + 日付セルを表示 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          // dayがnullの場合は空白セル、そうでなければ日付セル
          const dateStr = day ? formatDate(year, month, day) : '';
          const dayTasks = day ? getTasksByDate(dateStr) : [];

          return (
            <Droppable key={`${month}-${index}`} droppableId={dateStr}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-24 p-2 rounded border-2 transition ${
                    day ? 'bg-white cursor-pointer' : 'bg-gray-100'
                  } ${snapshot.isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  {day && (
                    <>
                      <div className="font-bold text-gray-800 text-lg mb-1">{day}</div>
                      {/* その日のタスク一覧を表示 */}
                      <div className="space-y-1">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="text-xs p-1 rounded bg-blue-100 text-blue-900 truncate"
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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
