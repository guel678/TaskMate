import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { useReducedMotion } from '../motion/MotionProvider';
import { lightColors, motion } from '../theme/tokens';

const splashLogo = require('../../assets/splash-icon.png');

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  if (__DEV__) {
    console.warn('TaskMate could not keep the native splash screen visible.', error);
  }
});

export function AnimatedSplash({ children }: PropsWithChildren) {
  const reduceMotion = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const hasStarted = useRef(false);
  const isMounted = useRef(true);
  const runningAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const [overlayOpacity] = useState(() => new Animated.Value(1));
  const [logoOpacity] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(1));
  const [logoTranslateY] = useState(() => new Animated.Value(0));
  const [contentOpacity] = useState(() => new Animated.Value(0));
  const [contentTranslateY] = useState(() => new Animated.Value(8));

  useEffect(
    () => () => {
      isMounted.current = false;
      runningAnimation.current?.stop();
    },
    [],
  );

  const runTransition = (shouldReduceMotion: boolean) => {
    try {
      SplashScreen.hide();
    } catch (error: unknown) {
      if (__DEV__) {
        console.warn('TaskMate could not hide the native splash screen.', error);
      }
    }

    if (shouldReduceMotion) {
      contentTranslateY.setValue(0);
      runningAnimation.current = Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: motion.launchReduced,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: motion.launchReduced,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    } else {
      runningAnimation.current = Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.025,
          duration: motion.launchSettle,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: motion.launchReveal,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: motion.launchReveal,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.94,
            duration: motion.launchReveal,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(logoTranslateY, {
            toValue: -8,
            duration: motion.launchReveal,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: motion.launchReveal,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: motion.launchReveal,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]);
    }

    runningAnimation.current.start(({ finished: animationFinished }) => {
      if (animationFinished && isMounted.current) setFinished(true);
    });
  };

  const startTransition = (_event: LayoutChangeEvent) => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((systemReduceMotion) => {
        if (isMounted.current) runTransition(systemReduceMotion);
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.warn('TaskMate could not read Reduce Motion for the launch transition.', error);
        }
        if (isMounted.current) runTransition(reduceMotion);
      });
  };

  return (
    <View style={styles.root}>
      <Animated.View
        accessibilityElementsHidden={!finished}
        importantForAccessibility={finished ? 'auto' : 'no-hide-descendants'}
        pointerEvents={finished ? 'auto' : 'none'}
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        {children}
      </Animated.View>

      {!finished ? (
        <Animated.View
          importantForAccessibility="no-hide-descendants"
          onLayout={startTransition}
          testID="launch-splash"
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Animated.Image
            accessible={false}
            resizeMode="contain"
            source={splashLogo}
            style={[
              styles.logo,
              {
                opacity: logoOpacity,
                transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
              },
            ]}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  content: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.background,
  },
  logo: {
    width: 196,
    height: 196,
  },
});
