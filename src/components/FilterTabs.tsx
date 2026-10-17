import { useEffect, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useReducedMotion } from '../motion/MotionProvider';
import { useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, motion, spacing, typography } from '../theme/tokens';
import { TaskFilter } from '../types/task';
import { shouldStackFilterTabs } from '../utils/layout';

const filters: { label: string; value: TaskFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

type FilterTabsProps = {
  value: TaskFilter;
  disabled?: boolean;
  onChange: (filter: TaskFilter) => void;
};

export function FilterTabs({ value, disabled = false, onChange }: FilterTabsProps) {
  const styles = useThemedStyles(createStyles);
  const reduceMotion = useReducedMotion();
  const { fontScale, width } = useWindowDimensions();
  const selectedIndex = filters.findIndex((filter) => filter.value === value);
  const [position] = useState(() => new Animated.Value(selectedIndex));
  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth = Math.max(0, containerWidth / filters.length);
  const stackTabs = shouldStackFilterTabs(width, fontScale);

  useEffect(() => {
    position.stopAnimation();
    if (reduceMotion) {
      position.setValue(selectedIndex);
      return;
    }

    const animation = Animated.spring(position, {
      toValue: selectedIndex,
      ...motion.spring,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [position, reduceMotion, selectedIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      accessibilityLabel="Task filters"
      accessibilityRole="tablist"
      onLayout={handleLayout}
      style={[styles.container, stackTabs && styles.containerStacked]}
    >
      {!stackTabs && segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selection,
            {
              width: segmentWidth,
              transform: [{ translateX: Animated.multiply(position, segmentWidth) }],
            },
          ]}
        />
      ) : null}
      {filters.map((filter) => {
        const selected = value === filter.value;
        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={`Show ${filter.label.toLowerCase()} tasks`}
            disabled={disabled}
            onPress={() => onChange(filter.value)}
            style={({ pressed }) => [
              styles.tab,
              stackTabs && styles.tabStacked,
              stackTabs && selected && styles.tabStackedSelected,
              pressed && styles.pressedTab,
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: spacing.xl,
  },
  containerStacked: {
    flexDirection: 'column',
    gap: spacing.xs,
    borderBottomWidth: 0,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabStacked: {
    width: '100%',
    flex: 0,
    alignItems: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  tabStackedSelected: {
    backgroundColor: colors.primarySoft,
  },
  selection: {
    position: 'absolute',
    left: 0,
    bottom: -1,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  pressedTab: {
    opacity: 0.72,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.text,
  },
});
