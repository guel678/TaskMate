import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { FilterTabs } from '../components/FilterTabs';

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

describe('FilterTabs responsive layout', () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390,
    });
  });

  test.each([
    { fontScale: 2, height: 844, name: 'large text', width: 390 },
    { fontScale: 1, height: 568, name: 'sub-320 width', width: 280 },
  ])('stacks the rendered tabs for $name', async ({ fontScale, height, width }) => {
    mockUseWindowDimensions.mockReturnValue({ fontScale, height, scale: 3, width });
    const screen = await render(<FilterTabs value="all" onChange={jest.fn()} />);

    const style = StyleSheet.flatten(screen.getByLabelText('Task filters').props.style);
    expect(style.flexDirection).toBe('column');
  });

  test.each([
    { height: 568, name: 'a 320px phone', width: 320 },
    { height: 390, name: 'phone landscape', width: 844 },
  ])('keeps one row for $name at normal text size', async ({ height, width }) => {
    mockUseWindowDimensions.mockReturnValue({ fontScale: 1, height, scale: 3, width });
    const screen = await render(<FilterTabs value="all" onChange={jest.fn()} />);

    const style = StyleSheet.flatten(screen.getByLabelText('Task filters').props.style);
    expect(style.flexDirection).toBe('row');
  });
});
