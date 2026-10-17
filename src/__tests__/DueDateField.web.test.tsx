import { render } from '@testing-library/react-native';

import { DueDateField } from '../components/DueDateField.web';

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

describe('DueDateField on web', () => {
  test('uses the browser date picker and returns its selected value', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <DueDateField
        pickerVisible={false}
        value={null}
        onChange={onChange}
        onPickerVisibleChange={jest.fn()}
      />,
    );

    const dateInput = screen.getByLabelText('Due date');

    expect(dateInput.props.type).toBe('date');
    dateInput.props.onChange({ currentTarget: { value: '2026-10-20' } });
    expect(onChange).toHaveBeenCalledWith('2026-10-20');
  });
});
