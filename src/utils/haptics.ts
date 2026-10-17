import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runNativeHaptic(effect: () => Promise<void>) {
  // Browser vibration support is inconsistent and can request permission, so
  // TaskMate keeps tactile feedback native-only.
  if (Platform.OS === 'web') return;

  try {
    await effect();
  } catch (error) {
    // Haptics are progressive enhancement and must never block a saved action.
    if (__DEV__) console.warn('TaskMate could not play haptic feedback.', error);
  }
}

export function playSelectionHaptic() {
  return runNativeHaptic(() => Haptics.selectionAsync());
}

export function playSuccessHaptic() {
  return runNativeHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function playDeleteHaptic() {
  return runNativeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}
