import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { TaskEditorModal } from '../components/TaskEditorModal';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

const mockUseWindowDimensions = jest.fn(() => ({
  fontScale: 1,
  height: 844,
  scale: 3,
  width: 390,
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockUseWindowDimensions(),
}));

describe('TaskEditorModal', () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390,
    });
  });

  test('announces title validation and retains input after a storage failure', async () => {
    const onSave = jest.fn(async () => 'Local storage is unavailable.');
    const screen = await render(
      <TaskEditorModal visible task={null} onClose={jest.fn()} onSave={onSave} />,
    );

    await fireEvent.press(screen.getByLabelText('Create task'));
    expect(screen.getByText('Enter a task title before saving.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Task title'), 'Read chapter four');
    await fireEvent.changeText(screen.getByLabelText('Task description'), 'Take short notes');
    await fireEvent.press(screen.getByLabelText('Create task'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        title: 'Read chapter four',
        description: 'Take short notes',
        dueDate: null,
        dueTime: null,
        priority: 'none',
      }),
    );
    expect(await screen.findByText('Your task was not saved')).toBeTruthy();
    expect(screen.getByDisplayValue('Read chapter four')).toBeTruthy();
  });

  test('unmounts its content after the close transition completes', async () => {
    const props = {
      task: null,
      onClose: jest.fn(),
      onSave: jest.fn(async () => null),
    };
    const screen = await render(<TaskEditorModal visible {...props} />);

    expect(screen.getByText('New task')).toBeTruthy();

    await screen.rerender(<TaskEditorModal visible={false} {...props} />);

    await waitFor(() => expect(screen.queryByText('New task')).toBeNull());
  });

  test('protects unsaved changes until the user confirms discard', async () => {
    const onClose = jest.fn();
    const screen = await render(
      <TaskEditorModal visible task={null} onClose={onClose} onSave={jest.fn(async () => null)} />,
    );

    await fireEvent.changeText(screen.getByLabelText('Task title'), 'Write reflection');
    await fireEvent.press(screen.getByLabelText('Cancel editing task'));

    expect(screen.getByText('Discard changes?')).toBeTruthy();
    expect(screen.getByText('Changes to “Write reflection” will not be saved.')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Keep editing task'));
    expect(screen.queryByText('Discard changes?')).toBeNull();
    expect(screen.getByDisplayValue('Write reflection')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Cancel editing task'));
    await fireEvent.press(screen.getByLabelText('Discard unsaved changes'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('includes the selected priority when saving', async () => {
    const onSave = jest.fn(async () => null);
    const screen = await render(
      <TaskEditorModal visible task={null} onClose={jest.fn()} onSave={onSave} />,
    );

    await fireEvent.changeText(screen.getByLabelText('Task title'), 'Prepare demo');
    await fireEvent.press(screen.getByLabelText('High priority'));
    await fireEvent.press(screen.getByLabelText('Create task'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        title: 'Prepare demo',
        description: '',
        dueDate: null,
        dueTime: null,
        priority: 'high',
      }),
    );
  });

  test.each([
    { fontScale: 1, height: 568, name: 'a 320px phone', width: 320 },
    { fontScale: 2, height: 844, name: 'large text', width: 390 },
  ])('stacks the rendered editor header for $name', async ({ fontScale, height, width }) => {
    mockUseWindowDimensions.mockReturnValue({ fontScale, height, scale: 3, width });
    const screen = await render(
      <TaskEditorModal visible task={null} onClose={jest.fn()} onSave={jest.fn(async () => null)} />,
    );

    const header = screen.getByText('New task').parent;
    expect(header).not.toBeNull();
    expect(StyleSheet.flatten(header?.props.style).flexDirection).toBe('column');
  });

  test('keeps the rendered editor header in one row in phone landscape', async () => {
    mockUseWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 390,
      scale: 3,
      width: 844,
    });
    const screen = await render(
      <TaskEditorModal visible task={null} onClose={jest.fn()} onSave={jest.fn(async () => null)} />,
    );

    const header = screen.getByText('New task').parent;
    expect(header).not.toBeNull();
    expect(StyleSheet.flatten(header?.props.style).flexDirection).toBe('row');
  });
});
