import * as Notifications from 'expo-notifications';

import {
  cancelTaskNotification,
  syncTaskNotification,
} from '../notifications/taskNotifications';
import { Task } from '../types/task';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled'),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  setNotificationHandler: jest.fn(),
}));

const futureTask: Task = {
  id: 'future-task',
  title: 'Present TaskMate',
  description: '',
  completed: false,
  dueDate: '2099-10-20',
  dueTime: '14:30',
  priority: 'high',
  createdAt: '2026-10-14T12:00:00.000Z',
};

describe('task notifications', () => {
  beforeEach(() => jest.clearAllMocks());

  test('schedules a deterministic one-time reminder with the custom sound', async () => {
    await expect(syncTaskNotification(futureTask)).resolves.toBeNull();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'taskmate-reminder-future-task',
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'taskmate-reminder-future-task',
        content: expect.objectContaining({
          body: futureTask.title,
          sound: 'miguel.wav',
        }),
        trigger: expect.objectContaining({
          type: 'date',
          channelId: 'task-reminders-miguel-v1',
        }),
      }),
    );
  });

  test('cancels instead of scheduling completed tasks', async () => {
    await syncTaskNotification({ ...futureTask, completed: true });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'taskmate-reminder-future-task',
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('cancels a task reminder by its stable identifier', async () => {
    await cancelTaskNotification('future-task');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'taskmate-reminder-future-task',
    );
  });
});
