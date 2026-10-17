import { fireEvent, render } from '@testing-library/react-native';

import { DeleteTaskModal } from '../components/DeleteTaskModal';
import { Task } from '../types/task';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

const task: Task = {
  id: 'task-delete',
  title: 'Submit the project outline',
  description: '',
  completed: false,
  dueDate: null,
  dueTime: null,
  priority: 'none',
  createdAt: '2026-10-12T08:00:00.000Z',
};

describe('DeleteTaskModal', () => {
  test('names the affected task and exposes safe and destructive actions', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <DeleteTaskModal
        deleting={false}
        task={task}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText(`“${task.title}” will be permanently deleted. This can't be undone.`),
    ).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Cancel deleting task'));
    await fireEvent.press(screen.getByLabelText(`Permanently delete ${task.title}`));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows a clear busy state while deletion is in progress', async () => {
    const screen = await render(
      <DeleteTaskModal
        deleting
        task={task}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(await screen.findByText('Deleting...')).toBeTruthy();
    expect(screen.getByLabelText('Cancel deleting task').props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(
      screen.getByLabelText(`Permanently delete ${task.title}`).props.accessibilityState,
    ).toEqual({ busy: true, disabled: true });
  });
});
