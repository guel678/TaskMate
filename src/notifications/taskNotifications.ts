import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { taskScheduleToDate } from '../domain/tasks';
import { Task } from '../types/task';

const CHANNEL_ID = 'task-reminders-miguel-v1';
const NOTIFICATION_SOUND = 'miguel.wav';
const NOTIFICATION_PREFIX = 'taskmate-reminder-';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function notificationIdentifier(taskId: string) {
  return `${NOTIFICATION_PREFIX}${taskId}`;
}

export async function initializeTaskNotifications() {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Task reminders',
      description: 'Alerts when a scheduled TaskMate task is due.',
      importance: Notifications.AndroidImportance.HIGH,
      sound: NOTIFICATION_SOUND,
      vibrationPattern: [0, 250, 180, 250],
    });
  } catch (error) {
    if (__DEV__) console.warn('TaskMate could not initialize reminders.', error);
  }
}

async function hasNotificationPermission() {
  await initializeTaskNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelTaskNotification(taskId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationIdentifier(taskId));
  } catch (error) {
    // Cancellation is idempotent from the app's perspective. A stale reminder
    // must not prevent the associated task mutation from being saved.
    if (__DEV__) console.warn('TaskMate could not cancel a task reminder.', error);
  }
}

export async function syncTaskNotification(task: Task): Promise<string | null> {
  await cancelTaskNotification(task.id);

  if (task.completed || !task.dueDate || !task.dueTime) return null;

  const scheduledFor = taskScheduleToDate(task.dueDate, task.dueTime);
  if (scheduledFor.getTime() <= Date.now()) return null;

  try {
    if (!(await hasNotificationPermission())) {
      return 'Task saved, but notifications are disabled. Enable them in system settings to receive reminders.';
    }

    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdentifier(task.id),
      content: {
        title: 'Task due now',
        body: task.title,
        data: { taskId: task.id },
        sound: NOTIFICATION_SOUND,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledFor,
        channelId: CHANNEL_ID,
      },
    });
    return null;
  } catch (error) {
    if (__DEV__) console.warn('TaskMate could not schedule a task reminder.', error);
    return 'Task saved, but its reminder could not be scheduled.';
  }
}
