// app/components/DayScheduleModal.tsx
import React from 'react';

interface DayScheduleModalProps {
  date: string; // YYYY-MM-DD format
  isOpen: boolean;
  onClose: () => void;
}

export default function DayScheduleModal({ date, isOpen, onClose }: DayScheduleModalProps) {
  if (!isOpen) return null;

  // 日付を整形 (例: 2026-05-04 -> 2026年5月4日(月))
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-3/4 flex flex-col">
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

        <div className="flex-1 overflow-auto border border-gray-200 rounded p-4">
          {/* ここに時間軸に沿ったスケジュール表示を実装 */}
          <p className="text-gray-500 text-center py-8">
            時間軸に沿ったスケジュール表示エリア
          </p>
          {/* 例: 簡易的な時間軸の目盛り */}
          <div className="flex border-b border-gray-300 pb-2 mb-2">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="flex-shrink-0 w-24 text-center text-xs text-gray-500 border-r border-gray-200 last:border-r-0">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {/* この下にタスクを時間軸に配置するロジックを追加します */}
        </div>
      </div>
    </div>
  );
}