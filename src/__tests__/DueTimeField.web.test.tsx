import { render } from '@testing-library/react-native';

import { DueTimeField } from '../components/DueTimeField.web';

describe('DueTimeField on web', () => {
  test('uses the browser time picker and returns its selected value', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <DueTimeField
        hasDueDate
        pickerVisible={false}
        value={null}
        onChange={onChange}
        onPickerVisibleChange={jest.fn()}
      />,
    );

    const timeInput = screen.getByLabelText('Reminder time');

    expect(timeInput.props.type).toBe('time');
    timeInput.props.onChange({ currentTarget: { value: '14:30' } });
    expect(onChange).toHaveBeenCalledWith('14:30');
  });

  test('disables reminder time until a due date exists', async () => {
    const screen = await render(
      <DueTimeField
        hasDueDate={false}
        pickerVisible={false}
        value={null}
        onChange={jest.fn()}
        onPickerVisibleChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Reminder time').props.disabled).toBe(true);
    expect(screen.getByText('Choose a due date first')).toBeTruthy();
  });
});
