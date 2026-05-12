'use client';

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';
import DragDropProvider from './components/dnd/DragDropProvider';
import { useTaskStore } from './context/TaskContext';
import { Task } from './types';

import DayScheduleModal from './components/DayScheduleModal'; // 新しいモーダルをインポート

export default function Home() {
  // Zustand ストアからタスク管理機能を取得
  const { tasks, addTask, updateTask, deleteTask, scheduleTask } = useTaskStore();
  
  // UI状態管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDayScheduleModalOpen, setIsDayScheduleModalOpen] = useState(false); // 日別スケジュールモーダルの開閉状態
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState(''); // 日別スケジュール表示対象の日付
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: Task['priority'];
    dueDate: string;
    scheduledDate: string;
    startTime: string;
    duration: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    scheduledDate: '',
    startTime: '',
    duration: '',
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
      scheduledDate: '',
      startTime: '',
      duration: '',
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
      dueDate: task.dueDate || '',
      scheduledDate: task.scheduledDate || '',
      startTime: task.startTime || '',
      duration: task.duration || '',
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
        scheduledDate: formData.scheduledDate || undefined,
        startTime: formData.startTime || undefined,
        duration: formData.duration || undefined,
      });
    } else {
      // 新規タスクを作成
      const newTask: Task = {
        id: generateId(),
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        scheduledDate: formData.scheduledDate || undefined,
        completed: false,
        startTime: formData.startTime || undefined,
        duration: formData.duration || undefined,
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
      } else if (destination.droppableId.startsWith('modal-hour-')) {
        // タイムラインの特定の時間にドロップされた場合
        // ID形式: modal-hour-YYYY-MM-DD-HH
        const parts = destination.droppableId.split('-');
        const date = `${parts[2]}-${parts[3]}-${parts[4]}`;
        const hour = parts[5];
        const time = `${hour.padStart(2, '0')}:00`;
        
        scheduleTask(draggableId, date, time);
      } else {
        // カレンダーの日付セルまたはモーダル内のエリアにドロップされた場合
        // IDから日付部分のみを抽出
        const targetDate = destination.droppableId.replace('modal-top-', '');
        scheduleTask(draggableId, targetDate);
      }
    },
    [scheduleTask]
  );

  // カレンダーの日をクリックした際に日別スケジュールモーダルを開く
  const handleOpenDayScheduleModal = (date: string) => {
    setSelectedDateForSchedule(date);
    setIsDayScheduleModalOpen(true);
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            スケジュール帳
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
                onDayClick={handleOpenDayScheduleModal} // カレンダーの日クリックハンドラを渡す
              />
            </div>
          </div>
        </div>

        {/* タスク作成・編集モーダル */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingTask ? 'タスク編集' : '新規タスク'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* 1行目: タスク名 | 日付 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タスク名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="タスク名を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日付
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* 2行目: 説明 | 開始時刻 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="説明を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始時刻
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 3行目: 優先度 | 所要時間 */}
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
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所要時間 (分)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="例: 60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 4行目: (空) | 期限 */}
                <div className="hidden md:block"></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    期限
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>
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

        {/* 日別スケジュール表示モーダル */}
        <DayScheduleModal
          date={selectedDateForSchedule}
          isOpen={isDayScheduleModalOpen}
          onClose={() => setIsDayScheduleModalOpen(false)}
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={deleteTask}
        />
      </main>
    </DragDropProvider>
  );
}
