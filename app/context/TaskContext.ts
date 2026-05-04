import { create } from 'zustand';
import { Task } from '@/app/types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  scheduleTask: (taskId: string, date: string, startTime?: string, duration?: string) => void;
  unscheduleTask: (taskId: string) => void;
}

/**
 * タスク管理用のグローバル状態ストア（Zustand）
 * アプリ全体でタスクの追加、編集、削除、スケジュール管理を行う
 */
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  
  // 新規タスクを追加
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  
  // 既存のタスク情報を更新（updatedAtも自動更新）
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    })),
  
  // タスクを削除
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  
  // タスクをカレンダーの特定の日付にスケジュール
  scheduleTask: (taskId, date, startTime, duration) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { 
              ...task, 
              scheduledDate: date || undefined, 
              startTime: startTime || undefined, 
              duration: duration || undefined, 
              updatedAt: new Date().toISOString() 
            }
          : task
      ),
    })),
  
  // タスクのスケジュールをクリア（タスク一覧に戻す）
  unscheduleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, scheduledDate: undefined, updatedAt: new Date().toISOString() }
          : task
      ),
    })),
}));
