export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  scheduledDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  taskId: string;
  date: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  scheduleTask: (taskId: string, date: string) => void;
  unscheduleTask: (taskId: string) => void;
}
