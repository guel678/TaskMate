import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DueTimeField } from '../components/DueTimeField';
import { openAndroidDatePicker } from '../utils/android-date-picker';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../utils/android-date-picker', () => ({
  openAndroidDatePicker: jest.fn(),
}));

const mockOpenAndroidDatePicker = openAndroidDatePicker as jest.Mock;

describe('DueTimeField on Android and iOS', () => {
  beforeEach(() => {
    mockOpenAndroidDatePicker.mockReset();
  });

  test('stores the selected reminder time and closes the system picker', async () => {
    const onChange = jest.fn();
    const onPickerVisibleChange = jest.fn();
    const screen = await render(
      <DueTimeField
        hasDueDate
        pickerVisible
        value={null}
        onChange={onChange}
        onPickerVisibleChange={onPickerVisibleChange}
      />,
    );

    screen.getByTestId('due-time-picker').props.onValueChange(
      { nativeEvent: { timestamp: 0, utcOffset: 0 } },
      new Date(2026, 9, 20, 14, 30),
    );

    expect(onChange).toHaveBeenCalledWith('14:30');
    expect(onPickerVisibleChange).toHaveBeenCalledWith(false);
  });

  test('opens the native Android time dialog', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const onChange = jest.fn();
    const onPickerVisibleChange = jest.fn();

    try {
      const screen = await render(
        <DueTimeField
          hasDueDate
          pickerVisible={false}
          value={null}
          onChange={onChange}
          onPickerVisibleChange={onPickerVisibleChange}
        />,
      );

      await fireEvent.press(screen.getByLabelText('Add a reminder time'));

      expect(onPickerVisibleChange).toHaveBeenCalledWith(true);
      expect(mockOpenAndroidDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'time' }),
      );
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });

  test('does not open a time picker until a due date exists', async () => {
    const onPickerVisibleChange = jest.fn();
    const screen = await render(
      <DueTimeField
        hasDueDate={false}
        pickerVisible={false}
        value={null}
        onChange={jest.fn()}
        onPickerVisibleChange={onPickerVisibleChange}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Add a reminder time'));

    expect(onPickerVisibleChange).not.toHaveBeenCalled();
    expect(mockOpenAndroidDatePicker).not.toHaveBeenCalled();
  });
});
