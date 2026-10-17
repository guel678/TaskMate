import { act, fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplash } from '../components/animated-splash';

jest.mock('expo-splash-screen', () => ({
  hide: jest.fn(),
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
}));

describe('AnimatedSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('hands off from the native splash and reveals the app', async () => {
    const screen = await render(
      <AnimatedSplash>
        <Text>TaskMate home</Text>
      </AnimatedSplash>,
    );

    await fireEvent(screen.getByTestId('launch-splash', { includeHiddenElements: true }), 'layout', {
      nativeEvent: { layout: { width: 390, height: 844, x: 0, y: 0 } },
    });

    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);

    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(screen.queryByTestId('launch-splash', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText('TaskMate home')).toBeTruthy();
  });
});
