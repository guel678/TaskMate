import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ActionSheetIOS, Platform } from 'react-native';

import { TaskCard } from '../components/TaskCard';
import { Task } from '../types/task';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

const task: Task = {
  id: 'task-1',
  title: 'Review the activity outline',
  description: 'Check every requirement',
  completed: false,
  dueDate: '2026-10-13',
  dueTime: '09:30',
  priority: 'high',
  createdAt: '2026-10-12T08:00:00.000Z',
};

describe('TaskCard', () => {
  test('preserves accessible task actions when motion is enabled in the app', async () => {
    const onToggle = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const screen = await render(
      <TaskCard
        disabled={false}
        exiting={false}
        task={task}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onExitComplete={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByLabelText(`Mark complete: ${task.title}`));
    const actionSheetSpy = jest
      .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
      .mockImplementation((_options, callback) => callback(0));
    await fireEvent.press(screen.getByLabelText(`More actions for ${task.title}`));
    actionSheetSpy.mockImplementation((_options, callback) => callback(1));
    await fireEvent.press(screen.getByLabelText(`More actions for ${task.title}`));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    actionSheetSpy.mockRestore();
  });

  test('finishes the removal transition before the parent removes the task', async () => {
    const onExitComplete = jest.fn();
    const screen = await render(
      <TaskCard
        disabled
        exiting={false}
        task={task}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onExitComplete={onExitComplete}
      />,
    );

    await screen.rerender(
      <TaskCard
        disabled
        exiting
        task={task}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onExitComplete={onExitComplete}
      />,
    );

    await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(1));
  });

  test('shows priority and due date as text, not color alone', async () => {
    const screen = await render(
      <TaskCard
        disabled={false}
        exiting={false}
        task={task}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onExitComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText(/Oct 13/)).toBeTruthy();
  });

  test('uses the designed action menu instead of the Android system alert', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    try {
      const screen = await render(
        <TaskCard
          disabled={false}
          exiting={false}
          task={task}
          onToggle={jest.fn()}
          onEdit={onEdit}
          onDelete={onDelete}
          onExitComplete={jest.fn()}
        />,
      );

      await fireEvent.press(screen.getByLabelText(`More actions for ${task.title}`));
      expect(screen.getByLabelText(`${task.title} actions`)).toBeTruthy();

      await fireEvent.press(screen.getByLabelText(`Edit ${task.title}`));
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onDelete).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
