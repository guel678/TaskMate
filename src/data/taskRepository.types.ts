import { Task, TaskInput } from '../types/task';

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, input: TaskInput): Promise<Task>;
  setCompleted(id: string, completed: boolean): Promise<Task>;
  remove(id: string): Promise<void>;
}

export class TaskRepositoryError extends Error {
  readonly causeValue: unknown;

  constructor(message: string, causeValue?: unknown) {
    super(message);
    this.name = 'TaskRepositoryError';
    this.causeValue = causeValue;
  }
}

export function repositoryError(message: string, error: unknown): TaskRepositoryError {
  return error instanceof TaskRepositoryError
    ? error
    : new TaskRepositoryError(message, error);
}
