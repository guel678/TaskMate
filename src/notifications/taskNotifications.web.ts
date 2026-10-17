import { Task } from '../types/task';

export async function initializeTaskNotifications() {}

export async function cancelTaskNotification(_taskId: string) {}

export async function syncTaskNotification(_task: Task): Promise<string | null> {
  return null;
}
