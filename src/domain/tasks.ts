import { Task, TaskFilter, TaskInput, TaskPriority } from '../types/task';

export const TASK_TITLE_MAX_LENGTH = 100;
export const TASK_DESCRIPTION_MAX_LENGTH = 240;
export const TASK_PRIORITIES: TaskPriority[] = ['none', 'low', 'medium', 'high'];
const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export function normalizeTaskInput(input: TaskInput): TaskInput {
  const title = input.title.trim();
  const description = input.description.trim();
  const dueDate = input.dueDate || null;
  const dueTime = input.dueTime || null;

  if (!title) {
    throw new TaskValidationError('Enter a task title before saving.');
  }
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    throw new TaskValidationError(
      `Keep the task title under ${TASK_TITLE_MAX_LENGTH} characters.`,
    );
  }
  if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
    throw new TaskValidationError(
      `Keep the description under ${TASK_DESCRIPTION_MAX_LENGTH} characters.`,
    );
  }
  if (dueDate && !isValidDateOnly(dueDate)) {
    throw new TaskValidationError('Choose a valid due date before saving.');
  }
  if (dueTime && !dueDate) {
    throw new TaskValidationError('Choose a due date before adding a time.');
  }
  if (dueTime && !isValidTimeOnly(dueTime)) {
    throw new TaskValidationError('Choose a valid due time before saving.');
  }
  if (!isTaskPriority(input.priority)) {
    throw new TaskValidationError('Choose a valid priority before saving.');
  }

  return { title, description, dueDate, dueTime, priority: input.priority };
}

export function createTaskEntity(
  input: TaskInput,
  id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  createdAt = new Date().toISOString(),
): Task {
  const normalized = normalizeTaskInput(input);
  return {
    id,
    ...normalized,
    completed: false,
    createdAt,
  };
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === 'string' && TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day, 12);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function dateToDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidTimeOnly(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function dateToTimeOnly(date: Date): string {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function dateOnlyToDate(value: string): Date {
  if (!isValidDateOnly(value)) {
    throw new TaskValidationError('Choose a valid due date before saving.');
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function taskScheduleToDate(dueDate: string, dueTime: string): Date {
  if (!isValidDateOnly(dueDate) || !isValidTimeOnly(dueTime)) {
    throw new TaskValidationError('Choose a valid due date and time before saving.');
  }

  const [year, month, day] = dueDate.split('-').map(Number);
  const [hour, minute] = dueTime.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatDueDate(value: string, locale?: string): string {
  const dueDate = dateOnlyToDate(value);
  const now = new Date();
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(dueDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  }).format(dueDate);
}

export function formatDueTime(value: string, locale?: string): string {
  if (!isValidTimeOnly(value)) {
    throw new TaskValidationError('Choose a valid due time before saving.');
  }
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hour, minute));
}

export type TaskDueState = 'none' | 'upcoming' | 'today' | 'overdue';

export function getTaskDueState(
  task: Pick<Task, 'completed' | 'dueDate'>,
  today = new Date(),
): TaskDueState {
  if (!task.dueDate || task.completed) return 'none';

  const todayValue = dateToDateOnly(today);
  if (task.dueDate < todayValue) return 'overdue';
  if (task.dueDate === todayValue) return 'today';
  return 'upcoming';
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === 'active') return tasks.filter((task) => !task.completed);
  if (filter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

export function getTaskProgress(tasks: Task[]) {
  const completed = tasks.reduce(
    (count, task) => count + (task.completed ? 1 : 0),
    0,
  );
  const percentage = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return { completed, percentage, total: tasks.length };
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const byPriority = PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority];
    if (byPriority !== 0) return byPriority;

    const byDate = right.createdAt.localeCompare(left.createdAt);
    return byDate === 0 ? right.id.localeCompare(left.id) : byDate;
  });
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    task.title.length <= TASK_TITLE_MAX_LENGTH &&
    typeof task.description === 'string' &&
    task.description.length <= TASK_DESCRIPTION_MAX_LENGTH &&
    typeof task.completed === 'boolean' &&
    (task.dueDate === null ||
      (typeof task.dueDate === 'string' && isValidDateOnly(task.dueDate))) &&
    (task.dueTime === null ||
      (typeof task.dueTime === 'string' && isValidTimeOnly(task.dueTime))) &&
    !(task.dueTime && !task.dueDate) &&
    isTaskPriority(task.priority) &&
    typeof task.createdAt === 'string' &&
    !Number.isNaN(Date.parse(task.createdAt))
  );
}
