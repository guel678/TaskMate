import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DueDateField } from '../components/DueDateField';
import { openAndroidDatePicker } from '../utils/android-date-picker';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../utils/android-date-picker', () => ({
  openAndroidDatePicker: jest.fn(),
}));

const mockOpenAndroidDatePicker = openAndroidDatePicker as jest.Mock;

describe('DueDateField on Android and iOS', () => {
  beforeEach(() => {
    mockOpenAndroidDatePicker.mockReset();
  });

  test('stores the selected date and closes the system picker', async () => {
    const onChange = jest.fn();
    const onPickerVisibleChange = jest.fn();
    const screen = await render(
      <DueDateField
        pickerVisible
        value={null}
        onChange={onChange}
        onPickerVisibleChange={onPickerVisibleChange}
      />,
    );

    const picker = screen.getByTestId('due-date-picker');
    picker.props.onValueChange(
      { nativeEvent: { timestamp: 0, utcOffset: 0 } },
      new Date(2026, 9, 20),
    );

    expect(onChange).toHaveBeenCalledWith('2026-10-20');
    expect(onPickerVisibleChange).toHaveBeenCalledWith(false);
    expect(screen.queryByLabelText('Close date picker')).toBeNull();
  });

  test('closes a dismissed picker without changing the date', async () => {
    const onChange = jest.fn();
    const onPickerVisibleChange = jest.fn();
    const screen = await render(
      <DueDateField
        pickerVisible
        value="2026-10-20"
        onChange={onChange}
        onPickerVisibleChange={onPickerVisibleChange}
      />,
    );

    screen.getByTestId('due-date-picker').props.onDismiss();

    expect(onChange).not.toHaveBeenCalled();
    expect(onPickerVisibleChange).toHaveBeenCalledWith(false);
  });

  test('opens the native Android date dialog from the field', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const onChange = jest.fn();
    const onPickerVisibleChange = jest.fn();

    try {
      const screen = await render(
        <DueDateField
          pickerVisible={false}
          value={null}
          onChange={onChange}
          onPickerVisibleChange={onPickerVisibleChange}
        />,
      );

      await fireEvent.press(screen.getByLabelText('Add a due date'));

      expect(onPickerVisibleChange).toHaveBeenCalledWith(true);
      expect(mockOpenAndroidDatePicker).toHaveBeenCalledTimes(1);
      const params = mockOpenAndroidDatePicker.mock.calls[0][0];
      params.onValueChange(
        { nativeEvent: { timestamp: 0, utcOffset: 0 } },
        new Date(2026, 9, 20),
      );
      expect(onChange).toHaveBeenCalledWith('2026-10-20');
      expect(onPickerVisibleChange).toHaveBeenLastCalledWith(false);
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
