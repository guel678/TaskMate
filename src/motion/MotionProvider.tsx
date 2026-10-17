import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Defaulting to reduced motion keeps isolated component tests and previews conservative.
const ReducedMotionContext = createContext(true);

export function MotionProvider({ children }: PropsWithChildren) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const updatePreference = (enabled: boolean) => {
      if (isMounted) setReduceMotion(enabled);
    };

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      updatePreference,
    );

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(updatePreference)
      .catch((error: unknown) => {
        if (__DEV__) {
          console.warn('TaskMate could not read the Reduce Motion preference.', error);
        }
      });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduceMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}
