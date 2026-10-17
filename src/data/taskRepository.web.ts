import {
  createTaskEntity,
  isTask,
  normalizeTaskInput,
  sortTasksByPriority,
} from '../domain/tasks';
import { Task, TaskInput } from '../types/task';
import {
  repositoryError,
  TaskRepository,
  TaskRepositoryError,
} from './taskRepository.types';

export type TaskStorage = Pick<Storage, 'getItem' | 'setItem'>;

type StoredTasksV3 = {
  version: 3;
  tasks: Task[];
};

type StoredTaskV2 = Omit<Task, 'dueTime'>;
type LegacyTask = Omit<Task, 'dueDate' | 'dueTime' | 'priority'>;

const STORAGE_KEY = 'taskmate.tasks.v3';
const V2_STORAGE_KEY = 'taskmate.tasks.v2';
const LEGACY_STORAGE_KEY = 'taskmate.tasks.v1';

function isStoredTaskV2(value: unknown): value is StoredTaskV2 {
  if (!value || typeof value !== 'object') return false;
  return isTask({ ...(value as object), dueTime: null });
}

function isLegacyTask(value: unknown): value is LegacyTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    !Number.isNaN(Date.parse(task.createdAt))
  );
}

function parseStoredTasks(serialized: string): Task[] {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== 'object') {
    throw new TaskRepositoryError('Saved task data is not in a recognized format.');
  }

  const store = parsed as { version?: unknown; tasks?: unknown };
  if (store.version === 3 && Array.isArray(store.tasks) && store.tasks.every(isTask)) {
    return sortTasksByPriority(store.tasks);
  }
  if (store.version === 2 && Array.isArray(store.tasks) && store.tasks.every(isStoredTaskV2)) {
    return sortTasksByPriority(
      store.tasks.map((task) => ({ ...task, dueTime: null })),
    );
  }
  if (store.version === 1 && Array.isArray(store.tasks) && store.tasks.every(isLegacyTask)) {
    return sortTasksByPriority(
      store.tasks.map((task) => ({
        ...task,
        dueDate: null,
        dueTime: null,
        priority: 'none',
      })),
    );
  }

  throw new TaskRepositoryError('Saved task data is damaged or from an unsupported version.');
}

function readTasks(storage: TaskStorage): Task[] {
  const serialized =
    storage.getItem(STORAGE_KEY) ??
    storage.getItem(V2_STORAGE_KEY) ??
    storage.getItem(LEGACY_STORAGE_KEY);
  if (!serialized) return [];
  return parseStoredTasks(serialized);
}

function writeTasks(storage: TaskStorage, tasks: Task[]) {
  const store: StoredTasksV3 = { version: 3, tasks: sortTasksByPriority(tasks) };
  storage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function updateExisting(tasks: Task[], id: string, update: (task: Task) => Task) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
  }

  const updatedTask = update(tasks[index]);
  const updatedTasks = [...tasks];
  updatedTasks[index] = updatedTask;
  return { tasks: updatedTasks, updatedTask };
}

export function createWebTaskRepository(storage: TaskStorage): TaskRepository {
  return {
    async list() {
      try {
        const tasks = readTasks(storage);
        writeTasks(storage, tasks);
        return tasks;
      } catch (error) {
        throw repositoryError('TaskMate could not load tasks from this browser.', error);
      }
    },

    async create(input: TaskInput) {
      const task = createTaskEntity(input);
      try {
        writeTasks(storage, [task, ...readTasks(storage)]);
        return task;
      } catch (error) {
        throw repositoryError('TaskMate could not save this task in the browser.', error);
      }
    },

    async update(id: string, input: TaskInput) {
      const normalized = normalizeTaskInput(input);
      try {
        const { tasks, updatedTask } = updateExisting(readTasks(storage), id, (task) => ({
          ...task,
          ...normalized,
        }));
        writeTasks(storage, tasks);
        return updatedTask;
      } catch (error) {
        throw repositoryError('TaskMate could not update this task in the browser.', error);
      }
    },

    async setCompleted(id: string, completed: boolean) {
      try {
        const { tasks, updatedTask } = updateExisting(readTasks(storage), id, (task) => ({
          ...task,
          completed,
        }));
        writeTasks(storage, tasks);
        return updatedTask;
      } catch (error) {
        throw repositoryError('TaskMate could not change this task in the browser.', error);
      }
    },

    async remove(id: string) {
      try {
        const tasks = readTasks(storage);
        const remaining = tasks.filter((task) => task.id !== id);
        if (remaining.length === tasks.length) {
          throw new TaskRepositoryError('That task no longer exists. Refresh and try again.');
        }
        writeTasks(storage, remaining);
      } catch (error) {
        throw repositoryError('TaskMate could not delete this task from the browser.', error);
      }
    },
  };
}

const browserStorage: TaskStorage = {
  getItem(key) {
    return window.localStorage.getItem(key);
  },
  setItem(key, value) {
    window.localStorage.setItem(key, value);
  },
};

export const taskRepository = createWebTaskRepository(browserStorage);
