import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';
import { TaskPriority } from '../types/task';

const options: {
  value: TaskPriority;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'none', label: 'None', icon: 'remove-outline' },
  { value: 'low', label: 'Low', icon: 'flag-outline' },
  { value: 'medium', label: 'Medium', icon: 'flag-outline' },
  { value: 'high', label: 'High', icon: 'flag' },
];

type PrioritySelectorProps = {
  value: TaskPriority;
  disabled?: boolean;
  onChange: (priority: TaskPriority) => void;
};

export function PrioritySelector({
  value,
  disabled = false,
  onChange,
}: PrioritySelectorProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Priority</Text>
      <View accessibilityLabel="Task priority" style={styles.options}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} priority`}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
                disabled && styles.optionDisabled,
              ]}
            >
              <Ionicons
                accessible={false}
                color={selected ? colors.primary : colors.textMuted}
                name={option.icon}
                size={16}
              />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    marginBottom: 6,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minHeight: 48,
    flexGrow: 1,
    flexBasis: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionDisabled: {
    opacity: 0.58,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
});
