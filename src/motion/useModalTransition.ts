import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { motion } from '../theme/tokens';
import { useReducedMotion } from './MotionProvider';

export function useModalTransition(visible: boolean) {
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));
  const [mounted, setMounted] = useState(visible);
  const [previousVisible, setPreviousVisible] = useState(visible);

  // React permits guarded state adjustment during render for prop-driven presence.
  // This mounts the modal before its entrance effect without an extra effect cascade.
  if (visible !== previousVisible) {
    setPreviousVisible(visible);
    if (visible && !mounted) setMounted(true);
  }

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      if (reduceMotion) {
        const animation = Animated.timing(progress, {
          toValue: 1,
          duration: motion.reduced,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
        animation.start();
        return () => animation.stop();
      }

      const animation = Animated.spring(progress, {
        toValue: 1,
        ...motion.spring,
        useNativeDriver: true,
      });
      animation.start();
      return () => animation.stop();
    }

    if (!mounted) {
      progress.setValue(0);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: reduceMotion ? motion.reduced : motion.exit,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) setMounted(false);
    });

    return () => animation.stop();
  }, [mounted, progress, reduceMotion, visible]);

  return { mounted, progress, reduceMotion };
}
