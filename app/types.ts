// app/types.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  scheduledDate?: string;
  startTime?: string;
  duration?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}