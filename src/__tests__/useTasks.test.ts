import { act, renderHook, waitFor } from '@testing-library/react-native';

import { TaskRepository } from '../data/taskRepository.types';
import { TaskNotificationService, useTasks } from '../hooks/useTasks';
import { Task, TaskInput } from '../types/task';

jest.mock('../data/taskRepository', () => ({
  taskRepository: {},
}));

jest.mock('../notifications/taskNotifications', () => ({
  cancelTaskNotification: jest.fn(async () => undefined),
  syncTaskNotification: jest.fn(async () => null),
}));

const input: TaskInput = {
  title: 'Submit weekly report',
  description: '',
  dueDate: '2099-10-20',
  dueTime: '14:30',
  priority: 'high',
};

const task: Task = {
  id: 'task-1',
  ...input,
  completed: false,
  createdAt: '2026-10-17T12:00:00.000Z',
};

function createRepository(initialTasks: Task[] = []): jest.Mocked<TaskRepository> {
  return {
    list: jest.fn(async () => initialTasks),
    create: jest.fn<Promise<Task>, [TaskInput]>(async () => task),
    update: jest.fn<Promise<Task>, [string, TaskInput]>(async () => task),
    setCompleted: jest.fn<Promise<Task>, [string, boolean]>(async () => ({
      ...task,
      completed: true,
    })),
    remove: jest.fn<Promise<void>, [string]>(async () => undefined),
  };
}

function createNotifications(): jest.Mocked<TaskNotificationService> {
  return {
    sync: jest.fn<Promise<string | null>, [Task]>(async () => null),
    cancel: jest.fn<Promise<void>, [string]>(async () => undefined),
  };
}

async function renderTasksHook(
  repository: TaskRepository,
  notifications: TaskNotificationService,
) {
  const hook = await renderHook(() => useTasks(repository, notifications));
  await waitFor(() => expect(hook.result.current.loadState).toBe('ready'));
  return hook;
}

describe('useTasks', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('keeps a persisted task in UI state when reminder scheduling fails', async () => {
    const repository = createRepository();
    const notifications = createNotifications();
    notifications.sync.mockRejectedValueOnce(new Error('notification service unavailable'));
    const { result } = await renderTasksHook(repository, notifications);

    let mutationResult: Awaited<ReturnType<typeof result.current.createTask>> | undefined;
    await act(async () => {
      mutationResult = await result.current.createTask(input);
    });

    expect(mutationResult).toEqual({ ok: true, value: task });
    expect(result.current.tasks).toEqual([task]);
    expect(result.current.operationError).toBe(
      'Task saved, but its reminder could not be scheduled.',
    );
  });

  test('removes a persisted task even when its closing animation fails', async () => {
    const repository = createRepository([task]);
    const notifications = createNotifications();
    const { result } = await renderTasksHook(repository, notifications);

    let mutationResult: Awaited<ReturnType<typeof result.current.deleteTask>> | undefined;
    await act(async () => {
      mutationResult = await result.current.deleteTask(task.id, async () => {
        throw new Error('animation interrupted');
      });
    });

    expect(mutationResult).toEqual({ ok: true, value: undefined });
    expect(result.current.tasks).toEqual([]);
    expect(result.current.operationError).toBe(
      'Task deleted, but its closing animation could not finish.',
    );
    expect(notifications.cancel).toHaveBeenCalledWith(task.id);
  });

  test('does not update UI state when persistence fails', async () => {
    const repository = createRepository();
    const notifications = createNotifications();
    repository.create.mockRejectedValueOnce(new Error('database unavailable'));
    const { result } = await renderTasksHook(repository, notifications);

    let mutationResult: Awaited<ReturnType<typeof result.current.createTask>> | undefined;
    await act(async () => {
      mutationResult = await result.current.createTask(input);
    });

    expect(mutationResult).toEqual({ ok: false, error: 'database unavailable' });
    expect(result.current.tasks).toEqual([]);
    expect(notifications.sync).not.toHaveBeenCalled();
  });
});
