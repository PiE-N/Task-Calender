'use client';

import { useState, Fragment } from 'react';
import { Task } from '@/app/types';
import TaskItem from './TaskItem';
import { Droppable } from '@hello-pangea/dnd';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onAddNew }: TaskListProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority');

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const comparePriority = (a: Task, b: Task) => 
    priorityOrder[a.priority] - priorityOrder[b.priority];

  const compareDueDate = (a: Task, b: Task) => {
    const dateA = (a as any).dueDate;
    const dateB = (b as any).dueDate;
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // 期限なしは後に
    if (!dateB) return -1;
    
    return dateA.localeCompare(dateB);
  };

  const unscheduledTasks = tasks
    .filter((t) => !t.scheduledDate)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return comparePriority(a, b) || compareDueDate(a, b);
      } else {
        return compareDueDate(a, b) || comparePriority(a, b);
      }
    });

  // グループヘッダー用の判定ロジック
  const getGroupLabel = (task: Task) => {
    if (sortBy === 'priority') {
      const labels = { high: '優先度：高', medium: '優先度：中', low: '優先度：低' };
      return labels[task.priority];
    } else {
      const dueDate = (task as any).dueDate as string;
      if (!dueDate) return '期限未設定';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [year, month, day] = dueDate.split('-').map(Number);
      const target = new Date(year, month - 1, day);
      const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) return '期限：1週間以内';
      if (diffDays <= 30) return '期限：1ヶ月以内';
      return '期限：それ以降';
    }
  };

  // 表示するグループの定義
  const groupDefinitions = sortBy === 'priority' 
    ? [
        { id: 'high', label: '優先度：高', color: 'border-red-200 bg-red-50/60' },
        { id: 'medium', label: '優先度：中', color: 'border-yellow-200 bg-yellow-50/60' },
        { id: 'low', label: '優先度：低', color: 'border-blue-200 bg-blue-50/60' },
      ]
    : [
        { id: 'week', label: '期限：1週間以内', color: 'border-red-200 bg-red-50/60' },
        { id: 'month', label: '期限：1ヶ月以内', color: 'border-yellow-200 bg-yellow-50/60' },
        { id: 'later', label: '期限：それ以降', color: 'border-blue-200 bg-blue-50/60' },
      ];

  // 全体のタスクをグループごとに分配
  const groupedTasks = groupDefinitions.map(group => ({
    ...group,
    tasks: unscheduledTasks.filter(t => {
      if (sortBy === 'priority') return t.priority === group.id;
      // 期限順の場合は getGroupLabel の結果とラベルが一致するかで判定
      const label = getGroupLabel(t);
      if (group.id === 'week') return label === '期限：1週間以内';
      if (group.id === 'month') return label === '期限：1ヶ月以内';
      return label === '期限：それ以降' || label === '期限未設定';
    })
  }));

  // ドラッグアンドドロップのインデックスを追跡するためのカウンター
  let globalIndexCounter = 0;

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg shadow-md p-6 min-h-[500px] flex flex-col">
      {/* ヘッダー：タスク一覧のタイトルと新規タスク追加ボタン */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">タスク一覧</h2>
        <div className="flex items-center justify-between w-full">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'dueDate')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">優先度順</option>
            <option value="dueDate">期限順</option>
          </select>
          <button
            onClick={onAddNew}
            className="whitespace-nowrap px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
          >
            + 新規
          </button>
        </div>
      </div>

      {/* ドラッグ＆ドロップ可能なエリア */}
      <Droppable droppableId="task-list">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-8 p-2 w-full rounded transition-colors overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : ''
            }`}
          >
            
            {groupedTasks.map((group) => (
              <div 
                key={group.id} 
                className={`w-full block rounded-xl border-2 p-4 shadow-sm ${group.color} transition-all min-h-[120px]`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex-shrink-0 w-3 h-3 rounded-full border border-black/20 ${
                    group.id === 'high' || group.id === 'week' ? 'bg-red-500' : 
                    group.id === 'medium' || group.id === 'month' ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}></span>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight whitespace-nowrap">
                    {group.label} <span className="ml-1 opacity-60">({group.tasks.length})</span>
                  </h3>
                  <div className="h-px bg-gray-300/30 w-full" />
                </div>

                <div className="grid grid-cols-3 gap-3 content-start">
                  {group.tasks.map((task) => {
                    const currentIndex = globalIndexCounter++;
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        index={currentIndex}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isCompact={false}
                      />
                    );
                  })}
                  {group.tasks.length === 0 && (
                    <div className="col-span-3 py-4 text-center text-[10px] text-gray-400 italic">アイテムなし</div>
                  )}
                </div>
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
