import { useCallback, useEffect, useRef, useState } from 'react';

import { taskRepository } from '../data/taskRepository';
import { TaskRepository } from '../data/taskRepository.types';
import { sortTasksByPriority } from '../domain/tasks';
import {
  cancelTaskNotification,
  syncTaskNotification,
} from '../notifications/taskNotifications';
import { Task, TaskInput, TaskMutationResult } from '../types/task';

type LoadState = 'loading' | 'ready' | 'error';

export type TaskNotificationService = {
  sync(task: Task): Promise<string | null>;
  cancel(taskId: string): Promise<void>;
};

type MutationSideEffect<T> = {
  run(value: T): Promise<string | null | void>;
  failureMessage: string;
};

type MutationOptions<T> = {
  beforeCommit?: MutationSideEffect<T>;
  afterCommit?: MutationSideEffect<T>;
};

const taskNotificationService: TaskNotificationService = {
  sync: syncTaskNotification,
  cancel: cancelTaskNotification,
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function runSideEffect<T>(
  sideEffect: MutationSideEffect<T> | undefined,
  value: T,
): Promise<string | null> {
  if (!sideEffect) return null;

  try {
    return (await sideEffect.run(value)) ?? null;
  } catch (error) {
    if (__DEV__) console.warn(sideEffect.failureMessage, error);
    return sideEffect.failureMessage;
  }
}

export function useTasks(
  repository: TaskRepository = taskRepository,
  notifications: TaskNotificationService = taskNotificationService,
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [isMutating, setIsMutating] = useState(false);
  const mutationInFlight = useRef(false);

  const retry = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');

    try {
      const savedTasks = await repository.list();
      setTasks(sortTasksByPriority(savedTasks));
      setLoadState('ready');
    } catch (error) {
      setLoadError(errorMessage(error, 'TaskMate could not load your tasks.'));
      setLoadState('error');
    }
  }, [repository]);

  useEffect(() => {
    let active = true;

    repository.list().then(
      (savedTasks) => {
        if (!active) return;
        setTasks(sortTasksByPriority(savedTasks));
        setLoadState('ready');
      },
      (error: unknown) => {
        if (!active) return;
        setLoadError(errorMessage(error, 'TaskMate could not load your tasks.'));
        setLoadState('error');
      },
    );

    return () => {
      active = false;
    };
  }, [repository]);

  const runMutation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      commit: (value: T) => void,
      options: MutationOptions<T> = {},
    ): Promise<TaskMutationResult<T>> => {
      if (mutationInFlight.current) {
        return { ok: false, error: 'Another change is still being saved. Please wait.' };
      }

      mutationInFlight.current = true;
      setIsMutating(true);
      setOperationError('');
      try {
        const value = await operation();
        const beforeCommitWarning = await runSideEffect(options.beforeCommit, value);

        commit(value);

        const afterCommitWarning = await runSideEffect(options.afterCommit, value);
        const warning = afterCommitWarning ?? beforeCommitWarning;
        if (warning) setOperationError(warning);

        return { ok: true, value };
      } catch (error) {
        const message = errorMessage(error, 'TaskMate could not save that change.');
        setOperationError(message);
        return { ok: false, error: message };
      } finally {
        mutationInFlight.current = false;
        setIsMutating(false);
      }
    },
    [],
  );

  const createTask = useCallback(
    (input: TaskInput) =>
      runMutation(
        () => repository.create(input),
        (created) => {
          setTasks((current) => sortTasksByPriority([created, ...current]));
        },
        {
          afterCommit: {
            run: notifications.sync,
            failureMessage: 'Task saved, but its reminder could not be scheduled.',
          },
        },
      ),
    [notifications, repository, runMutation],
  );

  const updateTask = useCallback(
    (id: string, input: TaskInput) =>
      runMutation(
        () => repository.update(id, input),
        (updated) => {
          setTasks((current) =>
            sortTasksByPriority(
              current.map((task) => (task.id === updated.id ? updated : task)),
            ),
          );
        },
        {
          afterCommit: {
            run: notifications.sync,
            failureMessage: 'Task saved, but its reminder could not be scheduled.',
          },
        },
      ),
    [notifications, repository, runMutation],
  );

  const setTaskCompleted = useCallback(
    (id: string, completed: boolean) =>
      runMutation(
        () => repository.setCompleted(id, completed),
        (updated) => {
          setTasks((current) =>
            current.map((task) => (task.id === updated.id ? updated : task)),
          );
        },
        {
          afterCommit: {
            run: notifications.sync,
            failureMessage: 'Task updated, but its reminder could not be changed.',
          },
        },
      ),
    [notifications, repository, runMutation],
  );

  const deleteTask = useCallback(
    (id: string, beforeCommit?: () => Promise<void>) =>
      runMutation(
        () => repository.remove(id),
        () => {
          setTasks((current) => current.filter((task) => task.id !== id));
        },
        {
          beforeCommit: beforeCommit
            ? {
                run: async () => {
                  await beforeCommit();
                },
                failureMessage: 'Task deleted, but its closing animation could not finish.',
              }
            : undefined,
          afterCommit: {
            run: async () => {
              await notifications.cancel(id);
            },
            failureMessage: 'Task deleted, but its reminder could not be cancelled.',
          },
        },
      ),
    [notifications, repository, runMutation],
  );

  return {
    tasks,
    loadState,
    loadError,
    operationError,
    isMutating,
    retry,
    clearOperationError: () => setOperationError(''),
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
  };
}
