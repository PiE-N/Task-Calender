'use client';

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';
import DragDropProvider from './components/dnd/DragDropProvider';
import { useTaskStore } from './context/TaskContext';
import { Task } from './types';

export default function Home() {
  // Zustand ストアからタスク管理機能を取得
  const { tasks, addTask, updateTask, deleteTask, scheduleTask } = useTaskStore();
  
  // UI状態管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: Task['priority'];
    dueDate: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  // 一意なタスクIDを生成
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 新規タスク作成モーダルを開く
  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
    setIsModalOpen(true);
  };

  // タスク編集モーダルを開く
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: (task as any).dueDate || '',
    });
    setIsModalOpen(true);
  };

  // タスク情報を保存（新規作成または編集）
  const handleSaveTask = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      // 既存タスクを更新
      updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      });
    } else {
      // 新規タスクを作成
      const newTask: Task = {
        id: generateId(),
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTask(newTask);
    }

    setIsModalOpen(false);
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // ドロップ位置が無い場合は処理しない
      if (!destination) return;
      
      // 同じ場所にドロップされた場合は処理しない
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      if (destination.droppableId === 'task-list') {
        // カレンダーからタスク一覧へ戻す（スケジュール解除）
        scheduleTask(draggableId, '');
      } else {
        // カレンダーの日付セルにドロップされた場合、タスクをその日付にスケジュール
        scheduleTask(draggableId, destination.droppableId);
      }
    },
    [scheduleTask]
  );

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            タスク・カレンダー管理
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            {/* 左側: タスク一覧パネル */}
            <div className="lg:col-span-3 h-full">
              <TaskList
                tasks={tasks}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onAddNew={handleAddTask}
              />
            </div>

            {/* 右側: カレンダーパネル */}
            <div className="lg:col-span-7 h-full">
              <Calendar
                tasks={tasks}
                onTaskScheduled={scheduleTask}
                onEdit={handleEditTask}
                onDelete={deleteTask}
              />
            </div>
          </div>
        </div>

        {/* タスク作成・編集モーダル */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingTask ? 'タスク編集' : '新規タスク'}
              </h2>

              <div className="space-y-4">
                {/* タスク名入力欄 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タスク名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="タスク名を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 説明入力欄 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="説明を入力（オプション）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* 期限入力欄 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    期限
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* 優先度選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>

              {/* モーダルのアクションボタン */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveTask}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DragDropProvider>
  );
}
