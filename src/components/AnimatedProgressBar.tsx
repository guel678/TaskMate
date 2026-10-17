import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../motion/MotionProvider';
import { useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, motion, spacing } from '../theme/tokens';

type AnimatedProgressBarProps = {
  percentage: number;
};

export function AnimatedProgressBar({ percentage }: AnimatedProgressBarProps) {
  const styles = useThemedStyles(createStyles);
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(reduceMotion ? percentage : 0));

  useEffect(() => {
    progress.stopAnimation();

    if (reduceMotion) {
      progress.setValue(percentage);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: percentage,
      duration: motion.standard,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [percentage, progress, reduceMotion]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track}>
      <Animated.View
        accessibilityLabel="Task completion progress"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percentage }}
        style={[styles.fill, { width }]}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.primaryTrack,
    borderRadius: 3,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
