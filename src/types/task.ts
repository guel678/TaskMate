export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  createdAt: string;
};

export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'dueDate' | 'dueTime' | 'priority'
>;

export type TaskFilter = 'all' | 'active' | 'completed';

export type TaskMutationResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; error: string };
